from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
from detector import Detector  # Make sure this points to your YOLO detector code

# ✅ Initialize Flask
app = Flask(__name__)
CORS(app)  # ✅ Allow requests from your PWA (solves CORS issue)

# ✅ Load your YOLO model (replace with your actual .pt model if needed)
detector = Detector("yolov8n.pt")  # or "best.pt"

# ✅ Image detection endpoint
@app.route('/detect', methods=['POST'])
def detect():
    if 'image' not in request.files:
        return jsonify({'error': 'No image uploaded'}), 400

    # Read uploaded image
    file = request.files['image']
    in_memory_file = file.read()
    nparr = np.frombuffer(in_memory_file, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # Run YOLO detection
    _, labels = detector.detectObject(img)

    # ✅ Return only the first label
    if labels:
        return jsonify({'label': labels[0]})
    else:
        return jsonify({'label': None})

# ✅ Start the server
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
