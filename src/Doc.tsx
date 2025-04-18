import { ArrowLeft, Camera } from "@phosphor-icons/react"
import { useCallback, useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import CameraView from "@/CameraView"
import { addPage, addPageText, createDoc, type Doc, getDoc } from "@/localStore"
import performMockOCR from "@/ocr/mock"
import performRemoteOCR from "@/ocr/remote"

import classes from "./Doc.module.css"

const performOCR = import.meta.env.DEV ? performMockOCR : performRemoteOCR
// const performOCR = performRemoteOCR

export default function Doc() {
  const { id } = useParams()
  const [doc, setDoc] = useState<Doc | null>(null)
  const [isCamera, setIsCamera] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    void (async () => {
      if (id === undefined) return

      setDoc(await getDoc(id))
    })()
  }, [setDoc])

  const doMagic = useCallback(
    async (base64Image: string) => {
      let localDoc = doc ?? (await createDoc())
      const { id } = localDoc

      localDoc = await addPage(id, base64Image)
      setDoc(localDoc)
      const lastPage = localDoc.pages.at(-1)

      if (lastPage === undefined) {
        throw new Error("Can't access last page after adding a page!")
      }

      const text = await performOCR(base64Image)
      localDoc = await addPageText(id, lastPage.id, text)
      setDoc(localDoc)
    },
    [doc, setDoc],
  )

  return (
    <main>
      {isCamera ? (
        <CameraView
          onBack={() => {
            setIsCamera(false)
          }}
          onCapture={(...args) => {
            void doMagic(...args)
            setIsCamera(false)
          }}
        />
      ) : (
        <>
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

          <section className={classes.content}>
            {doc?.pages.map((p) => <pre key={p.id}>{p.text}</pre>)}
          </section>

          <nav className={classes.footer}>
            <button
              aria-label="New page"
              className={classes.newPage}
              onClick={() => {
                setIsCamera(true)
              }}
            >
              <Camera size={32} />
            </button>

            {doc?.pages.map((p) => <img key={p.id} src={p.imageURL} />)}
          </nav>
        </>
      )}
    </main>
  )
}
