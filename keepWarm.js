while (true) {
  console.log(`${new Date().toISOString()} Pinging /api/generate`)
  try {
    await fetch(
      "https://ollama-minicpm-v-31109354798.us-central1.run.app/api/generate",
      {
        method: "POST",
        body: JSON.stringify({
          model: "minicpm-v:8b-2.6-q4_K_M",
          prompt: "Respond with just one word: hi",
          options: {
            temperature: 0.01,
            top_k: 100,
            top_p: 0.8,
          },
        }),
      },
    )
  } catch (e) {
    console.error(`${new Date().toISOString()} ${e}`)
  }
  console.log(`${new Date().toISOString()} Done. Waiting...`)
  await new Promise((r) => setTimeout(r, 14 * 60 * 1000))
}
