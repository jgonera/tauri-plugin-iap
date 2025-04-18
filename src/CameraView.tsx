import { useCallback, useEffect, useRef, useState } from "react"

interface CameraViewProps {
  onBack: () => void
  onCapture: (base64Image: string) => void
}

export default function CameraView({ onBack, onCapture }: CameraViewProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [height, setHeight] = useState(0)
  const [width, setWidth] = useState(0)

  async function setMediaStream() {
    if (videoRef.current === null) return

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: { exact: "environment" },
        height: 9999,
        width: 9999,
      },
    })

    setStream(stream)

    const settings = stream.getVideoTracks()[0].getSettings()

    if (!settings.height || !settings.width) {
      throw new Error("Missing width and/or height of video stream!")
    }

    videoRef.current.srcObject = stream

    const { height, width } = settings

    if (height > width) {
      setHeight(height)
      setWidth(width)
    } else {
      // This might be only needed in dev because of React strict mode
      setHeight(width)
      setWidth(height)
    }

    console.log(
      `Video resolution: ${settings.width.toString()}x${settings.height.toString()}`,
    )
  }

  useEffect(() => {
    void setMediaStream()

    // return () => {
    //   if (stream) {
    //     stream.getTracks().forEach((track) => {
    //       track.stop()
    //     })
    //   }
    // }
  }, [setHeight, setWidth, videoRef])

  const onCaptureCallback = useCallback(() => {
    if (canvasRef.current === null || videoRef.current === null) {
      throw new Error("Camera not ready!")
    }

    const canvas = canvasRef.current

    canvas.width = width
    canvas.height = height
    const context = canvas.getContext("2d")
    context?.drawImage(videoRef.current, 0, 0, width, height)

    // Slice to remove `data:image/jpeg;base64,`
    const base64Image = canvas.toDataURL("image/jpeg", 0.75).slice(23)

    onCapture(base64Image)
  }, [canvasRef, videoRef, onCapture])

  return (
    <>
      <canvas ref={canvasRef} style={{ display: "none" }} />
      <video ref={videoRef} autoPlay playsInline />

      <button onClick={onBack}>Back</button>
      <button onClick={onCaptureCallback}>Capture</button>
    </>
  )
}
