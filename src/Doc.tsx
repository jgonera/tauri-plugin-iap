import "./Doc.css"

import { useCallback, useEffect, useRef, useState } from "react"
import { useParams } from "react-router"

import Camera, { CameraHandle } from "@/components/Camera"
import { addPage, addPageText, createDoc, type Doc, getDoc } from "@/localStore"
// import performMockOCR from "@/ocr/mock"
import performRemoteOCR from "@/ocr/remote"

// const performOCR = import.meta.env.DEV ? performMockOCR : performRemoteOCR
const performOCR = performRemoteOCR

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

    let localDoc = doc ?? (await createDoc())
    const { id } = localDoc
    const base64Image = cameraRef.current.capture()

    localDoc = await addPage(id, base64Image)
    setDoc(localDoc)
    const lastPage = localDoc.pages.at(-1)

    if (lastPage === undefined) {
      throw new Error("Can't access last page after adding a page!")
    }

    const text = await performOCR(base64Image)
    localDoc = await addPageText(id, lastPage.id, text)
    setDoc(localDoc)
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
          <p>{p.imageURL}</p>
          <pre>{p.text}</pre>
        </>
      ))}
    </main>
  )
}
