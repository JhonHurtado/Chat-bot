import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from functools import lru_cache

import uvicorn
from pathlib import Path

# Importar configuración
from app.config import (
    logger, MODEL_NAME, CONTEXT_PATH, ENABLE_CORS, ALLOWED_ORIGINS,
    CACHE_TIMEOUT, HOST, PORT, RELOAD, DEVICE, ensure_context_directory
)

# Importar servicios
from app.services.context import ContextManager
from app.services.model import ModelManager
from app.services.cache import ResponseCache
from app.services.metrics import MetricsManager

# Importar rutas
from app.routes.qa import router as qa_router, dependencies as qa_dependencies
from app.routes.admin import router as admin_router, dependencies as admin_dependencies

# Asegurar que existe el directorio de contexto
ensure_context_directory()

# Crear instancias de servicios
metrics_manager = MetricsManager()
response_cache = ResponseCache(timeout=CACHE_TIMEOUT)
context_manager = ContextManager(CONTEXT_PATH)
model_manager = ModelManager(MODEL_NAME, DEVICE)

# Inicializar la aplicación
app = FastAPI(
    title="Question Answering API",
    description="API para responder preguntas basadas en un contexto usando modelos de Hugging Face",
    version="1.1.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Manejo global de errores
@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error no manejado: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Error interno del servidor. Por favor, inténtelo de nuevo más tarde."}
    )

# Middleware para métricas
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Configuración de CORS
if ENABLE_CORS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    logger.info(f"CORS habilitado para los orígenes: {ALLOWED_ORIGINS}")

# Compartir dependencias con los routers
shared_dependencies = {
    "context_manager": context_manager,
    "model_manager": model_manager,
    "response_cache": response_cache,
    "metrics_manager": metrics_manager
}

qa_dependencies.update(shared_dependencies)
admin_dependencies.update(shared_dependencies)

# Incluir routers
app.include_router(qa_router)
app.include_router(admin_router)

# Montar archivos estáticos
static_dir = Path(__file__).parent.parent / "static"
if static_dir.exists():
    app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")

@app.get("/", tags=["Estado"])
def read_root():
    """Devuelve el estado del servicio"""
    return {
        "status": "ok" if model_manager.is_available() else "error",
        "model": model_manager.get_model_info(),
        "context_size": len(context_manager.get_context()),
        "cors_enabled": ENABLE_CORS,
        "cache_timeout": CACHE_TIMEOUT
    }

# Para ejecutar directamente la aplicación
if __name__ == "__main__":
    logger.info(f"Iniciando servidor en {HOST}:{PORT} (reload={RELOAD})")
    uvicorn.run("app.main:app", host=HOST, port=PORT, reload=RELOAD)
    