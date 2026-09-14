// 바이어 신청 도메인 정의 — 클라이언트/서버 공용.
// 여기의 타입과 필수 항목 정의가 폼 UI와 서버 검증의 단일 기준이다.

export const BUYER_TYPES = ["wholesale", "retail", "bar", "importer", "press"] as const
export type BuyerType = (typeof BUYER_TYPES)[number]

export const VISIT_DAYS = ["day1", "day2", "both"] as const
export type VisitDay = (typeof VISIT_DAYS)[number]

export const APPLICATION_STATUSES = ["pending", "approved", "rejected"] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

/** 프레스는 사업자 정보 대신 매체 정보를 받는다. */
export function isPress(type: string): boolean {
  return type === "press"
}

/** 사업자 유형(프레스 제외)인지 */
export function isBusiness(type: string): boolean {
  return BUYER_TYPES.includes(type as BuyerType) && !isPress(type)
}

// interface 가 아니라 type 으로 둔다.
// interface 는 암묵적 인덱스 시그니처를 갖지 않아 supabase 의 스키마 제약(Record<string, unknown>)을
// 통과하지 못하고, 그 결과 쿼리 타입이 전부 never 로 무너진다.
export type BuyerApplication = {
  id: string
  created_at: string
  status: ApplicationStatus
  buyer_type: BuyerType
  name: string
  job_title: string
  company: string
  department: string | null
  phone: string
  email: string
  company_address: string
  country: string
  visit_day: VisitDay
  companions: number
  /** 사업자 유형 전용 */
  business_number: string | null
  categories: string | null
  outlets: string | null
  /** 프레스 전용 */
  media_name: string | null
  media_url: string | null
  press_purpose: string | null
  /** Storage 경로 (공개 URL 아님) */
  business_card_path: string
  document_path: string | null
  marketing_opt_in: boolean
  admin_note: string | null
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
