import { Bug, PencilSimpleLine, Trash } from "@phosphor-icons/react"
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

  return (
    <Drawer.Root
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
            <ul>
              <li>
                <button
                  onClick={() => {
                    const name = prompt("New name:", doc.name)

                    if (name !== null && name !== "") {
                      void renameDoc(doc.id, name)
                      void navigate(-1)
                    }
                  }}
                >
                  <PencilSimpleLine size={24} />
                  Rename
                </button>
              </li>
              <li>
                <button
                  className={classes.delete}
                  onClick={() => {
                    if (
                      confirm(`Are you sure you want to delete "${doc.name}"?`)
                    ) {
                      void deleteDoc(doc.id)
                      onDelete()
                    }
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
          </nav>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  )
}
