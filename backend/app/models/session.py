from enum import Enum
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime, timezone


class SessionStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class DetectionResult(BaseModel):
    frame: int
    class_name: str
    confidence: float
    bbox: list[float]


class AnalyticsSummary(BaseModel):
    total_frames: int = 0
    processed_frames: int = 0
    total_detections: int = 0
    unique_classes: list[str] = []
    class_distribution: dict = {}
    processing_time_seconds: float = 0.0
    fps: float = 0.0
    resolution: str = ""
    output_video: Optional[str] = None


class VideoSession(BaseModel):
    session_id: str
    filename: str
    file_size: int
    status: SessionStatus = SessionStatus.PENDING
    progress: float = 0.0
    error: Optional[str] = None
    analytics: Optional[AnalyticsSummary] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    