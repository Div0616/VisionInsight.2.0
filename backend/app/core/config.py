from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    # App
    APP_NAME: str = "VisionInsight"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # MongoDB
    MONGODB_URI: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "visioninsight"

    # File Storage
    UPLOAD_DIR: str = str(__import__('pathlib').Path(__file__).parent.parent.parent / "uploads")
    PROCESSED_DIR: str = str(__import__('pathlib').Path(__file__).parent.parent.parent / "processed")
    MAX_FILE_SIZE: int = 209715200  # 200MB in bytes

    # CORS
    FRONTEND_URL: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env")

    #cloudinary

    CLOUDINARY_CLOUD_NAME: str = ""
    CLOUDINARY_API_KEY: str = ""
    CLOUDINARY_API_SECRET: str = ""




@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()