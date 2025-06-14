import {
  ArrowFatRight,
  DotsThreeVertical,
  MagnifyingGlass,
  Plus,
} from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { Link, useNavigate, useParams } from "react-router"
import { ping } from "tauri-plugin-iap-api"

import DocDrawer from "@/components/DocDrawer"
import useScrollRestore from "@/useScrollRestore"
import useStore from "@/useStore"
import { pluralize } from "@/util"

import classes from "./List.module.css"

const DATE_TIME_FORMAT = new Intl.DateTimeFormat()

interface ListProps {
  showDocDrawer?: boolean
}

export default function List({ showDocDrawer }: ListProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { docs, openDoc, setOpenDocId } = useStore()
  const contentScrollRef = useScrollRestore<HTMLDivElement>({
    name: "content",
    restoreY: true,
  })

  const [pingResponse, setPingResponse] = useState<null | string>(null)

  // We keep `openDoc` set even when there's no `id` so that the drawer can be
  // still rendered with full content while its closing animation finishes.
  useEffect(() => {
    if (id !== undefined) {
      setOpenDocId(id)
    }
  }, [id, setOpenDocId])

  useEffect(() => {
    void (async () => {
      setPingResponse(await ping("hola"))
    })()
  }, [])

  return (
    <>
      <header className={classes.header}>
        <h1>Scribbles</h1>
        <Link aria-label="Search" to={`/search`}>
          <MagnifyingGlass size={32} />
        </Link>
      </header>

      <div className={classes.content} ref={contentScrollRef}>
        <p>pingResponse: {pingResponse}</p>
        {docs.length === 0 && (
          <div className={classes.message}>
            <p>You don&apos;t have any scribbles yet.</p>
            <p>
              Tap the{" "}
              <Plus className={classes.miniNew} size={16} weight="bold" />{" "}
              button below
              <br />
              to add your first one!
            </p>
          </div>
        )}

        <ul className={classes.list}>
          {docs.map((d) => (
            <li key={d.id}>
              <Link className={classes.docLink} to={`/doc/${d.id}`}>
                <div className={classes.thumbnailWrapper}>
                  <img src={d.imageURL} />
                </div>
                <div className={classes.description}>
                  <h2>{d.name}</h2>
                  <p>
                    <time dateTime={d.updatedAt.toISOString()}>
                      {DATE_TIME_FORMAT.format(d.updatedAt)}
                    </time>{" "}
                    • {pluralize(d.pageCount, "page")}
                  </p>
                </div>
              </Link>
              <Link
                className={classes.docMenuLink}
                aria-label={`Menu for ${d.name}`}
                to={`/list/${d.id}/doc-drawer`}
              >
                <DotsThreeVertical size={32} />
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <Link aria-label="New" className={classes.new} to="/camera">
        {docs.length === 0 && (
          <ArrowFatRight className={classes.arrow} size={64} weight="thin" />
        )}
        <Plus size={32} />
      </Link>

      {openDoc && (
        <DocDrawer
          doc={openDoc}
          isOpen={showDocDrawer}
          onDelete={() => {
            void navigate(-1)
          }}
        />
      )}
    </>
  )
}
