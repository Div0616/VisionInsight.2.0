from contextlib import asynccontextmanager
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_db, close_db
from app.api.health import router as health_router
from app.api.upload import router as upload_router
from app.api.detection import router as detection_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create required folders on startup
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("processed", exist_ok=True)
    print("Folders created: uploads/ and processed/")
    await connect_db()
    yield
    await close_db()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        lifespan=lifespan
    )

    # CORS — allows any origin to call this API
    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=False,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["*"],
        max_age=3600,
    )

    app.include_router(health_router, tags=["Health"])
    app.include_router(upload_router, prefix="/api", tags=["Video"])
    app.include_router(detection_router, prefix="/api", tags=["Detection"])

    @app.get("/")
    async def root():
        return {
            "message": "VisionInsight API",
            "version": "1.0.0",
            "docs": "/docs",
            "health": "/health"
        }

    return app


app = create_app()