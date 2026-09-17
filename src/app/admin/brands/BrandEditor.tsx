"use client"

import { useRef, useState } from "react"
import { type BrandRow, COUNTRY_CODES } from "@/lib/brandRecord"

type Result = { ok: boolean; error?: string; brand?: BrandRow }

async function call(url: string, init: RequestInit): Promise<Result> {
  try {
    const res = await fetch(url, init)
    return (await res.json()) as Result
  } catch {
    return { ok: false, error: "네트워크 오류가 발생했습니다." }
  }
}

const inputCls =
  "w-full border border-black/15 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[#7d0b1c]"

/** row 가 null 이면 새 브랜드 작성. 저장하면 해당 행으로 전환돼 로고를 이어서 올릴 수 있다. */
export default function BrandEditor({
  row,
  onSaved,
  onDeleted,
  onClose,
}: {
  row: BrandRow | null
  onSaved: (row: BrandRow) => void
  onDeleted: (slug: string) => void
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const body = JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
    const r = row
      ? await call(`/api/admin/brands/${row.slug}`, { method: "PATCH", body })
      : await call("/api/admin/brands", { method: "POST", body })
    setBusy(false)
    if (r.ok && r.brand) onSaved(r.brand)
    else setError(r.error ?? "저장하지 못했습니다.")
  }

  async function upload(file: File) {
    if (!row) return
    setBusy(true)
    setError(null)
    const form = new FormData()
    form.append("file", file)
    const r = await call(`/api/admin/brands/${row.slug}/logo`, { method: "POST", body: form })
    setBusy(false)
    if (r.ok && r.brand) onSaved(r.brand)
    else setError(r.error ?? "업로드하지 못했습니다.")
  }

  async function removeLogo() {
    if (!row) return
    setBusy(true)
    const r = await call(`/api/admin/brands/${row.slug}/logo`, { method: "DELETE" })
    setBusy(false)
    if (r.ok && r.brand) onSaved(r.brand)
    else setError(r.error ?? "로고를 지우지 못했습니다.")
  }

  async function remove() {
    if (!row || !window.confirm(`'${row.name_ko}' 브랜드를 삭제할까요? 되돌릴 수 없습니다.`)) return
    setBusy(true)
    const r = await call(`/api/admin/brands/${row.slug}`, { method: "DELETE" })
    setBusy(false)
    if (r.ok) onDeleted(row.slug)
    else setError(r.error ?? "삭제하지 못했습니다.")
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        className="bg-white rounded w-full max-w-[560px] p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-extrabold">{row ? row.name_ko : "새 브랜드"}</h2>
          <button type="button" onClick={onClose} className="text-[#888] text-[13px]">
            닫기
          </button>
        </div>

        {row && (
          <div
            className={`mb-5 border-2 border-dashed rounded p-4 flex items-center gap-4 ${
              dragOver ? "border-[#7d0b1c] bg-[#7d0b1c]/5" : "border-black/15"
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const f = e.dataTransfer.files[0]
              if (f) upload(f)
            }}
          >
            <div className="w-20 h-20 shrink-0 bg-[#f6f5f5] rounded flex items-center justify-center overflow-hidden">
              {row.logo ? (
                // biome-ignore lint/performance/noImgElement: 관리자 미리보기라 최적화 불필요
                <img src={row.logo} alt="" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[11px] text-[#aaa]">로고 없음</span>
              )}
            </div>
            <div className="text-[13px]">
              <p className="text-[#666]">여기로 끌어다 놓거나</p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  className="border border-black/15 rounded px-3 py-1.5 font-semibold"
                >
                  파일 선택
                </button>
                {row.logo && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={removeLogo}
                    className="text-[#7d0b1c] px-2 font-semibold"
                  >
                    로고 삭제
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#aaa] mt-2">PNG·JPG·WebP, 5MB 이하. 투명 배경 정사각형 권장</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) upload(f)
                e.target.value = ""
              }}
            />
          </div>
        )}

        <form onSubmit={save} className="grid grid-cols-2 gap-3 text-[13px]">
          <label className="col-span-2 sm:col-span-1">
            한글명 *
            <input name="name_ko" required defaultValue={row?.name_ko ?? ""} className={inputCls} />
          </label>
          <label className="col-span-2 sm:col-span-1">
            영문명
            <input name="name_en" defaultValue={row?.name_en ?? ""} className={inputCls} />
          </label>
          <label>
            국가 *
            <select name="country_ko" required defaultValue={row?.country_ko ?? ""} className={inputCls}>
              <option value="" disabled>
                선택
              </option>
              {Object.keys(COUNTRY_CODES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label>
            부스 수 *
            <input
              name="booths"
              type="number"
              min={1}
              required
              defaultValue={row?.booths ?? 1}
              className={inputCls}
            />
          </label>
          <label className="col-span-2">
            홈페이지
            <input name="website" type="url" defaultValue={row?.website ?? ""} className={inputCls} />
          </label>
          <label className="col-span-2">
            인스타그램
            <input name="instagram" type="url" defaultValue={row?.instagram ?? ""} className={inputCls} />
          </label>

          {error && <p className="col-span-2 text-[#7d0b1c] font-semibold">{error}</p>}

          <div className="col-span-2 flex items-center gap-2 mt-2">
            {row && (
              <button type="button" disabled={busy} onClick={remove} className="text-[#7d0b1c] font-semibold">
                브랜드 삭제
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="ml-auto bg-[#7d0b1c] text-white rounded px-5 py-2 font-bold disabled:opacity-50"
            >
              {busy ? "처리 중…" : row ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
