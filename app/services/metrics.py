import time
from typing import Dict, Any

class MetricsManager:
    def __init__(self):
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.avg_response_time = 0
        self.last_reset = time.time()
    
    def record_request(self, success: bool, response_time: float):
        self.total_requests += 1
        if success:
            self.successful_requests += 1
        else:
            self.failed_requests += 1
        
        # Actualizar tiempo promedio de respuesta
        self.avg_response_time = ((self.avg_response_time * (self.total_requests - 1)) + response_time) / self.total_requests
    
    def reset(self):
        self.total_requests = 0
        self.successful_requests = 0
        self.failed_requests = 0
        self.avg_response_time = 0
        self.last_reset = time.time()
    
    def get_metrics(self) -> Dict[str, Any]:
        return {
            "total_requests": self.total_requests,
            "successful_requests": self.successful_requests,
            "failed_requests": self.failed_requests,
            "avg_response_time": self.avg_response_time,
            "uptime_since_reset": time.time() - self.last_reset
        }