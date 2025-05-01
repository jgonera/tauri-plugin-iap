while (true) {
  console.log(`${new Date().toISOString()} Pinging /api/version`)
  try {
    await fetch(
      "https://ollama-minicpm-v-31109354798.us-central1.run.app/api/version",
    )
  } catch (e) {
    console.error(`${new Date().toISOString()} ${e}`)
  }
  console.log(`${new Date().toISOString()} Done. Waiting...`)
  await new Promise((r) => setTimeout(r, 14 * 60 * 1000))
}
