import { useEffect, useRef } from "react"
import { useNavigate } from "react-router"

interface UseScrollRestoreArgs {
  name: string
  restoreX?: boolean
  restoreY?: boolean
}

export default function useScrollRestore<T extends HTMLElement>({
  name,
  restoreX = false,
  restoreY = false,
}: UseScrollRestoreArgs) {
  const ref = useRef<T>(null)
  const navigate = useNavigate()

  function handleScroll(e: Event) {
    if (!(e.currentTarget instanceof Element)) return

    const searchParams = new URLSearchParams({
      ...Object.fromEntries(new URLSearchParams(window.location.search)),
      ...(restoreX
        ? {
            [`${name}ScrollX`]: Math.round(
              e.currentTarget.scrollLeft,
            ).toString(),
          }
        : {}),
      ...(restoreY
        ? {
            [`${name}ScrollY`]: Math.round(
              e.currentTarget.scrollTop,
            ).toString(),
          }
        : {}),
    }).toString()

    void navigate(`${window.location.pathname}?${searchParams}`, {
      replace: true,
    })
  }

  useEffect(() => {
    if (ref.current === null) return

    const searchParams = new URLSearchParams(location.search)
    const x = searchParams.get(`${name}ScrollX`)
    const y = searchParams.get(`${name}ScrollY`)

    if (x || y) {
      ref.current.scrollTo({
        behavior: "instant",
        left: x !== null ? parseInt(x) : undefined,
        top: y !== null ? parseInt(y) : undefined,
      })
    }

    ref.current.addEventListener("scroll", handleScroll, { passive: true })

    return () => {
      if (ref.current === null) return

      ref.current.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return ref
}
