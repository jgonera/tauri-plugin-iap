import {
  BaseDirectory,
  mkdir,
  readTextFile,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs"
import { v7 as uuidv7 } from "uuid"
import { z } from "zod"

import { base64ToArrayBuffer } from "./util"

const PageSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

type Page = z.infer<typeof PageSchema>

const DocSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
    pages: z.array(PageSchema),
  })
  .strict()

type Doc = z.infer<typeof DocSchema>

async function updateDocs(docs: Doc[]): Promise<void> {
  await writeTextFile("scribbleDocs.json", JSON.stringify(docs), {
    baseDir: BaseDirectory.AppData,
  })
}

export async function getDocs(): Promise<Doc[]> {
  const docsFileText = await readTextFile("scribbleDocs.json", {
    baseDir: BaseDirectory.AppData,
  })

  return z.array(DocSchema).parse(JSON.parse(docsFileText))
}

export async function getDoc(id: string): Promise<Doc> {
  const doc = (await getDocs()).find((d) => d.id === id)

  if (doc === undefined) {
    throw new Error(`Can't find doc with id ${id}`)
  }

  return doc
}

export async function createDoc(): Promise<Doc> {
  const docs = await getDocs()
  const now = new Date()

  const doc = {
    id: uuidv7(),
    name: `Scribble ${now.toISOString()}`,
    createdAt: now,
    updatedAt: now,
    pages: [],
  }

  await mkdir(`scribbleDocs/${doc.id}`, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  })

  docs.push(doc)
  await updateDocs(docs)

  return doc
}

export async function addPage(
  docId: string,
  base64Image: string,
): Promise<Page> {
  const docs = await getDocs()
  const doc = docs.find((d) => d.id === docId)

  if (doc === undefined) {
    throw new Error(`Can't find doc with id ${docId}`)
  }

  const page = { id: uuidv7() }

  await writeFile(
    `scribbleDocs/${docId}/${page.id}.jpg`,
    base64ToArrayBuffer(base64Image),
    {
      baseDir: BaseDirectory.AppData,
    },
  )

  doc.pages.push(page)
  await updateDocs(docs.map((d) => (d.id === docId ? doc : d)))

  return page
}

export async function addPageText(
  docId: string,
  pageId: string,
  text: string,
): Promise<Page> {
  const docs = await getDocs()
  const doc = docs.find((d) => d.id === docId)

  if (doc === undefined) {
    throw new Error(`Can't find doc with id ${docId}`)
  }

  const page = doc.pages.find((p) => p.id === pageId)

  if (page === undefined) {
    throw new Error(`Can't find page with id ${pageId} in doc ${docId}`)
  }

  await writeTextFile(`scribbleDocs/${docId}/${pageId}.txt`, text, {
    baseDir: BaseDirectory.AppData,
  })

  return page
}
