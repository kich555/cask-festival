// 참가 업체 표시용 유틸. 클라이언트 컴포넌트도 import 하므로 서버 전용 코드를 두지 않는다.
// 데이터 로더는 brandsServer.ts 에 있다.

import type { Brand } from "./brandRecord"

export type { Brand }

const COUNTRY_EN: Record<string, string> = {
  KR: "Korea",
  JP: "Japan",
  TW: "Taiwan",
  GB: "United Kingdom",
  "GB-SCT": "Scotland",
  NL: "Netherlands",
}

export function countryName(brand: Brand, lang: "ko" | "en"): string {
  if (lang === "ko") return brand.countryKo
  return COUNTRY_EN[brand.country] ?? brand.countryKo
}

/**
 * 국가코드를 국기 이모지로 변환한다.
 * 스코틀랜드처럼 alpha-2 가 없는 지역은 별도 처리하고,
 * 알 수 없는 값이면 빈 문자열을 돌려줘 카드가 깨지지 않게 한다.
 */
export function countryFlag(code: string): string {
  const c = code?.trim().toUpperCase()
  if (!c) return ""
  // 스코틀랜드기: 잉글랜드·웨일스와 함께 subdivision flag 로 정의돼 있다.
  if (c === "GB-SCT") return "🏴󠁧󠁢󠁳󠁣󠁴󠁿"
  if (!/^[A-Z]{2}$/.test(c)) return ""
  return String.fromCodePoint(...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65))
}

/** 로고가 없을 때 쓰는 이니셜 (영문명 기준, 최대 2자). 영문명이 없으면 한글명 앞 2자. */
export function brandInitials(nameEn: string, nameKo = ""): string {
  const words = nameEn.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return nameKo.trim().slice(0, 2) || "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}

/** 표시용으로 주소에서 스킴과 끝 슬래시를 걷어낸다. */
export function prettyUrl(url: string): string {
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "")
}

/** 인스타그램 주소에서 핸들(@아이디)만 뽑는다. */
export function instagramHandle(url: string): string {
  const m = url.match(/instagram\.com\/([^/?#]+)/i)
  return m ? `@${m[1]}` : prettyUrl(url)
}
