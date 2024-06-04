import { useEffect, useRef, useState } from "react"
import { type CameraState, releaseStream, handleStream, getDevices, getUserMedia, toggleTorch } from "../utils/camera"
import { useLocalStorage } from "./use-local-storage"

export type CameraController = {
  readonly preview: React.RefObject<HTMLVideoElement>;
  readonly camera: {
      readonly capabilities: MediaTrackCapabilities | undefined;
      readonly state: CameraState;
      torch: boolean;
  };
  readonly device: {
    list: MediaDeviceInfo[];
    selected: string | undefined;
  };
}

export const useCamera = (
  enabled: boolean = true,
  onError: (error: any) => void = console.error,
  facingMode?: 'user' | 'environment',
  useLastDeviceId?: boolean,
): CameraController => {
  const preview = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const isMounted = useRef<boolean>(false)

  const [torchState, setTorchState] = useState<boolean>(false)
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities>()
  const [cameraState, setCameraState] = useState<CameraState>("idle")
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>();
  const [lastDeviceId, setLastDeviceId] = useLocalStorage<string | null>("last-device-id", null)

  const release = async () => {
    setCameraState("stopping")

    await setTorch(false)
    await releaseStream(preview.current, stream.current)
    setCapabilities(undefined)
    stream.current = null

    setCameraState("idle")
  }

  const setTorch = async (target: boolean) => {
    if (!capabilities?.torch || target == torchState) return

    await toggleTorch(stream.current, target).catch(_ => {})
    setTorchState(target)
  }

  const error = async (e: any) => {
    await release().catch(_ => {})
    onError?.(e)
  }

  const start = () => {
    setCameraState("starting")
    getDevices(facingMode)
      .then(ds => {
        setDevices(ds)
        const deviceId = useLastDeviceId ? lastDeviceId : ds[0].deviceId
        setSelectedDevice(deviceId)
      })
      .catch(error)
  }

  useEffect(() => { 
    if(enabled) start()
    else release()
  }, [enabled])

  useEffect(() => {
    isMounted.current = true

    return () => {
      isMounted.current = false
      release()
    }
  }, [])

  useEffect(() => {
    if(enabled) start()
    return () => { release() }
  }, [preview])

  useEffect(() => {
    if (selectedDevice == undefined) return

    const index = devices.findIndex(i => i.deviceId == selectedDevice)
    if (index < 0) return

    setLastDeviceId(selectedDevice)
    const selected = devices[index]

    release()
      .then(_ => getUserMedia(selected.deviceId))
      .then<MediaTrackCapabilities | void>(value => {
        if (!preview.current) return Promise.resolve()
        stream.current = value

        return isMounted
          ? handleStream(preview.current, value, selected)
          : release()
      })
      .then(c => {
        if (!c) return
        setCapabilities(c)
        setCameraState("display")
      })
      .catch(error)

    return () => { release() }
  }, [selectedDevice])

  return {
    get preview() { return preview },
    get camera() {
      return {
        get capabilities() { return capabilities },
        get state() { return cameraState },
        get torch() { return torchState },
        set torch(target: boolean) { setTorch(target) },
      }
    },
    get device() {
      return {
        get list() { return devices },
        set list(target: MediaDeviceInfo[]) { setDevices(target) },
        get selected() { return selectedDevice },
        set selected(target: string | undefined) { setSelectedDevice(target) },
      }
    },
  }
}