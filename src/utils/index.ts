import HTMLVideoElementExtended from "../types/html-video-element"

export const handleStream = async (
  preview: HTMLVideoElementExtended,
  stream: MediaStream,
  delay: number,
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
  await videoReady(preview, delay)
}

export const releaseStream = (
  preview: HTMLVideoElementExtended | null,
  stream: MediaStream,
) => {
  if (stream) for (const track of stream.getVideoTracks()) {
    stream.removeTrack(track)
    track.stop()
  }
  if (preview) {
    preview.src = ''
    preview.srcObject = null
    preview.load()
  }
}

export const getDevices = async () => {
  return navigator.mediaDevices
    .enumerateDevices()
    .then(ds => ds.filter((d) => d.kind === 'videoinput'))
}

export const getUserMedia = async (deviceId: string) => {
  return navigator.mediaDevices
    .getUserMedia({
      audio: false,
      video: { deviceId }
    })
}

export const eventOn = (
  eventTarget: EventTarget,
  successEvent: string,
  errorEvent = 'error'
): Promise<Event> => {
  let $resolve: (value: Event) => void
  let $reject: (reason?: Event) => void

  return new Promise<Event>((resolve, reject) => {
    $resolve = resolve
    $reject = reject

    eventTarget.addEventListener(successEvent, $resolve)
    eventTarget.addEventListener(errorEvent, $reject)
  }).finally(() => {
    eventTarget.removeEventListener(successEvent, $resolve)
    eventTarget.removeEventListener(errorEvent, $reject)
  })
}

export const timeout = (milliseconds: number) => {
  return new Promise((resolve: (value: unknown) => void) => setTimeout(resolve, milliseconds))
}

export const videoReady = (preview: HTMLVideoElement, delay: number) => {
  return new Promise((resolve) => {
    const check = () => {
      if (preview.readyState === preview.HAVE_ENOUGH_DATA) {
        resolve(0)
      } else setTimeout(check, delay)
    }
    setTimeout(check, delay)
  })
}