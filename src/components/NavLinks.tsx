import type { MouseEvent } from "react"

export type NavigationItem = {
  id: string
  label: string
}

interface NavLinksProps {
  items: readonly NavigationItem[]
  activeId: string
  onNavigate: (id: string) => void
  containerClassName?: string
  linkClassName?: string
  activeClassName?: string
  inactiveClassName?: string
}

export function NavLinks({
  items,
  activeId,
  onNavigate,
  containerClassName,
  linkClassName,
  activeClassName = "text-[#ea5514]",
  inactiveClassName = "text-white hover:text-[#ea5514] transition-colors",
}: NavLinksProps) {
  const handleClick = (event: MouseEvent<HTMLAnchorElement>, id: string) => {
    event.preventDefault()
    onNavigate(id)
  }

  return (
    <div className={containerClassName}>
      {items.map((item) => {
        const isActive = activeId === item.id
        const combinedClassName = [linkClassName, isActive ? activeClassName : inactiveClassName]
          .filter(Boolean)
          .join(" ")

        return (
          <a
            key={item.id}
            href={`#${item.id}`}
            onClick={(event) => handleClick(event, item.id)}
            className={combinedClassName}
          >
            {item.label}
          </a>
        )
      })}
    </div>
  )
}
