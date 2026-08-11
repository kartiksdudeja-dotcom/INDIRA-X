import { sendUltrasonicToken } from "../utils/ultrasonicSender";

export default function UltrasonicSender() {
  const send = async () => {
    await sendUltrasonicToken("ABC123");
  };

  return (
    <button onClick={send}>
      Broadcast Ultrasonic Token
    </button>
  );
}