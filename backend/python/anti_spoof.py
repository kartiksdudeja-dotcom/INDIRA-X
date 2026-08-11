import base64
import json
import os
import sys

import cv2
import numpy as np
import torch


# ============================================================
# 1. Define base paths
# ============================================================

PYTHON_DIR = os.path.dirname(os.path.abspath(__file__))

PROJECT_PATH = os.path.join(
    PYTHON_DIR,
    "Silent-Face-Anti-Spoofing-master"
)

MODEL_DIR = os.path.join(
    PROJECT_PATH,
    "resources",
    "anti_spoof_models"
)


print("Python directory:", PYTHON_DIR)
print("Project path:", PROJECT_PATH)
print("Model directory:", MODEL_DIR)


# ============================================================
# 2. Check paths
# ============================================================

if not os.path.exists(PROJECT_PATH):
    raise Exception(
        f"Project path not found: {PROJECT_PATH}"
    )

if not os.path.exists(MODEL_DIR):
    raise Exception(
        f"Model directory not found: {MODEL_DIR}"
    )


# ============================================================
# 3. Append project path before local imports
# ============================================================

sys.path.insert(0, PROJECT_PATH)

from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name


# ============================================================
# 4. CPU / GPU
# ============================================================

DEVICE_ID = 0 if torch.cuda.is_available() else -1

print("CUDA available:", torch.cuda.is_available())
print("Anti-spoof device ID:", DEVICE_ID)


# ============================================================
# 5. Initialize models
# ============================================================

model_test = AntiSpoofPredict(
    device_id=DEVICE_ID
)

image_cropper = CropImage()


# ============================================================
# 6. Prediction
# ============================================================

def predict(image):

    # Detect bounding box for face
    image_bbox = model_test.get_bbox(image)

    if image_bbox is None:
        return {
            "success": False,
            "real": False,
            "score": 0.0,
            "message": "Face not detected"
        }

    prediction = np.zeros((1, 3))
    model_count = 0

    for model_name in os.listdir(MODEL_DIR):

        model_path = os.path.join(
            MODEL_DIR,
            model_name
        )

        # Filter model files only
        if (
            not os.path.isfile(model_path)
            or not model_name.endswith((".pth", ".onnx"))
        ):
            continue

        h_input, w_input, model_type, scale = parse_model_name(
            model_name
        )

        param = {
            "org_img": image,
            "bbox": image_bbox,
            "scale": scale,
            "out_w": w_input,
            "out_h": h_input,
            "crop": True,
        }

        if scale is None:
            param["crop"] = False

        img = image_cropper.crop(**param)

        # Accumulate model output
        prediction += model_test.predict(
            img,
            model_path
        )

        model_count += 1

    # No models found
    if model_count == 0:
        return {
            "success": False,
            "real": False,
            "score": 0.0,
            "message": "No valid models found in model directory"
        }

    # Average predictions
    averaged_prediction = (
        prediction / model_count
    )

    label = np.argmax(
        averaged_prediction
    )

    score = float(
        averaged_prediction[0][label]
    )

    # Class 1 = Real
    is_real = bool(label == 1)

    return {
        "success": True,
        "real": is_real,
        "score": round(score, 4)
    }


# ============================================================
# 7. Main
# ============================================================

if __name__ == "__main__":

    try:

        raw_input = sys.stdin.read().strip()

        if not raw_input:
            raise ValueError(
                "Received empty input on stdin"
            )

        data = json.loads(
            raw_input
        )

        image_base64 = data.get(
            "image",
            ""
        )

        if not image_base64:
            raise ValueError(
                "Image data is missing"
            )

        # Remove data:image/jpeg;base64 prefix
        if "," in image_base64:
            image_base64 = image_base64.split(
                ",",
                1
            )[1]

        img_bytes = base64.b64decode(
            image_base64
        )

        if len(img_bytes) == 0:
            raise ValueError(
                "Decoded Base64 byte array is empty"
            )

        npimg = np.frombuffer(
            img_bytes,
            np.uint8
        )

        image = cv2.imdecode(
            npimg,
            cv2.IMREAD_COLOR
        )

        if image is None:
            raise ValueError(
                "OpenCV failed to decode image buffer"
            )

        result = predict(image)

        print(
            json.dumps(result)
        )

    except Exception as e:

        print(
            json.dumps({
                "success": False,
                "real": False,
                "score": 0.0,
                "message": str(e)
            })
        )