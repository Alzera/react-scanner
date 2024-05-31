import { BarcodeDetector, type BarcodeDetectorOptions } from "barcode-detector/pure";

export const createDecoder = (opts?: BarcodeDetectorOptions) => {
  const detector = new BarcodeDetector(opts || {
    formats: ['qr_code']
  })
  return async (imageData: ImageBitmapSourceWebCodecs) => {
    try {
      const decoded = await detector.detect(imageData);
      if (decoded.length) 
        return decoded.at(0)?.rawValue ?? null
    } catch (e) {
      console.error(e)
    }
    return null
  }
}
