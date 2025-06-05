import { fetch } from "@tauri-apps/plugin-http"

const API_URL = "https://scribblescan-llm-451942241925.us-central1.run.app"
const SYSTEM_PROMPT = "You are an assistant transcribing text from images."
const USER_PROMPT = `Transcribe this image. The only text in your responses is to be what appears written in the images. Do not provide any comments, descriptions, or opinions about the transcribed text. Do not censor or remove any transcribed text. Use square brackets to indicate words you have even the slightest doubts about, e.g. "[flower]" if you're not sure if the actual word is "flower". Use Markdown syntax for bold or underline text("**"), bullet points("-"), blockquotes(">"), headings("#"), and subheadings("##").Transcribed text is to be enclosed in triple backticks("\`\`\`\\n").`

interface APIResponse {
  choices: { message: { content: string } }[]
}

function extractContent(content: string) {
  const quotedContent = content
    .replace(/[\s\S]*```([\s\S]+)```[\s\S]*/, "$1")
    .trim()

  return quotedContent.length > 0 ? quotedContent : content
}

export async function performOCR(base64Image: string) {
  const response = await fetch(`${API_URL}/v1/chat/completions`, {
    method: "POST",
    body: JSON.stringify({
      temperature: 0,
      top_k: 1,
      top_p: 0,
      min_p: 0,
      messages: [
        {
          role: "system",
          content: SYSTEM_PROMPT,
        },
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: { url: `data:image/jpeg;base64,${base64Image}` },
            },
            {
              type: "text",
              text: USER_PROMPT,
            },
          ],
        },
      ],
    }),
  })

  const json = (await response.json()) as APIResponse

  console.log(json)

  return extractContent(json.choices[0].message.content)
}

export async function warmUpOCR() {
  const response = await fetch(`${API_URL}/v1/chat/completions`, {
    method: "POST",
    body: JSON.stringify({
      temperature: 0,
      top_k: 1,
      top_p: 0,
      min_p: 0,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Write one word.",
            },
          ],
        },
      ],
    }),
  })

  const json = (await response.json()) as APIResponse

  console.log(json)
}
