import React, { useEffect } from "react"
import { usePreventScroll } from "react-aria"
import { RouterProvider } from "react-aria-components"
import { Route, Routes, useHref, useNavigate } from "react-router"

import Camera from "@/Camera"
import Debug from "@/Debug"
import Doc from "@/Doc"
import List from "@/List"
import { warmUpOCR } from "@/ocr"
import Page from "@/Page"
import Search from "@/Search"
import Subscribe from "@/Subscribe"

export default function App() {
  useEffect(() => {
    void warmUpOCR()
  }, [])

  const navigate = useNavigate()
  usePreventScroll()

  return (
    <React.StrictMode>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <RouterProvider navigate={navigate} useHref={useHref}>
        <Routes>
          <Route path="/" element={<List />} />
          <Route path="/camera" element={<Camera />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/doc/:id" element={<Doc />} />
          <Route path="/doc/:id/camera" element={<Camera />} />
          <Route path="/doc/:id/doc-drawer" element={<Doc showDocDrawer />} />
          <Route path="/doc/:id/page/:pageId" element={<Page />} />
          <Route
            path="/doc/:id/page/:pageId/delete-drawer"
            element={<Page showDeleteDrawer />}
          />
          <Route path="/list/:id/doc-drawer" element={<List showDocDrawer />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/search/:id/doc-drawer"
            element={<Search showDocDrawer />}
          />
          <Route path="/subscribe" element={<Subscribe />} />
        </Routes>
      </RouterProvider>
    </React.StrictMode>
  )
}
