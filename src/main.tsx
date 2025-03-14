import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router"

import App from "@/App"

const rootEl = document.getElementById("root")

if (rootEl === null) {
  throw new Error("Can't find #root element!")
}

ReactDOM.createRoot(rootEl).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
