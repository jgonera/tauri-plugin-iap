import { useEffect, useState } from "react"
import { Link } from "react-router"

import { type Doc, getDocs } from "@/localStore"

export default function List() {
  const [docs, setDocs] = useState<Doc[]>([])

  useEffect(() => {
    void (async () => {
      setDocs(await getDocs())
    })()
  })

  return (
    <>
      <Link to="/new">New</Link>
      <ul>
        {docs.map((d) => (
          <li>
            <Link to={`/doc/${d.id}`}>{d.name}</Link>
          </li>
        ))}
      </ul>

      {import.meta.env.DEV && <Link to="/debug">Debug</Link>}
    </>
  )
}
