import os
import logging
import torch
from pathlib import Path
from dotenv import load_dotenv

# Carga automática del archivo .env
load_dotenv()

# Configuración del logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("qa_service.log")
    ]
)
logger = logging.getLogger("qa-chatbot")

PROJECT_ROOT = Path(__file__).parent.parent

# Configurar CONTEXT_PATH para que sea relativo a la raíz del proyecto
CONTEXT_PATH = os.getenv("QA_CONTEXT_PATH", 
                         str(PROJECT_ROOT / "context" / "context.txt"))
# Cargar variables de entorno (con valores por defecto)
MODEL_NAME = os.getenv("QA_MODEL_NAME", "distilbert-base-uncased-distilled-squad")
ENABLE_CORS = os.getenv("QA_ENABLE_CORS", "true").lower() == "true"
ALLOWED_ORIGINS = os.getenv("QA_ALLOWED_ORIGINS", "*").split(",")
MAX_ANSWER_LENGTH = int(os.getenv("QA_MAX_ANSWER_LENGTH", "50"))
CONFIDENCE_THRESHOLD = float(os.getenv("QA_CONFIDENCE_THRESHOLD", "0.01"))
DEVICE = os.getenv("QA_DEVICE", "cuda" if torch.cuda.is_available() else "cpu")
ADMIN_API_KEY = os.getenv("QA_ADMIN_API_KEY")
CACHE_TIMEOUT = int(os.getenv("QA_CACHE_TIMEOUT", "3600"))  # Segundos para invalidar cache
PORT = int(os.getenv("QA_PORT", "8000"))
HOST = os.getenv("QA_HOST", "0.0.0.0")
RELOAD = os.getenv("QA_RELOAD", "false").lower() == "true"

#log para ver el path del contexto
logger.info(f"Context path: {CONTEXT_PATH} : ")

# Validar configuración
if not ADMIN_API_KEY:
    logger.warning("No se ha configurado una API key para administración. Se usará una clave por defecto.")
    ADMIN_API_KEY = "admin-key-change-me"

# Asegurar que la carpeta de contexto exista
def ensure_context_directory():
    context_dir = Path(CONTEXT_PATH).parent
    if not context_dir.exists():
        context_dir.mkdir(parents=True, exist_ok=True)
        logger.info(f"Creado directorio de contexto en {context_dir}")