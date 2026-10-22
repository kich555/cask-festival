"use client"

// 스크롤해서 화면에 들어오면 아래에서 살짝 떠오르며 나타난다 (한 번만).
// immediate: 페이지 첫 화면의 큰 덩어리(목록·표)는 스크롤을 기다리지 않고 바로 나타난다.
import { motion } from "framer-motion"

export default function Reveal({
  children,
  delay = 0,
  className,
  immediate = false,
}: {
  children: React.ReactNode
  delay?: number
  className?: string
  immediate?: boolean
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 28 }}
      {...(immediate
        ? { animate: { opacity: 1, y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 } })}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  )
}
