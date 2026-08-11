import * as faceapi from "face-api.js";

let loaded = false;

export async function loadFaceModels() {
  if (loaded) return;

  await Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  ]);

  loaded = true;

  console.log("✅ Face Models Loaded");
}

export async function getFaceDescriptor(image: string) {
  await loadFaceModels();

  const img = await faceapi.fetchImage(image);

  const detection = await faceapi
    .detectSingleFace(
      img,
      new faceapi.TinyFaceDetectorOptions()
    )
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection) {
    return null;
  }

  return Array.from(detection.descriptor);
}