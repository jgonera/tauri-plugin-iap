import { create } from "zustand"

import {
  addPage,
  addPageText,
  createDoc,
  deleteDoc,
  deletePage,
  getDoc,
  getDocs,
  renameDoc,
  search,
} from "@/store/sqliteStore"
import type { Doc, ListItem, SearchResult } from "@/store/types"

interface StoreState {
  docs: ListItem[]
  openDoc: Doc | null
  openDocId: string | null
  searchResults: SearchResult[]
  searchQuery: string
  createDoc: () => Promise<string>
  deleteDoc: (docId: string) => Promise<void>
  renameDoc: (docId: string, name: string) => Promise<void>
  addPage: (docId: string, base64Image: string) => Promise<string>
  addPageText: (docId: string, pageId: string, text: string) => Promise<void>
  deletePage: (docId: string, pageId: string) => Promise<void>
  setOpenDocId: (docId: string | null) => void
  setSearchQuery: (searchQuery: string) => void
}

const docs = await getDocs()

const useStore = create<StoreState>()((set, get) => {
  async function refreshDocs() {
    const docs = await getDocs()
    set(() => ({ docs }))
  }

  async function refreshOpenDoc() {
    const openDocId = get().openDocId
    const openDoc = openDocId === null ? null : await getDoc(openDocId)
    set(() => ({ openDoc }))
  }

  async function refreshSearchResults() {
    const searchQuery = get().searchQuery
    const searchResults =
      searchQuery.length < 2 ? [] : await search(searchQuery)
    set(() => ({ searchResults }))
  }

  return {
    docs,
    openDoc: null,
    openDocId: null,
    searchResults: [],
    searchQuery: "",

    createDoc: async () => {
      const id = await createDoc()
      void refreshDocs()
      void refreshSearchResults()

      return id
    },

    deleteDoc: async (docId) => {
      await deleteDoc(docId)
      void refreshDocs()
      void refreshSearchResults()
    },

    renameDoc: async (docId, name) => {
      await renameDoc(docId, name)
      void refreshDocs()
      void refreshOpenDoc()
      void refreshSearchResults()
    },

    addPage: async (docId, base64Image) => {
      const pageId = await addPage(docId, base64Image)
      void refreshDocs()
      void refreshOpenDoc()

      return pageId
    },

    addPageText: async (docId, base64Image, text) => {
      await addPageText(docId, base64Image, text)
      void refreshOpenDoc()
    },

    deletePage: async (docId, pageId) => {
      await deletePage(docId, pageId)
      void refreshDocs()
      void refreshOpenDoc()
    },

    setOpenDocId: (openDocId) => {
      set(() => ({ openDocId }))
      void refreshOpenDoc()
    },

    setSearchQuery: (searchQuery) => {
      set(() => ({ searchQuery }))
      void refreshSearchResults()
    },
  }
})

export default useStore
