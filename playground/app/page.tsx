"use client";

import { BarcodeScanner, Scanner, useCamera } from "@alzera/react-scanner";
import { useEffect, useState } from "react";

export default function Home() {
  // const [cameraEnabled, setCameraEnabled] = useState(true);
  // const cameraController = useCamera();

  // useEffect(() => {
  //   if (cameraEnabled && cameraController.device.list.length > 0)
  //     cameraController.device.selected = cameraController.device.lastSelected;
  //   else cameraController.device.selected = undefined;
  // }, [cameraEnabled]);

  return (
    <main>
      <BarcodeScanner
        onScan={console.log}
        onError={console.log}
      />
      {/* <video
        ref={cameraController.preview}
        preload="none"
        muted
        playsInline
        className="w-full h-full object-cover select-none pointer-events-none"
      />
      <br />
      <button onClick={() => setCameraEnabled(!cameraEnabled)}>
        {cameraEnabled ? "Disable camera" : "Enable camera"}
      </button> */}
    </main>
  );
}
