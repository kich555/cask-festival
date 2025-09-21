import type { LucideIcon } from "lucide-react"
import type { ButtonHTMLAttributes } from "react"

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> & {
  icon: LucideIcon
  iconSize?: number
  iconClassName?: string
}

export function IconButton({
  icon: Icon,
  iconSize = 24,
  iconClassName,
  className,
  type,
  ...buttonProps
}: IconButtonProps) {
  const mergedClassName = ["inline-flex items-center justify-center", className]
    .filter(Boolean)
    .join(" ")

  return (
    <button type={type ?? "button"} className={mergedClassName} {...buttonProps}>
      <Icon aria-hidden="true" size={iconSize} className={iconClassName} />
    </button>
  )
}
