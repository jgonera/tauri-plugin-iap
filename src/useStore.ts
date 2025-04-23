import { create } from "zustand"

import {
  addPage,
  addPageText,
  createDoc,
  deleteDoc,
  type Doc,
  getDocs,
  renameDoc,
} from "@/localStore"

interface StoreState {
  docs: Doc[]
  createDoc: () => Promise<string>
  deleteDoc: (docId: string) => Promise<void>
  renameDoc: (docId: string, name: string) => Promise<void>
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
  deleteDoc: async (docId) => {
    await deleteDoc(docId)
    const docs = await getDocs()
    set(() => ({ docs }))
  },
  renameDoc: async (docId, name) => {
    await renameDoc(docId, name)
    const docs = await getDocs()
    set(() => ({ docs }))
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
