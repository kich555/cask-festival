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

  // compact: 모바일 카드용(작은 로고·글자)
  const cell = (s: ProgramSession, compact = false) => {
    const brand = ko ? s.nameKo : s.nameEn
    const speaker = (ko ? s.speakerKo : s.speakerEn) ?? ""
    const title = (ko ? s.titleKo : s.titleEn) ?? ""
    const logoH = compact ? "h-10" : "h-11"
    const strong = compact ? "text-[12px]" : "text-[13px] lg:text-[14px]"
    const sub = compact ? "text-[11px]" : "text-[12px] lg:text-[13px]"
    return (
      <div className="flex flex-col items-center text-center gap-1.5">
        {s.kind !== "lecture" && (
          <div
            className={`${s.logoWide ? "w-full max-w-[130px]" : compact ? "w-10" : "w-11"} ${logoH} flex items-center justify-center overflow-hidden`}
            style={{ backgroundColor: s.logoBg ?? "#ffffff" }}
          >
            {s.logo && (
              <Image
                src={s.logo}
                alt={brand}
                width={s.logoWide ? 130 : 48}
                height={48}
                className={`w-full h-full object-contain ${s.logoWide ? "" : "p-1"}`}
              />
            )}
          </div>
        )}
        <div className={`${strong} font-bold leading-snug break-keep`}>
          {!compact && (
            <span title={p.kinds[s.kind]} className="mr-1 relative -top-px">
              <Dot kind={s.kind} small />
              <span className="sr-only">{p.kinds[s.kind]}</span>
            </span>
          )}
          {s.kind === "lecture" ? speaker : brand}
        </div>
        {speaker && s.kind !== "lecture" && (
          <div className={`${sub} leading-snug break-keep`}>{speaker}</div>
        )}
        {title && <div className={`${sub} text-[#666] leading-snug break-keep`}>{title}</div>}
      </div>
    )
  }

  return (
    <div className="w-full text-left">
      {/* 요일 탭 + 범례 (데스크톱은 한 줄) */}
      <div className="flex flex-col md:flex-row items-center md:justify-between gap-3 mb-4 md:mb-5">
        <div className="flex justify-center gap-2">
          {days.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setDayId(d.id)}
              className={`px-4 md:px-5 py-2 rounded-full text-[14px] md:text-[15px] font-semibold border transition-colors ${
                d.id === dayId
                  ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                  : "bg-white text-[#666] border-black/15 hover:border-[#1a1a1a] hover:text-[#1a1a1a]"
              }`}
            >
              {p.days[d.id]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] md:text-[13px]">
          {(Object.keys(KIND_DOT) as SessionKind[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 text-[#555]">
              <Dot kind={k} />
              {p.kinds[k]}
            </span>
          ))}
        </div>
      </div>

      {/* 모바일: 시간대별로 그 시간에 열리는 관만 3열 카드로 */}
      <div className="md:hidden border-t-2 border-[#1a1a1a]">
        {starts.map((start) => (
          <div key={start} className="border-b border-black/10 py-3">
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-[14px] font-bold">{start}</span>
              <span className="text-[12px] text-[#888]">~ {endTime(start)}</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {HALLS.map((h) => at(start, h))
                .filter((s): s is ProgramSession => !!s)
                .map((s) => (
                  <div
                    key={s.hall}
                    className="flex flex-col bg-[#f7f6f4] rounded-md px-1.5 pt-1.5 pb-2.5"
                  >
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[#777] mb-1.5">
                      <Dot kind={s.kind} small />
                      <span className="sr-only">{p.kinds[s.kind]}</span>
                      {hallLabel(s.hall)}
                    </div>
                    <div className="flex-1 flex flex-col justify-center">{cell(s, true)}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      {/* 데스크톱: 시간 × 관 표 */}
      <table className="hidden md:table w-full border-collapse table-fixed">
        <thead>
          <tr className="border-t-2 border-[#1a1a1a]">
            {/* 모서리 칸: 대각선으로 나눠 오른쪽 위 = 관, 왼쪽 아래 = 시간 */}
            <th
              className="bg-[#f3f1ee] w-[84px] h-[44px] p-0 border-b border-r border-black/15 text-[12px] font-semibold text-[#777] relative"
              style={{
                backgroundImage:
                  "linear-gradient(to top right, transparent calc(50% - 0.5px), rgba(0,0,0,0.15) 50%, transparent calc(50% + 0.5px))",
              }}
            >
              <span className="absolute top-1 right-2">{p.cols.hall}</span>
              <span className="absolute bottom-1 left-2">{p.cols.time}</span>
            </th>
            {HALLS.map((h) => (
              <th
                key={h}
                className="py-2 px-2 bg-[#f3f1ee] border-b border-r last:border-r-0 border-black/15 text-[14px] font-bold text-center"
              >
                {hallLabel(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {starts.map((start) => (
            <tr key={start} className="border-b border-black/10 align-middle">
              <td className="bg-[#f3f1ee] py-2 px-1 border-r border-black/15 whitespace-nowrap text-center">
                <div className="text-[14px] font-bold">{start}</div>
                <div className="text-[12px] text-[#888]">~ {endTime(start)}</div>
              </td>
              {HALLS.map((h) => {
                const s = at(start, h)
                return (
                  <td key={h} className="px-2 py-2 border-r last:border-r-0 border-black/10">
                    {s && cell(s)}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* 유의사항 */}
      <div className="mt-5 md:mt-6 border-t border-black/10 pt-4 md:pt-5 text-[13px] md:text-[14px] text-[#555] leading-relaxed">
        <p className="font-bold text-[#1a1a1a] break-keep">{p.notice.lead}</p>
        <ul className="mt-2 space-y-1">
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
