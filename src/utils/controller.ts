import { eventOn, videoReady } from "."
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

export const getDevices = () => navigator.mediaDevices
  .enumerateDevices()
  .then(ds => ds.filter((d) => d.kind === 'videoinput'))

export const getUserMedia = (deviceId: string) => navigator.mediaDevices
  .getUserMedia({
    audio: false,
    video: { deviceId },
  })