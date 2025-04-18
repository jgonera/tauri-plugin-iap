import { ArrowLeft } from "@phosphor-icons/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"

import Camera, { CameraHandle } from "@/components/Camera"
import { addPage, addPageText, createDoc, type Doc, getDoc } from "@/localStore"
import performMockOCR from "@/ocr/mock"
import performRemoteOCR from "@/ocr/remote"

import classes from "./Doc.module.css"

const performOCR = import.meta.env.DEV ? performMockOCR : performRemoteOCR
// const performOCR = performRemoteOCR

export default function Doc() {
  const { id } = useParams()
  const cameraRef = useRef<CameraHandle | null>(null)
  const [doc, setDoc] = useState<Doc | null>(null)
  const navigate = useNavigate()

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
  }, [doc, setDoc])

  return (
    <main>
      <header className={classes.header}>
        <button
          aria-label="Go back"
          onClick={() => {
            void navigate(-1)
          }}
        >
          <ArrowLeft size={32} />
        </button>
        <h1>{doc?.name}</h1>
      </header>

      <div className={classes.temp}>
        <button type="submit" onClick={() => void doMagic()}>
          Transcribe
        </button>
      </div>

      <section className={classes.content}>
        {doc?.pages.map((p) => <pre key={p.id}>{p.text}</pre>)}
      </section>

      <nav className={classes.footer}>
        {doc?.pages.map((p) => <img key={p.id} src={p.imageURL} />)}
      </nav>
    </main>
  )
}
