import { ArrowLeft, DotsThreeVertical, Plus, X } from "@phosphor-icons/react"
import { useEffect, useRef, useState } from "react"
import { Link, useLocation, useNavigate, useParams } from "react-router"
import { useThrottledCallback } from "use-debounce"

import DocDrawer from "@/components/DocDrawer"
import { Doc } from "@/store/types"
import useStore from "@/useStore"
import { pluralize } from "@/util"

import classes from "./Search.module.css"

const dateTimeFormat = new Intl.DateTimeFormat()

interface SearchInputProps {
  onChange: (value: string) => void
  defaultValue?: string
}

function SearchInput({ onChange, defaultValue = "" }: SearchInputProps) {
  const [value, setValue] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  return (
    <div className={classes.searchInput}>
      <input
        autoFocus
        onChange={(e) => {
          setValue(e.target.value)
          onChange(e.target.value)
        }}
        placeholder="Start typing to search"
        ref={inputRef}
        value={value}
      />
      {value !== "" && (
        <button
          aria-label="Clear"
          onClick={() => {
            setValue("")
            onChange("")
            inputRef.current?.focus()
          }}
        >
          <X size={24} />
        </button>
      )}
    </div>
  )
}

export default function Search() {
  const { id } = useParams()
  const location = useLocation()
  const navigate = useNavigate()
  const { docs, searchResults, searchQuery, setSearchQuery } = useStore()
  const [doc, setDoc] = useState<Doc | undefined>()

  useEffect(() => {
    const search = new URLSearchParams(location.search)
    setSearchQuery(search.get("query") ?? "")
  }, [])

  // We keep `doc` set even when there's no `id` so that the drawer can be
  // still rendered with full content while its closing animation finishes.
  useEffect(() => {
    if (id !== undefined) {
      setDoc(docs.find((d) => d.id === id))
    }
  }, [docs, id])

  const handleInput = useThrottledCallback((value: string) => {
    setSearchQuery(value)

    const search = new URLSearchParams({
      ...Object.fromEntries(new URLSearchParams(location.search)),
      query: value,
    }).toString()

    void navigate({ search }, { replace: true })
  }, 100)

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
        <SearchInput defaultValue={searchQuery} onChange={handleInput} />
      </header>

      <Link aria-label="New" className={classes.new} to="/camera">
        <Plus size={32} />
      </Link>

      <ul className={classes.list}>
        {searchResults.map((sr) => (
          <li key={sr.id}>
            <div>
              <Link className={classes.docLink} to={`/doc/${sr.id}`}>
                <div className={classes.thumbnailWrapper}>
                  <img src="" />
                </div>
                <div className={classes.description}>
                  <h2 dangerouslySetInnerHTML={{ __html: sr.name }}></h2>
                  <p className={classes.metadata}>
                    <time dateTime={sr.updatedAt.toISOString()}>
                      {dateTimeFormat.format(sr.updatedAt)}
                    </time>{" "}
                    • {pluralize(sr.pageCount, "page")}
                  </p>
                </div>
              </Link>
              <Link
                className={classes.docMenuLink}
                aria-label={`Menu for ${sr.name}`}
                to={`/search/${sr.id}/doc-drawer`}
              >
                <DotsThreeVertical size={32} />
              </Link>
            </div>
            {sr.fragments.map((f, index) => (
              <Link
                key={index}
                to={`/doc/${sr.id}?pageId=${f.pageId}`}
                dangerouslySetInnerHTML={{ __html: f.text }}
              ></Link>
            ))}
          </li>
        ))}
      </ul>

      {doc && (
        <DocDrawer
          doc={doc}
          isOpen={false}
          onDelete={() => {
            void navigate(-1)
          }}
        />
      )}
    </>
  )
}
