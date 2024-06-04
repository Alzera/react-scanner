import { eventOn, timeout } from "."

declare global {
  interface Navigator { mozGetUserMedia: any }
  interface HTMLVideoElement { mozSrcObject?: MediaStream }
  interface MediaTrackCapabilities { torch?: boolean }
  interface MediaTrackConstraintSet { torch?: ConstrainBoolean }
}

export type CameraState = 'starting' | 'display' | 'stopping' | 'idle'

export type CameraFacingMode = 'user' | 'environment'

const videoReady = (preview: HTMLVideoElement, delay: number) => new Promise((resolve) => {
  const check = () => {
    if (preview.readyState === preview.HAVE_ENOUGH_DATA) {
      resolve(0)
    } else setTimeout(check, delay)
  }
  setTimeout(check, delay)
})

const requestCameraPermission = async () => {
  if (!navigator.mozGetUserMedia) {
    const permissionStatus = await navigator.permissions
      .query({ name: 'camera' as any })
      .catch(() => ({ state: 'prompt' }))
    if (permissionStatus.state === 'granted') return
  }
  await getUserMedia(true) .then(s => s.getTracks().forEach(i => i.stop()))
}

const getFacingModePattern = (facingMode: CameraFacingMode) => 
  facingMode === 'environment' ? /rear|back|environment/gi : /front|user|face/gi

export const handleStream = async (
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

export const releaseStream = async (
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

export const getUserMedia = (deviceId: string | boolean) => navigator.mediaDevices
  .getUserMedia({ 
    audio: false, 
    video: deviceId === true || { deviceId } as MediaTrackConstraints 
  })

export const getDevices = (facingMode?: CameraFacingMode) => requestCameraPermission()
  .then(_ => navigator.mediaDevices.enumerateDevices())
  .then(ds => {
    ds = ds.filter(({ kind }) => kind === 'videoinput')

    if(facingMode) {
      const pattern = getFacingModePattern(facingMode);
      ds = ds.filter(({ label }) => pattern.test(label))
    }

    return ds
  })

export const toggleTorch = async (stream: MediaStream | null, target: boolean) => {
  if (!stream) return

  const [track] = stream.getVideoTracks()
  await track.applyConstraints({ advanced: [{ torch: target }] })
}