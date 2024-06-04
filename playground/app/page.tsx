'use client'

import { BarcodeScanner, useCamera } from '@alzera/react-scanner'

export default function Home() {
  const cameraController = useCamera()
  return (
    <main>
      {/* <BarcodeScanner onScan={console.log} onError={console.log} /> */}
      <video
        ref={cameraController.preview}
        preload="none"
        muted
        playsInline
        className="w-full h-full object-cover select-none pointer-events-none" />
    </main>
  );
}