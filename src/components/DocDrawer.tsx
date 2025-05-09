import { Bug, PencilSimpleLine, Trash } from "@phosphor-icons/react"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import { Link, useNavigate } from "react-router"
import { Drawer } from "vaul"

import { Doc } from "@/localStore"
import useStore from "@/useStore"

import classes from "./DocDrawer.module.css"

interface DocDrawerProps {
  doc: Doc
  isOpen?: boolean
  onDelete: () => void
}

export default function DocDrawer({ doc, isOpen, onDelete }: DocDrawerProps) {
  const navigate = useNavigate()
  const { deleteDoc, renameDoc } = useStore()
  const [state, setState] = useState<"default" | "delete" | "rename">("default")
  const nameInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen) {
      setState("default")
    }
  }, [isOpen])

  return (
    <Drawer.Root
      repositionInputs={false}
      open={isOpen}
      onOpenChange={(isOpen) => {
        if (!isOpen) {
          void navigate(-1)
        }
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className={classes.overlay} />
        <Drawer.Content className={classes.content}>
          <nav>
            <Drawer.Title className={classes.title}>{doc.name}</Drawer.Title>
            <Drawer.Description className={classes.description}>
              Actions for {doc.name}
            </Drawer.Description>
            {state === "default" && (
              <ul>
                <li>
                  <button
                    onClick={() => {
                      setState("rename")
                    }}
                  >
                    <PencilSimpleLine size={24} />
                    Rename
                  </button>
                </li>
                <li>
                  <button
                    className={classes.deleteMenu}
                    onClick={() => {
                      setState("delete")
                    }}
                  >
                    <Trash size={24} /> Delete
                  </button>
                </li>
                {import.meta.env.DEV && (
                  <li>
                    <Link to="/debug">
                      <Bug size={24} /> Debug
                    </Link>
                  </li>
                )}
              </ul>
            )}
            {state === "delete" && (
              <>
                <p>
                  Are you sure you want to delete <strong>{doc.name}</strong>?
                </p>
                <div className={classes.buttonBar}>
                  <button
                    className={clsx(classes.button, classes.text)}
                    onClick={() => {
                      setState("default")
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={clsx(classes.button, classes.danger)}
                    onClick={() => {
                      void deleteDoc(doc.id)
                      onDelete()
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
            {state === "rename" && (
              <>
                <input
                  className={classes.input}
                  ref={nameInputRef}
                  type="text"
                  defaultValue={doc.name}
                />
                <div className={classes.buttonBar}>
                  <button
                    className={clsx(classes.button, classes.text)}
                    onClick={() => {
                      setState("default")
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    className={clsx(classes.button, classes.accent)}
                    onClick={() => {
                      const name = nameInputRef.current?.value

                      if (name !== undefined && name !== "") {
                        void renameDoc(doc.id, name)
                        void navigate(-1)
                      }
                    }}
                  >
                    Rename
                  </button>
                </div>
              </>
            )}
          </nav>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
