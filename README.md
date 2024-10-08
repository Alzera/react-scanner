# React QR Scanner

<a href="https://www.npmjs.com/package/@alzera/react-scanner" target="_blank"><img alt="NPM Version" src="https://img.shields.io/npm/v/%40alzera%2Freact-scanner"></a> <a href="https://www.npmjs.com/package/@alzera/react-scanner" target="_blank"><img alt="NPM Downloads" src="https://img.shields.io/npm/dt/%40alzera%2Freact-scanner"></a> <a href="https://pkg-size.dev/@alzera/react-scanner?no-peers" target="_blank"><img src="https://pkg-size.dev/badge/install/174740" title="Install size for @alzera/react-scanner"></a> <a href="https://bundlephobia.com/package/@alzera/react-scanner" target="_blank"><img src="https://img.shields.io/bundlephobia/min/%40alzera%2Freact-scanner" title="minified size"></a> <a href="https://bundlephobia.com/package/@alzera/react-scanner" target="_blank"><img src="https://img.shields.io/bundlephobia/minzip/%40alzera%2Freact-scanner" title="minified zip size"></a>

`@alzera/react-scanner` is a lightweight and simple-to-use React library for integrating QR code scanning functionality into your web applications. The primary goal of this library is to provide a hassle-free solution for developers who need a quick and efficient way to incorporate QR code scanning without the bloat.

## Features

-   **Barcode Formats:** Support many different barcode formats, more on [here](https://github.com/Sec-ant/barcode-detector#barcode-detector).
-   **Legacy:** Support image input as camera fallback.
-   **Low-level API:** Expose low-level API to be able to create your own layout.
-   **Flash/Torch:** Support handling torch when ever possible.

## Installation

Install `@alzera/react-scanner` using your preferred package manager:

    npm install @alzera/react-scanner

## Components

### BarcodeScanner

Combined version of Scanner component and DropZone component, comes with a built-in button that allows users to switch between the scanning mode and the drop zone mode.

#### Basic Example

    import React, { useState } from 'react';
    import { BarcodeScanner } from '@alzera/react-scanner';
    
    export default function MyComponent(){
      const [scannedData, setScannedData] = useState('');
    
      return (
        <div style={{ maxWidth: '500px' }}>
          <BarcodeScanner onScan={(d) => d && setScannedData(d)} />
          {scannedData && <p>Scanned Data: {scannedData}</p>}
        </div>
      );
    };

#### Properties

| Name    | Type | Description |
| -------- | ------- | ------- |
| onScan* | (value: string) => void | Callback function triggered when a QR code is scanned. Passes the scanned data as an argument. |
| onError | (error: any) => void | Callback function triggered when an error occurs during scanning. |
| delay | number | Set the delay (in milliseconds) between scans. |
| aspectRatio | string | Set the aspect ratio of the scanner window, using css aspect-ratio. |
| decoderOptions | BarcodeDetectorOptions | Exposed BarcodeScanner config, more on [here](https://github.com/Sec-ant/barcode-detector#barcode-detector). |
| switchLabel | (isScanner: boolean) => React.ReactNode | Function to customize the label for the switch component. |
| dropChildren | React.ReactNode | React node to customize the content of the drop area. |
| style | React.CSSProperties | Apply custom styles to the scanner component. |
| className | string | Add custom class names to the scanner component. |


### Scanner

Simple component wrapper for barcode-detector library.

#### Basic Example

    import React, { useState } from 'react';
    import { Scanner } from '@alzera/react-scanner';
    
    export default function MyComponent(){
      const [scannedData, setScannedData] = useState('');
    
      return (
        <div style={{ maxWidth: '500px' }}>
          <Scanner onScan={(d) => d && setScannedData(d)} />
          {scannedData && <p>Scanned Data: {scannedData}</p>}
        </div>
      );
    };

#### Properties

| Name    | Type | Description |
| -------- | ------- | ------- |
| onScan* | (value: string) => void | Callback function triggered when a QR code is scanned. Passes the scanned data as an argument. |
| onError | (error: any) => void | Callback function triggered when an error occurs during scanning. |
| delay | number | Set the delay (in milliseconds) between scans. |
| aspectRatio | string | Set the aspect ratio of the scanner window, using css aspect-ratio. |
| decoderOptions | BarcodeDetectorOptions | Exposed BarcodeScanner config, more on [here](https://github.com/Sec-ant/barcode-detector#barcode-detector). |
| style | React.CSSProperties | Apply custom styles to the scanner component. |
| className | string | Add custom class names to the scanner component. |

### DropZone

Simple component wrapper for barcode-detector library.

#### Basic Example

    import React, { useState } from 'react';
    import { DropZone } from '@alzera/react-scanner';
    
    export default function MyComponent(){
      const [scannedData, setScannedData] = useState('');
    
      return (
        <div style={{ maxWidth: '500px' }}>
          <DropZone onScan={(d) => d && setScannedData(d)} />
          {scannedData && <p>Scanned Data: {scannedData}</p>}
        </div>
      );
    };

#### Properties

| Name    | Type | Description |
| -------- | ------- | ------- |
| onScan* | (value: string) => void | Callback function triggered when a QR code is scanned. Passes the scanned data as an argument. |
| onError | (error: any) => void | Callback function triggered when an error occurs during scanning. |
| children | React.ReactNode | React node to customize the content of the drop area. |
| decoderOptions | BarcodeDetectorOptions | Exposed BarcodeScanner config, more on [here](https://github.com/Sec-ant/barcode-detector#barcode-detector). |
| style | React.CSSProperties | Apply custom styles to the scanner component. |
| className | string | Add custom class names to the scanner component. |

## API

### useDecoder

The `useDecoder` hook is designed to facilitate barcode detection, returning a ref to a decoder function that can be used to decode barcodes from images.

#### Parameter

| Name    | Type | Description |
| -------- | ------- | ------- |
| opts | BarcodeDetectorOptions | Exposed BarcodeScanner config, more on [here](https://github.com/Sec-ant/barcode-detector#barcode-detector). |

#### Return

| Type | Description |
| ------- | ------- |
| (imageData: ImageBitmapSourceWebCodecs) => Promise<string \| null> | Function that take CanvasImageSourceWebCodecs, Blob or ImageData to be processed and return the decoded string or null if failed |

### useCamera

The `useCamera` hook is designed to facilitate easy to use camera.

#### Parameter

| Name    | Type | Description |
| -------- | ------- | ------- |
| onError | (error: any) => void | Callback function triggered when an error occurs during scanning. |
| useLastDeviceId | boolean | Use the last selected device id. |
| autoStart | boolean | Set the initial camera state. |
| autoPause | boolean | Set if the camera should be paused when the component is not visible. |
| constraints.audio | boolean | Set if the camera should have audio enabled. |
| constraints.video | boolean | Set if the camera should have video enabled. |

#### Return

| Name    | Type | Description |
| -------- | ------- | ------- |
| video | React.RefObject\<HTMLVideoElement> | Reference object for video element. |
| camera.capabilities | MediaTrackCapabilities \| undefined | Selected camera capabilities. |
| camera.state | CameraState | Reflect the current camera state, `starting, display, stopping, idle`. |
| camera.torch | boolean | State of torch. |
| device.list | MediaDeviceInfo[] | Reflect available devices options. |
| device.selected | string \| undefined | State of selected device. |
| device.lastSelected | string \| undefined | State of last selected device. |

## Contributing

We welcome contributions! Feel free to open issues, create pull requests, or provide feedback.

Happy scanning! 📷 🚀