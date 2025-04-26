import { create } from "zustand"

import {
  addPage,
  addPageText,
  createDoc,
  deleteDoc,
  deletePage,
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
  deletePage: (docId: string, pageId: string) => Promise<void>
}

const docs = await getDocs()

const useStore = create<StoreState>()((set) => {
  async function refreshDocs() {
    const docs = await getDocs()
    set(() => ({ docs }))
  }

  return {
    docs,
    createDoc: async () => {
      const id = await createDoc()
      await refreshDocs()

      return id
    },
    deleteDoc: async (docId) => {
      await deleteDoc(docId)
      await refreshDocs()
    },
    renameDoc: async (docId, name) => {
      await renameDoc(docId, name)
      await refreshDocs()
    },
    addPage: async (docId, base64Image) => {
      const pageId = await addPage(docId, base64Image)
      await refreshDocs()

      return pageId
    },
    addPageText: async (docId, base64Image, text) => {
      await addPageText(docId, base64Image, text)
      await refreshDocs()
    },
    deletePage: async (docId, pageId) => {
      await deletePage(docId, pageId)
      await refreshDocs()
    },
  }
})

export default useStore
