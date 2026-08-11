import { useEffect, useRef, useState } from "react";
import {
  encodeVisualToken,
  FRAME_DURATION_MS,
} from "../utils/visualTokenEncoder";

interface VisualFlickerBroadcasterProps {
  token?: string;
}

const REPEAT_DELAY_MS = 1000;

export default function VisualFlickerBroadcaster({
  token = "A7K92X",
}: VisualFlickerBroadcasterProps) {
  const [isBroadcasting, setIsBroadcasting] =
    useState(false);

  const [currentBit, setCurrentBit] =
    useState(0);

  const timerRef =
    useRef<number | null>(null);

  const delayTimerRef =
    useRef<number | null>(null);

  const framesRef =
    useRef<number[]>([]);

  const indexRef =
    useRef(0);

  const broadcastingRef =
    useRef(false);

  const broadcastNextFrame = () => {
    if (!broadcastingRef.current) {
      return;
    }

    const frames = framesRef.current;

    if (frames.length === 0) {
      return;
    }

    if (indexRef.current >= frames.length) {
      setCurrentBit(0);

      indexRef.current = 0;

      delayTimerRef.current =
        window.setTimeout(() => {
          broadcastNextFrame();
        }, REPEAT_DELAY_MS);

      return;
    }

    const bit =
      frames[indexRef.current];

    setCurrentBit(bit);

    indexRef.current += 1;

    timerRef.current =
      window.setTimeout(
        broadcastNextFrame,
        FRAME_DURATION_MS
      );
  };

  const startBroadcast = () => {
    if (broadcastingRef.current) {
      return;
    }

    const frames =
      encodeVisualToken(token);

    console.log(
      "Encoded frames:",
      frames
    );

    framesRef.current = frames;
    indexRef.current = 0;

    broadcastingRef.current = true;
    setIsBroadcasting(true);

    setTimeout(() => {
      broadcastNextFrame();
    }, 100);
  };

  const stopBroadcast = () => {
    broadcastingRef.current = false;

    if (timerRef.current !== null) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (delayTimerRef.current !== null) {
      clearTimeout(
        delayTimerRef.current
      );

      delayTimerRef.current = null;
    }

    indexRef.current = 0;

    setCurrentBit(0);
    setIsBroadcasting(false);
  };

  useEffect(() => {
    return () => {
      broadcastingRef.current = false;

      if (timerRef.current !== null) {
        clearTimeout(
          timerRef.current
        );
      }

      if (delayTimerRef.current !== null) {
        clearTimeout(
          delayTimerRef.current
        );
      }
    };
  }, []);

  /*
   * Outer signal board.
   *
   * Four black corner markers identify
   * the visual communication area.
   */
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 600,
        margin: "20px auto",
        padding: 20,
        textAlign: "center",
      }}
    >
      <h2>
        Visible Light Token
      </h2>

      <p>
        Test Token:{" "}
        <strong>{token}</strong>
      </p>

      {/* SIGNAL BOARD */}
      <div
        style={{
          position: "relative",
          width: 420,
          height: 320,
          margin: "25px auto",
          backgroundColor: "#ffffff",
          border: "3px solid #000000",
          boxSizing: "border-box",
        }}
      >
        {/* TOP LEFT MARKER */}
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            width: 35,
            height: 35,
            backgroundColor: "#000000",
          }}
        />

        {/* TOP RIGHT MARKER */}
        <div
          style={{
            position: "absolute",
            right: 12,
            top: 12,
            width: 35,
            height: 35,
            backgroundColor: "#000000",
          }}
        />

        {/* BOTTOM LEFT MARKER */}
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            width: 35,
            height: 35,
            backgroundColor: "#000000",
          }}
        />

        {/* BOTTOM RIGHT MARKER */}
        <div
          style={{
            position: "absolute",
            right: 12,
            bottom: 12,
            width: 35,
            height: 35,
            backgroundColor: "#000000",
          }}
        />

        {/* FLICKER AREA */}
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            top: 70,
            bottom: 70,
            backgroundColor:
              currentBit === 1
                ? "#ffffff"
                : "#000000",
            border:
              "4px solid #333333",
          }}
        />
      </div>

      <p>
        Current signal:{" "}
        <strong>
          {currentBit}
        </strong>
      </p>

      <p>
        Status:{" "}
        <strong>
          {isBroadcasting
            ? "Broadcasting continuously"
            : "Ready"}
        </strong>
      </p>

      <button
        onClick={startBroadcast}
        disabled={isBroadcasting}
        style={{
          padding: "10px 20px",
          marginRight: 10,
          cursor: "pointer",
        }}
      >
        Start Broadcast
      </button>

      <button
        onClick={stopBroadcast}
        disabled={!isBroadcasting}
        style={{
          padding: "10px 20px",
          cursor: "pointer",
        }}
      >
        Stop
      </button>
    </div>
  );
}