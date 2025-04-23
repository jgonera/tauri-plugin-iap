import {
  Bug,
  DotsThreeVertical,
  PencilSimpleLine,
  Plus,
  Trash,
} from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { Drawer } from "vaul"

import { Doc } from "@/localStore"
import useStore from "@/useStore"
import { pluralize } from "@/util"

import classes from "./List.module.css"

const dateTimeFormat = new Intl.DateTimeFormat()

interface ListProps {
  showDocMenu?: boolean
}

export default function List({ showDocMenu }: ListProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { deleteDoc, renameDoc, docs } = useStore()
  const [doc, setDoc] = useState<Doc | undefined>()

  // We keep `doc` set even when there's no `id` so that the drawer can be
  // still rendered with full content while its closing animation finishes.
  useEffect(() => {
    if (id !== undefined) {
      setDoc(docs.find((d) => d.id === id))
    }
  }, [docs, id])

  return (
    <>
      <header className={classes.header}>
        <h1>Scribbles</h1>
      </header>

      <Link aria-label="New" className={classes.new} to="/camera">
        <Plus size={32} />
      </Link>

      <ul className={classes.list}>
        {docs.map((d) => (
          <li key={d.id}>
            <Link className={classes.docLink} to={`/doc/${d.id}`}>
              <img src={d.pages.at(0)?.imageURL} />
              <div>
                <h2>{d.name}</h2>
                <p>
                  <time dateTime={d.updatedAt.toISOString()}>
                    {dateTimeFormat.format(d.updatedAt)}
                  </time>{" "}
                  • {pluralize(d.pages.length, "page")}
                </p>
              </div>
            </Link>
            <Link
              className={classes.docMenuLink}
              aria-label={`Menu for ${d.name}`}
              to={`/list/${d.id}/menu`}
            >
              <DotsThreeVertical size={32} />
            </Link>
          </li>
        ))}
      </ul>

      {doc && (
        <Drawer.Root
          open={showDocMenu}
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
                <h1>{doc.name}</h1>
                <ul>
                  <li>
                    <button
                      onClick={() => {
                        const name = prompt(undefined, doc.name)

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
                        if (confirm("Are you sure?")) {
                          void deleteDoc(doc.id)
                          void navigate(-1)
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
      )}
    </>
  )
}
