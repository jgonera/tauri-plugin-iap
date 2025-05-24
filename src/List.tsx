import {
  ArrowFatRight,
  DotsThreeVertical,
  MagnifyingGlass,
  Plus,
} from "@phosphor-icons/react"
import { useEffect } from "react"
import { Link, useNavigate, useParams } from "react-router"

import DocDrawer from "@/components/DocDrawer"
import useStore from "@/useStore"
import { pluralize } from "@/util"

import classes from "./List.module.css"

const dateTimeFormat = new Intl.DateTimeFormat()

interface ListProps {
  showDocDrawer?: boolean
}

export default function List({ showDocDrawer }: ListProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const { docs, openDoc, setOpenDocId } = useStore()

  // We keep `openDoc` set even when there's no `id` so that the drawer can be
  // still rendered with full content while its closing animation finishes.
  useEffect(() => {
    if (id !== undefined) {
      setOpenDocId(id)
    }
  }, [id, setOpenDocId])

  return (
    <>
      <header className={classes.header}>
        <h1>Scribbles</h1>
        <Link aria-label="Search" to={`/search`}>
          <MagnifyingGlass size={32} />
        </Link>
      </header>

      <Link aria-label="New" className={classes.new} to="/camera">
        {docs.length === 0 && (
          <ArrowFatRight className={classes.arrow} size={64} weight="thin" />
        )}
        <Plus size={32} />
      </Link>

      <div className={classes.content}>
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
                      {dateTimeFormat.format(d.updatedAt)}
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
