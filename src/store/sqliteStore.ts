import { convertFileSrc } from "@tauri-apps/api/core"
import { appDataDir, BaseDirectory } from "@tauri-apps/api/path"
import { mkdir, remove, writeFile } from "@tauri-apps/plugin-fs"
import Database from "@tauri-apps/plugin-sql"
import sql from "sql-template-tag"
import { v7 as uuidv7 } from "uuid"

import { execute, select } from "@/store/dbHelpers"
import {
  DBDocSchema,
  DBPageSchema,
  Doc,
  ListItem,
  SearchResult,
} from "@/store/types"
import { base64ToArrayBuffer } from "@/util"

const APP_DATA_DIR = await appDataDir()
const DB = await Database.load("sqlite:scribbleScan.db")

function getImageURL(docId: string, pageId: string) {
  return convertFileSrc(
    `${APP_DATA_DIR}/scribbleScan/docs/${docId}/${pageId}.jpg`,
  )
}

export async function getDocs(): Promise<ListItem[]> {
  const results = await select(
    DB,
    DBDocSchema.extend({
      firstPageId: DBPageSchema.shape.id,
    }),
    sql`
      SELECT
        doc.*,
        first_page.id AS first_page_id
      FROM
        doc
        JOIN page first_page ON first_page.doc_id = doc.id
        AND first_page.position = 0
    `,
  )

  return results.map((r) => {
    const { firstPageId, ...rest } = r

    return {
      ...rest,
      imageURL: getImageURL(r.id, firstPageId),
    }
  })
}

export async function getDoc(docId: string): Promise<Doc> {
  const doc = await select(
    DB,
    DBDocSchema,
    sql`
      SELECT
        *
      FROM
        doc
      WHERE
        id = ${docId}
    `,
  )

  const pages = await select(
    DB,
    DBPageSchema.pick({ id: true, text: true }),
    sql`
      SELECT
        id,
        text
      FROM
        page
      WHERE
        doc_id = ${docId}
    `,
  )

  return {
    ...doc[0],
    pages: pages.map((p) => ({ ...p, imageURL: getImageURL(docId, p.id) })),
  }
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
      DELETE FROM page
      WHERE
        doc_id = ${docId};

      DELETE FROM doc
      WHERE
        id = ${docId};
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
          page_count
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
    DBDocSchema.extend({
      firstPageId: DBPageSchema.shape.id,
      pageId: DBPageSchema.shape.id,
      text: DBPageSchema.shape.text,
    }),
    sql`
      SELECT
        doc.*,
        first_page.id AS first_page_id,
        page.id AS page_id,
        page.text
      FROM
        doc
        JOIN page first_page ON first_page.doc_id = doc.id
        AND first_page.position = 0
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
            imageURL: getImageURL(r.id, r.firstPageId),
            name: r.name.replaceAll(
              new RegExp(`(${query})`, "ig"),
              "<mark>$1</mark>",
            ),
            pageCount: r.pageCount,
            updatedAt: r.updatedAt,
          })
        }

        if (r.text !== null) {
          acc.get(r.id)?.fragments.push(
            ...getFragments(query, r.text).map((f) => ({
              pageId: r.pageId,
              text: f,
            })),
          )
        }

        return acc
      }, new Map())
      .values(),
  )
}
