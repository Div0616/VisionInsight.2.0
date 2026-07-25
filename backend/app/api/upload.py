import os
import uuid
# pyright: ignore [reportMissingImports]
from fastapi import APIRouter, UploadFile, File, HTTPException, BackgroundTasks
from pydantic import BaseModel
from app.core.config import settings
from app.models.session import VideoSession, SessionStatus
from app.services.session_repository import (
    create_session, get_session, list_sessions
)
from app.cv_engine.video_processor import VideoProcessor
# pyrefly: ignore [missing-import]
from fastapi.responses import StreamingResponse, RedirectResponse, FileResponse
from app.core.database import get_database


router = APIRouter()

ALLOWED_EXTENSIONS = {".mp4", ".avi", ".mov", ".mkv", ".webm"}


def validate_video(file: UploadFile) -> None:
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type '{ext}'. Allowed: {ALLOWED_EXTENSIONS}"
        )


async def save_upload(file: UploadFile, session_id: str) -> tuple[str, int]:
    ext = os.path.splitext(file.filename)[1].lower()
    filename = f"{session_id}{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)

    # Write file in chunks and track size to avoid loading entire file into memory
    file_size = 0
    with open(file_path, "wb") as f:
        while chunk := await file.read(1024 * 1024):  # Read 1MB at a time
            file_size += len(chunk)
            if file_size > settings.MAX_FILE_SIZE:
                f.close()
                os.remove(file_path)  # Clean up partial file
                raise HTTPException(
                    status_code=413,
                    detail=f"File too large. Max size: {settings.MAX_FILE_SIZE // 1024 // 1024}MB"
                )
            f.write(chunk)

    return file_path, file_size


def run_processing(video_path: str, session_id: str):
    processor = VideoProcessor()
    processor.process_video(video_path, session_id)


@router.post("/upload")
async def upload_video(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...)
):
    validate_video(file)

    session_id = str(uuid.uuid4())
    file_path, file_size = await save_upload(file, session_id)

    session = VideoSession(
        session_id=session_id,
        filename=file.filename,
        file_size=file_size,
        status=SessionStatus.PENDING
    )
    await create_session(session)

    background_tasks.add_task(run_processing, file_path, session_id)

    return {
        "session_id": session_id,
        "filename": file.filename,
        "file_size_mb": round(file_size / 1024 / 1024, 2),
        "status": "pending",
        "message": "Video uploaded successfully. Processing started."
    }


@router.get("/status/{session_id}")
async def get_status(session_id: str):
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session["session_id"],
        "status": session["status"],
        "progress": session["progress"],
        "error": session.get("error")
    }


@router.get("/results/{session_id}")
async def get_results(session_id: str):
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail=f"Session not completed yet. Status: {session['status']}"
        )

    return {
        "session_id": session["session_id"],
        "filename": session["filename"],
        "status": session["status"],
        "analytics": session["analytics"],
        "created_at": session["created_at"]
    }


@router.get("/sessions")
async def get_all_sessions():
    sessions = await list_sessions()
    return {"sessions": sessions}

@router.get("/dashboard")
async def get_dashboard_stats():
    """
    BACKEND ENDPOINT: GET /api/dashboard
    CALLED BY: DashboardPage on mount
    RETURNS: Aggregated stats across all sessions
    
    Computes:
    - Total videos processed
    - Total objects detected across all videos
    - Most detected class across all videos
    - Combined class distribution
    - Recent 5 sessions
    """
    sessions = await list_sessions()

    # Filter only completed sessions for stats
    completed = [s for s in sessions if s.get("status") == "completed"]

    # Calculate total detections across all videos
    total_detections = sum(
        s.get("analytics", {}).get("total_detections", 0)
        for s in completed
    )

    # Calculate total processing time
    total_processing_time = sum(
        s.get("analytics", {}).get("processing_time_seconds", 0)
        for s in completed
    )

    # Combine class distributions from all sessions
    combined_classes = {}
    for s in completed:
        class_dist = s.get("analytics", {}).get("class_distribution", {})
        for cls, count in class_dist.items():
            combined_classes[cls] = combined_classes.get(cls, 0) + count

    # Find most detected class
    most_detected = max(combined_classes, key=combined_classes.get) \
        if combined_classes else "N/A"

    # Calculate total unique objects across all videos
    total_unique_objects = sum(
        s.get("analytics", {}).get("total_unique_objects", 0)
        for s in completed
    )

    return {
        "total_videos": len(sessions),
        "completed_videos": len(completed),
        "total_detections": total_detections,
        "total_unique_objects": total_unique_objects,
        "total_processing_time": round(total_processing_time, 2),
        "most_detected_class": most_detected,
        "class_distribution": combined_classes,
        "recent_sessions": sessions[:5],  # Latest 5 sessions
        "all_sessions": sessions
    }


@router.get("/session/{session_id}/analytics")
async def get_session_analytics(session_id: str):
    """
    BACKEND ENDPOINT: GET /api/session/{session_id}/analytics
    CALLED BY: HistoryPage when user clicks a session
    RETURNS: Full analytics for one specific session
    """
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session["session_id"],
        "filename": session["filename"],
        "status": session["status"],
        "analytics": session.get("analytics"),
        "created_at": session["created_at"],
        "file_size": session.get("file_size")
    }


@router.get("/video/{session_id}")
async def get_processed_video(session_id: str):
    session = await get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if session["status"] != SessionStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Video processing not completed yet")

    analytics = session.get("analytics", {})
    video_url = analytics.get("output_video", "")

    if not video_url:
        raise HTTPException(status_code=404, detail="Processed video not found")

    # Old Cloudinary URL (session processed before local storage switch)
    if video_url.startswith("http"):
        raise HTTPException(
            status_code=410,
            detail="This session used cloud storage. Please re-upload your video to use local playback."
        )

    # Local file — stream directly to the browser
    if not os.path.exists(video_url):
        raise HTTPException(
            status_code=404,
            detail="Processed video file not found on disk. Please re-upload and process the video."
        )

    return FileResponse(
        video_url,
        media_type="video/mp4",
        filename=f"{session_id}_output.mp4"
    )
# ============================================
# SETTINGS ENDPOINTS
# These are NEW — they do NOT modify any
# existing endpoint above this line.
# ============================================

# Allowed YOLO models that can be selected from Settings UI
ALLOWED_MODELS = {"yolo11n.pt", "yolo11s.pt", "yolo11m.pt"}


class ConfidenceRequest(BaseModel):
    """Request body for updating detection confidence threshold."""
    confidence: float


class ModelRequest(BaseModel):
    """Request body for swapping the active YOLO model."""
    model_name: str


@router.post("/settings/confidence")
async def update_confidence(body: ConfidenceRequest):
    """
    BACKEND ENDPOINT: POST /api/settings/confidence
    CALLED BY: SettingsPage — Detection Settings card Save button
    RECEIVES: { confidence: float }  e.g. 0.45
    RETURNS:  { success, confidence, message }

    Validates that confidence is within [0.1, 0.9] then updates
    the shared ObjectDetector instance used by /api/detect/frame
    and video processing tasks.
    """
    # Validate range before touching any shared state
    if not (0.1 <= body.confidence <= 0.9):
        raise HTTPException(
            status_code=422,
            detail="Confidence must be between 0.1 and 0.9"
        )

    # Import the live singleton from detection.py.
    # This is the same detector used by /api/detect/frame so the
    # change takes effect immediately on the next frame processed.
    from app.api.detection import detector as live_detector
    live_detector.confidence = round(body.confidence, 3)

    return {
        "success": True,
        "confidence": live_detector.confidence,
        "message": f"Confidence threshold updated to {round(body.confidence * 100)}%"
    }


@router.post("/settings/model")
async def update_model(body: ModelRequest):
    """
    BACKEND ENDPOINT: POST /api/settings/model
    CALLED BY: SettingsPage — Model Selector card Save button
    RECEIVES: { model_name: string }  e.g. "yolo11s.pt"
    RETURNS:  { success, model_name, message }

    Validates model_name is one of the three allowed models then
    hot-swaps the YOLO model on the shared ObjectDetector.
    The first request after a model change will be slightly slower
    because YOLO will download the weights if not cached locally.
    """
    if body.model_name not in ALLOWED_MODELS:
        raise HTTPException(
            status_code=422,
            detail=f"model_name must be one of: {', '.join(ALLOWED_MODELS)}"
        )

    from app.api.detection import detector as live_detector
    from app.cv_engine.detector import ObjectDetector
    from ultralytics import YOLO

    # Preserve the current confidence while swapping the model
    current_confidence = live_detector.confidence

    # Re-load the model (downloads automatically if not cached)
    live_detector.model = YOLO(body.model_name)
    live_detector._model_name = body.model_name
    live_detector.class_names = live_detector.model.names
    live_detector.confidence = current_confidence

    return {
        "success": True,
        "model_name": body.model_name,
        "message": f"Model switched to {body.model_name}. First inference may take a moment."
    }


@router.delete("/sessions/failed")
async def clear_failed_sessions():
    """
    BACKEND ENDPOINT: DELETE /api/sessions/failed
    CALLED BY: SettingsPage — Clear Failed Sessions card
    RETURNS: { deleted_count, message }

    Deletes all MongoDB documents in the 'sessions' collection
    where status == "failed". Matches the pattern used in
    session_repository.py (get_database() + collection access).
    """
    db = get_database()
    result = await db["sessions"].delete_many({"status": "failed"})
    count = result.deleted_count

    return {
        "deleted_count": count,
        "message": f"Deleted {count} failed session{'s' if count != 1 else ''} successfully."
    }
