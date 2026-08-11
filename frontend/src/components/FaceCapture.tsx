import { useEffect, useRef, useState } from "react";

interface Props {
  onCapture: (image: string) => void;
}

export default function FaceCapture({ onCapture }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [status, setStatus] = useState("Preparing camera...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stream: MediaStream | null = null;

    const startCamera = async () => {
      try {
        console.log("Opening camera...");

        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: "user",
          },
        });

        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;

          const handleReady = () => {
            if (!isReady) {
              setIsReady(true);
              setStatus("Camera ready");
            }
          };

          video.addEventListener("canplay", handleReady, { once: true });
          await video.play();

await new Promise<void>((resolve) => {
  if (video.readyState >= 2) {
    resolve();
  } else {
    video.onloadedmetadata = () => resolve();
  }
});

handleReady();
        }

        console.log("Camera started");
      } catch (err) {
        console.error("Camera Error:", err);
        setError("Unable to access camera. Please allow camera permission.");
        setStatus("Camera error");
      }
    };

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const capture = () => {
  const video = videoRef.current;
  const canvas = canvasRef.current;

  console.log("Capture pressed");
  console.log("Ready:", isReady);
  console.log("Video:", video);
  console.log("Canvas:", canvas);

  if (!video || !canvas) {
    alert("Video or canvas not found");
    return;
  }

  console.log("Width:", video.videoWidth);
  console.log("Height:", video.videoHeight);

  if (video.videoWidth === 0 || video.videoHeight === 0) {
    alert("Camera video feed is not ready yet. Please wait a second.");
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    alert("Canvas context not found");
    return;
  }

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const image = canvas.toDataURL("image/jpeg", 0.9);

  alert("Image Captured");
  console.log("Image Length:", image.length);

  onCapture(image);
};

  return (
    <div style={{ maxWidth: 480, margin: "0 auto" }}>
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{
          width: "100%",
          maxHeight: 360,
          objectFit: "cover",
          borderRadius: 8,
          background: "#000",
        }}
      />
      <canvas ref={canvasRef} style={{ display: "none" }} />

      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          onClick={capture}
         disabled={!isReady}
          style={{
            width: "100%",
            padding: "10px 12px",
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Capture Face
        </button>
      </div>

      <p style={{ marginTop: 10, fontSize: 14, color: error ? "#dc2626" : "#374151" }}>
        {error || status}
      </p>
    </div>
  );
}