import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"

import App from "@/App"
import Doc from "@/Doc"

const rootEl = document.getElementById("root")

if (rootEl === null) {
  throw new Error("Can't find #root element!")
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/new" element={<Doc />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
