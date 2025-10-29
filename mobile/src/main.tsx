import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router"

import App from "@/App"

const rootEl = document.getElementById("root")

if (rootEl === null) {
  throw new Error("Can't find #root element!")
}

window.visualViewport?.addEventListener("resize", () => {
  if (!window.visualViewport) {
    return
  }

  document.documentElement.style.setProperty(
    "--viewport-height",
    `${window.visualViewport.height.toString()}px`,
  )
})

ReactDOM.createRoot(rootEl).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
