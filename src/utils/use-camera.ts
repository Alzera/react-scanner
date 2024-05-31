import { useEffect, useRef, useState } from "react"
import { eventOn, timeout } from "."
import { useLocalStorage } from "./use-local-storage"

declare global {
  interface Navigator {
    mozGetUserMedia: any
  }
  interface HTMLVideoElement {
    mozSrcObject?: MediaStream
  }
  interface MediaTrackCapabilities {
    torch?: boolean;
  }
  interface MediaTrackConstraintSet {
    torch?: ConstrainBoolean;
  }
}

export enum CameraState {
  starting, display, stopping, idle,
}

const handleStream = async (
  preview: HTMLVideoElement,
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
  return track?.getCapabilities?.() ?? {}
}

const releaseStream = async (
  preview: HTMLVideoElement | null,
  stream: MediaStream | null,
) => {
  if (preview) {
    preview.src = ''
    preview.srcObject = null
    preview.load()

    await eventOn(preview, 'error')
  }
  if (stream) {
    for (const track of stream.getVideoTracks()) {
      stream.removeTrack(track)
      track.stop()
    }
  }
}

const videoReady = (preview: HTMLVideoElement, delay: number) => new Promise((resolve) => {
  const check = () => {
    if (preview.readyState === preview.HAVE_ENOUGH_DATA) {
      resolve(0)
    } else setTimeout(check, delay)
  }
  setTimeout(check, delay)
})

const requestCameraPermission = async () => {
  const request = () => getUserMedia(true).then(s => s.getTracks().forEach(i => i.stop()))
  if(navigator.mozGetUserMedia) request()
  else {
    const permissionStatus = await navigator.permissions.query({ name: 'camera' as any });
    if (permissionStatus.state === 'prompt' || permissionStatus.state === 'denied') {
      request()
    }
  }
}

const getDevices = () => requestCameraPermission()
  .then(_ => navigator.mediaDevices.enumerateDevices())
  .then(ds => ds.filter((d) => d.kind === 'videoinput'))

const getUserMedia = (deviceId: string | boolean) => {
  const video = deviceId === true || { deviceId } as MediaTrackConstraints
  return navigator.mediaDevices.getUserMedia({ audio: false, video })
}

export const useCamera = (
  onError: ((error: any) => void) | undefined,
) => {
  const preview = useRef<HTMLVideoElement>(null)
  const stream = useRef<MediaStream | null>(null)
  const isMounted = useRef<boolean>(false)

  const [torchState, setTorchState] = useState<boolean>(false)
  const [capabilities, setCapabilities] = useState<MediaTrackCapabilities>()
  const [cameraState, setCameraState] = useState<CameraState>(CameraState.idle)
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([])
  const [selectedDevice, setSelectedDevice] = useState<string | undefined>();
  const [lastDeviceId, setLastDeviceId] = useLocalStorage<string | null>("last-device-id", null)

  const release = async () => {
    setCameraState(CameraState.stopping)

    await setTorch(false)
    await releaseStream(preview.current, stream.current)
    setCapabilities(undefined)
    stream.current = null

    setCameraState(CameraState.idle)
  }

  const setTorch = async (target: boolean) => {
    if (!stream.current || !capabilities?.torch || target == torchState) return

    const [track] = stream.current.getVideoTracks()
    await track.applyConstraints({ advanced: [ { torch: target } ] })
    setTorchState(target)
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
        setCameraState(CameraState.display)
      })
      .catch(error)

    return () => { release() }
  }, [selectedDevice])

  return {
    preview,
    camera: {
      capabilities,
      state: cameraState,
      get torch() {
        return torchState;
      },
      set torch(target: boolean) {
        setTorch(target);
      },
    },
    device: {
      list: devices,
      get selected() {
        return selectedDevice;
      },
      set selected(target: string | undefined) {
        setSelectedDevice(target);
      },
    },
  }
}
