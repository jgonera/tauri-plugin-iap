import { convertFileSrc } from "@tauri-apps/api/core"
import { appDataDir, join } from "@tauri-apps/api/path"
import {
  BaseDirectory,
  exists,
  mkdir,
  readTextFile,
  remove,
  writeFile,
  writeTextFile,
} from "@tauri-apps/plugin-fs"
import { v7 as uuidv7 } from "uuid"
import { z } from "zod"

import { base64ToArrayBuffer } from "@/util"

const APP_DATA_DIR = await appDataDir()

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
      RawPageSchema.extend({
        imageURL: z.string(),
        text: z.string().optional(),
      }),
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

async function augmentRawDoc(rawDoc: RawDoc): Promise<Doc> {
  return {
    ...rawDoc,
    pages: await Promise.all(
      rawDoc.pages.map(async (p) => {
        const textPath = `scribbleScan/docs/${rawDoc.id}/${p.id}.txt`

        return {
          ...p,
          imageURL: convertFileSrc(
            await join(
              APP_DATA_DIR,
              `scribbleScan/docs/${rawDoc.id}/${p.id}.jpg`,
            ),
          ),
          text: (await exists(textPath, { baseDir: BaseDirectory.AppData }))
            ? await readTextFile(textPath, { baseDir: BaseDirectory.AppData })
            : undefined,
        }
      }),
    ),
  }
}

export async function getDocs(): Promise<Doc[]> {
  return await Promise.all((await getRawDocs()).map(augmentRawDoc))
}

export async function createDoc(): Promise<string> {
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

  return rawDoc.id
}

export async function deleteDoc(docId: string): Promise<void> {
  const rawDocs = await getRawDocs()

  await remove(`scribbleScan/docs/${docId}`, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  })

  await updateRawDocs(rawDocs.filter((d) => d.id !== docId))
}

export async function renameDoc(docId: string, name: string): Promise<void> {
  const rawDocs = await getRawDocs()
  const rawDoc = rawDocs.find((d) => d.id === docId)

  if (rawDoc === undefined) {
    throw new Error(`Can't find doc with id ${docId}`)
  }

  rawDoc.name = name
  rawDoc.updatedAt = new Date()

  await updateRawDocs(rawDocs.map((d) => (d.id === docId ? rawDoc : d)))
}

export async function addPage(
  docId: string,
  base64Image: string,
): Promise<string> {
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
  rawDoc.updatedAt = new Date()
  await updateRawDocs(rawDocs.map((d) => (d.id === docId ? rawDoc : d)))

  return page.id
}

export async function addPageText(
  docId: string,
  pageId: string,
  text: string,
): Promise<void> {
  const rawDocs = await getRawDocs()
  const rawDoc = rawDocs.find((d) => d.id === docId)

  if (rawDoc === undefined) {
    throw new Error(`Can't find doc with id ${docId}`)
  }

  const page = rawDoc.pages.find((p) => p.id === pageId)

  if (page === undefined) {
    // This can happen if someone added a new page and removed it right away
    // before the OCR results were back.
    console.warn(`Can't find page with id ${pageId} in doc ${docId}`)
    return
  }

  await writeTextFile(`scribbleScan/docs/${docId}/${pageId}.txt`, text, {
    baseDir: BaseDirectory.AppData,
  })
}

export async function deletePage(docId: string, pageId: string): Promise<void> {
  const rawDocs = await getRawDocs()
  const rawDoc = rawDocs.find((d) => d.id === docId)

  if (rawDoc === undefined) {
    throw new Error(`Can't find doc with id ${docId}`)
  }

  const pagePath = `scribbleScan/docs/${docId}/${pageId}.txt`

  // Text file might not be present if page is removed just after it was added
  // but before OCR results came from the server.
  if (await exists(pagePath, { baseDir: BaseDirectory.AppData })) {
    await remove(pagePath, { baseDir: BaseDirectory.AppData })
  }

  rawDoc.pages = rawDoc.pages.filter((p) => p.id !== pageId)
  rawDoc.updatedAt = new Date()

  await updateRawDocs(rawDocs)
}
