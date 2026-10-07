"use client"

import Image from "next/image"
import { useState } from "react"
import { OFFICE_CONTACT } from "@/lib/exhibitorRecord"

export default function ExhibitorLogin() {
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch("/api/exhibitor/login", {
        method: "POST",
        body: new FormData(e.currentTarget),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (data.ok) {
        window.location.reload()
        return
      }
      setError(data.error ?? "로그인에 실패했습니다.")
    } catch {
      setError("로그인에 실패했습니다.")
    } finally {
      setBusy(false)
    }
  }

  const inputCls =
    "w-full bg-white border border-black/15 rounded px-4 py-3 text-[15px] text-center outline-none focus:border-[#1a1a1a]"

  return (
    <div className="relative min-h-screen bg-[#f6f5f5] text-[#1a1a1a] flex flex-col items-center justify-center px-5 py-12 ">
      <div className="relative w-full max-w-[400px] text-center">
        <Image
          src="/2026/logo-nav-dark.svg"
          alt="CASK CARNIVAL"
          width={480}
          height={144}
          priority
          className="mx-auto w-[240px] h-auto"
        />
        <p className="mt-4 text-[13px] font-bold tracking-[0.2em] text-[#7d0b1c]">
          2026. 11. 21 – 22
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-8 bg-white border border-black/10 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.06)] px-6 py-8 md:px-8"
        >
          <h1 className="text-[20px] font-extrabold">참가업체 전용 페이지</h1>
          <p className="mt-1.5 text-[13px] text-[#888]">
            운영사무국에서 전달드린 아이디·비밀번호를 입력해 주세요.
          </p>

          <div className="mt-6 space-y-2">
            <input
              name="loginId"
              required
              autoComplete="username"
              autoCapitalize="none"
              placeholder="아이디"
              aria-label="아이디"
              className={inputCls}
            />
            <input
              type="password"
              name="password"
              required
              autoComplete="current-password"
              placeholder="비밀번호"
              aria-label="비밀번호"
              className={inputCls}
            />
          </div>

          {error && <p className="text-[13px] text-[#7d0b1c] mt-3">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full mt-4 bg-[#1a1a1a] text-white rounded px-4 py-3 font-bold text-[15px] hover:bg-black disabled:opacity-50"
          >
            {busy ? "확인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-6 text-[13px] text-[#777] leading-relaxed">
          <p>
            로그인이 되지 않는 경우 운영사무국 공식 카카오톡 혹은
            <br />
            하단 연락처로 연락 부탁드립니다.
          </p>
          <p className="mt-3 text-[#555]">
            <a href={`tel:${OFFICE_CONTACT.phone.replace(/-/g, "")}`} className="hover:underline">
              {OFFICE_CONTACT.phone}
            </a>
            <span className="mx-2 text-black/20">|</span>
            <a href={`mailto:${OFFICE_CONTACT.email}`} className="hover:underline">
              {OFFICE_CONTACT.email}
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
