// 참가 업체 데이터 로더 + 유틸.
// 데이터 출처는 src/content/brands2026.json (수동 관리).
// 나중에 인스타그램 자동 동기화를 붙이더라도 이 형태를 그대로 유지한다.

import brandsData from "@/content/brands2026.json"

export interface Brand {
  /** kebab-case 고유 키. 로고 파일명 규약(public/brands/<slug>.png)으로도 쓴다. */
  slug: string
  nameKo: string
  nameEn: string
  /** ISO 3166-1 alpha-2 (JP, KR, GB ...). 국기 이모지로 변환해 표시. */
  country: string
  /** 로고 경로. null 이면 이니셜 플레이스홀더를 표시. */
  logo: string | null
  /** 인스타그램 게시물 등 외부 링크. null 이면 카드가 링크되지 않는다. */
  link: string | null
}

export function getBrands(): Brand[] {
  return brandsData as Brand[]
}

/**
 * ISO alpha-2 국가코드를 국기 이모지로 변환한다.
 * 2글자 알파벳이 아니면 빈 문자열을 반환해 카드가 깨지지 않게 한다.
 */
export function countryFlag(code: string): string {
  const c = code?.trim().toUpperCase()
  if (!c || !/^[A-Z]{2}$/.test(c)) return ""
  return String.fromCodePoint(...[...c].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65))
}

/** 로고가 없을 때 쓰는 이니셜 (영문명 기준, 최대 2자). */
export function brandInitials(nameEn: string): string {
  const words = nameEn.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
