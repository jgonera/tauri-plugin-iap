import { fetch } from "@tauri-apps/plugin-http";

export default async function performRemoteOCR(imageDataURL: string) {
  const response = await fetch(
    "https://ollama-minicpm-v-31109354798.us-central1.run.app/api/generate",
    {
      method: "POST",
      // TODO: Remove when we add OLLAMA_ORIGINS
      // https://github.com/tauri-apps/plugins-workspace/issues/1968
      headers: {
        Origin: "",
      },
      body: JSON.stringify({
        model: "minicpm-v:8b-2.6-q4_K_M",
        prompt: "Transcribe this image.",
        // Slice to remove `data:image/jpeg;base64,`
        images: [imageDataURL.slice(23)],
        options: {
          temperature: 0.01,
          top_k: 100,
          top_p: 0.8,
        },
        stream: false,
      }),
    },
  );

  console.dir(response);

  return (await response.json()).response;
}
