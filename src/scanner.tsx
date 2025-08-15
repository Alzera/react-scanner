import { useEffect, useRef } from "react";
import { useCamera } from "@alzera/react-camera";

import { useDecoder } from "./composables/use-decoder";
import type ScannerProps from "./types/scanner-props";
import type Styleable from "./types/styleable";

const flashlightIcon = (
  <svg viewBox="0 0 256 256">
    <path
      fill="none"
      d="M0 0h256v256H0z"
    />
    <path
      fill="none"
      stroke="#000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      d="m96 240 16-80-64-24L160 16l-16 80 64 24L96 240z"
    />
  </svg>
);
const flashlightDisabledIcon = (
  <svg viewBox="0 0 256 256">
    <path
      fill="none"
      d="M0 0h256v256H0z"
    />
    <path
      fill="none"
      stroke="#000"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="16"
      d="m48 40 160 176M163.8 167.4 96 240l16-80-64-24 44.2-47.4M114.1 65.1 160 16l-16 80 64 24-22.3 23.9"
    />
  </svg>
);

export default function Scanner({
  onScan,
  onError,
  delay = 800,
  aspectRatio = "1/1",
  decoderOptions,
  className,
  style,
}: ScannerProps & Styleable) {
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  const decoder = useDecoder(decoderOptions);
  const controller = useCamera({ onError });

  function decode() {
    if (!controller.video.current) return;

    decoder
      .current(controller.video.current)
      .then((code) => {
        timeoutId.current = setTimeout(decode, delay);
        if (code) onScan(code);
      })
      .catch(onError);
  }

  useEffect(() => {
    if (controller.camera.state != "display") return;
    decode();
  }, [controller.camera.state]);

  useEffect(() => {
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current);
    };
  }, []);

  return (
    <div
      id="barcode-scanner"
      className={className}
      style={style}>
      <div
        style={{
          aspectRatio: aspectRatio,
          width: "100%",
          height: "100%",
          position: "relative",
        }}>
        <video
          ref={controller.video}
          preload="none"
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        {controller.camera.capabilities?.torch && (
          <button
            type="button"
            onClick={() => (controller.camera.torch = !controller.camera.torch)}
            style={{
              width: "32px",
              height: "32px",
              position: "absolute",
              right: "16px",
              bottom: "16px",
            }}>
            {controller.camera.torch ? flashlightIcon : flashlightDisabledIcon}
          </button>
        )}
      </div>
      {controller.device.list.length > 1 && (
        <select
          value={controller.device.selected?.deviceId}
          onChange={(e) => {
            controller.device.selected = controller.device.list.find(
              (v) => v.deviceId === e.target.value
            );
          }}
          style={{
            width: "100%",
            marginTop: "8px",
            fontSize: "1rem",
          }}>
          {controller.device.list.map((v, i) => (
            <option
              key={i}
              value={v.deviceId}>
              {v.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
