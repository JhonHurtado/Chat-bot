import time
from pathlib import Path
from app.config import logger

class ContextManager:
    def __init__(self, context_path: str):
        self.context_path = context_path
        self.context = self._load_context()
        self.last_updated = time.time()
        logger.info(f"Contexto cargado: {len(self.context)} caracteres")
    
    def _load_context(self) -> str:
        try:
            path = Path(self.context_path)
            if not path.exists():
                logger.error(f"Archivo de contexto no encontrado: {self.context_path}")
                return "El contexto no está disponible."
            
            with open(path, "r", encoding="utf-8") as f:
                context = f.read()
                
            if not context or len(context) < 10:
                logger.warning(f"Contexto muy corto o vacío: {len(context)} caracteres")
                return "El contexto es insuficiente."
                
            return context
        except Exception as e:
            logger.error(f"Error al cargar el contexto: {str(e)}", exc_info=True)
            return "Error al cargar el contexto."
    
    def get_context(self) -> str:
        # Verificar si el contexto debe recargarse (si el archivo ha cambiado)
        path = Path(self.context_path)
        if path.exists():
            mtime = path.stat().st_mtime
            if mtime > self.last_updated:
                logger.info("Detectado cambio en el archivo de contexto, recargando...")
                self.context = self._load_context()
                self.last_updated = time.time()
        return self.context
    
    def reload_context(self) -> bool:
        try:
            self.context = self._load_context()
            self.last_updated = time.time()
            return True
        except Exception as e:
            logger.error(f"Error al recargar el contexto: {str(e)}", exc_info=True)
            return False
    
    def update_context(self, new_context: str) -> bool:
        try:
            path = Path(self.context_path)
            # Asegurar que el directorio exista
            path.parent.mkdir(parents=True, exist_ok=True)
            
            with open(path, "w", encoding="utf-8") as f:
                f.write(new_context)
            
            self.context = new_context
            self.last_updated = time.time()
            logger.info(f"Contexto actualizado: {len(new_context)} caracteres")
            return True
        except Exception as e:
            logger.error(f"Error al actualizar el contexto: {str(e)}", exc_info=True)
            return False