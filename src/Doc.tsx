import { ArrowLeft, Camera } from "@phosphor-icons/react"
import clsx from "clsx"
import { useInView } from "react-intersection-observer"
import { useNavigate, useParams } from "react-router"

import useStore from "@/useStore"

import classes from "./Doc.module.css"

interface ThumbnailProps {
  imageURL: string
  onActive: () => void
}

function Thumbnail({ imageURL, onActive }: ThumbnailProps) {
  const { ref, inView } = useInView({
    rootMargin: "0% -50% 0% -50%",
  })

  if (inView) {
    onActive()
  }

  return (
    <li className={clsx({ [classes.active]: inView })} ref={ref}>
      <img src={imageURL} />
    </li>
  )
}

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

      <section className={classes.text}>
        {doc.pages.map((p) => (
          <pre id={`text-${p.id}`} key={p.id}>
            {p.text}
          </pre>
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

        <ul>
          {doc.pages.map((p) => (
            <Thumbnail
              onActive={() => {
                document
                  .getElementById(`text-${p.id}`)
                  ?.scrollIntoView({ block: "start" })
              }}
              imageURL={p.imageURL}
              key={p.id}
            />
          ))}
        </ul>
      </nav>
    </>
  )
}
