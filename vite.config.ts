import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      staticImport: true,
    }),
  ],
  build: {
    lib: {
      name: 'BarcodeScanner',
      entry: {
        'use-camera': resolve(__dirname, 'src/composables/use-camera.ts'),
        'use-decoder': resolve(__dirname, 'src/composables/use-decoder.ts'),
        'scanner': resolve(__dirname, 'src/scanner.tsx'),
        'drop-zone': resolve(__dirname, 'src/drop-zone.tsx'),
        'barcode-scanner': resolve(__dirname, 'src/barcode-scanner.tsx'),
        'index': resolve(__dirname, 'src/index.ts'),
      },
    },
    rollupOptions: {
      external: [
        'react',
        'react/jsx-runtime',
        // 'barcode-detector/pure',
      ],
      output: {
        exports: "named"
      }
    }
  },
});