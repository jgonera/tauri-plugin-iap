import React, { useEffect, useImperativeHandle, useRef, useState } from "react";

export interface CameraHandle {
  capture: () => string;
}

export default React.forwardRef<CameraHandle>((_, ref) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [height, setHeight] = useState(0);
  const [width, setWidth] = useState(0);

  async function setMediaStream() {
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
    setMediaStream();
  }, [setHeight, setWidth, videoRef]);

  useImperativeHandle(ref, () => ({
    capture() {
      if (canvasRef.current === null || videoRef.current === null) {
        throw new Error("Camera not ready!");
      }

      const canvas = canvasRef.current;

      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext("2d");
      context?.drawImage(videoRef.current, 0, 0, width, height);

      return canvas.toDataURL("image/jpeg", 0.75);
    },
  }));

  return (
    <>
      <canvas ref={canvasRef} />
      <video ref={videoRef} autoPlay />
    </>
  );
});
