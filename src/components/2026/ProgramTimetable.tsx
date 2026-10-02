"use client"

import Image from "next/image"
import { useState } from "react"
import {
  endTime,
  HALLS,
  type ProgramDay,
  type ProgramSession,
  program2026,
  type SessionKind,
  toMinutes,
} from "@/content/program2026"
import { useContent2026 } from "@/i18n/useContent2026"

// 색각이상이 있어도 구분되도록 Okabe-Ito 팔레트(주황빨강·청록·파랑)를 쓴다.
const KIND_DOT: Record<SessionKind, string> = {
  masterclass: "bg-[#d55e00]",
  tasting: "bg-[#009e73]",
  lecture: "bg-[#0072b2]",
}

function Dot({ kind, small = false }: { kind: SessionKind; small?: boolean }) {
  return (
    <span
      aria-hidden
      className={`inline-block align-middle shrink-0 rounded-full ${small ? "w-2.5 h-2.5" : "w-3 h-3"} ${KIND_DOT[kind]}`}
    />
  )
}

export default function ProgramTimetable({ days = program2026 }: { days?: ProgramDay[] }) {
  const { c, lang } = useContent2026()
  const p = c.programP
  const [dayId, setDayId] = useState<"sat" | "sun">("sat")
  const day = days.find((d) => d.id === dayId) ?? days[0]

  const ko = lang === "ko"
  const hallLabel = (n: number) => p.hall.replace("{n}", String(n))
  // 세션이 모두 90분이고 관끼리 90분씩 엇갈리므로 시작 시각 = 표의 한 행.
  const starts = [...new Set(day.sessions.map((s) => s.start))].sort(
    (a, b) => toMinutes(a) - toMinutes(b),
  )
  const at = (start: string, hall: number) =>
    day.sessions.find((s) => s.start === start && s.hall === hall)

  const cell = (s: ProgramSession) => {
    const brand = ko ? s.nameKo : s.nameEn
    const speaker = (ko ? s.speakerKo : s.speakerEn) ?? ""
    const title = (ko ? s.titleKo : s.titleEn) ?? ""
    return (
      <div className="flex flex-col items-center text-center gap-2">
        <span title={p.kinds[s.kind]} className="leading-none">
          <Dot kind={s.kind} small />
          <span className="sr-only">{p.kinds[s.kind]}</span>
        </span>
        {s.kind !== "lecture" && (
          <>
            <div
              className={`${s.logoWide ? "w-full max-w-[150px]" : "w-16"} h-16 flex items-center justify-center overflow-hidden`}
              style={{ backgroundColor: s.logoBg ?? "#ffffff" }}
            >
              {s.logo && (
                <Image
                  src={s.logo}
                  alt={brand}
                  width={s.logoWide ? 150 : 64}
                  height={64}
                  className={`w-full h-full object-contain ${s.logoWide ? "" : "p-1.5"}`}
                />
              )}
            </div>
            <div className="text-[14px] font-bold leading-snug break-keep">{brand}</div>
          </>
        )}
        {speaker &&
          (s.kind === "lecture" ? (
            <div className="text-[14px] font-bold leading-snug break-keep">{speaker}</div>
          ) : (
            <div className="text-[13px] leading-snug break-keep">{speaker}</div>
          ))}
        {title && <div className="text-[12px] text-[#666] leading-snug break-keep">{title}</div>}
      </div>
    )
  }

  return (
    <div className="w-full text-left">
      {/* 요일 탭 */}
      <div className="flex justify-center gap-2 mb-6">
        {days.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setDayId(d.id)}
            className={`px-5 py-2.5 rounded-full text-[14px] md:text-[15px] font-semibold border transition-colors ${
              d.id === dayId
                ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                : "bg-white text-[#666] border-black/15 hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
            }`}
          >
            {p.days[d.id]}
          </button>
        ))}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 mb-6 text-[13px]">
        {(Object.keys(KIND_DOT) as SessionKind[]).map((k) => (
          <span key={k} className="inline-flex items-center gap-1.5 text-[#555]">
            <Dot kind={k} />
            {p.kinds[k]}
          </span>
        ))}
      </div>

      {/* 시간 × 관 시간표. 모바일은 가로 스크롤(시간 열 고정). */}
      <div className="overflow-x-auto -mx-5 px-5 md:mx-0 md:px-0">
        <table className="w-full min-w-[860px] border-collapse table-fixed">
          <thead>
            <tr className="border-t-2 border-[#1a1a1a]">
              {/* 모서리 칸: 대각선으로 나눠 오른쪽 위 = 관, 왼쪽 아래 = 시간 */}
              <th
                className="sticky left-0 z-10 bg-[#f3f1ee] w-[92px] h-[52px] p-0 border-b border-r border-black/15 text-[12px] font-semibold text-[#777] relative"
                style={{
                  backgroundImage:
                    "linear-gradient(to top right, transparent calc(50% - 0.5px), rgba(0,0,0,0.15) 50%, transparent calc(50% + 0.5px))",
                }}
              >
                <span className="absolute top-1.5 right-2.5">{p.cols.hall}</span>
                <span className="absolute bottom-1.5 left-2.5">{p.cols.time}</span>
              </th>
              {HALLS.map((h) => (
                <th
                  key={h}
                  className="py-3 px-3 bg-[#f3f1ee] border-b border-r last:border-r-0 border-black/15 text-[14px] font-bold text-center"
                >
                  {hallLabel(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {starts.map((start) => (
              <tr key={start} className="border-b border-black/10 align-middle">
                <td className="sticky left-0 z-10 bg-[#f3f1ee] py-3 px-2 border-r border-black/15 whitespace-nowrap text-center">
                  <div className="text-[14px] font-bold">{start}</div>
                  <div className="text-[12px] text-[#888]">~ {endTime(start)}</div>
                </td>
                {HALLS.map((h) => {
                  const s = at(start, h)
                  return (
                    <td key={h} className={`p-4 border-r last:border-r-0 border-black/10`}>
                      {s && cell(s)}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 유의사항 */}
      <div className="mt-8 border-t border-black/10 pt-6 text-[13px] md:text-[14px] text-[#555] leading-relaxed">
        <p className="font-bold text-[#1a1a1a] break-keep">{p.notice.lead}</p>
        <ul className="mt-3 space-y-1.5">
          {p.notice.items.map((t) => (
            <li key={t} className="flex gap-2 break-keep">
              <span aria-hidden>•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
