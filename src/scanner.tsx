import { useEffect, useRef, useState } from "react"

import createDecoder, { type Decoder } from "./utils/create-decoder"
import type ScannerProps from "./types/scanner-props"
import type Styleable from "./types/styleable"

interface HTMLVideoElementExtended extends HTMLVideoElement {
  mozSrcObject?: MediaStream
}

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
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<number | undefined>();

  const preview = useRef<HTMLVideoElementExtended>(null)
  const timeout = useRef<NodeJS.Timeout | null>(null)
  const stopCamera = useRef<(() => void) | null>(null)

  const decoder = useRef<Decoder | null>(null)
  useEffect(() => { decoder.current = createDecoder(decoderOptions) }, [decoderOptions])

  const handleVideo = (stream: MediaStream) => {
    if (!preview.current) {
      timeout.current = setTimeout(() => handleVideo(stream), 200)
      return
    }

    if (preview.current.srcObject !== undefined) {
      preview.current.srcObject = stream
    } else if (preview.current.mozSrcObject !== undefined) {
      preview.current.mozSrcObject = stream
    } else if (window.URL.createObjectURL) {
      preview.current.src = window.URL.createObjectURL(stream as any)
    } else if (window.webkitURL) {
      preview.current.src = window.webkitURL.createObjectURL(stream as any)
    } else {
      preview.current.src = stream as any
    }

    const streamTrack = stream.getTracks()[0]
    stopCamera.current = streamTrack.stop.bind(streamTrack)
    preview.current.addEventListener('canplay', handleCanPlay)
  }

  const handleCanPlay = () => {
    if (!preview.current) return

    preview.current.play()
      .then(() => timeout.current = setTimeout(check, delay))
      .catch(onError)
    preview.current.removeEventListener('canplay', handleCanPlay)
  }

  const check = () => {
    if (!preview.current) {
      timeout.current = setTimeout(check, delay)
      return
    }

    if (preview.current.readyState === preview.current.HAVE_ENOUGH_DATA) {
      const decode = () => {
        if (!preview.current) return

        decoder.current?.(preview.current).then((code) => {
          timeout.current = setTimeout(decode, delay)
          if (code) onScan(code)
        })
      }
      decode()
    } else {
      timeout.current = setTimeout(check, delay)
    }
  }

  const release = () => {
    if (timeout.current) clearTimeout(timeout.current)
    if (stopCamera) stopCamera.current?.()
    preview.current?.removeEventListener('canplay', handleCanPlay)
  }

  useEffect(() => {
    navigator
      .mediaDevices
      .enumerateDevices()
      .then(ds => ds.filter((d) => d.kind === 'videoinput'))
      .then(ds => {
        setDevices(ds)
        setSelectedDevice(0)
      })
      .catch(onError)
    return release
  }, [])

  useEffect(() => {
    if (selectedDevice == undefined || selectedDevice >= devices.length) return

    navigator.mediaDevices
      .getUserMedia({
        video: {
          deviceId: devices[selectedDevice].deviceId
        }
      })
      .then(handleVideo)
      .catch(onError)

    return release
  }, [selectedDevice])

  return <div id="barcode-scanner" className={className} style={style}>
    <video
      ref={preview}
      preload="none"
      playsInline
      style={{
        aspectRatio: aspectRatio,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: flipHorizontally ? 'scaleX(1)' : 'scaleX(-1)',
      }} />
    {devices.length > 1 && <select
      value={selectedDevice}
      onChange={e => {
        const v = parseInt(e.target.value)
        setSelectedDevice(Number.isNaN(v) ? undefined : v)
      }}
      style={{
        width: '100%',
        marginTop: '8px',
        fontSize: '1rem',
      }}>
      {devices.map((v, i) => <option key={i} value={i}>{v.label}</option>)}
    </select>}
  </div>
}