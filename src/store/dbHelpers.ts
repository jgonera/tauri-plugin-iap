import type Database from "@tauri-apps/plugin-sql"
import camelcaseKeys from "camelcase-keys"
import sql from "sql-template-tag"
import { z } from "zod"

export async function execute(db: Database, query: ReturnType<typeof sql>) {
  return await db.execute(query.text, query.values)
}

export async function select<T extends z.ZodTypeAny>(
  db: Database,
  schema: T,
  query: ReturnType<typeof sql>,
) {
  return z
    .array(schema)
    .parse(
      camelcaseKeys(await db.select(query.text, query.values)),
    ) as z.infer<T>[]
}
