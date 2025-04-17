import { useEffect, useState } from "react"
import { Link } from "react-router"

import { type Doc, getDocs } from "@/localStore"
import { pluralize } from "@/util"

import classes from "./List.module.css"

const dateTimeFormat = new Intl.DateTimeFormat()

export default function List() {
  const [docs, setDocs] = useState<Doc[]>([])

  useEffect(() => {
    void (async () => {
      setDocs(await getDocs())
    })()
  })

  return (
    <>
      <header className={classes.header}>
        <h1>Scribbles</h1>
      </header>

      <Link to="/new">New</Link>

      <ul className={classes.list}>
        {docs.map((d) => (
          <li key={d.id}>
            <Link className={classes.link} to={`/doc/${d.id}`}>
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
          </li>
        ))}
      </ul>

      {import.meta.env.DEV && <Link to="/debug">Debug</Link>}
    </>
  )
}
