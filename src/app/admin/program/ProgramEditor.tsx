"use client"

import { useRef, useState } from "react"
import { HALLS, type SessionKind } from "@/content/program2026"
import { KINDS, type ProgramSessionRow } from "@/lib/programRecord"
import { type BrandOption, KIND_LABEL } from "./ProgramAdmin"

/** 기존 세션이거나, 새 세션의 자리(요일·관·시간)만 정한 초안. */
export type Draft = ProgramSessionRow | { day: "sat" | "sun"; hall: number; start_time: string }

type Result = { ok: boolean; error?: string; session?: ProgramSessionRow }

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

export default function ProgramEditor({
  draft,
  brands,
  onSaved,
  onDeleted,
  onClose,
}: {
  draft: Draft
  brands: BrandOption[]
  onSaved: (row: ProgramSessionRow) => void
  onDeleted: (id: string) => void
  onClose: () => void
}) {
  const row = "id" in draft ? draft : null
  const [form, setForm] = useState({
    day: draft.day,
    hall: String(draft.hall),
    start_time: draft.start_time,
    kind: (row?.kind ?? "masterclass") as SessionKind,
    name_ko: row?.name_ko ?? "",
    name_en: row?.name_en ?? "",
    logo_bg: row?.logo_bg ?? "",
    logo_wide: row?.logo_wide ?? false,
    speaker_ko: row?.speaker_ko ?? "",
    speaker_en: row?.speaker_en ?? "",
    title_ko: row?.title_ko ?? "",
    title_en: row?.title_en ?? "",
  })
  // 참가업체에서 고른 로고 (저장 시 세션 로고로 복사)
  const [brandLogo, setBrandLogo] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const set = (k: keyof typeof form, v: string | boolean) => setForm((f) => ({ ...f, [k]: v }))
  const previewLogo = brandLogo ?? row?.logo ?? null

  function pickBrand(slug: string) {
    const b = brands.find((x) => x.slug === slug)
    if (!b) return
    setForm((f) => ({
      ...f,
      name_ko: b.name_ko,
      name_en: b.name_en ?? "",
      logo_bg: b.logo_bg ?? "",
    }))
    setBrandLogo(b.logo)
  }

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const body = JSON.stringify({ ...form, brand_logo: brandLogo })
    const r = row
      ? await call(`/api/admin/program/${row.id}`, { method: "PATCH", body })
      : await call("/api/admin/program", { method: "POST", body })
    setBusy(false)
    if (r.ok && r.session) {
      setBrandLogo(null)
      onSaved(r.session)
    } else setError(r.error ?? "저장하지 못했습니다.")
  }

  async function upload(file: File) {
    if (!row) return
    setBusy(true)
    setError(null)
    const body = new FormData()
    body.append("file", file)
    const r = await call(`/api/admin/program/${row.id}/logo`, { method: "POST", body })
    setBusy(false)
    if (r.ok && r.session) onSaved(r.session)
    else setError(r.error ?? "업로드하지 못했습니다.")
  }

  async function removeLogo() {
    if (!row) return
    setBusy(true)
    const r = await call(`/api/admin/program/${row.id}/logo`, { method: "DELETE" })
    setBusy(false)
    if (r.ok && r.session) onSaved(r.session)
    else setError(r.error ?? "로고를 지우지 못했습니다.")
  }

  async function remove() {
    if (
      !row ||
      !window.confirm(`'${row.name_ko || row.speaker_ko}' 세션을 삭제할까요? 되돌릴 수 없습니다.`)
    )
      return
    setBusy(true)
    const r = await call(`/api/admin/program/${row.id}`, { method: "DELETE" })
    setBusy(false)
    if (r.ok) onDeleted(row.id)
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
        className="bg-white rounded w-full max-w-[600px] p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-extrabold">
            {row ? row.name_ko || row.speaker_ko : "새 세션"}
          </h2>
          <button type="button" onClick={onClose} className="text-[#888] text-[13px]">
            닫기
          </button>
        </div>

        <form onSubmit={save} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[13px]">
          <label>
            요일 *
            <select
              value={form.day}
              onChange={(e) => set("day", e.target.value)}
              className={inputCls}
            >
              <option value="sat">토요일</option>
              <option value="sun">일요일</option>
            </select>
          </label>
          <label>
            관 *
            <select
              value={form.hall}
              onChange={(e) => set("hall", e.target.value)}
              className={inputCls}
            >
              {HALLS.map((h) => (
                <option key={h} value={h}>
                  {h}관
                </option>
              ))}
            </select>
          </label>
          <label>
            시작 시간 *
            <input
              value={form.start_time}
              onChange={(e) => set("start_time", e.target.value)}
              placeholder="10:30"
              required
              className={inputCls}
            />
          </label>
          <label>
            구분 *
            <select
              value={form.kind}
              onChange={(e) => set("kind", e.target.value)}
              className={inputCls}
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {KIND_LABEL[k]}
                </option>
              ))}
            </select>
          </label>

          <label className="col-span-2 sm:col-span-4">
            참가업체에서 불러오기
            <select
              defaultValue=""
              onChange={(e) => pickBrand(e.target.value)}
              className={inputCls}
            >
              <option value="">선택하면 브랜드명·로고가 채워집니다</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.name_ko}
                  {b.logo ? "" : " (로고 없음)"}
                </option>
              ))}
            </select>
          </label>

          <label className="col-span-2">
            브랜드명 (한글)
            <input
              value={form.name_ko}
              onChange={(e) => set("name_ko", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="col-span-2">
            브랜드명 (영문)
            <input
              value={form.name_en}
              onChange={(e) => set("name_en", e.target.value)}
              className={inputCls}
            />
          </label>

          <div className="col-span-2 sm:col-span-4 border border-black/10 rounded p-3 flex items-center gap-4">
            <div
              className="w-24 h-16 shrink-0 rounded flex items-center justify-center overflow-hidden border border-black/5"
              style={{ backgroundColor: form.logo_bg || "#ffffff" }}
            >
              {previewLogo ? (
                // biome-ignore lint/performance/noImgElement: 관리자 미리보기
                <img src={previewLogo} alt="" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[11px] text-[#aaa]">로고 없음</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              {row ? (
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => fileRef.current?.click()}
                    className="border border-black/15 rounded px-3 py-1.5 font-semibold"
                  >
                    로고 파일 올리기
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
              ) : (
                <p className="text-[#888]">새 세션은 저장한 뒤 로고 파일을 올릴 수 있습니다.</p>
              )}
              <label className="flex items-center gap-2 mt-2">
                <input
                  type="checkbox"
                  checked={form.logo_wide}
                  onChange={(e) => set("logo_wide", e.target.checked)}
                />
                가로로 긴 로고 (작게 보이면 체크)
              </label>
              <label className="flex items-center gap-2 mt-1">
                배경색
                <input
                  value={form.logo_bg}
                  onChange={(e) => set("logo_bg", e.target.value)}
                  placeholder="#ffffff (비우면 흰색)"
                  className="border border-black/15 rounded px-2 py-1 w-[160px]"
                />
              </label>
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

          <label className="col-span-2">
            강연자 (한글)
            <input
              value={form.speaker_ko}
              onChange={(e) => set("speaker_ko", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="col-span-2">
            강연자 (영문)
            <input
              value={form.speaker_en}
              onChange={(e) => set("speaker_en", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="col-span-2">
            강연 제목 (한글)
            <input
              value={form.title_ko}
              onChange={(e) => set("title_ko", e.target.value)}
              className={inputCls}
            />
          </label>
          <label className="col-span-2">
            강연 제목 (영문)
            <input
              value={form.title_en}
              onChange={(e) => set("title_en", e.target.value)}
              className={inputCls}
            />
          </label>
          <p className="col-span-2 sm:col-span-4 text-[12px] text-[#888]">
            강연자·강연 제목은 비워 두면 시간표에 표시되지 않습니다. 영문을 비우면 영어 화면에도
            표시되지 않습니다.
          </p>

          {error && (
            <p className="col-span-2 sm:col-span-4 text-[#7d0b1c] font-semibold">{error}</p>
          )}

          <div className="col-span-2 sm:col-span-4 flex items-center gap-2 mt-2">
            {row && (
              <button
                type="button"
                disabled={busy}
                onClick={remove}
                className="text-[#7d0b1c] font-semibold"
              >
                세션 삭제
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
