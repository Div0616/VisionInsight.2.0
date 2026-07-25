import cv2
import time
import os
from datetime import datetime
from app.cv_engine.detector import ObjectDetector
from app.core.config import settings
from app.models.session import SessionStatus
from pymongo import MongoClient


def get_sync_db():
    client = MongoClient(settings.MONGODB_URI)
    return client[settings.DATABASE_NAME]


def sync_update_status(session_id, status, progress=None, error=None):
    db = get_sync_db()
    update = {"status": status, "updated_at": datetime.utcnow()}
    if progress is not None:
        update["progress"] = progress
    if error is not None:
        update["error"] = error
    db["sessions"].update_one(
        {"session_id": session_id},
        {"$set": update}
    )


def sync_update_analytics(session_id, analytics):
    db = get_sync_db()
    db["sessions"].update_one(
        {"session_id": session_id},
        {"$set": {
            "analytics": analytics,
            "status": SessionStatus.COMPLETED,
            "progress": 100.0,
            "updated_at": datetime.utcnow()
        }}
    )


class VideoProcessor:
    def __init__(self):
        self.detector = ObjectDetector()

    def process_video(self, video_path: str, session_id: str) -> dict:
        try:
            sync_update_status(
                session_id, SessionStatus.PROCESSING, progress=0.0
            )

            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise ValueError(f"Cannot open video: {video_path}")

            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

            output_path = os.path.join(
                settings.PROCESSED_DIR,
                f"{session_id}_output.mp4"
            )
            fourcc = cv2.VideoWriter_fourcc(*"avc1")
            out = cv2.VideoWriter(
                output_path, fourcc, fps, (width, height)
            )

            all_detections = []
            class_counts = {}
            start_time = time.time()
            frame_number = 0

            while True:
                ret, frame = cap.read()
                if not ret:
                    break

                frame_number += 1
                result = self.detector.detect_frame(frame)
                detections = result["detections"]

                for det in detections:
                    all_detections.append(
                        {"frame": frame_number, **det}
                    )
                    cn = det["class_name"]
                    class_counts[cn] = class_counts.get(cn, 0) + 1

                annotated = self.detector.annotate_frame(
                    frame, detections
                )
                out.write(annotated)

                if frame_number % 10 == 0:
                    progress = (frame_number / total_frames) * 100
                    sync_update_status(
                        session_id,
                        SessionStatus.PROCESSING,
                        progress=round(progress, 1)
                    )

            cap.release()
            out.release()

            processing_time = time.time() - start_time

            # Video stored locally — served via GET /api/video/{session_id}
            video_url = output_path
            print(f"Processed video saved locally: {output_path}")

            analytics = {
                "total_frames": total_frames,
                "processed_frames": frame_number,
                "total_detections": len(all_detections),
                "unique_classes": list(class_counts.keys()),
                "class_distribution": class_counts,
                "processing_time_seconds": round(processing_time, 2),
                "fps": round(fps, 2),
                "resolution": f"{width}x{height}",
                "output_video": video_url  # Now a Cloudinary URL
            }

            sync_update_analytics(session_id, analytics)
            return analytics

        except Exception as e:
            sync_update_status(
                session_id, SessionStatus.FAILED, error=str(e)
            )
            raise