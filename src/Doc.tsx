import {
  ArrowLeft,
  Camera,
  DotsThreeVertical,
  MagnifyingGlassPlus,
} from "@phosphor-icons/react"
import clsx from "clsx"
import { useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { Link, useLocation, useNavigate, useParams } from "react-router"

import DocDrawer from "@/components/DocDrawer"
import Loader from "@/components/Loader"
import useScrollRestore from "@/useScrollRestore"
import useStore from "@/useStore"

import classes from "./Doc.module.css"

interface TextProps {
  id: string
  onActive: () => void
  text: string | null
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
    <div className={classes.pageContainer} id={`text-${id}`} ref={ref}>
      {text !== null ? (
        <pre className={clsx({ [classes.active]: inView })}>{text}</pre>
      ) : (
        <Loader />
      )}
    </div>
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
  const { id = null } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { openDoc, setOpenDocId } = useStore()
  const [currentPageNumber, setCurrentPageNumber] = useState(1)
  const [isScrollingText, setIsScrollingText] = useState(false)
  const [isScrollingThumbnails, setIsScrollingThumbnails] = useState(false)
  const textScrollRef = useScrollRestore({ name: "text", restoreY: true })
  const thumbnailScrollRef = useScrollRestore<HTMLUListElement>({
    name: "thumbnail",
    restoreX: true,
  })

  function scrollTextIntoView(pageId: string) {
    const textEl = document.getElementById(`text-${pageId}`)

    if (textEl === null) return

    textEl.scrollIntoView({
      block:
        textEl.scrollHeight > 0.5 * window.document.body.clientHeight
          ? "start"
          : "center",
    })
  }

  function scrollThumbnailIntoView(pageId: string) {
    document
      .getElementById(`thumbnail-${pageId}`)
      ?.scrollIntoView({ inline: "center" })
  }

  useEffect(() => {
    const search = new URLSearchParams(location.search)
    const pageId = search.get("pageId")

    if (pageId !== null) {
      scrollTextIntoView(pageId)
      scrollThumbnailIntoView(pageId)

      search.delete("pageId")
      void navigate({ search: search.toString() }, { replace: true })
    }
  }, [])

  useEffect(() => {
    setOpenDocId(id)
  }, [id, setOpenDocId])

  useEffect(() => {
    if (
      openDoc !== null &&
      openDoc.pages.at(-1)?.text === null &&
      textScrollRef.current !== null &&
      thumbnailScrollRef.current !== null
    ) {
      textScrollRef.current.scrollTo({
        top: textScrollRef.current.scrollHeight,
      })
      thumbnailScrollRef.current.scrollTo({
        left: thumbnailScrollRef.current.scrollWidth,
      })
    }
  }, [openDoc, textScrollRef, thumbnailScrollRef])

  return (
    openDoc?.id === id && (
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
          <h1>{openDoc.name}</h1>
          <Link
            aria-label={`Menu for ${openDoc.name}`}
            to={`/doc/${openDoc.id}/doc-drawer`}
          >
            <DotsThreeVertical size={32} />
          </Link>
        </header>

        <section
          className={classes.text}
          onTouchStart={() => {
            setIsScrollingText(true)
            setIsScrollingThumbnails(false)
          }}
          ref={textScrollRef}
        >
          {openDoc.pages.map((p) => (
            <Text
              id={p.id}
              key={p.id}
              onActive={() => {
                if (isScrollingText) {
                  scrollThumbnailIntoView(p.id)
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
              void navigate(`/doc/${openDoc.id}/camera`)
            }}
          >
            <Camera size={32} />
          </button>

          <div
            aria-label="Current page number"
            className={classes.currentPageNumber}
          >
            {currentPageNumber} / {openDoc.pages.length}
          </div>

          <ul
            onTouchStart={() => {
              setIsScrollingThumbnails(true)
              setIsScrollingText(false)
            }}
            ref={thumbnailScrollRef}
          >
            {openDoc.pages.map((p, index) => (
              <Thumbnail
                id={openDoc.id}
                imageURL={p.imageURL}
                key={p.id}
                onActive={() => {
                  setCurrentPageNumber(index + 1)

                  if (isScrollingThumbnails) {
                    scrollTextIntoView(p.id)
                  }
                }}
                pageId={p.id}
              />
            ))}
          </ul>
        </nav>

        <DocDrawer
          doc={openDoc}
          isOpen={showDocDrawer}
          onDelete={() => {
            void navigate(-2)
          }}
        />
      </>
    )
  )
}
