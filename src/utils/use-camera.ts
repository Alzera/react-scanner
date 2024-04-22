import { useEffect, useRef, useState } from "react"
import { eventOn, videoReady, timeout } from "."
import shimGetUserMedia from "./shim-get-user-media"
import { useLocalStorage } from "./use-local-storage"

interface HTMLVideoElementExtended extends HTMLVideoElement {
  mozSrcObject?: MediaStream
}
interface MediaTrackCapabilities {
  aspectRatio?: DoubleRange;
  autoGainControl?: boolean[];
  channelCount?: ULongRange;
  deviceId?: string;
  displaySurface?: string;
  echoCancellation?: boolean[];
  facingMode?: string[];
  frameRate?: DoubleRange;
  groupId?: string;
  height?: ULongRange;
  noiseSuppression?: boolean[];
  sampleRate?: ULongRange;
  sampleSize?: ULongRange;
  width?: ULongRange;
  torch?: boolean;
}

interface MediaTrackConstraintSet {
  aspectRatio?: ConstrainDouble;
  autoGainControl?: ConstrainBoolean;
  channelCount?: ConstrainULong;
  deviceId?: ConstrainDOMString;
  displaySurface?: ConstrainDOMString;
  echoCancellation?: ConstrainBoolean;
  facingMode?: ConstrainDOMString;
  frameRate?: ConstrainDouble;
  groupId?: ConstrainDOMString;
  height?: ConstrainULong;
  noiseSuppression?: ConstrainBoolean;
  sampleRate?: ConstrainULong;
  sampleSize?: ConstrainULong;
  width?: ConstrainULong;
  torch?: ConstrainBoolean;
}

export enum CameraState {
  starting, display, stopping, idle,
}

const handleStream = async (
  preview: HTMLVideoElementExtended,
  stream: MediaStream,
  info: MediaDeviceInfo
) => {
  if (preview.srcObject !== undefined) {
    preview.srcObject = stream
  } else if (preview.mozSrcObject !== undefined) {
    preview.mozSrcObject = stream
  } else if (window.URL.createObjectURL) {
    preview.src = window.URL.createObjectURL(stream as any)
  } else if (window.webkitURL) {
    preview.src = window.webkitURL.createObjectURL(stream as any)
  } else {
    preview.src = stream as any
  }

  await eventOn(preview, 'canplay')

  const isFrontCamera = /front|user|face/gi.test(info.label)
  preview.style.transform = isFrontCamera ? 'scaleX(-1)' : ''

  await preview.play()
  await videoReady(preview, 750)

  await timeout(500)
  const [track] = stream.getVideoTracks()
  const capabilities: Partial<MediaTrackCapabilities> = track?.getCapabilities?.() ?? {}
  return capabilities
}

const requestCameraPermission = () => navigator.mediaDevices
  .getUserMedia({ audio: false, video: true })
  .then(s => s.getTracks().forEach(i => i.stop()))

const getDevices = () => shimGetUserMedia()
  .then(requestCameraPermission)
  .then(_ => navigator.mediaDevices.enumerateDevices())
  .then(ds => ds.filter((d) => d.kind === 'videoinput'))

const getUserMedia = (deviceId: string) => navigator.mediaDevices
  .getUserMedia({ audio: false, video: { deviceId } })

export const useCamera = (
  onError: ((error: any) => void) | undefined,
) => {
  const preview = useRef<HTMLVideoElementExtended>(null)
  const stream = useRef<MediaStream | null>(null)
  const isMounted = useRef<boolean>(false)
  const capabilities = useRef<MediaTrackCapabilities>()
  const torch = useRef<boolean>(false)

  const [cameraState, setCameraState] = useState<CameraState>(CameraState.idle)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>();
  const [lastDeviceId, setLastDeviceId] = useLocalStorage<string | null>("last-device-id", null)

  const release = async () => {
    setCameraState(CameraState.stopping)
    if (preview.current) {
      preview.current.src = ''
      preview.current.srcObject = null
      preview.current.load()

      await eventOn(preview.current, 'error')
    }
    if (stream.current) {
      const constrains: MediaTrackConstraints | null = torch.current
        ? { advanced: [{ torch: false } as MediaTrackConstraintSet] }
        : null
      for (const track of stream.current.getVideoTracks()) {
        if(constrains) await track.applyConstraints(constrains).then(error)
        stream.current.removeTrack(track)
        track.stop()
      }
    }
    setCameraState(CameraState.idle)
  }

  const toggleTorch = async (force?: boolean) => {
    if(!stream.current || !capabilities.current?.torch) return
    const target = force ?? !torch.current
    
    if(target == torch.current) return

    const [track] = stream.current.getVideoTracks()
    await track.applyConstraints({ advanced: [{ torch: target } as MediaTrackConstraintSet] })
    torch.current = target
  }

  const error = (e: any) => {
    release()
    onError?.(e)
  }

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
      release()
    }
  }, [])

  useEffect(() => {
    setCameraState(CameraState.starting)
    getDevices()
      .then(ds => {
        setDevices(ds)
        setSelectedDevice(lastDeviceId || ds[0].deviceId)
      })
      .catch(error)

    return () => { release() }
  }, [preview])

  useEffect(() => {
    if (selectedDevice == undefined) return

    const selectedDeviceIndex = devices.findIndex(i => i.deviceId == selectedDevice)
    if(selectedDeviceIndex < 0) return

    setLastDeviceId(selectedDevice)
    const selected = devices[selectedDeviceIndex]

    release()
      .then(_ => getUserMedia(selected.deviceId))
      .then(s => {
        if (!preview.current) return
        stream.current = s

        if (isMounted) {
          handleStream(preview.current, s, selected).then(c => {
            capabilities.current = c
            setCameraState(CameraState.display)
          })
        } else release()
      })
      .catch(error)

      return () => { release() }
  }, [selectedDevice])

  return {
    cameraState,
    capabilities,
    preview, 
    devices,
    selectedDevice, 
    setSelectedDevice,
    toggleTorch,
  }
}
  