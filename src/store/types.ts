import { z } from "zod"

export const RawPageSchema = z
  .object({
    id: z.string().uuid(),
    text: z.string().nullable(),
  })
  .strict()

export const RawDocSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
    pages: z.array(RawPageSchema),
  })
  .strict()

export type RawDoc = z.infer<typeof RawDocSchema>

export const DocSchema = z
  .object({
    id: z.string().uuid(),
    name: z.string(),
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
    pages: z.array(
      RawPageSchema.extend({
        imageURL: z.string(),
      }),
    ),
  })
  .strict()

export type Doc = z.infer<typeof DocSchema>

export const SearchResultSchema = z
  .object({
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    fragments: z.array(
      z
        .object({
          pageId: z.string().uuid(),
          text: z.string(),
        })
        .strict(),
    ),
    id: z.string().uuid(),
    name: z.string(),
    pageCount: z.number(),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
  })
  .strict()

export type SearchResult = z.infer<typeof SearchResultSchema>
