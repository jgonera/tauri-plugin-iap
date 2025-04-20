import { create } from "zustand"

import {
  addPage,
  addPageText,
  createDoc,
  type Doc,
  getDocs,
} from "@/localStore"

interface StoreState {
  docs: Doc[]
  createDoc: () => Promise<string>
  addPage: (docId: string, base64Image: string) => Promise<string>
  addPageText: (docId: string, pageId: string, text: string) => Promise<void>
}

const docs = await getDocs()

const useStore = create<StoreState>()((set) => ({
  docs,
  createDoc: async () => {
    const doc = await createDoc()
    const docs = await getDocs()
    set(() => ({ docs }))
    return doc.id
  },
  addPage: async (docId, base64Image) => {
    const doc = await addPage(docId, base64Image)
    const docs = await getDocs()
    set(() => ({ docs }))

    const lastPage = doc.pages.at(-1)

    if (lastPage === undefined) {
      throw new Error("Can't access newly added page!")
    }

    return lastPage.id
  },
  addPageText: async (docId, base64Image, text) => {
    await addPageText(docId, base64Image, text)
    const docs = await getDocs()
    set(() => ({ docs }))
  },
}))

export default useStore
