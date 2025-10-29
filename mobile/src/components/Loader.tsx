import clsx from "clsx"
import React from "react"

import classes from "./Loader.module.css"

interface LoaderProps {
  className?: string
  id?: string
}

export default React.forwardRef(function Loader(
  { className, id }: LoaderProps,
  ref?: React.Ref<HTMLDivElement>,
) {
  return (
    <div
      aria-label="Loading..."
      className={clsx(classes.loader, className)}
      id={id}
      ref={ref}
    ></div>
  )
})
