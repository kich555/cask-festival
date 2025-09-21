"use client"

import { AnimatePresence } from "framer-motion"
import { Menu } from "lucide-react"
import Image from "next/image"
import { useCallback, useState } from "react"

import { NAV_ITEMS } from "@/constants"
import { useActiveSection } from "@/hooks/useActiveSection"
import { useBodyScrollLock } from "@/hooks/useBodyScrollLock"

import { IconButton } from "./IconButton"
import { MobileMenu } from "./MobileMenu"
import { NavLinks } from "./NavLinks"

export default function NavigationBar() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { activeId, handleNavClick } = useActiveSection(NAV_ITEMS)

  useBodyScrollLock(menuOpen)

  const handleMobileNavigate = useCallback(
    (id: string) => {
      handleNavClick(id)
      setMenuOpen(false)
    },
    [handleNavClick],
  )

  return (
    <>
      <nav className="bg-[#121212]/30 backdrop-blur-sm fixed top-0 left-0 right-0 z-50 flex justify-center ">
        <div className="max-w-[1440px] mx-6 md:mx-10 py-4 w-full">
          <div className="flex items-center justify-between">
            <Image
              src="/header_icon.svg"
              alt="logo"
              width={330}
              height={54}
              className="w-[165px] h-[27px] md:w-[244px] md:h-[40px]"
            />
            <NavLinks
              items={NAV_ITEMS}
              activeId={activeId}
              onNavigate={handleNavClick}
              containerClassName="hidden md:flex items-center space-x-16 text-[16px] font-bold"
            />
            <IconButton
              icon={Menu}
              className="md:hidden text-white"
              aria-label="메뉴 열기"
              iconSize={24}
              onClick={() => setMenuOpen(true)}
            />
          </div>
        </div>
      </nav>
      <AnimatePresence>
        {menuOpen && (
          <MobileMenu
            items={NAV_ITEMS}
            activeId={activeId}
            onNavigate={handleMobileNavigate}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
