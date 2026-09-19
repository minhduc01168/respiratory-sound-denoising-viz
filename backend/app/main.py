from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.core.config import settings
from backend.app.core.database import init_db
from backend.app.api.routes_audio import router as audio_router
from backend.app.api.routes_annotation import router as annotation_router

# Initialize database tables on startup
init_db()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Medical-grade respiratory sound denoising, spectral visualization, and annotation platform.",
)

# Enable CORS for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(audio_router)
app.include_router(annotation_router)


@app.get("/")
def read_root():
    return {
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs": "/docs",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "respiratory-sound-denoising-api",
        "version": settings.VERSION,
        "storage": {
            "raw": settings.RAW_DIR.exists(),
            "cleaned": settings.CLEANED_DIR.exists(),
            "presets": settings.PRESETS_DIR.exists(),
        },
    }
