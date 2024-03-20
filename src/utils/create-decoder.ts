import { BarcodeDetector, BarcodeDetectorOptions } from "barcode-detector/pure";

export type Decoder = (imageData: ImageBitmapSourceWebCodecs) => Promise<string | null | undefined>

export default function createDecoder(opts?: BarcodeDetectorOptions): Decoder {
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