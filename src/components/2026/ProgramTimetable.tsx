"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { createPortal } from "react-dom"
import {
  actualRange,
  endTime,
  HALLS,
  hallName,
  type ProgramDay,
  type ProgramSession,
  program2026,
  type SessionKind,
  toMinutes,
} from "@/content/program2026"
import { useContent2026 } from "@/i18n/useContent2026"

// 색각이상이 있어도 구분되도록 Okabe-Ito 팔레트(주황빨강·청록·파랑)를 쓴다.
export const KIND_DOT: Record<SessionKind, string> = {
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

/** 세션을 누르면 뜨는 상세 창. Reveal 의 transform 이 fixed 기준이 되므로 body 에 띄운다 */
function SessionDetail({ session: s, onClose }: { session: ProgramSession; onClose: () => void }) {
  const { c, lang } = useContent2026()
  const ko = lang === "ko"
  const brand = ko ? s.nameKo : s.nameEn
  const speaker = (ko ? s.speakerKo : s.speakerEn) ?? ""
  const title = (ko ? s.titleKo : s.titleEn) ?? ""
  // 강연은 브랜드가 없으므로 강연자를 제목 자리에 쓴다
  const heading = brand || speaker || c.programP.kinds[s.kind]
  const speakerLabel = (
    <span className="mr-1.5 text-[12px] font-normal text-[var(--c-muted)]">
      {c.programP.speakerLabel}
    </span>
  )
  const time = actualRange(s) ?? `${s.start} – ${endTime(s.start)}`

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center px-6">
      <button
        type="button"
        aria-label={c.programP.close}
        className="absolute inset-0 bg-black/45 cursor-default"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={heading}
        className="force-light relative w-full max-w-[360px] bg-[var(--c-surface)] text-[var(--c-text)] px-6 pt-8 pb-5 text-center shadow-xl"
      >
        {s.logo && (
          <div
            className={`logo-box mx-auto mb-5 flex items-center justify-center overflow-hidden ${s.logoWide ? "w-[200px] h-20" : "w-28 h-28"}`}
            style={{ backgroundColor: s.logoBg ?? "#ffffff" }}
          >
            <Image
              src={s.logo}
              alt={heading}
              width={s.logoWide ? 200 : 112}
              height={s.logoWide ? 80 : 112}
              className={`w-full h-full object-contain ${s.logoWide ? "" : "p-1.5"}`}
            />
          </div>
        )}
        <h3 className="text-[18px] font-extrabold leading-snug break-keep">
          {!brand && speaker && speakerLabel}
          {heading}
        </h3>
        {speaker && brand && (
          <p className="mt-2 text-[15px] font-semibold leading-snug break-keep">
            {speakerLabel}
            {speaker}
          </p>
        )}
        {title && (
          <p className="mt-2 text-[14px] text-[var(--c-text2)] leading-relaxed break-keep">
            {title}
          </p>
        )}
        <p className="mt-3 text-[14px] font-bold text-[#7d0b1c]">{time}</p>
        <button
          type="button"
          // biome-ignore lint/a11y/noAutofocus: 열린 창 안으로 키보드 초점을 옮긴다
          autoFocus
          onClick={onClose}
          className="mt-6 w-full h-11 bg-[#7d0b1c] text-white text-[14px] font-bold"
        >
          {c.programP.close}
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default function ProgramTimetable({ days = program2026 }: { days?: ProgramDay[] }) {
  const { c, lang } = useContent2026()
  const p = c.programP
  const [dayId, setDayId] = useState<"sat" | "sun">("sat")
  const [opened, setOpened] = useState<ProgramSession | null>(null)
  const [tip, setTip] = useState<{ x: number; y: number } | null>(null)
  const day = days.find((d) => d.id === dayId) ?? days[0]

  const ko = lang === "ko"
  const hallLabel = hallName
  // 세션은 기본 90분이고 관끼리 90분씩 엇갈리므로 시작 시각 = 표의 한 행.
  // 행 높이를 고정해 두 요일 표의 칸 크기를 모두 같게 한다.
  // 예외 시간 세션은 해당 행에 두고 칸 안에 실제 시간을 표시한다.
  const starts = [...new Set(day.sessions.map((s) => s.start))].sort(
    (a, b) => toMinutes(a) - toMinutes(b),
  )
  const at = (start: string, hall: number) =>
    day.sessions.find((s) => s.start === start && s.hall === hall)

  // 칸에는 로고·브랜드만 두고, 강연자·제목은 눌렀을 때 상세 창에서 보여 준다.
  // compact: 모바일 카드용(작은 로고·글자)
  const cell = (s: ProgramSession, compact = false) => {
    const brand = ko ? s.nameKo : s.nameEn
    const speaker = (ko ? s.speakerKo : s.speakerEn) ?? ""
    const range = actualRange(s)
    // 로고 자리는 모든 칸에서 같은 높이로 두어 이름이 같은 위치에서 시작하게 한다.
    // 가로로 긴 로고는 정사각형 로고와 눈에 보이는 크기가 비슷하도록 높이를 낮춘다.
    const slotH = compact ? "h-11" : "h-16"
    const logoBox = s.logoWide
      ? compact
        ? "w-[96px] h-8"
        : "w-[120px] h-11"
      : compact
        ? "w-11 h-11"
        : "w-16 h-16"
    return (
      <button
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          setTip(null)
          setOpened(s)
        }}
        onPointerMove={(e) => {
          if (e.pointerType === "mouse") setTip({ x: e.clientX, y: e.clientY })
        }}
        onPointerLeave={() => setTip(null)}
        className={`relative w-full flex flex-col items-center justify-start gap-2 text-center font-bold leading-snug break-keep cursor-pointer ${
          compact ? "text-[12px]" : "min-h-[144px] px-2 pt-6 pb-2 text-[13px] lg:text-[14px]"
        }`}
      >
        {range && (
          <span
            className={`text-[#7d0b1c] leading-none whitespace-nowrap ${compact ? "text-[11px]" : "absolute top-1.5 inset-x-0 text-[12px]"}`}
          >
            {range}
          </span>
        )}
        <span className={`${slotH} w-full flex items-center justify-center`}>
          {(s.kind !== "lecture" || s.logo) && (
            <span
              className={`logo-box ${logoBox} flex items-center justify-center overflow-hidden`}
              style={{ backgroundColor: s.logoBg ?? "#ffffff" }}
            >
              {s.logo && (
                <Image
                  src={s.logo}
                  alt=""
                  width={s.logoWide ? 120 : 64}
                  height={s.logoWide ? 44 : 64}
                  className={`w-full h-full object-contain ${s.logoWide ? "" : "p-1"}`}
                />
              )}
            </span>
          )}
        </span>
        <span>
          {!compact && (
            <span title={p.kinds[s.kind]} className="mr-1 relative -top-px">
              <Dot kind={s.kind} small />
              <span className="sr-only">{p.kinds[s.kind]}</span>
            </span>
          )}
          {brand || speaker || p.kinds[s.kind]}
        </span>
      </button>
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
                  ? "bg-[var(--c-ink)] text-[var(--c-ink-text)] border-[var(--c-ink)]"
                  : "bg-[var(--c-surface)] text-[var(--c-muted)] border-[var(--c-line-strong)] hover:border-[var(--c-ink)] hover:text-[var(--c-text)]"
              }`}
            >
              {p.days[d.id]}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[12px] md:text-[13px]">
          {(Object.keys(KIND_DOT) as SessionKind[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5 text-[var(--c-text2)]">
              <Dot kind={k} />
              {p.kinds[k]}
            </span>
          ))}
        </div>
      </div>

      {/* 표 영역: 다크 모드에서도 밝은 패널. 둘레 여백을 줘 표가 패널에 꽉 끼지 않게 (라이트·다크 같은 크기) */}
      <div className="force-light p-3 md:p-6">
        {/* 모바일: 시간대별로 그 시간에 열리는 관만 3열 카드로. 호버가 없으므로 안내를 적어 둔다 */}
        <p className="md:hidden mb-2 text-center text-[12px] text-[var(--c-muted)]">{p.tapHint}</p>
        <div className="md:hidden border-t-2 border-[var(--c-ink)]">
          {starts.map((start) => (
            <div key={start} className="border-b border-[var(--c-line)] py-3">
              <div className="flex items-baseline gap-1.5 mb-2">
                <span className="text-[14px] font-bold">{start}</span>
                <span className="text-[12px] text-[var(--c-muted2)]">~ {endTime(start)}</span>
              </div>
              <div className="grid grid-cols-3 divide-x divide-[var(--c-line)]">
                {HALLS.map((h) => at(start, h))
                  .filter((s): s is ProgramSession => !!s)
                  .map((s) => (
                    <div key={s.hall} className="flex flex-col px-1.5 pt-0.5 pb-1">
                      <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-[var(--c-muted)] mb-1.5">
                        <Dot kind={s.kind} small />
                        <span className="sr-only">{p.kinds[s.kind]}</span>
                        {hallLabel(s.hall)}
                      </div>
                      <div className="flex-1 flex flex-col justify-start">{cell(s, true)}</div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        {/* 데스크톱: 시간 × 관 표 */}
        <table className="hidden md:table w-full border-collapse table-fixed">
          <thead>
            <tr className="border-t-2 border-[var(--c-ink)]">
              {/* 모서리 칸: 대각선으로 나눠 오른쪽 위 = 관, 왼쪽 아래 = 시간 */}
              <th
                className="bg-[var(--c-soft)] w-[84px] h-[44px] p-0 border-b border-r border-[var(--c-line-strong)] text-[12px] font-semibold text-[var(--c-muted)] relative"
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
                  className="py-2 px-2 bg-[var(--c-soft)] border-b border-r last:border-r-0 border-[var(--c-line-strong)] text-[14px] font-bold text-center"
                >
                  {hallLabel(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {starts.map((start) => (
              <tr key={start} className="h-[144px] border-b border-[var(--c-line)]">
                <td className="bg-[var(--c-soft)] py-2 px-1 border-r border-[var(--c-line-strong)] whitespace-nowrap text-center align-middle">
                  <div className="text-[14px] font-bold">{start}</div>
                  <div className="text-[12px] text-[var(--c-muted2)]">~ {endTime(start)}</div>
                </td>
                {HALLS.map((h) => {
                  const s = at(start, h)
                  return (
                    <td
                      key={h}
                      className="p-0 align-top border-r last:border-r-0 border-[var(--c-line)]"
                    >
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
      <div className="mt-5 md:mt-6 border-t border-[var(--c-line)] pt-4 md:pt-5 text-[13px] md:text-[14px] text-[var(--c-text2)] leading-relaxed">
        <p className="font-bold text-[var(--c-text)] break-keep">{p.notice.lead}</p>
        <ul className="mt-2 space-y-1">
          {p.notice.items.map((t) => (
            <li key={t} className="flex gap-2 break-keep">
              <span aria-hidden>•</span>
              <span>{t}</span>
            </li>
          ))}
        </ul>
      </div>

      {opened && <SessionDetail session={opened} onClose={() => setOpened(null)} />}

      {/* 마우스 오른쪽 위에 붙어 다니는 안내. 오른쪽 끝에서는 화면 밖으로 나가지 않게 한다 */}
      {tip &&
        createPortal(
          <div
            aria-hidden
            className="fixed z-[55] pointer-events-none px-2.5 py-1 rounded bg-[#1a1a1a] text-white text-[12px] font-semibold whitespace-nowrap shadow"
            style={{ left: Math.min(tip.x + 12, window.innerWidth - 96), top: tip.y - 34 }}
          >
            {p.detail}
          </div>,
          document.body,
        )}
    </div>
  )
}
