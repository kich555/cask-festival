"use client"
// 관리자 — 업체별 참가확인서 올리기·삭제 (비공개 Storage 버킷)

import { useCallback, useEffect, useState } from "react"

type Cert = { name: string; size: number }

const kb = (n: number) =>
  n < 1024 * 1024 ? `${Math.max(1, Math.round(n / 1024))}KB` : `${(n / 1024 / 1024).toFixed(1)}MB`

export default function CertificateControl({ loginId }: { loginId: string }) {
  const [files, setFiles] = useState<Cert[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")
  const [dragOver, setDragOver] = useState(false)

  const load = useCallback(async () => {
    const res = await fetch(
      `/api/admin/exhibitor/certificates?login=${encodeURIComponent(loginId)}`,
    )
    const data = await res.json()
    setFiles(data.ok ? data.files : [])
  }, [loginId])

  useEffect(() => {
    load()
  }, [load])

  async function call(method: "POST" | "DELETE", body: object) {
    const res = await fetch("/api/admin/exhibitor/certificates", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login: loginId, ...body }),
    })
    const data = await res.json()
    if (!data.ok) throw new Error(data.error)
    return data
  }

  async function upload(list: FileList | null) {
    if (!list?.length) return
    setBusy(true)
    setError("")
    try {
      for (const file of Array.from(list)) {
        const { signedUrl } = await call("POST", { name: file.name, size: file.size })
        const form = new FormData()
        form.append("cacheControl", "0")
        form.append("", file)
        const put = await fetch(signedUrl, { method: "PUT", body: form })
        if (!put.ok) throw new Error(`${file.name}을(를) 올리지 못했습니다.`)
      }
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "올리지 못했습니다.")
    } finally {
      setBusy(false)
    }
  }

  async function remove(name: string) {
    if (!window.confirm(`${name}을(를) 삭제할까요? 업체 자료실에서도 사라집니다.`)) return
    setBusy(true)
    setError("")
    try {
      await call("DELETE", { name })
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제하지 못했습니다.")
    } finally {
      setBusy(false)
    }
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: 파일 끌어다 놓기 영역 (버튼으로도 올릴 수 있음)
    <div
      className={`mt-4 rounded border-2 border-dashed p-3 ${
        dragOver ? "border-[#7d0b1c] bg-[#7d0b1c]/5" : "border-black/15 bg-white"
      }`}
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragOver(false)
        if (!busy) upload(e.dataTransfer.files)
      }}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <p className="font-bold">참가확인서</p>
        <label
          className={`text-[13px] font-bold rounded px-3 py-1.5 $
            busy ? "bg-black/10 text-[#999]" : "bg-[#1a1a1a] text-white cursor-pointer"`}
        >
          {busy ? "처리 중…" : "파일 올리기"}
          <input
            type="file"
            multiple
            disabled={busy}
            className="hidden"
            onChange={(e) => {
              upload(e.target.files)
              e.target.value = ""
            }}
          />
        </label>
      </div>
      {files === null ? (
        <p className="text-[13px] text-[#999]">불러오는 중…</p>
      ) : files.length === 0 ? (
        <p className="text-[13px] text-[#999]">
          올린 파일 없음 · 파일을 여기로 끌어다 놓아도 됩니다
        </p>
      ) : (
        <ul className="space-y-1">
          {files.map((f) => (
            <li key={f.name} className="flex items-center justify-between gap-2 text-[13px]">
              <span className="min-w-0 truncate">
                {f.name} <span className="text-[#999]">{kb(f.size)}</span>
              </span>
              <button
                type="button"
                disabled={busy}
                onClick={() => remove(f.name)}
                className="shrink-0 text-[#7d0b1c] font-bold hover:underline disabled:text-[#999]"
              >
                삭제
              </button>
            </li>
          ))}
        </ul>
      )}
      {files?.length ? (
        <p className="text-[12px] text-[#aaa] mt-2">파일을 여기로 끌어다 놓아도 올라갑니다</p>
      ) : null}
      {error && <p className="text-[13px] text-[#7d0b1c] mt-2">{error}</p>}
    </div>
  )
}
