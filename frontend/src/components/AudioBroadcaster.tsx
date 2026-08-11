import { useState } from "react";
import { playUltrasonicToken } from "../utils/ultrasonicEncoder";

interface Props {
  token: string;
}

export default function AudioBroadcaster({ token }: Props) {
  const [sending, setSending] = useState(false);

  const start = async () => {
    if (!token) {
      alert("Attendance token is not available.");
      return;
    }

    try {
      setSending(true);

      console.log("Sending ultrasonic token:", token);

      await playUltrasonicToken(token);

      console.log("Ultrasonic token sent successfully");
    } catch (error) {
      console.error("Ultrasonic broadcast error:", error);
      alert("Failed to broadcast ultrasonic token.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: 20 }}>
      <button
        type="button"
        onClick={start}
        disabled={sending || !token}
        style={{
          padding: "12px 20px",
          background: sending ? "#999" : "#16a34a",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: sending ? "not-allowed" : "pointer",
        }}
      >
        {sending
          ? "Broadcasting..."
          : "🔊 Broadcast Ultrasonic Token"}
      </button>

      <p>Current Token: {token}</p>
    </div>
  );
}