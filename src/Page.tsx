import { ArrowLeft, Trash } from "@phosphor-icons/react"
import { useEffect } from "react"
import { useNavigate, useParams } from "react-router"
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"

import useStore from "@/useStore"

import classes from "./Page.module.css"

export default function Page() {
  const { id = null, pageId } = useParams()
  const navigate = useNavigate()
  const { deleteDoc, deletePage, openDoc, setOpenDocId } = useStore()

  useEffect(() => {
    setOpenDocId(id)
  }, [id, setOpenDocId])

  if (openDoc === null) {
    return
  }

  const index = openDoc.pages.findIndex((p) => p.id === pageId)

  if (index === -1) {
    throw new Error(
      `Can't find page with id ${pageId ?? "undefined"} in doc ${openDoc.id}`,
    )
  }

  const page = openDoc.pages[index]

  return (
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
        <h1>
          Page {index + 1} / {openDoc.pages.length}
        </h1>
        <button
          aria-label="Delete page"
          className={classes.delete}
          onClick={() => {
            if (openDoc.pages.length > 1) {
              if (confirm("Are you sure you want to delete this page?")) {
                void deletePage(openDoc.id, page.id)
                void navigate(-1)
              }
            } else {
              if (
                confirm(`Are you sure you want to delete "${openDoc.name}"?`)
              ) {
                void deleteDoc(openDoc.id)
                void navigate(-2)
              }
            }
          }}
        >
          <Trash size={32} />
        </button>
      </header>

      <section className={classes.content}>
        <TransformWrapper
          alignmentAnimation={{ disabled: true, sizeX: 0, sizeY: 0 }}
          centerOnInit={true}
          doubleClick={{ mode: "toggle" }}
          zoomAnimation={{ size: 0.1 }}
        >
          <TransformComponent
            wrapperStyle={{
              width: "100%",
              height: "100%",
            }}
          >
            <img
              alt="Page image"
              className={classes.image}
              src={page.imageURL}
            />
          </TransformComponent>
        </TransformWrapper>
      </section>
    </>
  )
}
