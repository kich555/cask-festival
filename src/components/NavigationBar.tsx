"use client"

import { NAV_ITEMS, NAV_ITEMS_2025 } from "@/constants"
import { useActiveSection } from "@/hooks/useActiveSection"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import LanguageToggle from "./LanguageToggle"
import { NavLinks } from "./NavLinks"

function NavigationBarContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { activeId, handleNavClick } = useActiveSection(
    pathname === "/2025" ? NAV_ITEMS_2025 : NAV_ITEMS,
  )

  // Preserve lang param when navigating to home
  const homeLinkHref = searchParams.get("lang") ? `/?lang=${searchParams.get("lang")}` : "/"

  return (
    <nav className="bg-[#121212]/30 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 flex justify-center ">
      <div className="max-w-[1440px] mx-6 md:mx-10 py-4 w-full">
        <div className="flex items-center justify-between">
          <Link href={homeLinkHref}>
            <Image
              src="/header_icon.svg"
              alt="logo"
              width={330}
              height={54}
              className="w-[165px] h-[27px] md:w-[244px] md:h-[40px]"
            />
          </Link>
          <div className="hidden md:flex items-center gap-8">
            <NavLinks
              items={NAV_ITEMS}
              activeId={activeId}
              onNavigate={handleNavClick}
              containerClassName="flex items-center space-x-16 text-[16px] font-bold"
            />
            <LanguageToggle />
          </div>
          <div className="flex md:hidden items-center">
            <LanguageToggle />
          </div>
        </div>
      </div>
    </nav>
  )
}

export default function NavigationBar() {
  return (
    <Suspense fallback={null}>
      <NavigationBarContent />
    </Suspense>
  )
}
