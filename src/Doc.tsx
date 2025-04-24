import {
  ArrowLeft,
  Camera,
  DotsThreeVertical,
  MagnifyingGlassPlus,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import { Link, useLocation, useNavigate, useParams } from "react-router"

import DocDrawer from "@/components/DocDrawer"
import useStore from "@/useStore"

import classes from "./Doc.module.css"

interface TextProps {
  id: string
  onActive: () => void
  text?: string
}

function Text({ id, onActive, text }: TextProps) {
  const { ref, inView } = useInView({
    onChange: (inView) => {
      if (inView) {
        onActive()
      }
    },
    rootMargin: "-50% 0% -50% 0%",
  })

  return (
    <pre
      className={clsx({ [classes.active]: inView })}
      id={`text-${id}`}
      ref={ref}
    >
      {text}
    </pre>
  )
}

interface ThumbnailProps {
  id: string
  imageURL: string
  onActive: () => void
  pageId: string
}

function Thumbnail({ id, imageURL, onActive, pageId }: ThumbnailProps) {
  const navigate = useNavigate()

  const { ref, inView } = useInView({
    onChange: (inView) => {
      if (inView) {
        onActive()
      }
    },
    rootMargin: "0% -50% 0% -50%",
  })

  return (
    <li
      className={clsx({ [classes.active]: inView })}
      id={`thumbnail-${pageId}`}
      onClick={(e) => {
        if (!inView) {
          e.currentTarget.scrollIntoView({ inline: "center" })
        } else {
          void navigate(`/doc/${id}/page/${pageId}`)
        }
      }}
      ref={ref}
    >
      <img src={imageURL} />
      <MagnifyingGlassPlus size={32} />
    </li>
  )
}

interface DocProps {
  showDocDrawer?: boolean
}

export default function Doc({ showDocDrawer }: DocProps) {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { docs } = useStore()
  const [isScrollingText, setIsScrollingText] = useState(true)
  const [isScrollingThumbnails, setIsScrollingThumbnails] = useState(false)
  const scrollableRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (scrollableRef.current) {
      const searchParams = new URLSearchParams(location.search)
      const scroll = searchParams.get("scroll")

      if (scroll !== null) {
        scrollableRef.current.scrollTo({
          behavior: "instant",
          top: parseInt(scroll),
        })
      }
    }
  }, [])

  const doc = docs.find((d) => d.id === id)

  if (doc === undefined) {
    throw new Error(`Can't find doc with id ${id ?? "undefined"}`)
  }

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
        <h1>{doc.name}</h1>
        <Link
          aria-label={`Menu for ${doc.name}`}
          to={`/doc/${doc.id}/doc-drawer`}
        >
          <DotsThreeVertical size={32} />
        </Link>
      </header>

      <section
        className={classes.text}
        onScroll={(e) => {
          console.log("*")
          console.log(window.location.href)

          const searchParams = new URLSearchParams({
            ...Object.fromEntries(new URLSearchParams(location.search)),
            scroll: Math.round(e.currentTarget.scrollTop).toString(),
          }).toString()

          void navigate(`${location.pathname}?${searchParams}`, {
            replace: true,
          })
          console.log(window.location.href)
        }}
        onTouchStart={() => {
          setIsScrollingText(true)
          setIsScrollingThumbnails(false)
        }}
        ref={scrollableRef}
      >
        {doc.pages.map((p) => (
          <Text
            id={p.id}
            key={p.id}
            onActive={() => {
              console.log(`Text onActive, ${isScrollingText}`)
              if (isScrollingText) {
                document
                  .getElementById(`thumbnail-${p.id}`)
                  ?.scrollIntoView({ inline: "center" })
              }
            }}
            text={p.text}
          />
        ))}
      </section>

      <nav className={classes.footer}>
        <button
          aria-label="New page"
          className={classes.newPage}
          onClick={() => {
            void navigate(`/doc/${doc.id}/camera`)
          }}
        >
          <Camera size={32} />
        </button>

        <ul
          onTouchStart={() => {
            setIsScrollingThumbnails(true)
            setIsScrollingText(false)
          }}
        >
          {doc.pages.map((p) => (
            <Thumbnail
              id={doc.id}
              imageURL={p.imageURL}
              key={p.id}
              onActive={() => {
                if (isScrollingThumbnails) {
                  document
                    .getElementById(`text-${p.id}`)
                    ?.scrollIntoView({ block: "start" })
                }
              }}
              pageId={p.id}
            />
          ))}
        </ul>
      </nav>

      <DocDrawer
        doc={doc}
        isOpen={showDocDrawer}
        onDelete={() => {
          void navigate(-2)
        }}
      />
    </>
  )
}
