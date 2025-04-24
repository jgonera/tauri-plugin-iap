import { ArrowLeft, Trash } from "@phosphor-icons/react"
import { useNavigate, useParams } from "react-router"
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"

import useStore from "@/useStore"

import classes from "./Page.module.css"

export default function Page() {
  const { id, pageId } = useParams()
  const navigate = useNavigate()
  const { docs } = useStore()

  const doc = docs.find((d) => d.id === id)

  if (doc === undefined) {
    throw new Error(`Can't find doc with id ${id ?? "undefined"}`)
  }

  const index = doc.pages.findIndex((p) => p.id === pageId)

  if (index === -1) {
    throw new Error(
      `Can't find page with id ${pageId ?? "undefined"} in doc ${doc.id}`,
    )
  }

  const page = doc.pages[index]

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
          Page {index + 1}/{doc.pages.length}
        </h1>
        <button aria-label="Delete page">
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
