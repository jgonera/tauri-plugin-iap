import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs"
import { v7 as uuidv7 } from "uuid"
import { z } from "zod"

import { base64ToArrayBuffer } from "@/util"

const RawPageSchema = z
  .object({
    id: z.string().uuid(),
  })
  .strict()

const RawDocSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
    pages: z.array(RawPageSchema),
  })
  .strict()

type RawDoc = z.infer<typeof RawDocSchema>

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const DocSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
    pages: z.array(
      RawPageSchema.extend({ imageURL: z.string(), text: z.string() }),
    ),
  })
  .strict()

export type Doc = z.infer<typeof DocSchema>

async function getRawDocs(): Promise<RawDoc[]> {
  if (
    !(await exists("scribbleScan/docs.json", {
      baseDir: BaseDirectory.AppData,
    }))
  ) {
    return []
  }

  const rawDocsData = await readTextFile("scribbleScan/docs.json", {
    baseDir: BaseDirectory.AppData,
  })

  return z.array(RawDocSchema).parse(JSON.parse(rawDocsData))
}

async function updateRawDocs(rawDocs: RawDoc[]): Promise<void> {
  await writeTextFile("scribbleScan/docs.json", JSON.stringify(rawDocs), {
    baseDir: BaseDirectory.AppData,
  })
}

function augmentRawDoc(rawDoc: RawDoc): Doc {
  return {
    ...rawDoc,
    pages: rawDoc.pages.map((p) => ({ ...p, imageURL: "", text: "" })),
  }
}

export async function getDocs(): Promise<Doc[]> {
  return (await getRawDocs()).map(augmentRawDoc)
}

export async function getDoc(id: string): Promise<Doc | null> {
  const doc = (await getRawDocs()).find((d) => d.id === id)

  return doc === undefined ? null : augmentRawDoc(doc)
}

export async function createDoc(): Promise<Doc> {
  const rawDocs = await getRawDocs()
  const now = new Date()

  const rawDoc = {
    id: uuidv7(),
    name: `Scribble ${now.toISOString()}`,
    createdAt: now,
    updatedAt: now,
    pages: [],
  }

  await mkdir(`scribbleScan/docs/${rawDoc.id}`, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  })

  rawDocs.push(rawDoc)
  await updateRawDocs(rawDocs)

  return augmentRawDoc(rawDoc)
}

export async function addPage(
  docId: string,
  base64Image: string,
): Promise<Doc> {
  const rawDocs = await getRawDocs()
  const rawDoc = rawDocs.find((d) => d.id === docId)

  if (rawDoc === undefined) {
    throw new Error(`Can't find doc with id ${docId}`)
  }

  const page = { id: uuidv7() }

  await writeFile(
    `scribbleScan/docs/${docId}/${page.id}.jpg`,
    base64ToArrayBuffer(base64Image),
    {
      baseDir: BaseDirectory.AppData,
    },
  )

  rawDoc.pages.push(page)
  await updateRawDocs(rawDocs.map((d) => (d.id === docId ? rawDoc : d)))

  return augmentRawDoc(rawDoc)
}

export async function addPageText(
  docId: string,
  pageId: string,
  text: string,
): Promise<Doc> {
  const rawDocs = await getRawDocs()
  const rawDoc = rawDocs.find((d) => d.id === docId)

  if (rawDoc === undefined) {
    throw new Error(`Can't find doc with id ${docId}`)
  }

  const page = rawDoc.pages.find((p) => p.id === pageId)

  if (page === undefined) {
    throw new Error(`Can't find page with id ${pageId} in doc ${docId}`)
  }

  await writeTextFile(`scribbleScan/docs/${docId}/${pageId}.txt`, text, {
    baseDir: BaseDirectory.AppData,
  })

  return augmentRawDoc(rawDoc)
}
