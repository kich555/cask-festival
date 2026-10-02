"use client"

import { useMemo, useState } from "react"
import { endTime, HALLS, type SessionKind, toMinutes } from "@/content/program2026"
import type { ProgramSessionRow } from "@/lib/programRecord"
import ProgramEditor, { type Draft } from "./ProgramEditor"

export interface BrandOption {
  slug: string
  name_ko: string
  name_en: string | null
  logo: string | null
  logo_bg: string | null
}

const DAY_LABEL = { sat: "토요일 (11.21)", sun: "일요일 (11.22)" } as const
export const KIND_LABEL: Record<SessionKind, string> = {
  masterclass: "마스터클래스",
  tasting: "테이스팅 세션",
  lecture: "강연",
}
const KIND_DOT: Record<SessionKind, string> = {
  masterclass: "bg-[#d55e00]",
  tasting: "bg-[#009e73]",
  lecture: "bg-[#0072b2]",
}

export default function ProgramAdmin({
  initialRows,
  brands,
}: {
  initialRows: ProgramSessionRow[]
  brands: BrandOption[]
}) {
  const [rows, setRows] = useState(initialRows)
  const [day, setDay] = useState<"sat" | "sun">("sat")
  // undefined: 닫힘 / Draft: 새 세션 또는 편집 중인 세션
  const [editing, setEditing] = useState<Draft | undefined>(undefined)

  const dayRows = rows.filter((r) => r.day === day)
  const starts = useMemo(
    () =>
      [...new Set(dayRows.map((r) => r.start_time))].sort((a, b) => toMinutes(a) - toMinutes(b)),
    [dayRows],
  )
  const at = (start: string, hall: number) =>
    dayRows.find((r) => r.start_time === start && r.hall === hall)

  function upsert(row: ProgramSessionRow) {
    setRows((prev) =>
      prev.some((r) => r.id === row.id)
        ? prev.map((r) => (r.id === row.id ? row : r))
        : [...prev, row],
    )
  }

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-5 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-[17px] font-extrabold tracking-tight">프로그램 관리</h1>
            <p className="text-white/50 text-[12px] mt-0.5">
              저장하면 프로그램 페이지와 홈 시간표에 바로 반영됩니다 · 모든 세션은 90분
            </p>
          </div>
          <button
            type="button"
            onClick={() => setEditing({ day, hall: 1, start_time: "" })}
            className="bg-white text-[#1a1a1a] rounded px-4 py-2 text-[13px] font-bold"
          >
            + 세션 추가
          </button>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(["sat", "sun"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDay(d)}
              className={`px-4 py-2 rounded text-[13px] font-semibold border transition-colors ${
                day === d
                  ? "bg-[#7d0b1c] text-white border-[#7d0b1c]"
                  : "bg-white border-black/10 hover:border-black/25"
              }`}
            >
              {DAY_LABEL[d]} {rows.filter((r) => r.day === d).length}
            </button>
          ))}
          <p className="ml-auto text-[12px] text-[#888]">
            칸을 누르면 수정, 빈 칸을 누르면 그 자리에 추가
          </p>
        </div>

        <div className="overflow-x-auto bg-white border border-black/10 rounded">
          <table className="w-full min-w-[900px] border-collapse table-fixed text-[13px]">
            <thead>
              <tr className="bg-[#f3f1ee]">
                <th className="w-[100px] py-2.5 border-b border-r border-black/10">시간</th>
                {HALLS.map((h) => (
                  <th key={h} className="py-2.5 border-b border-r last:border-r-0 border-black/10">
                    {h}관
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {starts.map((start) => (
                <tr key={start} className="border-b border-black/10">
                  <td className="bg-[#f3f1ee] text-center py-3 border-r border-black/10 font-bold">
                    {start}
                    <div className="text-[11px] text-[#888] font-normal">~ {endTime(start)}</div>
                  </td>
                  {HALLS.map((h) => {
                    const r = at(start, h)
                    return (
                      <td key={h} className="border-r last:border-r-0 border-black/10 p-0 h-[96px]">
                        <button
                          type="button"
                          onClick={() => setEditing(r ?? { day, hall: h, start_time: start })}
                          className="w-full h-full p-2 flex flex-col items-center justify-center gap-1 hover:bg-[#7d0b1c]/5 text-center"
                        >
                          {r ? (
                            <>
                              <span className={`w-2 h-2 rounded-full ${KIND_DOT[r.kind]}`} />
                              {r.logo && (
                                // biome-ignore lint/performance/noImgElement: 관리자 썸네일
                                <img
                                  src={r.logo}
                                  alt=""
                                  className="max-h-8 max-w-[80%] object-contain"
                                />
                              )}
                              <span className="font-bold leading-tight">
                                {r.name_ko || r.speaker_ko}
                              </span>
                              {r.name_ko && r.speaker_ko && (
                                <span className="text-[11px] text-[#666] leading-tight">
                                  {r.speaker_ko}
                                </span>
                              )}
                              {r.title_ko && (
                                <span className="text-[11px] text-[#888] leading-tight">
                                  {r.title_ko}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-[#ccc] text-[18px]">+</span>
                          )}
                        </button>
                      </td>
                    )
                  })}
                </tr>
              ))}
              {starts.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-[#888]">
                    세션이 없습니다. 오른쪽 위 ‘+ 세션 추가’를 눌러 주세요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex gap-4 mt-3 text-[12px] text-[#666]">
          {(Object.keys(KIND_LABEL) as SessionKind[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${KIND_DOT[k]}`} />
              {KIND_LABEL[k]}
            </span>
          ))}
        </div>
      </div>

      {editing && (
        <ProgramEditor
          key={
            "id" in editing
              ? editing.id
              : `new-${editing.day}-${editing.hall}-${editing.start_time}`
          }
          draft={editing}
          brands={brands}
          onSaved={(row) => {
            upsert(row)
            setEditing(row)
          }}
          onDeleted={(id) => {
            setRows((prev) => prev.filter((r) => r.id !== id))
            setEditing(undefined)
          }}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  )
}
