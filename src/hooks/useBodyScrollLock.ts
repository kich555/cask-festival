import { useEffect } from "react"

export function useBodyScrollLock(shouldLock: boolean) {
  useEffect(() => {
    if (typeof document === "undefined") return

    const { body } = document
    if (!body) return

    const previousOverflow = body.style.overflow

    body.style.overflow = shouldLock ? "hidden" : ""

    return () => {
      body.style.overflow = previousOverflow
    }
  }, [shouldLock])
}
