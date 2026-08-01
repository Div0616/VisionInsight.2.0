import base64
import numpy as np
import cv2
import threading
import time
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import Optional
from app.cv_engine.detector import ObjectDetector

router = APIRouter()

# ============================================
# SINGLE DETECTOR INSTANCE — LAZY INITIALIZED
# Created on first request, not at import time.
# This prevents the server from crashing if the
# model file path isn't resolved yet at startup.
# ============================================
_detector: Optional["ObjectDetector"] = None
_detector_lock = threading.Lock()


def get_detector() -> "ObjectDetector":
    """Return the shared detector, creating it on first call."""
    global _detector
    if _detector is None:
        with _detector_lock:
            if _detector is None:  # double-checked locking
                _detector = ObjectDetector(model_name="yolo11n.pt", confidence=0.25)
    return _detector


# Keep module-level alias for backward compatibility with reset endpoint
def _get_detector_direct():
    return _detector


live_seen_track_ids = set()   # All unique track IDs seen in current live session
live_lock = threading.Lock()  # Thread safety for live state

# ============================================
# IP CAMERA STREAM STATE
# Manages background thread for IP camera streams
# ============================================
ip_stream_state = {
    "active": False,
    "thread": None,
    "latest_detections": [],
    "active_objects": 0,
    "total_unique": 0,
    "frame_count": 0,
    "fps": 0,
    "error": None,
    "url": None,
}
ip_stream_lock = threading.Lock()
ip_stream_detector = None  # Separate detector instance for IP camera


class FrameRequest(BaseModel):
    """
    Request body for frame detection
    frame_data: base64 encoded JPEG image string
    """
    frame_data: str  # base64 encoded image


class StreamRequest(BaseModel):
    """Request body to start an IP camera stream."""
    url: str  # RTSP or HTTP stream URL


class DetectionResponse(BaseModel):
    """
    Response containing all detections for one frame
    """
    detections: list
    total_detections: int
    active_objects: int
    total_unique_objects: int
    frame_width: int
    frame_height: int


class StreamStatusResponse(BaseModel):
    """Response for IP camera stream status."""
    active: bool
    detections: list
    active_objects: int
    total_unique_objects: int
    frame_count: int
    fps: float
    error: Optional[str] = None
    url: Optional[str] = None


@router.post("/detect/frame", response_model=DetectionResponse)
async def detect_frame(request: FrameRequest):
    """
    BACKEND ENDPOINT: POST /api/detect/frame
    CALLED BY: LivePage every 500ms while streaming
    RECEIVES: Base64 encoded video frame from webcam
    RETURNS: List of tracked detections with track IDs

    Flow:
    1. Decode base64 string to numpy array
    2. Run YOLO tracking on frame (persistent IDs)
    3. Return detections with bounding box + track_id + labels + confidence
    """
    global live_seen_track_ids

    try:
        # ============================================
        # STEP 1: Decode base64 image to numpy array
        # ============================================
        img_data = base64.b64decode(request.frame_data)
        np_arr = np.frombuffer(img_data, np.uint8)
        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        if frame is None:
            # Return empty result for corrupted frames instead of crashing
            return DetectionResponse(
                detections=[],
                total_detections=0,
                active_objects=0,
                total_unique_objects=len(live_seen_track_ids),
                frame_width=0,
                frame_height=0
            )

        height, width = frame.shape[:2]

        # ============================================
        # STEP 2: Run YOLO tracking (not just detection)
        # Uses BoT-SORT for persistent track IDs
        # ============================================
        result = get_detector().track_frame(frame)
        detections = result["detections"]

        # Update live tracking state
        active_objects = 0
        with live_lock:
            for det in detections:
                track_id = det.get("track_id", -1)
                if track_id >= 0:
                    live_seen_track_ids.add(track_id)
                    active_objects += 1

            total_unique = len(live_seen_track_ids)

        return DetectionResponse(
            detections=detections,
            total_detections=result["total_detections"],
            active_objects=active_objects,
            total_unique_objects=total_unique,
            frame_width=width,
            frame_height=height
        )

    except Exception as e:
        # Don't crash on detection errors — return empty result
        return DetectionResponse(
            detections=[],
            total_detections=0,
            active_objects=0,
            total_unique_objects=len(live_seen_track_ids),
            frame_width=0,
            frame_height=0
        )


@router.post("/detect/reset")
async def reset_tracking():
    """
    BACKEND ENDPOINT: POST /api/detect/reset
    CALLED BY: LivePage when user starts/stops detection
    Resets the tracker state so IDs start fresh
    """
    global live_seen_track_ids
    with live_lock:
        live_seen_track_ids = set()
    d = _get_detector_direct()
    if d is not None:
        d.reset_tracker()
    return {"message": "Tracking state reset", "status": "ok"}


# ============================================
# IP CAMERA / PHONE CAMERA STREAM ENDPOINTS
# Processes RTSP/HTTP streams in a background thread
# ============================================

def _ip_stream_worker(url: str):
    """Background thread that reads and processes IP camera frames."""
    global ip_stream_state, ip_stream_detector

    # Create a separate detector instance for IP camera
    ip_stream_detector = ObjectDetector()
    ip_stream_detector.reset_tracker()

    seen_ids = set()
    frame_count = 0
    fps_counter = 0
    fps_timer = time.time()
    current_fps = 0.0

    cap = cv2.VideoCapture(url)
    if not cap.isOpened():
        with ip_stream_lock:
            ip_stream_state["error"] = f"Cannot connect to stream: {url}"
            ip_stream_state["active"] = False
        return

    with ip_stream_lock:
        ip_stream_state["error"] = None

    while True:
        with ip_stream_lock:
            if not ip_stream_state["active"]:
                break

        ret, frame = cap.read()
        if not ret:
            # Try to reconnect on stream interruption
            cap.release()
            time.sleep(1)
            cap = cv2.VideoCapture(url)
            if not cap.isOpened():
                with ip_stream_lock:
                    ip_stream_state["error"] = "Stream disconnected"
                    ip_stream_state["active"] = False
                break
            continue

        if frame is None or frame.size == 0:
            continue

        # Run tracking
        result = ip_stream_detector.track_frame(frame)
        detections = result["detections"]

        # Update tracking state
        active_count = 0
        for det in detections:
            track_id = det.get("track_id", -1)
            if track_id >= 0:
                seen_ids.add(track_id)
                active_count += 1

        frame_count += 1
        fps_counter += 1

        # Calculate FPS every second
        elapsed = time.time() - fps_timer
        if elapsed >= 1.0:
            current_fps = fps_counter / elapsed
            fps_counter = 0
            fps_timer = time.time()

        with ip_stream_lock:
            ip_stream_state["latest_detections"] = detections
            ip_stream_state["active_objects"] = active_count
            ip_stream_state["total_unique"] = len(seen_ids)
            ip_stream_state["frame_count"] = frame_count
            ip_stream_state["fps"] = round(current_fps, 1)

        # Small sleep to avoid overwhelming CPU (process ~15 fps)
        time.sleep(0.066)

    cap.release()
    if ip_stream_detector:
        ip_stream_detector.reset_tracker()


@router.post("/stream/start")
async def start_ip_stream(request: StreamRequest):
    """
    BACKEND ENDPOINT: POST /api/stream/start
    CALLED BY: LivePage when user connects IP camera
    Starts processing an RTSP/HTTP camera stream in background
    """
    global ip_stream_state

    with ip_stream_lock:
        if ip_stream_state["active"]:
            raise HTTPException(status_code=400, detail="A stream is already active. Stop it first.")

        ip_stream_state = {
            "active": True,
            "thread": None,
            "latest_detections": [],
            "active_objects": 0,
            "total_unique": 0,
            "frame_count": 0,
            "fps": 0,
            "error": None,
            "url": request.url,
        }

    # Start background processing thread
    thread = threading.Thread(target=_ip_stream_worker, args=(request.url,), daemon=True)
    thread.start()

    with ip_stream_lock:
        ip_stream_state["thread"] = thread

    return {"message": f"Stream started: {request.url}", "status": "ok"}


@router.post("/stream/stop")
async def stop_ip_stream():
    """
    BACKEND ENDPOINT: POST /api/stream/stop
    CALLED BY: LivePage when user disconnects IP camera
    """
    global ip_stream_state

    with ip_stream_lock:
        ip_stream_state["active"] = False

    return {"message": "Stream stopped", "status": "ok"}


@router.get("/stream/status", response_model=StreamStatusResponse)
async def get_stream_status():
    """
    BACKEND ENDPOINT: GET /api/stream/status
    CALLED BY: LivePage polling every 500ms while IP camera is active
    Returns latest detection results from the IP camera stream
    """
    with ip_stream_lock:
        return StreamStatusResponse(
            active=ip_stream_state["active"],
            detections=ip_stream_state["latest_detections"],
            active_objects=ip_stream_state["active_objects"],
            total_unique_objects=ip_stream_state["total_unique"],
            frame_count=ip_stream_state["frame_count"],
            fps=ip_stream_state["fps"],
            error=ip_stream_state["error"],
            url=ip_stream_state["url"],
        )