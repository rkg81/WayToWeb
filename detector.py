import torch
import cv2
from ultralytics import YOLO

class Detector():
    
    def __init__(self, model_path="yolov8n.pt", device=None):

        # Select device: GPU if available, otherwise CPU
        self.device = device if device else ("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Using device: {self.device}")

        # Load YOLOv8 model
        self.model = YOLO(model_path).to(self.device)  #

    def detectObject(self, frame):
        labels = []

        # Perform YOLOv8 inference
        results = self.model(frame)[0]

        for box in results.boxes:
            x1, y1, x2, y2 = map(int, box.xyxy[0])  # Bounding box coordinates
            conf = float(box.conf[0])               # Confidence score
            label_id = int(box.cls[0])              # Class ID
            label = self.model.names[label_id]      # Class label

            if conf > 0.6:  # Confidence threshold
                labels.append((label))

                # Draw bounding box and label
                label_text = f"{label}: {conf:.2f}"
                cv2.rectangle(frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                cv2.putText(frame, label_text, (x1, y1 - 10),
                            cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 255), 2)

        return frame, labels