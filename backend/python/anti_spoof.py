import os
import sys
import base64
import json

import cv2
import numpy as np
import torch

print("===== PYTHON ANTI SPOOF START =====", flush=True)

# ============================================================
# 1. Check Python packages
# ============================================================

try:
    print("OpenCV loaded:", cv2.__version__, flush=True)
    print("NumPy loaded:", np.__version__, flush=True)
    print("Torch loaded:", torch.__version__, flush=True)
except Exception as e:
    print("IMPORT ERROR:", repr(e), flush=True)
    raise


# ============================================================
# 2. Base paths
# ============================================================

PYTHON_DIR = os.path.dirname(os.path.abspath(__file__))

PROJECT_PATH = os.path.join(
    PYTHON_DIR,
    "anti-spoof",
    "Silent-Face-Anti-Spoofing-master"
)

MODEL_DIR = os.path.join(
    PROJECT_PATH,
    "resources",
    "anti_spoof_models"
)

print("PYTHON_DIR:", PYTHON_DIR, flush=True)
print("PROJECT_PATH:", PROJECT_PATH, flush=True)
print("MODEL_DIR:", MODEL_DIR, flush=True)


# ============================================================
# 3. Check paths
# ============================================================

if not os.path.exists(PROJECT_PATH):
    raise Exception(
        f"Project path not found: {PROJECT_PATH}"
    )

if not os.path.exists(MODEL_DIR):
    raise Exception(
        f"Model directory not found: {MODEL_DIR}"
    )

print("Project path exists", flush=True)
print("Model directory exists", flush=True)


# ============================================================
# 4. Add anti-spoof project to Python path
# ============================================================

sys.path.insert(0, PROJECT_PATH)

print("Loading anti-spoof modules...", flush=True)

from src.anti_spoof_predict import AntiSpoofPredict
from src.generate_patches import CropImage
from src.utility import parse_model_name

print("AntiSpoofPredict imported", flush=True)
print("CropImage imported", flush=True)
print("parse_model_name imported", flush=True)


# ============================================================
# 5. CPU
# ============================================================

# Render does not provide a GPU for this service.
# Force CPU to avoid CUDA/model initialization problems.

DEVICE_ID = -1

print(
    "CUDA available:",
    torch.cuda.is_available(),
    flush=True
)

print(
    "Anti-spoof device ID:",
    DEVICE_ID,
    flush=True
)


# ============================================================
# 6. Initialize anti-spoof model
# ============================================================

print("Creating AntiSpoofPredict...", flush=True)

model_test = AntiSpoofPredict(
    device_id=DEVICE_ID
)

print(
    "AntiSpoofPredict initialized successfully",
    flush=True
)

image_cropper = CropImage()

print(
    "Image cropper initialized",
    flush=True
)


# ============================================================
# 7. Prediction
# ============================================================

def predict(image):

    print(
        "===== START ANTI SPOOF PREDICTION =====",
        flush=True
    )

    # --------------------------------------------------------
    # Detect face
    # --------------------------------------------------------

    print(
        "Detecting face...",
        flush=True
    )

    image_bbox = model_test.get_bbox(image)

    print(
        "Face bbox:",
        image_bbox,
        flush=True
    )

    if image_bbox is None:
        return {
            "success": False,
            "real": False,
            "score": 0.0,
            "message": "Face not detected"
        }

    # --------------------------------------------------------
    # Prediction array
    # --------------------------------------------------------

    prediction = np.zeros((1, 3))

    model_count = 0

    # --------------------------------------------------------
    # Load anti-spoof models
    # --------------------------------------------------------

    model_files = os.listdir(MODEL_DIR)

    print(
        "Files in model directory:",
        model_files,
        flush=True
    )

    for model_name in model_files:

        model_path = os.path.join(
            MODEL_DIR,
            model_name
        )

        if (
            not os.path.isfile(model_path)
            or not model_name.endswith(
                (".pth", ".onnx")
            )
        ):
            continue

        print(
            "Using model:",
            model_name,
            flush=True
        )

        # ----------------------------------------------------
        # Parse model name
        # ----------------------------------------------------

        h_input, w_input, model_type, scale = parse_model_name(
            model_name
        )

        print(
            "Model parameters:",
            h_input,
            w_input,
            model_type,
            scale,
            flush=True
        )

        # ----------------------------------------------------
        # Crop face
        # ----------------------------------------------------

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

        print(
            "Face crop completed",
            flush=True
        )

        # ----------------------------------------------------
        # Run model
        # ----------------------------------------------------

        model_prediction = model_test.predict(
            img,
            model_path
        )

        print(
            "Model prediction:",
            model_prediction,
            flush=True
        )

        prediction += model_prediction

        model_count += 1

    # --------------------------------------------------------
    # No models
    # --------------------------------------------------------

    if model_count == 0:

        return {
            "success": False,
            "real": False,
            "score": 0.0,
            "message": "No valid models found in model directory"
        }

    # --------------------------------------------------------
    # Average predictions
    # --------------------------------------------------------

    averaged_prediction = (
        prediction / model_count
    )

    print(
        "Averaged prediction:",
        averaged_prediction,
        flush=True
    )

    label = np.argmax(
        averaged_prediction
    )

    score = float(
        averaged_prediction[0][label]
    )

    # Class 1 = real
    is_real = bool(label == 1)

    print(
        "Label:",
        label,
        flush=True
    )

    print(
        "Score:",
        score,
        flush=True
    )

    print(
        "Real:",
        is_real,
        flush=True
    )

    return {
        "success": True,
        "real": is_real,
        "score": round(score, 4)
    }


# ============================================================
# 8. Main
# ============================================================

if __name__ == "__main__":

    try:

        print(
            "Waiting for image from Node.js...",
            flush=True
        )

        raw_input = sys.stdin.read().strip()

        print(
            "Input received",
            flush=True
        )

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

        print(
            "Image data received. Length:",
            len(image_base64),
            flush=True
        )

        # Remove data:image/jpeg;base64 prefix

        if "," in image_base64:

            image_base64 = image_base64.split(
                ",",
                1
            )[1]

        # Decode Base64

        img_bytes = base64.b64decode(
            image_base64
        )

        print(
            "Decoded image bytes:",
            len(img_bytes),
            flush=True
        )

        if len(img_bytes) == 0:
            raise ValueError(
                "Decoded Base64 byte array is empty"
            )

        # Convert to NumPy

        npimg = np.frombuffer(
            img_bytes,
            np.uint8
        )

        # Decode image

        image = cv2.imdecode(
            npimg,
            cv2.IMREAD_COLOR
        )

        if image is None:
            raise ValueError(
                "OpenCV failed to decode image buffer"
            )

        print(
            "Image decoded successfully:",
            image.shape,
            flush=True
        )

        # Run prediction

        result = predict(image)

        # IMPORTANT:
        # Only JSON should be returned as the final output.
        print(
            json.dumps(result),
            flush=True
        )

    except Exception as e:

        print(
            "PYTHON ERROR:",
            repr(e),
            flush=True
        )

        print(
            json.dumps({
                "success": False,
                "real": False,
                "score": 0.0,
                "message": str(e)
            }),
            flush=True
        )