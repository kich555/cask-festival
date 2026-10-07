"use client"

import { useState } from "react"

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

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex items-center justify-center px-5">
      <form onSubmit={handleSubmit} className="w-full max-w-[360px]">
        <h1 className="text-[22px] font-extrabold tracking-tight">CASK CARNIVAL 2026</h1>
        <p className="text-white/60 text-[14px] mt-1.5">참가업체 부스 확인 · 추가 신청</p>

        <input
          name="loginId"
          required
          autoComplete="username"
          autoCapitalize="none"
          placeholder="아이디"
          className="w-full mt-8 bg-white/10 border border-white/15 rounded px-4 py-3 text-[15px] outline-none focus:border-white/40"
        />
        <input
          type="password"
          name="password"
          required
          autoComplete="current-password"
          placeholder="비밀번호"
          className="w-full mt-2 bg-white/10 border border-white/15 rounded px-4 py-3 text-[15px] outline-none focus:border-white/40"
        />

        {error && <p className="text-[13px] text-[#ff8b9a] mt-3">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full mt-4 bg-white text-[#1a1a1a] rounded px-4 py-3 font-bold text-[15px] disabled:opacity-50"
        >
          {busy ? "확인 중..." : "로그인"}
        </button>
        <p className="text-white/40 text-[12px] mt-6 leading-relaxed">
          아이디·비밀번호는 운영사무국에서 전달드린 정보를 입력해 주세요.
        </p>
      </form>
    </div>
  )
}
