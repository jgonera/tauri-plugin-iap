import { useCallback, useEffect, useRef, useState } from "react"

interface CameraViewProps {
  readonly onBack: () => void
  readonly onCapture: (base64Image: string) => void
}

export default function CameraView({ onBack, onCapture }: CameraViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)

  useEffect(() => {
    void (async () => {
      if (videoRef.current === null || stream !== null) return

      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: { exact: "environment" },
          height: 9999,
          width: 9999,
        },
      })

      videoRef.current.srcObject = newStream
      setStream(newStream)
    })()

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
        })
      }
    }
  }, [stream])

  const onCaptureCallback = useCallback(() => {
    if (
      canvasRef.current === null ||
      videoRef.current === null ||
      stream === null
    ) {
      throw new Error("Camera not ready!")
    }

    const canvas = canvasRef.current
    const settings = stream.getVideoTracks()[0].getSettings()

    if (!settings.height || !settings.width) {
      throw new Error("Missing width and/or height of video stream!")
    }

    const { height, width } = settings

    if (height > width) {
      canvas.height = height
      canvas.width = width
    } else {
      // This might be only needed in dev because of React strict mode
      canvas.height = width
      canvas.width = height
    }
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    context?.drawImage(videoRef.current, 0, 0, width, height)

    // Slice to remove `data:image/jpeg;base64,`
    const base64Image = canvas.toDataURL("image/jpeg", 0.75).slice(23)

    onCapture(base64Image)
  }, [onCapture, stream])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <video autoPlay playsInline ref={videoRef} />

      <button onClick={onBack}>Back</button>
      <button onClick={onCaptureCallback}>Capture</button>
    </>
  )
}
