import { useDecoder } from "./composables/use-decoder"
import type ScannerProps from "./types/scanner-props";
import type Styleable from "./types/styleable";

export default function DropZone({
  onScan,
  onError,
  children,
  decoderOptions,
  className,
  style,
}: Pick<ScannerProps, 'onScan' | 'onError' | 'decoderOptions'> & Styleable & {
  children?: React.ReactNode
}) {
  const decoder = useDecoder(decoderOptions)

  const handleDetect = (file: File) => {
    decoder
      .current(file)
      .then(d => d && onScan)
      .catch(onError)
  }

  return (
    <div
      id="barcode-drop-zone"
      className={className}
      onDrop={(e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!e.dataTransfer.files.length) return;
        handleDetect(e.dataTransfer.files[0])
      }}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        border: '2px dashed',
        padding: '16px',
        boxSizing: 'border-box',
        textAlign: 'center',
        lineHeight: '2rem',
        minHeight: '150px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        ...style
      }}>
      <input
        type="file"
        accept="image/*"
        onChange={({ target }) => target.files?.length && handleDetect(target.files[0])}
        style={{
          position: 'absolute',
          inset: '0',
          opacity: '0',
          width: '100%',
          height: '100%',
        }}
      />
      {children || <div>Drop an image here to scan<br />or<br /><u>Click here to browse</u></div>}
    </div>
  );
}