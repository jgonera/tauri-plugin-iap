import { z } from "zod"

export const DBDocSchema = z
  .object({
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    id: z.string().uuid(),
    name: z.string(),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
    pageCount: z.number(),
  })
  .strict()

export const DBPageSchema = z
  .object({
    createdAt: z.string().datetime().pipe(z.coerce.date()),
    docId: z.string().uuid(),
    id: z.string().uuid(),
    position: z.number(),
    text: z.string().nullable(),
    updatedAt: z.string().datetime().pipe(z.coerce.date()),
  })
  .strict()

export const DocSchema = DBDocSchema.extend({
  pages: z.array(
    z
      .object({
        id: z.string().uuid(),
        imageURL: z.string(),
        text: z.string().nullable(),
      })
      .strict(),
  ),
}).strict()

export type Doc = z.infer<typeof DocSchema>

export const ListItemSchema = DBDocSchema.extend({
  imageURL: z.string(),
})

export type ListItem = z.infer<typeof ListItemSchema>

export const SearchResultSchema = ListItemSchema.extend({
  fragments: z.array(
    z
      .object({
        pageId: z.string().uuid(),
        text: z.string(),
      })
      .strict(),
  ),
})

export type SearchResult = z.infer<typeof SearchResultSchema>
