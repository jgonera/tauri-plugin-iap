import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router"
import { useDebouncedCallback } from "use-debounce"

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
  const location = useLocation()
  const navigate = useNavigate()
  const ref = useRef<T>(null)
  const [scrollX, setScrollX] = useState<number | null>(null)
  const [scrollY, setScrollY] = useState<number | null>(null)

  const handleScroll = useDebouncedCallback((e: Event) => {
    if (!(e.target instanceof Element)) return

    setScrollX(e.target.scrollLeft)
    setScrollY(e.target.scrollTop)
  }, 100)

  useEffect(() => {
    const search = new URLSearchParams({
      ...Object.fromEntries(new URLSearchParams(location.search)),
      ...(restoreX && scrollX !== null
        ? {
            [`${name}ScrollX`]: Math.round(scrollX).toString(),
          }
        : {}),
      ...(restoreY && scrollY !== null
        ? {
            [`${name}ScrollY`]: Math.round(scrollY).toString(),
          }
        : {}),
    }).toString()

    void navigate({ search }, { replace: true })
  }, [scrollX, scrollY])

  useEffect(() => {
    if (ref.current === null) return

    const search = new URLSearchParams(location.search)
    const x = search.get(`${name}ScrollX`)
    const y = search.get(`${name}ScrollY`)

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
