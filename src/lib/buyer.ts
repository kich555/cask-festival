// 바이어 신청 도메인 정의 — 클라이언트/서버 공용.
// 여기의 타입과 선택지 정의가 폼 UI와 서버 검증의 단일 기준이다.

/** 바이어 구분 */
export const BUYER_TYPES = [
  "import_export",
  "wholesale",
  "food_service",
  "manufacturer",
  "distribution",
  "equipment",
  "other",
] as const
export type BuyerType = (typeof BUYER_TYPES)[number]

/** 인지 경로 */
export const REFERRALS = [
  "sns",
  "website",
  "cafe_blog",
  "industry_site",
  "word_of_mouth",
  "invitation",
  "search",
  "other",
] as const
export type Referral = (typeof REFERRALS)[number]

/** 참관 목적 */
export const PURPOSES = [
  "new_products",
  "market_research",
  "new_partners",
  "tasting",
  "program",
  "other",
] as const
export type Purpose = (typeof PURPOSES)[number]

export const VISIT_DAYS = ["day1", "day2", "both"] as const
export type VisitDay = (typeof VISIT_DAYS)[number]

export const APPLICATION_STATUSES = ["pending", "approved", "rejected"] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export type BuyerApplication = {
  id: string
  created_at: string
  status: ApplicationStatus

  /** 1. 신청자 정보 */
  name: string
  company: string
  job_title: string
  phone: string
  email: string
  /** Storage 경로 (공개 URL 아님) */
  business_card_path: string

  /** 2. 참관 희망일 */
  visit_day: VisitDay

  /** 3. 바이어 구분 — other 인 경우 buyer_type_other 에 직접 입력값 */
  buyer_type: BuyerType
  buyer_type_other: string | null

  /** 4. 인지 경로 */
  referral: Referral | null
  referral_other: string | null

  /** 5. 참관 목적 */
  purpose: Purpose | null
  purpose_other: string | null

  /** 6. 필수 확인 */
  age_confirmed: boolean

  /** 7. 선택 동의 */
  marketing_opt_in: boolean

  /** 운영용 */
  admin_note: string | null
  approval_email_sent_at: string | null
}

/** 무료 이메일 도메인 — 관리자 화면에서 '회사 도메인 아님' 표시에 사용 */
const FREE_EMAIL_DOMAINS = new Set([
  "gmail.com",
  "naver.com",
  "daum.net",
  "hanmail.net",
  "kakao.com",
  "nate.com",
  "outlook.com",
  "hotmail.com",
  "yahoo.com",
  "yahoo.co.jp",
  "icloud.com",
  "qq.com",
  "163.com",
])

export function isFreeEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase().trim()
  return domain ? FREE_EMAIL_DOMAINS.has(domain) : false
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024 // 10MB
export const ACCEPTED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "application/pdf",
]

export function extensionFor(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpg"
    case "image/png":
      return "png"
    case "image/webp":
      return "webp"
    case "image/heic":
      return "heic"
    case "application/pdf":
      return "pdf"
    default:
      return "bin"
  }
}

/**
 * 한글 받침 여부에 따라 목적격 조사를 붙인다. ("성명을" / "회사명를"이 아니라 "회사명을")
 * 한글이 아닌 글자로 끝나면 "을"을 기본으로 한다.
 */
export function withObjectParticle(word: string): string {
  const last = word.trim().slice(-1)
  const code = last.charCodeAt(0)
  const isHangulSyllable = code >= 0xac00 && code <= 0xd7a3
  if (!isHangulSyllable) return `${word}을`
  const hasFinalConsonant = (code - 0xac00) % 28 !== 0
  return `${word}${hasFinalConsonant ? "을" : "를"}`
}
