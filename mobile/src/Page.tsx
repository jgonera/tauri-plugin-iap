import { ArrowLeft, Trash } from "@phosphor-icons/react"
import clsx from "clsx"
import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { TransformComponent, TransformWrapper } from "react-zoom-pan-pinch"
import { Drawer } from "vaul"

import useStore from "@/useStore"

// TODO: Abstract away a generic drawer component
import classesDrawer from "./components/DocDrawer.module.css"
import classes from "./Page.module.css"

interface PageProps {
  showDeleteDrawer?: boolean
}

export default function Page({ showDeleteDrawer }: PageProps) {
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
        <Link
          aria-label="Delete page"
          className={classes.delete}
          to={`/doc/${openDoc.id}/page/${page.id}/delete-drawer`}
        >
          <Trash size={32} />
        </Link>
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

      <Drawer.Root
        repositionInputs={false}
        open={showDeleteDrawer}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            void navigate(-1)
          }
        }}
      >
        <Drawer.Portal>
          <Drawer.Overlay className={classesDrawer.overlay} />
          <Drawer.Content className={classesDrawer.content}>
            {openDoc.pages.length > 1 && (
              <p>Are you sure you want to delete this page?</p>
            )}
            {openDoc.pages.length === 1 && (
              <p>
                Are you sure you want to delete <strong>{openDoc.name}</strong>?
              </p>
            )}
            <div className={classesDrawer.buttonBar}>
              <button
                className={clsx(classesDrawer.button, classesDrawer.text)}
                onClick={() => {
                  void navigate(-1)
                }}
              >
                Cancel
              </button>
              <button
                className={clsx(classesDrawer.button, classesDrawer.danger)}
                onClick={() => {
                  if (openDoc.pages.length > 1) {
                    void deletePage(openDoc.id, page.id)
                    void navigate(-2)
                  } else {
                    void deleteDoc(openDoc.id)
                    void navigate(-3)
                  }
                }}
              >
                Delete
              </button>
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
