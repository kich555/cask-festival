// 프로그램 세션 DB 행 ↔ 화면용 데이터 변환과 관리자 입력 검증.
// 클라이언트 컴포넌트도 import 하므로 서버 전용 코드를 두지 않는다.

import type { ProgramDay, ProgramSession, SessionKind } from "@/content/program2026"

export const PROGRAM_TABLE = "program_sessions"

export type ProgramSessionRow = {
  id: string
  day: "sat" | "sun"
  hall: number
  start_time: string
  kind: SessionKind
  name_ko: string
  name_en: string
  logo: string | null
  logo_bg: string | null
  logo_wide: boolean
  speaker_ko: string | null
  speaker_en: string | null
  title_ko: string | null
  title_en: string | null
  created_at: string
  updated_at: string
}

export type ProgramSessionInput = Omit<
  ProgramSessionRow,
  "id" | "logo" | "created_at" | "updated_at"
>

export const DAYS = ["sat", "sun"] as const
export const KINDS: SessionKind[] = ["masterclass", "tasting", "lecture"]

export function rowToSession(r: ProgramSessionRow): ProgramSession {
  return {
    hall: r.hall as ProgramSession["hall"],
    start: r.start_time,
    kind: r.kind,
    nameKo: r.name_ko,
    nameEn: r.name_en,
    logo: r.logo ?? undefined,
    logoBg: r.logo_bg ?? undefined,
    logoWide: r.logo_wide,
    speakerKo: r.speaker_ko ?? undefined,
    speakerEn: r.speaker_en ?? undefined,
    titleKo: r.title_ko ?? undefined,
    titleEn: r.title_en ?? undefined,
  }
}

export function rowsToDays(rows: ProgramSessionRow[]): ProgramDay[] {
  return DAYS.map((id) => ({
    id,
    sessions: rows.filter((r) => r.day === id).map(rowToSession),
  }))
}

function text(v: unknown): string | null {
  if (typeof v !== "string") return null
  const t = v.trim()
  return t === "" ? null : t
}

type ParseResult = { ok: true; value: ProgramSessionInput } | { ok: false; error: string }

/** 관리자 폼 입력을 검증·정규화한다. */
export function parseSessionInput(raw: unknown): ParseResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "입력이 없습니다." }
  const r = raw as Record<string, unknown>

  const day = r.day
  if (day !== "sat" && day !== "sun") return { ok: false, error: "요일을 선택해 주세요." }
  const hall = Number(r.hall)
  if (!Number.isInteger(hall) || hall < 1 || hall > 6)
    return { ok: false, error: "관은 1~6 중에서 골라 주세요." }
  const start_time = text(r.start_time) ?? ""
  if (!/^[0-2]\d:[0-5]\d$/.test(start_time))
    return { ok: false, error: "시작 시간은 10:30 형식으로 입력해 주세요." }
  const kind = r.kind as SessionKind
  if (!KINDS.includes(kind)) return { ok: false, error: "구분을 선택해 주세요." }

  const name_ko = text(r.name_ko) ?? ""
  const speaker_ko = text(r.speaker_ko)
  if (!name_ko && !speaker_ko)
    return { ok: false, error: "브랜드명이나 강연자 중 하나는 입력해 주세요." }

  const logo_bg = text(r.logo_bg)
  if (logo_bg && !/^#[0-9a-f]{6}$/i.test(logo_bg))
    return { ok: false, error: "로고 배경색은 #ffffff 형식이어야 합니다." }

  return {
    ok: true,
    value: {
      day,
      hall,
      start_time,
      kind,
      name_ko,
      name_en: text(r.name_en) ?? "",
      logo_bg,
      logo_wide: r.logo_wide === true || r.logo_wide === "on" || r.logo_wide === "true",
      speaker_ko,
      speaker_en: text(r.speaker_en),
      title_ko: text(r.title_ko),
      title_en: text(r.title_en),
    },
  }
}

/** 같은 요일·관·시작 시간 중복은 DB unique 제약으로 막힌다. */
export function duplicateMessage(message: string) {
  return message.includes("duplicate key") ? "같은 요일·관·시간에 이미 세션이 있습니다." : message
}
