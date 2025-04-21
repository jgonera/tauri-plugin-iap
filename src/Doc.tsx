import { ArrowLeft, Camera } from "@phosphor-icons/react"
import { useNavigate, useParams } from "react-router"

import useStore from "@/useStore"

import classes from "./Doc.module.css"

export default function Doc() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { docs } = useStore()

  const doc = docs.find((d) => d.id === id)

  if (doc === undefined) {
    throw new Error(`Can't find doc with id ${id ?? "undefined"}`)
  }

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
        <h1>{doc.name}</h1>
      </header>

      <section className={classes.content}>
        {doc.pages.map((p) => (
          <pre key={p.id}>{p.text}</pre>
        ))}
      </section>

      <nav className={classes.footer}>
        <button
          aria-label="New page"
          className={classes.newPage}
          onClick={() => {
            void navigate(`/doc/${doc.id}/camera`)
          }}
        >
          <Camera size={32} />
        </button>

        {doc.pages.map((p) => (
          <img key={p.id} src={p.imageURL} />
        ))}
      </nav>
    </>
  )
}
