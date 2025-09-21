"use client"

import { motion } from "framer-motion"
import { X } from "lucide-react"
import Image from "next/image"

import { IconButton } from "./IconButton"
import type { NavigationItem } from "./NavLinks"

interface MobileMenuProps {
  items: readonly NavigationItem[]
  activeId: string
  onNavigate: (id: string) => void
  onClose: () => void
}

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

const menuVariants = {
  hidden: { x: "100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      damping: 25,
      stiffness: 200,
    },
  },
  exit: {
    x: "100%",
    opacity: 0,
    transition: {
      type: "spring" as const,
      damping: 30,
      stiffness: 300,
    },
  },
}

const itemsContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring" as const,
      damping: 20,
      stiffness: 300,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.95,
    transition: {
      duration: 0.2,
    },
  },
}

const logoVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      delay: 0.3,
      type: "spring" as const,
      damping: 20,
    },
  },
  exit: { opacity: 0, x: -20 },
}

const closeButtonVariants = {
  hidden: { opacity: 0, rotate: -90, scale: 0 },
  visible: {
    opacity: 1,
    rotate: 0,
    scale: 1,
    transition: {
      delay: 0.3,
      type: "spring" as const,
      damping: 15,
    },
  },
  exit: { opacity: 0, rotate: 90, scale: 0 },
}

export function MobileMenu({ items, activeId, onNavigate, onClose }: MobileMenuProps) {
  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        className="absolute inset-0 backdrop-blur-sm"
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        onClick={onClose}
        aria-hidden
      />
      <motion.div
        className="relative flex h-full w-full"
        variants={menuVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <div className="flex h-full w-full flex-col items-center justify-center bg-white/30 backdrop-blur-sm">
          <motion.nav
            className="flex flex-col items-center space-y-12 text-2xl font-bold"
            variants={itemsContainerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {items.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={
                  activeId === item.id
                    ? "text-[#ea5514]"
                    : "text-black hover:text-[#ea5514] transition-colors"
                }
                variants={itemVariants}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                type="button"
              >
                {item.label}
              </motion.button>
            ))}
          </motion.nav>
        </div>
        <motion.div
          className="absolute left-6 top-6"
          variants={logoVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <Image
            src="/header_icon.svg"
            alt="logo"
            width={165}
            height={27}
            className="w-[165px] h-[27px]"
          />
        </motion.div>
        <motion.div
          className="absolute right-6 top-6"
          variants={closeButtonVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <IconButton
            icon={X}
            className="text-black"
            aria-label="메뉴 닫기"
            iconSize={24}
            onClick={onClose}
          />
        </motion.div>
      </motion.div>
    </div>
  )
}
