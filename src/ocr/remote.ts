import { fetch } from "@tauri-apps/plugin-http"

const API_URL = "https://ollama-minicpm-v-31109354798.us-central1.run.app/api"

export async function performOCR(base64Image: string) {
  const response = await fetch(`${API_URL}/generate`, {
    method: "POST",
    // TODO: Remove when we add OLLAMA_ORIGINS
    // https://github.com/tauri-apps/plugins-workspace/issues/1968
    headers: {
      Origin: "",
    },
    body: JSON.stringify({
      model: "minicpm-v:8b-2.6-q4_K_M",
      prompt: "Transcribe this image.",
      images: [base64Image],
      options: {
        temperature: 0.01,
        top_k: 100,
        top_p: 0.8,
      },
      stream: false,
    }),
  })

  const json = (await response.json()) as { response: string }

  console.log(json)

  return json.response
}

export async function warmUpOCR() {
  const response = await fetch(`${API_URL}/generate`, {
    method: "POST",
    // TODO: Remove when we add OLLAMA_ORIGINS
    // https://github.com/tauri-apps/plugins-workspace/issues/1968
    headers: {
      Origin: "",
    },
    body: JSON.stringify({
      model: "minicpm-v:8b-2.6-q4_K_M",
      prompt: "Write one word.",
      options: {
        temperature: 0.01,
        top_k: 100,
        top_p: 0.8,
      },
      stream: false,
    }),
  })

  const json = (await response.json()) as { response: string }

  console.log(json)
}
