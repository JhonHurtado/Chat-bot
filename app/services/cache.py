import time
from typing import Dict, Any, Optional

class ResponseCache:
    def __init__(self, timeout: int = 3600):
        self.cache = {}
        self.timeout = timeout
    
    def get(self, question: str) -> Optional[Dict[str, Any]]:
        if question in self.cache:
            timestamp, response = self.cache[question]
            if time.time() - timestamp < self.timeout:
                return response
            else:
                # Caché expirado
                del self.cache[question]
        return None
    
    def set(self, question: str, response: Dict[str, Any]):
        self.cache[question] = (time.time(), response)
    
    def clear(self):
        self.cache.clear()
    
    def clean_expired(self):
        """Elimina entradas expiradas de la caché"""
        current_time = time.time()
        expired_keys = [
            key for key, (timestamp, _) in self.cache.items() 
            if current_time - timestamp >= self.timeout
        ]
        for key in expired_keys:
            del self.cache[key]