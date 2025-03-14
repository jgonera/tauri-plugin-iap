import "./Doc.css"

import { BaseDirectory, writeFile } from "@tauri-apps/plugin-fs"
import { useCallback, useRef, useState } from "react"

import Camera, { CameraHandle } from "@/components/Camera"
import performMockOCR from "@/ocr/mock"

import { base64ToArrayBuffer } from "./util"
// import performRemoteOCR from "@/ocr/remote";

export default function Doc() {
  const cameraRef = useRef<CameraHandle | null>(null)
  const [text, setText] = useState("")
  const [imageData, setImageData] = useState<string | null>(null)

  const doMagic = useCallback(async () => {
    if (cameraRef.current === null) return

    const dataURL = cameraRef.current.capture()

    setImageData(dataURL)
    setText("Processing...")
    setText(await performMockOCR(dataURL))

    await writeFile("docs/test.jpg", base64ToArrayBuffer(dataURL.slice(23)), {
      baseDir: BaseDirectory.AppData,
    })
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
