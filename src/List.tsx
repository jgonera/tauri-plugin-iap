import { BaseDirectory, readDir } from "@tauri-apps/plugin-fs"
import { useEffect, useState } from "react"
import { Link } from "react-router"

import { type Doc, getDocs } from "@/localStore"

export default function List() {
  const [docs, setDocs] = useState<Doc[]>([])
  const [appData, setAppData] = useState<string[]>([])

  useEffect(() => {
    void (async () => {
      setDocs(await getDocs())
      setAppData(
        (await readDir("scribbleScan", { baseDir: BaseDirectory.AppData })).map(
          (e) => e.name,
        ),
      )
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

      <pre>{appData.join("\n")}</pre>
    </>
  )
}
