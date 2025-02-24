import "./App.css"

import { useCallback, useRef, useState } from "react"

import Camera, { CameraHandle } from "@/components/Camera"
import performMockOCR from "@/ocr/mock"
// import performRemoteOCR from "@/ocr/remote";

function App() {
  const cameraRef = useRef<CameraHandle | null>(null)
  const [text, setText] = useState("")
  const [imageData, setImageData] = useState<string | null>(null)

  const doMagic = useCallback(async () => {
    if (cameraRef.current === null) return

    const dataURL = cameraRef.current.capture()

    setImageData(dataURL)
    setText("Processing...")
    setText(await performMockOCR(dataURL))
  }, [setText])

  return (
    <main className="container">
      <Camera ref={cameraRef} />

      <button type="submit" onClick={() => void doMagic()}>
        Transcribe
      </button>

      {imageData && <img src={imageData} />}

      <pre>{text}</pre>
    </main>
  )
}

export default App
