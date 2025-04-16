import time
from typing import Dict, Any, Optional
from transformers import pipeline, Pipeline
from app.config import logger

class ModelManager:
    def __init__(self, model_name: str, device: str):
        self.model_name = model_name
        self.device = device
        self.qa_pipeline = self._load_model()
        self.model_loaded_at = time.time() if self.qa_pipeline else None
        logger.info(f"Modelo cargado: {model_name} en dispositivo {device}")
    
    def _load_model(self) -> Optional[Pipeline]:
        try:
            return pipeline(
                "question-answering", 
                model=self.model_name, 
                device=0 if self.device == "cuda" else -1
            )
        except Exception as e:
            logger.error(f"Error al cargar el modelo {self.model_name}: {str(e)}", exc_info=True)
            return None
    
    def get_pipeline(self) -> Optional[Pipeline]:
        return self.qa_pipeline
    
    def is_available(self) -> bool:
        return self.qa_pipeline is not None
    
    def reload_model(self) -> bool:
        try:
            self.qa_pipeline = self._load_model()
            if self.qa_pipeline:
                self.model_loaded_at = time.time()
            return self.is_available()
        except Exception as e:
            logger.error(f"Error al recargar el modelo: {str(e)}", exc_info=True)
            return False
    
    def get_model_info(self) -> Dict[str, Any]:
        return {
            "name": self.model_name,
            "device": self.device,
            "available": self.is_available(),
            "loaded_at": self.model_loaded_at
        }