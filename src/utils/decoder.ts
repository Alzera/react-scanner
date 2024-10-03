import {
  BarcodeDetector,
  type BarcodeDetectorOptions,
} from "barcode-detector/pure";

export const createDecoder = (opts?: BarcodeDetectorOptions) => {
  const detector = new BarcodeDetector(
    opts || {
      formats: ["qr_code"],
    }
  );
  return async (imageData: ImageBitmapSourceWebCodecs) => {
    try {
      const img: ImageBitmapSourceWebCodecs =
        imageData instanceof File && imageData.name.endsWith(".svg")
          ? await svgFileToImageBitmap(imageData)
          : imageData;
      const decoded = await detector.detect(img);
      if (decoded.length) return decoded.at(0)?.rawValue ?? null;
    } catch (e) {
      console.error(e);
    }
    return null;
  };
};

export const svgFileToImageBitmap = async (
  svgFile: File
): Promise<ImageBitmapSourceWebCodecs> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();
      img.src = reader.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas 2D context"));
          return;
        }

        ctx.drawImage(img, 0, 0);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Failed to convert canvas to Blob"));
          }
        });
      };

      img.onerror = (err) => reject(new Error(`Failed to load image: ${err}`));
    };

    reader.onerror = (err) =>
      reject(new Error(`Failed to read SVG file: ${err}`));

    reader.readAsDataURL(svgFile);
  });
};
