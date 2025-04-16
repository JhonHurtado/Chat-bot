from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import APIKeyHeader
from app.config import ADMIN_API_KEY
from app.models.question import ContextUpdateRequest
from app.services.context import ContextManager
from app.services.model import ModelManager
from app.services.cache import ResponseCache
from app.services.metrics import MetricsManager

router = APIRouter(tags=["Administración"])

# Seguridad para endpoints de administración
api_key_header = APIKeyHeader(name="X-API-Key", auto_error=False)

async def get_api_key(api_key: str = Depends(api_key_header)):
    if not api_key or api_key != ADMIN_API_KEY:
        raise HTTPException(
            status_code=401,
            detail="API key inválida o no proporcionada",
            headers={"WWW-Authenticate": "ApiKey"},
        )
    return api_key

@router.post("/reload")
def reload_resources(
    context_manager: ContextManager = Depends(lambda: dependencies["context_manager"]),
    model_manager: ModelManager = Depends(lambda: dependencies["model_manager"]),
    cache: ResponseCache = Depends(lambda: dependencies["response_cache"]),
    api_key: str = Depends(get_api_key)
):
    """
    Recarga el contexto y el modelo
    
    Requiere API key de administrador en el header X-API-Key
    """
    context_reloaded = context_manager.reload_context()
    model_reloaded = model_manager.reload_model()
    
    # Limpiar caché después de recargar recursos
    cache.clear()
    
    if not context_reloaded and not model_reloaded:
        raise HTTPException(
            status_code=500,
            detail="Error al recargar los recursos"
        )
    
    return {
        "context_reloaded": context_reloaded,
        "model_reloaded": model_reloaded,
        "cache_cleared": True,
        "status": "ok"
    }

@router.post("/context")
def update_context(
    req: ContextUpdateRequest,
    context_manager: ContextManager = Depends(lambda: dependencies["context_manager"]),
    cache: ResponseCache = Depends(lambda: dependencies["response_cache"]),
    api_key: str = Depends(get_api_key)
):
    """
    Actualiza el contenido del contexto
    
    Requiere API key de administrador en el header X-API-Key
    
    - **context**: Nuevo texto de contexto
    """
    success = context_manager.update_context(req.context)
    
    if not success:
        raise HTTPException(
            status_code=500,
            detail="Error al actualizar el contexto"
        )
    
    # Limpiar caché después de actualizar contexto
    cache.clear()
    
    return {
        "status": "ok",
        "message": "Contexto actualizado correctamente",
        "context_size": len(req.context),
        "cache_cleared": True
    }

@router.get("/metrics")
def get_metrics(
    metrics: MetricsManager = Depends(lambda: dependencies["metrics_manager"]),
    api_key: str = Depends(get_api_key)
):
    """
    Obtiene métricas de uso del servicio
    
    Requiere API key de administrador en el header X-API-Key
    """
    return metrics.get_metrics()

@router.post("/reset-metrics")
def reset_metrics(
    metrics: MetricsManager = Depends(lambda: dependencies["metrics_manager"]),
    api_key: str = Depends(get_api_key)
):
    """
    Reinicia las métricas del servicio
    
    Requiere API key de administrador en el header X-API-Key
    """
    metrics.reset()
    return {"status": "ok", "message": "Métricas reiniciadas correctamente"}

@router.post("/clear-cache")
def clear_cache(
    cache: ResponseCache = Depends(lambda: dependencies["response_cache"]),
    api_key: str = Depends(get_api_key)
):
    """
    Limpia la caché de respuestas
    
    Requiere API key de administrador en el header X-API-Key
    """
    cache.clear()
    return {"status": "ok", "message": "Caché limpiada correctamente"}

# Variable para almacenar dependencias (se inicializa en main.py)
dependencies = {}