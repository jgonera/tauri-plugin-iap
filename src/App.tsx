import { useCallback, useEffect, useRef, useState } from "react";
import { fetch } from "@tauri-apps/plugin-http";
import "./App.css";

function App() {
  const [text, setText] = useState("");
  const [imageData, setImageData] = useState<string | null>(null);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  async function setVideoSource() {
    if (videoRef.current === null) return;

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { exact: "environment" },
        height: 9999,
        width: 9999,
      },
    });

    const settings = stream.getVideoTracks()[0].getSettings();

    if (!settings.height || !settings.width) {
      throw new Error("Missing width and/or height of video stream!");
    }

    videoRef.current.srcObject = stream;

    const { height, width } = settings;

    if (height > width) {
      setHeight(height);
      setWidth(width);
    } else {
      // This might be only needed in dev because of React strict mode
      setHeight(width);
      setWidth(height);
    }

    console.log(`Video resolution: ${settings.width}x${settings.height}`);
  }

  useEffect(() => {
    setVideoSource();
  }, [setHeight, setWidth, videoRef]);

  const doMagic = useCallback(async () => {
    if (canvasRef.current === null || videoRef.current === null) return;

    const canvas = canvasRef.current;

    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    context?.drawImage(videoRef.current, 0, 0, width, height);

    const dataURL = canvas.toDataURL("image/jpeg", 0.75);
    setImageData(dataURL);

    // setText("Processing...");
    //
    // const response = await fetch(
    //   "https://ollama-minicpm-v-31109354798.us-central1.run.app/api/generate",
    //   {
    //     method: "POST",
    //     // TODO: Remove when we add OLLAMA_ORIGINS
    //     // https://github.com/tauri-apps/plugins-workspace/issues/1968
    //     headers: {
    //       Origin: "",
    //     },
    //     body: JSON.stringify({
    //       model: "minicpm-v:8b-2.6-q4_K_M",
    //       prompt: "Transcribe this image.",
    //       // Slice to remove `data:image/jpeg;base64,`
    //       images: [dataURL.slice(23)],
    //       options: {
    //         temperature: 0.01,
    //         top_k: 100,
    //         top_p: 0.8,
    //       },
    //       stream: false,
    //     }),
    //   },
    // );
    //
    // console.dir(response);
    //
    // setText((await response.json()).response);
  }, [height, width]);

  return (
    <main className="container">
      <video ref={videoRef} autoPlay />
      <canvas ref={canvasRef} />

      <button type="submit" onClick={doMagic}>
        Transcribe
      </button>

      {imageData && <img src={imageData} />}

      <pre>{text}</pre>
    </main>
  );
}

export default App;
