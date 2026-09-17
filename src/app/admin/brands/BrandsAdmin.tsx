"use client"

import { useMemo, useState } from "react"
import type { BrandRow } from "@/lib/brandRecord"
import BrandEditor from "./BrandEditor"

type Filter = "all" | "visible" | "hidden" | "nologo"

const FILTER_LABEL: Record<Filter, string> = {
  all: "전체",
  visible: "노출중",
  hidden: "숨김",
  nologo: "로고 없음",
}

function matches(row: BrandRow, f: Filter) {
  if (f === "visible") return row.visible
  if (f === "hidden") return !row.visible
  if (f === "nologo") return !row.logo
  return true
}

export default function BrandsAdmin({ initialRows }: { initialRows: BrandRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  // undefined: 닫힘, null: 새 브랜드, string: 편집 중인 slug
  const [editing, setEditing] = useState<string | null | undefined>(undefined)
  const [message, setMessage] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c = { all: 0, visible: 0, hidden: 0, nologo: 0 } as Record<Filter, number>
    for (const r of rows) for (const f of Object.keys(c) as Filter[]) if (matches(r, f)) c[f]++
    return c
  }, [rows])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(
      (r) =>
        matches(r, filter) &&
        (!q || r.name_ko.toLowerCase().includes(q) || (r.name_en ?? "").toLowerCase().includes(q)),
    )
  }, [rows, filter, query])

  function upsertRow(row: BrandRow) {
    setRows((prev) =>
      prev.some((r) => r.slug === row.slug)
        ? prev.map((r) => (r.slug === row.slug ? row : r))
        : [...prev, row],
    )
  }

  async function toggle(row: BrandRow) {
    const next = !row.visible
    if (next && !row.logo && !window.confirm(`'${row.name_ko}'은(는) 로고가 없습니다. 로고 없이 노출할까요?`)) {
      return
    }
    setMessage(null)
    upsertRow({ ...row, visible: next })
    try {
      const res = await fetch(`/api/admin/brands/${row.slug}`, {
        method: "PATCH",
        body: JSON.stringify({ visible: next }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string; brand?: BrandRow }
      if (!data.ok || !data.brand) throw new Error(data.error)
      upsertRow(data.brand)
    } catch (e) {
      upsertRow(row)
      setMessage(`노출 상태를 바꾸지 못했습니다. ${e instanceof Error ? (e.message ?? "") : ""}`)
    }
  }

  const editingRow = typeof editing === "string" ? (rows.find((r) => r.slug === editing) ?? null) : null

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-5 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-[17px] font-extrabold tracking-tight">브랜드 관리</h1>
            <p className="text-white/50 text-[12px] mt-0.5">노출중인 브랜드만 참가업체 페이지에 보입니다</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="bg-white text-[#1a1a1a] rounded px-4 py-2 text-[13px] font-bold"
          >
            + 브랜드 추가
          </button>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(Object.keys(FILTER_LABEL) as Filter[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded text-[13px] font-semibold border transition-colors ${
                filter === k
                  ? "bg-[#7d0b1c] text-white border-[#7d0b1c]"
                  : "bg-white border-black/10 hover:border-black/25"
              }`}
            >
              {FILTER_LABEL[k]} {counts[k]}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름 검색"
            className="ml-auto bg-white border border-black/10 rounded px-3 py-2 text-[13px] w-full sm:w-[220px]"
          />
        </div>

        {message && <p className="mb-4 text-[13px] font-semibold text-[#7d0b1c]">{message}</p>}

        <ul className="bg-white border border-black/10 rounded divide-y divide-black/5">
          {shown.map((row) => (
            <li key={row.slug} className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => setEditing(row.slug)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <span className="w-12 h-12 shrink-0 rounded bg-[#f6f5f5] flex items-center justify-center overflow-hidden">
                  {row.logo ? (
                    // biome-ignore lint/performance/noImgElement: 관리자 썸네일
                    <img src={row.logo} alt="" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-[#aaa]">없음</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold truncate">{row.name_ko}</span>
                  <span className="block text-[12px] text-[#888] truncate">
                    {row.name_en ?? "-"} · {row.country_ko} · 부스 {row.booths}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggle(row)}
                aria-pressed={row.visible}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold border ${
                  row.visible
                    ? "bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/30"
                    : "bg-black/5 text-[#777] border-black/15"
                }`}
              >
                {row.visible ? "노출중" : "숨김"}
              </button>
            </li>
          ))}
          {shown.length === 0 && <li className="px-4 py-10 text-center text-[13px] text-[#888]">결과가 없습니다.</li>}
        </ul>
      </div>

      {editing !== undefined && (
        <BrandEditor
          key={editingRow?.slug ?? "new"}
          row={editingRow}
          onSaved={(saved) => {
            upsertRow(saved)
            setEditing(saved.slug)
          }}
          onDeleted={(slug) => {
            setRows((prev) => prev.filter((r) => r.slug !== slug))
            setEditing(undefined)
          }}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  )
}
