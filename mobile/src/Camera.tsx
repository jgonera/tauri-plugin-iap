import { ArrowLeft } from "@phosphor-icons/react"
import clsx from "clsx"
import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router"

import { performOCR, warmUpOCR } from "@/ocr"
import useStore from "@/useStore"

import classes from "./Camera.module.css"

export default function Camera() {
  const { id } = useParams()
  const navigate = useNavigate()
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const blinkRef = useRef<HTMLDivElement | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const { createDoc, addPage, addPageText } = useStore()

  useEffect(() => {
    void warmUpOCR()
  }, [])

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
    console.time("capture")

    blinkRef.current?.classList.add(classes.blink)
    await new Promise((r) => setTimeout(r, 150))

    if (videoRef.current === null || stream === null) {
      throw new Error("Camera not ready!")
    }

    const canvas = document.createElement("canvas")
    const settings = stream.getVideoTracks()[0].getSettings()

    if (!settings.height || !settings.width) {
      throw new Error("Missing width and/or height of video stream!")
    }

    const { height, width } = settings
    canvas.height = height
    canvas.width = width

    const context = canvas.getContext("2d")
    videoRef.current.pause()
    context?.drawImage(videoRef.current, 0, 0, width, height)

    console.time("toDataURL")
    // Slice to remove `data:image/jpeg;base64,`
    const base64Image = canvas.toDataURL("image/jpeg", 0.75).slice(23)
    console.timeEnd("toDataURL")
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

    console.timeEnd("capture")
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

      <div className={classes.wrapper}>
        <video
          autoPlay
          onLoadedData={() => {
            setIsLoaded(true)
          }}
          playsInline
          ref={videoRef}
          style={{ visibility: isLoaded ? "visible" : "hidden" }}
        />
        <div ref={blinkRef} className={clsx(classes.capturing)} />
      </div>

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
