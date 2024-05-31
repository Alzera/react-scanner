import { useEffect, useRef } from "react";
import { createDecoder } from "../utils/decoder";
import type { BarcodeDetectorOptions } from "barcode-detector/pure";

export const useDecoder = (opts?: BarcodeDetectorOptions) => {
  const decoder = useRef(createDecoder(opts))
  useEffect(() => { 
    decoder.current = createDecoder(opts)
  }, [opts])
  return decoder
}