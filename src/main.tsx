import React from "react"
import ReactDOM from "react-dom/client"

import App from "./App"

const rootEl = document.getElementById("root")

if (rootEl === null) {
  throw new Error("Can't find #root element!")
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
