from flask import Flask, request, jsonify
import base64
import cv2
import numpy as np

from anti_spoof import predict

app = Flask(__name__)


@app.get("/")
def health():
    return jsonify({
        "success": True,
        "service": "Indira Anti-Spoof API",
        "status": "running"
    })


@app.post("/anti-spoof")
def anti_spoof():
    try:
        data = request.get_json(silent=True)

        if not data:
            return jsonify({
                "success": False,
                "real": False,
                "score": 0.0,
                "message": "Request body is empty"
            }), 400

        image_base64 = data.get("image", "")

        if not image_base64:
            return jsonify({
                "success": False,
                "real": False,
                "score": 0.0,
                "message": "Image is missing"
            }), 400

        # Remove data:image/jpeg;base64,... prefix
        if "," in image_base64:
            image_base64 = image_base64.split(",", 1)[1]

        image_bytes = base64.b64decode(image_base64)

        npimg = np.frombuffer(
            image_bytes,
            np.uint8
        )

        image = cv2.imdecode(
            npimg,
            cv2.IMREAD_COLOR
        )

        if image is None:
            return jsonify({
                "success": False,
                "real": False,
                "score": 0.0,
                "message": "Unable to decode image"
            }), 400

        print("Image received:", image.shape, flush=True)

        result = predict(image)

        print("Prediction:", result, flush=True)

        return jsonify(result)

    except Exception as e:

        print("ANTI SPOOF ERROR:", repr(e), flush=True)

        return jsonify({
            "success": False,
            "real": False,
            "score": 0.0,
            "message": str(e)
        }), 500


if __name__ == "__main__":

    import os

    port = int(
        os.environ.get("PORT", 10000)
    )

    print(
        f"Starting Anti-Spoof API on port {port}",
        flush=True
    )

    app.run(
        host="0.0.0.0",
        port=port,
        debug=False
    )