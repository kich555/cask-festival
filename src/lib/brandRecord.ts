// 브랜드 데이터의 순수 로직. 서버·클라이언트·Node 스크립트/테스트가 함께 쓰므로
// 어떤 모듈도 import 하지 않는다 (Node type stripping 으로 바로 실행되어야 함).

export interface Brand {
  /** kebab-case 고유 키 */
  slug: string
  nameKo: string
  nameEn: string
  /** ISO 3166-1 alpha-2. 스코틀랜드는 GB-SCT */
  country: string
  countryKo: string
  website: string | null
  instagram: string | null
  booths: number
  /** 로고 URL. null 이면 이니셜 플레이스홀더 */
  logo: string | null
  /** 로고 배경색. null 이면 흰 배경 */
  logoBg?: string | null
}

/** Supabase public.brands 행 */
export interface BrandRow {
  slug: string
  name_ko: string
  name_en: string | null
  country: string
  country_ko: string
  website: string | null
  instagram: string | null
  booths: number
  logo: string | null
  logo_bg: string | null
  visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/** 관리자 화면 국가 선택지 (한글명 → 코드) */
export const COUNTRY_CODES: Record<string, string> = {
  한국: "KR",
  일본: "JP",
  대만: "TW",
  영국: "GB",
  스코틀랜드: "GB-SCT",
  아일랜드: "IE",
  미국: "US",
  프랑스: "FR",
  네덜란드: "NL",
  인도: "IN",
}

export const BRAND_BUCKET_NAME = "brand-logos"

export function slugify(name: string, used: Set<string>): string {
  const base =
    name
      .normalize("NFKD")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "brand"
  let slug = base
  let n = 2
  while (used.has(slug)) {
    slug = `${base}-${n}`
    n += 1
  }
  used.add(slug)
  return slug
}

export interface BrandInput {
  name_ko: string
  name_en: string | null
  country: string
  country_ko: string
  website: string | null
  instagram: string | null
  booths: number
}

type ParseResult = { ok: true; value: BrandInput } | { ok: false; error: string }

function optionalText(v: unknown): string | null {
  if (typeof v !== "string") return null
  const t = v.replace(/ /g, " ").trim()
  return t === "" ? null : t
}

function optionalUrl(v: unknown): string | null | undefined {
  const t = optionalText(v)
  if (t === null) return null
  return /^https?:\/\/\S+$/i.test(t) ? t : undefined
}

/** 관리자 폼 입력을 검증·정규화한다. undefined 는 형식 오류를 뜻한다. */
export function parseBrandInput(raw: unknown): ParseResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "입력이 없습니다." }
  const r = raw as Record<string, unknown>

  const name_ko = optionalText(r.name_ko)
  if (!name_ko) return { ok: false, error: "한글명은 필수입니다." }

  const country_ko = optionalText(r.country_ko) ?? ""
  const country = COUNTRY_CODES[country_ko]
  if (!country) return { ok: false, error: "국가를 선택해 주세요." }

  const website = optionalUrl(r.website)
  if (website === undefined) return { ok: false, error: "홈페이지는 http(s):// 로 시작해야 합니다." }
  const instagram = optionalUrl(r.instagram)
  if (instagram === undefined) return { ok: false, error: "인스타그램은 http(s):// 로 시작해야 합니다." }

  const booths = Number(r.booths)
  if (!Number.isInteger(booths) || booths < 1) {
    return { ok: false, error: "부스 수는 1 이상의 정수여야 합니다." }
  }

  return {
    ok: true,
    value: {
      name_ko,
      name_en: optionalText(r.name_en),
      country,
      country_ko,
      website,
      instagram,
      booths,
    },
  }
}

export function rowToBrand(row: BrandRow): Brand {
  return {
    slug: row.slug,
    nameKo: row.name_ko,
    nameEn: row.name_en ?? "",
    country: row.country,
    countryKo: row.country_ko,
    website: row.website,
    instagram: row.instagram,
    booths: row.booths,
    logo: row.logo,
    logoBg: row.logo_bg,
  }
}

/** 버킷 public URL 에서 객체 경로를 뽑는다. 버킷 밖 경로면 null. */
export function logoPathFromUrl(url: string | null): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${BRAND_BUCKET_NAME}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}
