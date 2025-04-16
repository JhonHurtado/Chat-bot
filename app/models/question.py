from pydantic import BaseModel, Field, validator, ConfigDict
from typing import Dict, Any, Optional
from app.config import logger

class QuestionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    question: str = Field(..., min_length=2, max_length=500, 
                         example="¿Qué es la inteligencia artificial?",
                         description="Pregunta en lenguaje natural")
    
    @validator('question')
    def question_must_be_valid(cls, v):
        v = v.strip()
        if not v or v.isspace():
            raise ValueError('La pregunta no puede estar vacía')
        if v.endswith('?') is False and '?' not in v:
            logger.warning(f"Pregunta sin signo de interrogación: {v}")
        return v

class AnswerResponse(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    answer: str = Field(..., example="La inteligencia artificial es la simulación de procesos de inteligencia humana por máquinas.")
    score: float = Field(..., example=0.95)
    start: int = Field(..., example=10)
    end: int = Field(..., example=42)
    context_snippet: str = Field(..., example="...procesos de inteligencia humana por parte de máquinas...")
    response_time: float = Field(..., example=0.345, description="Tiempo de respuesta en segundos")

class ContextUpdateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    
    context: str = Field(..., min_length=10, 
                       example="La inteligencia artificial es un campo de la informática que...",
                       description="Nuevo contenido para el contexto")