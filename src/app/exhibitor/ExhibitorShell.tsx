"use client"
// /exhibitor 공통 틀: 업체명 헤더, 상단 탭, 임시 비밀번호 안내, 비밀번호 변경

import Link from "next/link"
import { useState } from "react"
import { PasswordDialog } from "./exhibitorParts"

const TABS = [
  { key: "apply", href: "/exhibitor", label: "부스 부대시설 신청" },
  { key: "assets", href: "/exhibitor/assets", label: "자료실" },
  { key: "layout", href: "/exhibitor/layout", label: "부스 배치도 (추후 업데이트 예정)" },
] as const

export type ExhibitorTabKey = (typeof TABS)[number]["key"]

export default function ExhibitorShell({
  name,
  passwordChanged,
  active,
  wide = false,
  children,
}: {
  name: string
  passwordChanged: boolean
  active: ExhibitorTabKey
  /** 본문만 넓게 (헤더·탭 폭은 그대로) */
  wide?: boolean
  children: React.ReactNode
}) {
  const [pwOpen, setPwOpen] = useState(false)
  const [pwChanged, setPwChanged] = useState(passwordChanged)

  async function logout() {
    await fetch("/api/exhibitor/logout", { method: "POST" })
    window.location.href = "/exhibitor"
  }

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-[1200px] mx-auto px-5 pt-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] text-white/50 font-bold tracking-wide">
              CASK CARNIVAL 2026 · 참가업체
            </p>
            <h1 className="text-[20px] md:text-[22px] font-extrabold mt-1">{name}</h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setPwOpen(true)}
              className="text-[13px] text-white/60 hover:text-white"
            >
              비밀번호 변경
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-[13px] text-white/60 hover:text-white"
            >
              로그아웃
            </button>
          </div>
        </div>
        <nav className="max-w-[1200px] mx-auto px-5 mt-5 grid grid-cols-3 border-t border-white/10">
          {TABS.map((t) => (
            <Link
              key={t.key}
              href={t.href}
              aria-current={active === t.key ? "page" : undefined}
              className={`text-center px-2 py-3.5 text-[13px] sm:text-[15px] font-bold border-b-[3px] transition-colors ${
                active === t.key
                  ? "border-[#7d0b1c] text-white"
                  : "border-transparent text-white/50 hover:text-white"
              }`}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className={`${wide ? "max-w-[1200px]" : "max-w-[820px]"} mx-auto px-5 py-8 space-y-6`}>
        {!pwChanged && (
          <div className="rounded-lg border border-[#f0ad4e]/50 bg-[#f0ad4e]/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1 text-[14px] text-[#6b4b00] leading-relaxed">
              <b>임시 비밀번호로 로그인하셨습니다.</b>
              <br className="hidden sm:block" /> 보안을 위해 원하시는 비밀번호로 변경해 주세요.
            </p>
            <button
              type="button"
              onClick={() => setPwOpen(true)}
              className="shrink-0 bg-[#1a1a1a] text-white rounded px-5 py-2.5 text-[14px] font-bold"
            >
              비밀번호 변경
            </button>
          </div>
        )}
        {children}
      </main>

      {pwOpen && (
        <PasswordDialog onClose={() => setPwOpen(false)} onChanged={() => setPwChanged(true)} />
      )}
    </div>
  )
}
