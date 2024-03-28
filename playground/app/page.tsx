'use client'

import { Scanner, useDecoder } from '@alzera/react-scanner';
import styles from './styles.module.scss'

export default function SignInPage() {
  const decoder = useDecoder()

  const handleDetect = async (file: File) => {
    try {
      const data = await decoder.current(file)
      if (!data) return
      console.log(data)
    } catch (error) {
      console.log(error)
    }
  }
  return (
    <section className={`${styles.content} ${styles.noheader}`}>
      {/* <Scanner style={{
        width: '100vw',
        height: '100vh',
      }} onScan={console.log} aspectRatio='unset' /> */}
      <img
        src='https://s3.ap-southeast-1.amazonaws.com/mplify-prod/2024/03/1710731722029-GgsH-60daa6b5b2d6.jpeg'
        style={{
          width: '100vw',
          height: '100vh',
          objectFit: 'cover',
        }} />
      <div style={{
        borderRadius: "16px",
        width: "min(75vw, 50vh)",
        height: "min(75vw, 50vh)",
        boxShadow: "rgba(0, 0, 0, 0.35) 0px 0px 0px 100vh",
        position: "absolute",
        top: "10vh",
      }}></div>
      <div className={styles.inside} style={{
        position: "absolute",
        top: "calc(10vh + min(75vw, 50vh))",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        <span>Sign in with your<br />Personalized QR Code</span>
        <div style={{
          background: 'white',
          borderRadius: '64px',
          padding: '8px 16px',
          position: 'relative',
          width: 'fit-content',
        }}>
          <input type='file' style={{
            opacity: '0',
            position: 'absolute',
            inset: '0',
            width: '100%',
            height: '100%',
          }} 
          onChange={({ target }) => target.files?.length && handleDetect(target.files[0])}/>
          <span>Pick from Gallery</span>
        </div>
      </div>
    </section>
  );
}