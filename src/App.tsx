import "@/global.css"

import React from "react"
import { RouterProvider } from "react-aria-components"
import { Route, Routes, useHref, useNavigate } from "react-router"

import Debug from "@/Debug"
import Doc from "@/Doc"
import List from "@/List"

export default function App() {
  const navigate = useNavigate()

  return (
    <React.StrictMode>
      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <RouterProvider navigate={navigate} useHref={useHref}>
        <Routes>
          <Route path="/" element={<List />} />
          <Route path="/debug" element={<Debug />} />
          <Route path="/doc/:id" element={<Doc />} />
          <Route path="/new" element={<Doc />} />
        </Routes>
      </RouterProvider>
    </React.StrictMode>
  )
}
