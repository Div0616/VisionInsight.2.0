import cv2
import numpy as np
from ultralytics import YOLO
from app.core.config import settings

class ObjectDetector:
    def __init__(self, model_name: str = "yolo11n.pt", confidence: float = 0.25):
        """
        Initialize YOLO detector.
        
        Args:
            model_name: YOLO model to use. 
                       'yolo11n.pt' = nano (fastest, less accurate)
                       'yolo11s.pt' = small
                       'yolo11m.pt' = medium
                       'yolo11l.pt' = large
                       'yolo11x.pt' = extra large (slowest, most accurate)
            confidence: Minimum confidence threshold (0.0 - 1.0)
        """
        self._model_name = model_name  # Store for reset_tracker()
        self.model = YOLO(model_name)
        self.confidence = confidence
        self.class_names = self.model.names  # {0: 'person', 1: 'bicycle', ...}

    def track_frame(self, frame: np.ndarray) -> dict:
        """
        Run YOLO tracking on a single frame with persistent track IDs.
        Used by the live feed endpoint (/api/detect/frame) and IP camera stream.
        
        Args:
            frame: BGR image as numpy array (from OpenCV)
            
        Returns:
            Dictionary with detections list (includes track_id per object)
        """
        return self.detect_frame(frame, persist=True)

    def reset_tracker(self):
        """
        Reset the YOLO tracker state so track IDs start fresh.
        Called when the user starts or stops a live detection session.
        """
        # Re-instantiate the model to fully clear BoT-SORT/ByteTrack state.
        # We use self._model_name (set in __init__) since YOLO objects don't
        # always expose a reliable .model_name attribute across versions.
        self.model = YOLO(self._model_name)
        self.class_names = self.model.names

    def detect_frame(self, frame: np.ndarray, persist: bool = False) -> dict:
        """
        Run detection on a single frame.
        
        Args:
            frame: BGR image as numpy array (from OpenCV)
            
        Returns:
            Dictionary with detections list
        """
        results = self.model.track(
            frame,
            conf=self.confidence,
            persist=persist,   # True for live/tracking, False for video analysis
            verbose=False
        )[0]

        detections = []

        for box in results.boxes:
            x1, y1, x2, y2 = box.xyxy[0].tolist()
            confidence = float(box.conf[0])
            class_id = int(box.cls[0])
            class_name = self.class_names[class_id]

            # Capture track ID if available (None when tracker loses the object)
            track_id = int(box.id[0]) if box.id is not None else None

            detections.append({
                "bbox": [x1, y1, x2, y2],
                "confidence": round(confidence, 3),
                "class_id": class_id,
                "class_name": class_name,
                "track_id": track_id
            })

        return {
            "detections": detections,
            "total_detections": len(detections)
        }

    def annotate_frame(self, frame: np.ndarray, detections: list) -> np.ndarray:
        """
        Draw bounding boxes and labels on frame.
        
        Args:
            frame: Original BGR frame
            detections: List of detection dicts from detect_frame()
            
        Returns:
            Annotated frame with boxes drawn
        """
        annotated = frame.copy()

        for det in detections:
            x1, y1, x2, y2 = [int(v) for v in det["bbox"]]
            label = f"{det['class_name']} {det['confidence']:.0%}"

            # Draw rectangle
            cv2.rectangle(annotated, (x1, y1), (x2, y2), (0, 255, 0), 2)

            # Draw label background
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 1)
            cv2.rectangle(annotated, (x1, y1 - h - 8), (x1 + w, y1), (0, 255, 0), -1)

            # Draw label text
            cv2.putText(annotated, label, (x1, y1 - 4),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 1)

        return annotated