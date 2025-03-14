import { BaseDirectory, readDir } from "@tauri-apps/plugin-fs"
import { useEffect, useState } from "react"
import { Link } from "react-router"

export default function List() {
  const [entries, setEntries] = useState<string[]>([])

  useEffect(() => {
    void (async () => {
      const entries = await readDir(".", {
        baseDir: BaseDirectory.AppData,
      })
      setEntries(entries.map((e) => e.name))
    })()
  })

  return (
    <>
      <pre>{entries.map((e) => `${e}\n`)}</pre>
      <Link to="/new">New</Link>
    </>
  )
}
