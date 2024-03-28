import { BarcodeDetector, type BarcodeDetectorOptions } from "barcode-detector/pure";
import { useEffect, useRef } from "react";

export type Decoder = (imageData: ImageBitmapSourceWebCodecs) => Promise<string | null | undefined>

const createDecoder = (opts?: BarcodeDetectorOptions) => {
  const detector = new BarcodeDetector(opts || {
    formats: ['qr_code']
  })
  return async (imageData: ImageBitmapSourceWebCodecs) => {
    try {
      const decoded = await detector.detect(imageData);
      if (decoded.length) return decoded.at(0)?.rawValue
    } catch (_) {
      return null
    }
  }
}

export const useDecoder = (opts?: BarcodeDetectorOptions) => {
  const decoder = useRef<Decoder>(createDecoder(opts))
  useEffect(() => { 
    decoder.current = createDecoder(opts)
  }, [opts])
  return decoder
}
