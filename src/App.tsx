import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { invoke } from "@tauri-apps/api/core";
import { fetch } from "@tauri-apps/plugin-http";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const webcamRef = useRef<Webcam | null>(null);
  const videoConstraints = {
    facingMode: { exact: "environment" },
    height: 99999,
    width: 99999,
  };

  useEffect(() => {
    console.log("test");
  });

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
    setText(await invoke("Hello"));
  }

  const doMagic = useCallback(async () => {
    if (webcamRef.current === null) return;

    const base64Image = webcamRef.current.getScreenshot();

    if (base64Image === null) return;

    setText("Processing...");

    console.log(base64Image);

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
          images: [base64Image.slice(23)],
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

    setText((await response.json()).response);
  }, [webcamRef]);

  navigator.mediaDevices.getUserMedia({
    video: videoConstraints,
    audio: true,
  });

  return (
    <main className="container">
      <Webcam
        ref={webcamRef}
        screenshotFormat="image/jpeg"
        videoConstraints={videoConstraints}
      />

      <button type="submit" onClick={doMagic}>
        Transcribe
      </button>

      <pre>{text}</pre>
    </main>
  );
}

export default App;
