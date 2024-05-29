import { useEffect, useRef } from "react"

import { useDecoder } from "./utils/use-decoder"
import type ScannerProps from "./types/scanner-props"
import type Styleable from "./types/styleable"
import { CameraState, useCamera } from "./utils/use-camera";

const flashlightIcon = <svg viewBox="0 0 32 32"><g data-name="Layer 57"><path d="M23.25 12.49 19 8.25a3.08 3.08 0 0 0-4.24 0l-1.41 1.41a3 3 0 0 0-.58 3.41l-8.61 8.61a3 3 0 0 0 0 4.24l1.41 1.41a3 3 0 0 0 4.24 0l8.62-8.62a3 3 0 0 0 3.41-.58l1.41-1.41a3 3 0 0 0 0-4.23Zm-9.19 6.36-1.41 1.41a1 1 0 0 1-1.41-1.41l1.41-1.41a1 1 0 0 1 1.41 1.41Zm7.78-3.54-1.41 1.41a1 1 0 0 1-1.41 0L16.9 14.6l-2.12-2.12a1 1 0 0 1 0-1.41l1.42-1.41a1 1 0 0 1 1.41 0l4.24 4.24a1 1 0 0 1-.01 1.42ZM24 9a1 1 0 0 1-.71-1.71l3-3A1 1 0 0 1 27.7 5.7l-3 3a1 1 0 0 1-.7.3ZM21.13 7.59a1 1 0 0 1-.32-.05 1 1 0 0 1-.62-1.27l.74-2.18a1 1 0 0 1 1.89.65l-.74 2.18a1 1 0 0 1-.95.67ZM25.37 11.88A1 1 0 0 1 25 10l2.12-.89a1 1 0 0 1 .77 1.85l-2.12.89a1 1 0 0 1-.4.03Z" /></g></svg>
const flashlightDisabledIcon = <svg viewBox="0 0 32 32"><g data-name="Layer 57"><path d="m27.61 21.68-6.93-6.93-1.42 1.41-1 1a1 1 0 0 1 .89.26l1.41 1.41a1 1 0 1 1-1.41 1.41l-1.41-1.41a1 1 0 0 1-.26-.88l-1 1L15 20.4l7 6.94a3 3 0 0 0 4.24 0l1.41-1.42a3 3 0 0 0-.04-4.24ZM7.07 8.71a1 1 0 0 0 1.41-1.42l-3-3a1 1 0 0 0-1.41 1.42ZM9.7 6.91a1 1 0 0 0 .95.68 1 1 0 0 0 .35-.05 1 1 0 0 0 .62-1.27l-.74-2.18A1 1 0 0 0 9 4.73ZM6.41 11.88A1 1 0 0 0 6.79 10l-2.12-.93a1 1 0 0 0-.77 1.85l2.1.88a1 1 0 0 0 .41.08ZM27.71 4.29a1 1 0 0 0-1.41 0l-7 7a3 3 0 0 0-.84-1.67L17 8.25a3.08 3.08 0 0 0-4.24 0l-4.24 4.24a3 3 0 0 0 0 4.24l1.42 1.42a3 3 0 0 0 1.67.83l-7.32 7.31A1 1 0 1 0 5.7 27.7l22-22a1 1 0 0 0 .01-1.41Z" /></g></svg>

export default function Scanner({
  onScan,
  onError,
  flipHorizontally = false,
  delay = 800,
  aspectRatio = '1/1',
  decoderOptions,
  className,
  style,
}: ScannerProps & Styleable) {
  const timeoutId = useRef<NodeJS.Timeout | null>(null)
  const decoder = useDecoder(decoderOptions)
  const controller = useCamera(onError)

  function decode() {
    if (!controller.preview.current) return

    decoder
      .current(controller.preview.current)
      .then((code) => {
        timeoutId.current = setTimeout(decode, delay)
        if (code) onScan(code)
      })
      .catch(onError)
  }

  useEffect(() => {
    if (controller.camera.state != CameraState.display) return
    decode()
  }, [controller.camera.state])

  useEffect(() => {
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current)
    }
  }, [])

  return <div id="barcode-scanner" className={className} style={style}>
    <div style={{
      aspectRatio: aspectRatio,
      width: '100%',
      height: '100%',
      position: 'relative',
    }}>
      <video
        ref={controller.preview}
        preload="none"
        muted
        playsInline
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: flipHorizontally ? 'scaleX(1)' : 'scaleX(-1)',
          userSelect: 'none',
          pointerEvents: 'none',
        }} />
      {controller.camera.capabilities?.torch && <button
        type="button"
        onClick={() => controller.camera.torch = !controller.camera.torch}
        style={{
          width: '32px',
          height: '32px',
          position: 'absolute',
          right: '16px',
          bottom: '16px',
        }}>
        {controller.camera.torch ? flashlightIcon : flashlightDisabledIcon}
      </button>}
    </div>
    {controller.device.list.length > 1 && <select
      value={controller.device.selected}
      onChange={e => controller.device.selected = e.target.value}
      style={{
        width: '100%',
        marginTop: '8px',
        fontSize: '1rem',
      }}>
      {controller.device.list.map((v, i) => <option key={i} value={v.deviceId}>{v.label}</option>)}
    </select>}

  </div>
}