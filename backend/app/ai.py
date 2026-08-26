import os
import random
from typing import List, Dict, Any

class BaseVisionModel:
    def predict(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Processes image binary data and returns a list of detected objects with bounding boxes:
        [
            {
                "class_name": str,
                "confidence": float,  # 0.0 to 1.0
                "bounding_box": {
                    "left": float,    # % from left (0 to 100)
                    "top": float,     # % from top (0 to 100)
                    "width": float,   # % width (0 to 100)
                    "height": float   # % height (0 to 100)
                },
                "risk_level": str     # SAFE, LOW, MEDIUM, HIGH, CRITICAL
            }
        ]
        """
        raise NotImplementedError("Predict method must be implemented by subclasses.")

class MockVisionModel(BaseVisionModel):
    """
    Mock vision model for development. Simulates PPE detections, blocked exits, hazards.
    """
    def predict(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        # Simulated responses
        scenarios = [
            # Scenario 1: PPE Violations
            [
                {
                    "class_name": "Person",
                    "confidence": 0.98,
                    "bounding_box": {"left": 23.0, "top": 16.0, "width": 22.0, "height": 60.0},
                    "risk_level": "SAFE"
                },
                {
                    "class_name": "Missing Helmet (PPE Violation)",
                    "confidence": 0.94,
                    "bounding_box": {"left": 28.0, "top": 17.0, "width": 10.0, "height": 12.0},
                    "risk_level": "HIGH"
                },
                {
                    "class_name": "Safety Vest",
                    "confidence": 0.91,
                    "bounding_box": {"left": 24.0, "top": 28.0, "width": 20.0, "height": 30.0},
                    "risk_level": "SAFE"
                },
                {
                    "class_name": "Electrical Panel (Exposed Wiring)",
                    "confidence": 0.87,
                    "bounding_box": {"left": 52.0, "top": 27.0, "width": 27.0, "height": 45.0},
                    "risk_level": "HIGH"
                }
            ],
            # Scenario 2: Blocked Exit
            [
                {
                    "class_name": "Emergency Exit Sign",
                    "confidence": 0.96,
                    "bounding_box": {"left": 40.0, "top": 5.0, "width": 20.0, "height": 10.0},
                    "risk_level": "SAFE"
                },
                {
                    "class_name": "Blocked Exit Pathway",
                    "confidence": 0.88,
                    "bounding_box": {"left": 15.0, "top": 50.0, "width": 70.0, "height": 45.0},
                    "risk_level": "CRITICAL"
                }
            ],
            # Scenario 3: Fire Hazard
            [
                {
                    "class_name": "Smoke detection",
                    "confidence": 0.92,
                    "bounding_box": {"left": 10.0, "top": 5.0, "width": 80.0, "height": 30.0},
                    "risk_level": "CRITICAL"
                },
                {
                    "class_name": "Flammable Canisters",
                    "confidence": 0.89,
                    "bounding_box": {"left": 65.0, "top": 60.0, "width": 20.0, "height": 35.0},
                    "risk_level": "HIGH"
                }
            ]
        ]
        # Choose a scenario randomly or based on image size to provide variety
        return random.choice(scenarios)

class YOLOVisionModel(BaseVisionModel):
    """
    Template for actual YOLO integration.
    To use this, install ultralytics (`pip install ultralytics`) and load a trained weights file.
    """
    def __init__(self, model_path: str):
        self.model_path = model_path
        self.model = None
        # In actual integration, you'd do:
        # from ultralytics import YOLO
        # self.model = YOLO(model_path)
        
    def predict(self, image_bytes: bytes) -> List[Dict[str, Any]]:
        """
        Placeholder implementation for YOLO.
        """
        if not self.model:
            # Fallback to Mock model if weight file is missing
            return MockVisionModel().predict(image_bytes)
            
        # Example pseudo-code for YOLO inference:
        # import cv2
        # import numpy as np
        # nparr = np.frombuffer(image_bytes, np.uint8)
        # img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        # results = self.model(img)
        # detections = []
        # for r in results:
        #     for box in r.boxes:
        #         x1, y1, x2, y2 = box.xyxy[0] # coords
        #         conf = box.conf[0]
        #         cls = box.cls[0]
        #         class_name = self.model.names[int(cls)]
        #         # calculate risk levels, normalize box percentages, and append...
        return []

def get_vision_model() -> BaseVisionModel:
    """
    Dependency Injection provider. Loads YOLO model if path exists, otherwise MockVisionModel.
    """
    model_path = os.getenv("AI_MODEL_PATH", "models/model.pt")
    if os.path.exists(model_path):
        return YOLOVisionModel(model_path)
    return MockVisionModel()
