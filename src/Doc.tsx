import "./Doc.css"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "react-router"

import Camera, { CameraHandle } from "@/components/Camera"
import { addPage, createDoc, type Doc, getDoc } from "@/localStore"
// import performMockOCR from "@/ocr/mock"
// import performRemoteOCR from "@/ocr/remote";

export default function Doc() {
  const { id } = useParams()
  const cameraRef = useRef<CameraHandle | null>(null)
  const [doc, setDoc] = useState<Doc | null>(null)

  useEffect(() => {
    void (async () => {
      if (id === undefined) return

      setDoc(await getDoc(id))
    })()
  }, [setDoc])

  const doMagic = useCallback(async () => {
    if (cameraRef.current === null) return

    const { id } = doc ?? (await createDoc())
    const base64Image = cameraRef.current.capture()

    setDoc(await addPage(id, base64Image))
  }, [setDoc])

  return (
    <main className="container">
      <Camera ref={cameraRef} />

      <button type="submit" onClick={() => void doMagic()}>
        Transcribe
      </button>

      {doc?.pages.map((p) => (
        <>
          <img key={p.id} src={p.imageURL} />
          {p.imageURL}
        </>
      ))}
    </main>
  )
}
