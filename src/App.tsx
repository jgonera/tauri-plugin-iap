import React from "react"
import { RouterProvider } from "react-aria-components"
import { Route, Routes, useHref, useNavigate } from "react-router"

import Camera from "@/Camera"
import Debug from "@/Debug"
import Doc from "@/Doc"
import List from "@/List"
import Page from "@/Page"
import Search from "@/Search"

export default function App() {
  const navigate = useNavigate()

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
          <Route path="/list/:id/doc-drawer" element={<List showDocDrawer />} />
          <Route path="/search" element={<Search />} />
          <Route
            path="/search/:id/doc-drawer"
            element={<Search showDocDrawer />}
          />
        </Routes>
      </RouterProvider>
    </React.StrictMode>
  )
}
