import { create } from "zustand"

import {
  addPage,
  addPageText,
  createDoc,
  deleteDoc,
  deletePage,
  getDocs,
  renameDoc,
  search,
} from "@/store/sqliteStore"
import type { Doc, SearchResult } from "@/store/types"

interface StoreState {
  docs: Doc[]
  searchResults: SearchResult[]
  searchQuery: string
  createDoc: () => Promise<string>
  deleteDoc: (docId: string) => Promise<void>
  renameDoc: (docId: string, name: string) => Promise<void>
  addPage: (docId: string, base64Image: string) => Promise<string>
  addPageText: (docId: string, pageId: string, text: string) => Promise<void>
  deletePage: (docId: string, pageId: string) => Promise<void>
  setSearchQuery: (searchQuery: string) => void
}

const docs = await getDocs()

const useStore = create<StoreState>()((set, get) => {
  async function refreshDocs() {
    const docs = await getDocs()
    set(() => ({ docs }))
  }

  async function refreshSearchResults() {
    const searchQuery = get().searchQuery
    const searchResults =
      searchQuery.length < 2 ? [] : await search(searchQuery)
    set(() => ({ searchResults }))
  }

  return {
    docs,
    searchResults: [],
    searchQuery: "",

    createDoc: async () => {
      const id = await createDoc()
      await refreshDocs()
      void refreshSearchResults()

      return id
    },
    deleteDoc: async (docId) => {
      await deleteDoc(docId)
      await refreshDocs()
      void refreshSearchResults()
    },
    renameDoc: async (docId, name) => {
      await renameDoc(docId, name)
      await refreshDocs()
      void refreshSearchResults()
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
    setSearchQuery: (searchQuery) => {
      set(() => ({ searchQuery }))
      void refreshSearchResults()
    },
  }
})

export default useStore
