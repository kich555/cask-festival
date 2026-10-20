"use client"
// 자료실 하단 스크롤 안내. 아래에 내용이 더 있을 때만 보이고, 조금 내리면 사라진다.

import { useEffect, useState } from "react"

export default function ScrollHint() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const update = () => {
      const rest = document.documentElement.scrollHeight - window.innerHeight - window.scrollY
      setShow(window.scrollY < 80 && rest > 120)
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    window.addEventListener("resize", update)
    return () => {
      window.removeEventListener("scroll", update)
      window.removeEventListener("resize", update)
    }
  }, [])

  return (
    <button
      type="button"
      aria-label="아래로 스크롤"
      onClick={() => window.scrollBy({ top: window.innerHeight * 0.8, behavior: "smooth" })}
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center justify-center w-10 h-10 rounded-full bg-white/90 border border-black/15 text-[#1a1a1a] shadow-sm transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5 animate-bounce"
        aria-hidden="true"
      >
        <path d="M5.5 8 10 12.5 14.5 8" />
      </svg>
    </button>
  )
}
