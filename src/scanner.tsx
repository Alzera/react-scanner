import { useEffect, useRef } from "react"

import { useDecoder } from "./utils/use-decoder"
import type ScannerProps from "./types/scanner-props"
import type Styleable from "./types/styleable"
import { CameraState, useCamera } from "./utils/use-camera";

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
  const cameraController = useCamera(onError)

  function decode() {
    if (!cameraController.preview.current) return

    decoder
      .current(cameraController.preview.current)
      .then((code) => {
        timeoutId.current = setTimeout(decode, delay)
        if (code) onScan(code)
      })
      .catch(onError)
  }

  useEffect(() => {
    if(cameraController.cameraState != CameraState.display) return
    decode()
  }, [cameraController.cameraState])

  useEffect(() => {
    return () => {
      if (timeoutId.current) clearTimeout(timeoutId.current)
    }
  }, [])

  // const [track] = stream.getVideoTracks()
  // const capabilities: Partial<MediaTrackCapabilities> = track?.getCapabilities?.() ?? {}
  // let isTorchOn = false
  // if (torch && capabilities.torch) {
  //   await track.applyConstraints({ advanced: [{ torch: true }] })
  //   isTorchOn = true
  // }



  // videoEl.src = ''
  // videoEl.srcObject = null
  // videoEl.load()
  // await eventOn(videoEl, 'error')
  // for (const track of stream.getTracks()) {
  //   isTorchOn ?? (await track.applyConstraints({ advanced: [{ torch: false }] }))
  //   stream.removeTrack(track)
  //   track.stop()
  // }


          // //Create image capture object and get camera capabilities
          // const imageCapture = new ImageCapture(track)
          // const photoCapabilities = imageCapture.getPhotoCapabilities().then(() => {
          //   //todo: check if camera has a torch
          //   //let there be light!
          //   const btn = document.querySelector('.switch');
          //   btn.addEventListener('click', function(){
          //     track.applyConstraints({
          //       advanced: [{torch: true}]
          //     });
          //   });
          // });

  return <div id="barcode-scanner" className={className} style={style}>
    <video
      ref={cameraController.preview}
      preload="none"
      muted
      playsInline
      style={{
        aspectRatio: aspectRatio,
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        transform: flipHorizontally ? 'scaleX(1)' : 'scaleX(-1)',
        userSelect: 'none',
        pointerEvents: 'none',
      }} />
    {cameraController.devices.length > 1 && <select
      value={cameraController.selectedDevice}
      onChange={e => cameraController.setSelectedDevice(e.target.value)}
      style={{
        width: '100%',
        marginTop: '8px',
        fontSize: '1rem',
      }}>
      {cameraController.devices.map((v, i) => <option key={i} value={v.deviceId}>{v.label}</option>)}
    </select>}
      <button
        type="button"
        onClick={() => cameraController.toggleTorch()}
        style={{
          width: '100%',
          marginTop: '16px',
          fontSize: '1rem',
        }}>
        Torch
      </button>
  </div>
}