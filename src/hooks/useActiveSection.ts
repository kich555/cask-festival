import { useCallback, useEffect, useState } from "react"

export interface SectionItem {
  id: string
}

interface UseActiveSectionResult {
  activeId: string
  handleNavClick: (id: string) => void
}

export function useActiveSection<T extends SectionItem>(
  items: readonly T[],
): UseActiveSectionResult {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "")

  const handleNavClick = useCallback((id: string) => {
    setActiveId(id)

    const section = document.getElementById(id)
    if (section) {
      const navBarHeight = 88 // NavigationBar의 높이
      const elementPosition = section.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.scrollY - navBarHeight

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      })
    }
  }, [])

  useEffect(() => {
    if (items.length === 0) return undefined

    const sections = items
      .map((item) => document.getElementById(item.id))
      .filter((section): section is HTMLElement => section !== null)

    if (sections.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntries = entries.filter((entry) => entry.isIntersecting)

        if (visibleEntries.length === 0) return

        const mostVisible = visibleEntries.reduce((prev, current) =>
          prev.intersectionRatio >= current.intersectionRatio ? prev : current,
        )

        setActiveId(mostVisible.target.id)
      },
      {
        root: null,
        rootMargin: "-50% 0px -50% 0px",
        threshold: 0,
      },
    )

    sections.forEach((section) => {
      observer.observe(section)
    })

    return () => {
      sections.forEach((section) => {
        observer.unobserve(section)
      })
      observer.disconnect()
    }
  }, [items])

  useEffect(() => {
    const handleScroll = () => {
      const { scrollY, innerHeight } = window
      const docHeight = document.documentElement.scrollHeight

      if (innerHeight + scrollY >= docHeight - 2) {
        const lastId = items[items.length - 1]?.id
        if (lastId) {
          setActiveId(lastId)
        }
      }
    }

    window.addEventListener("scroll", handleScroll)

    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [items])

  useEffect(() => {
    setActiveId(items[0]?.id ?? "")
  }, [items])

  return { activeId, handleNavClick }
}
