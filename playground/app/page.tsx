'use client'

import { BarcodeScanner } from '@alzera/react-scanner'

export default function Home() {
  return (
    <main>
      <BarcodeScanner onScan={console.log} onError={console.log} />
    </main>
  );
}