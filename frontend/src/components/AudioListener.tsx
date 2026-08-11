
import { useState } from "react";

export default function AudioListener() {
  const [listening, setListening] = useState(false);

  const listen = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });

    setListening(true);

    const recorder = new MediaRecorder(stream);

    recorder.start();

    setTimeout(() => {
      recorder.stop();

      stream.getTracks().forEach((track) => track.stop());

      setListening(false);

      alert("Audio captured.");
    }, 3000);
  };

  return (
    <button onClick={listen}>
      {listening ? "Listening..." : "Listen"}
    </button>
  );
}