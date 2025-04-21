import { ArrowLeft } from "@phosphor-icons/react"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"

import performMockOCR from "@/ocr/mock"
import performRemoteOCR from "@/ocr/remote"
import useStore from "@/useStore"

import classes from "./Camera.module.css"

const performOCR = import.meta.env.DEV ? performMockOCR : performRemoteOCR
// const performOCR = performRemoteOCR

export default function Camera() {
  const { id } = useParams()
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { createDoc, addPage, addPageText } = useStore()

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

  const capture = useCallback(async () => {
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
    const currentId = id ?? (await createDoc())

    if (id === undefined) {
      void navigate(`/doc/${currentId}`, { replace: true })
    } else {
      void navigate(-1)
    }

    void (async () => {
      const pageId = await addPage(currentId, base64Image)
      const text = await performOCR(base64Image)
      await addPageText(currentId, pageId, text)
    })()
  }, [addPage, addPageText, createDoc, id, navigate, stream])

  return (
    <>
      <header className={classes.header}>
        <button
          aria-label="Go back"
          onClick={() => {
            void navigate(-1)
          }}
        >
          <ArrowLeft size={32} />
        </button>
      </header>

      <canvas ref={canvasRef} style={{ display: "none" }} />
      <video
        autoPlay
        onLoadedData={() => {
          setIsLoaded(true)
        }}
        playsInline
        ref={videoRef}
        style={{ visibility: isLoaded ? "visible" : "hidden" }}
      />

      <div className={classes.footer}>
        <button
          aria-label="Capture"
          className={classes.capture}
          onClick={() => {
            void capture()
          }}
        >
          <span>&nbsp;</span>
        </button>
      </div>
    </>
  )
}
