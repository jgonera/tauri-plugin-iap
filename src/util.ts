import { save } from "@tauri-apps/plugin-dialog"
import { writeFile } from "@tauri-apps/plugin-fs"

// TODO: Use `Uint8Array.fromBase64() when
// https://issues.chromium.org/issues/42204568 is implemented.
function base64ToArrayBuffer(base64: string) {
  const binaryString = atob(base64)
  const bytes = new Uint8Array(binaryString.length)
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i)
  }
  return bytes
}

export async function saveJPEG(imageDataURL: string) {
  const path = await save({
    defaultPath: "test.jpeg",
    filters: [
      {
        name: "JPEG",
        extensions: ["jpg"],
      },
    ],
  })
  console.log(path)

  if (path !== null) {
    await writeFile(path, base64ToArrayBuffer(imageDataURL.slice(23)))
  }
}
