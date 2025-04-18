import { ArrowLeft, Camera } from "@phosphor-icons/react"
import { useEffect, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { type Doc, getDoc } from "@/localStore"

import classes from "./Doc.module.css"

export default function Doc() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [doc, setDoc] = useState<Doc | null>(null)

  useEffect(() => {
    if (id === undefined) return

    void (async () => {
      setDoc(await getDoc(id))
    })()
  }, [id])

  if (id === undefined) return

  return (
    <main>
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
            void navigate(`/doc/${id}/camera`)
          }}
        >
          <Camera size={32} />
        </button>

        {doc?.pages.map((p) => <img key={p.id} src={p.imageURL} />)}
      </nav>
    </main>
  )
}
