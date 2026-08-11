import { useState } from "react";
import { listenForToken } from "../utils/ultrasonicDecoder";

export default function UltrasonicListener() {
  const [token, setToken] = useState("");

  const start = async () => {
    await listenForToken((char) => {
      setToken((old) => old + char);
    });
  };

  return (
    <div>
      <button onClick={start}>
        Start Listening
      </button>

      <h2>{token}</h2>
    </div>
  );
}