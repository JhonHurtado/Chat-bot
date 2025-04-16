import time
from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from app.config import logger, MAX_ANSWER_LENGTH, CONFIDENCE_THRESHOLD
from app.models.question import QuestionRequest, AnswerResponse
from app.models.feedback import FeedbackRequest
from app.services.context import ContextManager
from app.services.model import ModelManager
from app.services.cache import ResponseCache
from app.services.metrics import MetricsManager

router = APIRouter(tags=["Pregunta-Respuesta"])

def clean_cache_task(cache: ResponseCache):
    """Tarea para limpiar la caché periódicamente"""
    cache.clean_expired()

@router.post("/qa", response_model=AnswerResponse)
def answer_question(
    req: QuestionRequest,
    background_tasks: BackgroundTasks,
    context_manager: ContextManager = Depends(lambda: dependencies["context_manager"]),
    model_manager: ModelManager = Depends(lambda: dependencies["model_manager"]),
    cache: ResponseCache = Depends(lambda: dependencies["response_cache"]),
    metrics: MetricsManager = Depends(lambda: dependencies["metrics_manager"])
):
    """
    Responde a una pregunta basada en el contexto cargado
    
    - **question**: La pregunta en lenguaje natural
    
    Devuelve:
    - **answer**: La respuesta extraída del contexto
    - **score**: Puntuación de confianza (0-1)
    - **start**: Posición de inicio en el contexto
    - **end**: Posición de fin en el contexto
    - **context_snippet**: Fragmento del contexto que contiene la respuesta
    - **response_time**: Tiempo de procesamiento en segundos
    """
    start_time = time.time()
    
    # Limpiar la caché en segundo plano
    background_tasks.add_task(clean_cache_task, cache)
    
    # Verificar si hay respuesta en caché
    cached_response = cache.get(req.question)
    if cached_response:
        logger.info(f"Respuesta encontrada en caché para: {req.question}")
        process_time = time.time() - start_time
        metrics.record_request(True, process_time)
        cached_response["response_time"] = process_time
        return cached_response
    
    qa_pipeline = model_manager.get_pipeline()
    if qa_pipeline is None:
        logger.error("Solicitud de respuesta con modelo no disponible")
        metrics.record_request(False, time.time() - start_time)
        raise HTTPException(
            status_code=503,
            detail="El servicio de respuestas no está disponible en este momento"
        )
    
    context = context_manager.get_context()
    question = req.question
    
    logger.info(f"Pregunta recibida: {question}")
    
    try:
        # Configurar parámetros adicionales del pipeline
        result = qa_pipeline(
            question=question, 
            context=context,
            handle_impossible_answer=True,
            max_answer_len=MAX_ANSWER_LENGTH
        )
        
        # Validar la confianza de la respuesta
        if result["score"] < CONFIDENCE_THRESHOLD:
            logger.warning(f"Respuesta con baja confianza: {result['score']:.4f}")
            metrics.record_request(False, time.time() - start_time)
            raise HTTPException(
                status_code=404,
                detail="No se encontró una respuesta con suficiente confianza"
            )
        
        # Crear un fragmento de contexto para mostrar
        start, end = max(0, result["start"] - 20), min(len(context), result["end"] + 20)
        context_snippet = f"...{context[start:end]}..." if start > 0 or end < len(context) else context[start:end]
        
        process_time = time.time() - start_time
        
        response = {
            "answer": result["answer"],
            "score": result["score"],
            "start": result["start"],
            "end": result["end"],
            "context_snippet": context_snippet,
            "response_time": process_time
        }
        
        # Guardar en caché
        cache.set(question, response)
        
        logger.info(f"Respuesta encontrada: '{result['answer']}' (score: {result['score']:.4f}, time: {process_time:.4f}s)")
        metrics.record_request(True, process_time)
        return response
        
    except HTTPException:
        # Re-lanzar excepciones HTTP ya manejadas
        raise
    except Exception as e:
        process_time = time.time() - start_time
        metrics.record_request(False, process_time)
        logger.error(f"Error al procesar la pregunta: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la pregunta: {str(e)}"
        )

@router.post("/feedback")
def submit_feedback(feedback: FeedbackRequest):
    """
    Envía retroalimentación sobre una respuesta
    
    - **question**: La pregunta original
    - **answer**: La respuesta proporcionada
    - **is_helpful**: Si la respuesta fue útil
    - **comments**: Comentarios adicionales (opcional)
    """
    try:
        # Registrar el feedback en un archivo
        with open("feedback.log", "a", encoding="utf-8") as f:
            f.write(f"{time.time()},{feedback.question},{feedback.answer},{feedback.is_helpful},{feedback.comments or ''}\n")
        
        logger.info(f"Feedback recibido: pregunta='{feedback.question}', útil={feedback.is_helpful}")
        return {"status": "ok", "message": "Feedback registrado correctamente"}
    except Exception as e:
        logger.error(f"Error al registrar feedback: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Error al procesar el feedback"
        )

# Variable para almacenar dependencias (se inicializa en main.py)
dependencies = {}