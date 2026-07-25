from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import connect_db, close_db
from app.api.health import router as health_router
from app.api.upload import router as upload_router
from app.api.detection import router as detection_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create folders on startup
    import os
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("processed", exist_ok=True)
    await connect_db()
    yield
    await close_db()


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version="1.0.0",
        lifespan=lifespan
    )

    app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
    )

    app.include_router(health_router, tags=["Health"])
    app.include_router(upload_router, prefix="/api", tags=["Video"])
    app.include_router(detection_router, prefix="/api", tags=["Detection"])

    @app.get("/")
    async def root():
        return {"message": "VisionInsight API", "docs": "/docs"}

    return app


app = create_app()