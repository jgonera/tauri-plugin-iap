import { BaseDirectory, readDir } from "@tauri-apps/plugin-fs"
import { useEffect, useState } from "react"

export default function Debug() {
  const [appData, setAppData] = useState<string[]>([])

  useEffect(() => {
    void (async () => {
      setAppData(
        (await readDir("scribbleScan", { baseDir: BaseDirectory.AppData })).map(
          (e) => e.name,
        ),
      )
    })()
  })

  return (
    <>
      <pre>{appData.join("\n")}</pre>
    </>
  )
}
