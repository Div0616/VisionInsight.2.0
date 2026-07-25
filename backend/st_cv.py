from app.cv_engine.detector import ObjectDetector
import cv2
import numpy as np

# Create a blank test image (640x480, black)
test_frame = np.zeros((480, 640, 3), dtype=np.uint8)

print("Loading YOLO model...")
detector = ObjectDetector()
print("Model loaded successfully!")
print(f"Classes available: {len(detector.class_names)}")
print(f"First 10 classes: {[detector.class_names[i] for i in range(10)]}")

result = detector.detect_frame(test_frame)
print(f"Test detection complete: {result}")