import Jabber from "jabber"

const jabber = new Jabber()

// https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest
export async function performOCR(base64Image: string) {
  const msgUint8 = new TextEncoder().encode(base64Image) // encode as (utf-8) Uint8Array
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgUint8) // hash the message
  const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("") // convert bytes to hex string
  const paragraph = jabber.createParagraph(100)

  // Simulate server response delay
  await new Promise((resolve) => setTimeout(resolve, 3000))

  return `Transcribed text for image with SHA-1 ${hashHex}\n\n${paragraph}`
}

export async function warmUpOCR() {
  console.log("Warming up mock OCR...")
  await Promise.resolve()
}
