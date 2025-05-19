import { convertFileSrc } from "@tauri-apps/api/core"
import { appDataDir, BaseDirectory, join } from "@tauri-apps/api/path"
import { mkdir, remove, writeFile } from "@tauri-apps/plugin-fs"
import Database from "@tauri-apps/plugin-sql"
import camelcaseKeys from "camelcase-keys"
import sql from "sql-template-tag"
import { v7 as uuidv7 } from "uuid"
import { z } from "zod"

import { execute, select } from "@/store/dbHelpers"
import { Doc, SearchResult } from "@/store/types"
import { base64ToArrayBuffer } from "@/util"

const APP_DATA_DIR = await appDataDir()
const DB = await Database.load("sqlite:scribbleScan.db")

const DBDocSchema = z
  .object({
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    id: z.string().uuid(),
    name: z.string(),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
    pageCount: z.number(),
  })
  .strict()

const DBPageSchema = z
  .object({
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    docId: z.string().uuid(),
    id: z.string().uuid(),
    position: z.number(),
    text: z.string().nullable(),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
  })
  .strict()

export async function getDocs(): Promise<Doc[]> {
  const docs = await select(
    DB,
    DBDocSchema,
    sql`
      SELECT
        *
      FROM
        doc
    `,
  )

  return await Promise.all(
    docs.map(async (d) => {
      const pages = await Promise.all(
        z
          .array(DBPageSchema)
          .parse(
            camelcaseKeys(
              await DB.select("SELECT * FROM page WHERE doc_id = $1", [d.id]),
            ),
          )
          .map(async (p) => ({
            ...p,
            imageURL: convertFileSrc(
              await join(APP_DATA_DIR, `scribbleScan/docs/${d.id}/${p.id}.jpg`),
            ),
          })),
      )

      return {
        ...d,
        pages,
      }
    }),
  )
}

export async function createDoc(): Promise<string> {
  const now = new Date().toISOString()

  const doc = {
    id: uuidv7(),
    name: `Scribble ${now}`,
    createdAt: now,
    updatedAt: now,
  }

  await mkdir(`scribbleScan/docs/${doc.id}`, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  })

  await execute(
    DB,
    sql`
      INSERT INTO
        doc (created_at, id, name, updated_at)
      VALUES
        (
          ${doc.createdAt},
          ${doc.id},
          ${doc.name},
          ${doc.updatedAt}
        )
    `,
  )

  return doc.id
}

export async function deleteDoc(docId: string): Promise<void> {
  await execute(
    DB,
    sql`
      DELETE FROM doc
      WHERE
        id = ${docId}
    `,
  )

  await remove(`scribbleScan/docs/${docId}`, {
    baseDir: BaseDirectory.AppData,
    recursive: true,
  })
}

export async function renameDoc(docId: string, name: string): Promise<void> {
  await execute(
    DB,
    sql`
      UPDATE doc
      SET
        name = ${name}
      WHERE
        id = ${docId}
    `,
  )
}

export async function addPage(
  docId: string,
  base64Image: string,
): Promise<string> {
  const now = new Date().toISOString()

  const page = {
    createdAt: now,
    docId,
    id: uuidv7(),
    position: sql`
      (
        SELECT
          page_count + 1
        FROM
          doc
        WHERE
          id = ${docId}
      )
    `,
    updatedAt: now,
  }

  await writeFile(
    `scribbleScan/docs/${docId}/${page.id}.jpg`,
    base64ToArrayBuffer(base64Image),
    {
      baseDir: BaseDirectory.AppData,
    },
  )

  await execute(
    DB,
    sql`
      INSERT INTO
        page (created_at, doc_id, id, position, updated_at)
      VALUES
        (
          ${page.createdAt},
          ${page.docId},
          ${page.id},
          ${page.position},
          ${page.updatedAt}
        );

      UPDATE doc
      SET
        page_count = page_count + 1,
        updated_at = ${now}
      WHERE
        id = ${docId};
    `,
  )

  return page.id
}

export async function addPageText(
  docId: string,
  pageId: string,
  text: string,
): Promise<void> {
  const now = new Date().toISOString()

  await execute(
    DB,
    sql`
      UPDATE page
      SET
        text = ${text},
        updated_at = ${now}
      WHERE
        id = ${pageId};

      UPDATE doc
      SET
        updated_at = ${now}
      WHERE
        id = ${docId};
    `,
  )
}

export async function deletePage(docId: string, pageId: string): Promise<void> {
  const now = new Date().toISOString()

  await execute(
    DB,
    sql`
      DELETE FROM page
      WHERE
        id = ${pageId};

      UPDATE doc
      SET
        page_count = page_count - 1,
        updated_at = ${now}
      WHERE
        id = ${docId};
    `,
  )
}

function getFragments(query: string, text: string) {
  return (
    `START${text}END`
      .match(new RegExp(`\\b.{0,50}${query}.{0,50}\\b`, "ig"))
      ?.map((m) =>
        ` ${m} `
          .replaceAll(/(^ START|END $)/g, "")
          .replaceAll(/(^\s+|\s+$)/g, "…")
          .replaceAll(new RegExp(`(${query})`, "ig"), "<mark>$1</mark>"),
      ) ?? []
  )
}

export async function search(query: string): Promise<SearchResult[]> {
  const results = await select(
    DB,
    DBDocSchema.extend({ text: DBPageSchema.shape.text }),
    sql`
      SELECT
        doc.*,
        page.text
      FROM
        doc
        LEFT JOIN page ON page.doc_id = doc.id
      WHERE
        doc.name LIKE ${`%${query}%`}
        OR page.text LIKE ${`%${query}%`}
    `,
  )

  return Array.from(
    results
      .reduce<Map<string, SearchResult>>((acc, r) => {
        if (!acc.has(r.id)) {
          acc.set(r.id, {
            createdAt: r.createdAt,
            fragments: [],
            id: r.id,
            name: r.name.replaceAll(
              new RegExp(`(${query})`, "ig"),
              "<mark>$1</mark>",
            ),
            pageCount: r.pageCount,
            updatedAt: r.updatedAt,
          })
        }

        if (r.text !== null) {
          acc.get(r.id)?.fragments.push(...getFragments(query, r.text))
        }

        return acc
      }, new Map())
      .values(),
  )
}
