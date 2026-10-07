// 참가업체 부스 정보 확인 · 부대시설 추가 신청(/exhibitor) 공용 정의. 서버·클라이언트가 함께 쓴다.
// 신청 항목·안내 문구·입금 정보를 바꾸려면 이 파일만 고치면 된다.

export const EXHIBITOR_TABLE = "exhibitor_accounts"
export const EXHIBITOR_LOG_TABLE = "exhibitor_log"
export const PRODUCT_BUCKET = "exhibitor-products"
export const PRODUCT_PHOTO_MAX = 2
export const PRODUCT_PHOTO_MAX_BYTES = 10 * 1024 * 1024
export const PRODUCT_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"]

/** 올로로소 셰리 캐스크 출품 제품 */
export type ExhibitorProduct = {
  id: string
  name_ko: string
  name_en: string
  category: string
  abv: string
  volume: string
  /** 제품 설명 (공식 SNS 소개에 활용) */
  description: string
  photos: string[]
}

export type ExhibitorLogKind =
  | "booth_approve"
  | "booth_revise"
  | "extra" // 첫 신청 (바로 접수)
  | "extra_change" // 변경 요청 (승인 대기)
  | "extra_cancel" // 업체가 변경 요청 취소
  | "booth_ack" // 관리자: 수정 요청 확인
  | "extra_approve" // 관리자: 변경 승인
  | "extra_reject" // 관리자: 변경 반려
  | "payment_confirm" // 관리자: 입금 확인
  | "payment_cancel" // 관리자: 입금 확인 취소
  | "products" // 출품 제품 저장

export type ExhibitorLogRow = {
  id: string
  brand_slug: string
  kind: ExhibitorLogKind
  data: Partial<ExtraRequest> & {
    name_ko?: string | null
    name_en?: string | null
    count?: number
  }
  created_at: string
}

/** 부대시설 추가 신청 항목 (price: 단위당 원) */
export const EXTRA_ITEMS = [
  {
    key: "power_24h",
    label: "전기 · 24시간",
    unit: "kW",
    price: 100_000,
    desc: "24시간 사용 시 추가 신청",
  },
  { key: "outlet", label: "추가 콘센트", unit: "개소", price: 50_000, desc: "" },
  { key: "water", label: "급배수", unit: "개소", price: 250_000, desc: "설치 위치 표시 필수" },
  { key: "lan", label: "인터넷 (LAN)", unit: "포트", price: 200_000, desc: "" },
] as const

export const EXTRA_NOTICES = [
  "전기는 부스당 1kW가 기본 제공됩니다. 냉장고·쿨러 등 24시간 전원이 필요한 설비를 사용할 경우 추가 신청 부탁드립니다.",
  "커피머신·제빙기처럼 전력 소모가 큰 기기(삼상 전기)는 사전 협의가 필요합니다.",
  "임의 멀티탭 연결은 화재 위험으로 금지됩니다.",
  "전시장 내 무선 공유기 사용은 금지되어 있습니다. 적발 시 사용이 제한될 수 있습니다.",
  "급배수는 설치 위치를 신청서에 표시해 주셔야 하며, 준비 기간 중 위치 변경이 불가합니다.",
]

export const PAYMENT_INFO = {
  bank: "하나은행",
  account: "340-910050-94804",
  holder: "㈜위스키내비",
  deadline: "11. 6(금)",
}

export type ExtraItems = Record<string, number>

export type ExhibitorAccountRow = {
  brand_slug: string
  login_id: string
  password_hash: string
  booth_status: "approved" | "revised" | null
  booth_name_ko: string | null
  booth_name_en: string | null
  booth_note: string | null
  booth_confirmed_at: string | null
  extra_items: ExtraItems
  water_location: string | null
  extra_note: string | null
  extra_submitted_at: string | null
  booth_ack_at: string | null
  extra_pending: ExtraRequest | null
  extra_pending_at: string | null
  extra_decision: "approved" | "rejected" | null
  extra_decided_at: string | null
  password_changed_at: string | null
  paid_at: string | null
  paid_amount: number | null
  products: ExhibitorProduct[]
  products_updated_at: string | null
  draft: ExhibitorDraft | null
  draft_saved_at: string | null
  submitted_at: string | null
  created_at: string
}

/** 부스 표기 임시 저장 값 (등록 정보와 같고 메모가 없으면 '확인', 다르면 '수정 요청'으로 제출) */
export type BoothDraft = { name_ko: string; name_en: string; note: string }

/** 섹션별 임시 저장. 제출하기 전까지 사무국에는 반영되지 않는다. */
export type ExhibitorDraft = {
  booth?: BoothDraft
  extra?: ExtraRequest
  products?: ExhibitorProduct[]
}

/** 부대시설 신청 한 건의 내용 (변경 요청·내역에 그대로 저장) */
export type ExtraRequest = {
  items: ExtraItems
  water_location: string | null
  note: string | null
  total: number
}

/** 화면에 내려줄 값 (비밀번호 해시 제외) */
export type ExhibitorState = Omit<ExhibitorAccountRow, "password_hash" | "created_at">

export const EXHIBITOR_STATE_COLUMNS =
  "brand_slug,login_id,booth_status,booth_name_ko,booth_name_en,booth_note,booth_confirmed_at,extra_items,water_location,extra_note,extra_submitted_at,booth_ack_at,extra_pending,extra_pending_at,extra_decision,extra_decided_at,password_changed_at,paid_at,paid_amount,products,products_updated_at,draft,draft_saved_at,submitted_at"

/** 등록된 기본 부스 정보 (brands 테이블 기준) */
export type BoothDefaults = {
  name_ko: string
  name_en: string | null
  booths: number
}

/** 알려진 항목만, 0~99 정수로 정리한다. */
export function sanitizeExtraItems(input: unknown): ExtraItems {
  const out: ExtraItems = {}
  if (!input || typeof input !== "object") return out
  for (const { key } of EXTRA_ITEMS) {
    const n = Math.floor(Number((input as Record<string, unknown>)[key]))
    if (Number.isFinite(n) && n > 0) out[key] = Math.min(n, 99)
  }
  return out
}

export function extraTotal(items: ExtraItems) {
  return EXTRA_ITEMS.reduce((sum, i) => sum + (items[i.key] ?? 0) * i.price, 0)
}

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`

/** 현재 접수된(승인된) 부대시설 신청 내용 */
export function currentExtra(s: ExhibitorState): ExtraRequest {
  return {
    items: s.extra_items ?? {},
    water_location: s.water_location,
    note: s.extra_note,
    total: extraTotal(s.extra_items ?? {}),
  }
}

export function itemsText(items: ExtraItems) {
  return EXTRA_ITEMS.filter((i) => items?.[i.key])
    .map((i) => `${i.label} ${items[i.key]}${i.unit}`)
    .join(", ")
}

/**
 * 입금 상태. 입금 확인 후 변경 승인으로 금액이 늘면 차액(due)을 보여준다.
 * none: 낼 금액 없음 · unpaid: 입금 대기 · paid: 완료 · partial: 추가 입금 필요
 */
export function paymentStatus(s: ExhibitorState) {
  const total = s.extra_submitted_at ? extraTotal(s.extra_items ?? {}) : 0
  const paid = s.paid_at ? (s.paid_amount ?? 0) : 0
  const due = total - paid
  if (s.paid_at)
    return { kind: due > 0 ? ("partial" as const) : ("paid" as const), total, paid, due }
  return { kind: total > 0 ? ("unpaid" as const) : ("none" as const), total, paid, due }
}

export const emptyProduct = (): ExhibitorProduct => ({
  id:
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : String(Date.now()),
  name_ko: "",
  name_en: "",
  category: "",
  abv: "",
  volume: "",
  description: "",
  photos: [],
})

/**
 * 출품 제품 목록 검증·정리. photoPrefix 로 시작하는 사진 URL 만 남긴다 (다른 업체 파일 차단).
 * 오류면 { error } — 몇 번째 제품인지 알려준다.
 */
export function sanitizeProducts(
  input: unknown,
  photoPrefix: string,
): { products: ExhibitorProduct[] } | { error: string } {
  if (!Array.isArray(input)) return { error: "잘못된 요청입니다." }
  if (input.length > 30) return { error: "제품은 30개까지 등록할 수 있습니다." }
  const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")
  const products: ExhibitorProduct[] = []
  for (const [i, raw] of input.entries()) {
    const r = (raw ?? {}) as Record<string, unknown>
    const p: ExhibitorProduct = {
      id: str(r.id, 64) || String(i),
      name_ko: str(r.name_ko, 100),
      name_en: str(r.name_en, 100),
      category: str(r.category, 50),
      abv: str(r.abv, 10).replace(/%$/, ""),
      volume: str(r.volume, 20),
      description: str(r.description, 2000),
      photos: (Array.isArray(r.photos) ? r.photos : [])
        .filter((u): u is string => typeof u === "string" && u.startsWith(photoPrefix))
        .slice(0, PRODUCT_PHOTO_MAX),
    }
    const n = `${i + 1}번째 제품`
    if (!p.name_ko) return { error: `${n}: 제품명(한글)을 입력해 주세요.` }
    if (!p.category) return { error: `${n}: 주종을 입력해 주세요.` }
    const abv = Number(p.abv)
    if (!p.abv || !Number.isFinite(abv) || abv < 0 || abv > 100)
      return { error: `${n}: 도수를 숫자로 입력해 주세요. (예: 46)` }
    if (!p.volume) return { error: `${n}: 용량을 입력해 주세요.` }
    products.push(p)
  }
  return { products }
}

/** 실제로 신청한 항목이 있는지 (신청 후 모두 0개로 바꾼 경우는 미신청으로 본다) */
export function hasExtra(s: ExhibitorState) {
  return Boolean(s.extra_submitted_at) && Object.keys(s.extra_items ?? {}).length > 0
}

/** 부스 표기 현재 값 (임시 저장 > 제출된 수정 요청 > 등록 정보) */
export function boothValues(s: ExhibitorState, d: BoothDefaults): BoothDraft {
  if (s.draft?.booth) return s.draft.booth
  const revised = s.booth_status === "revised"
  return {
    name_ko: (revised ? s.booth_name_ko : d.name_ko) ?? "",
    name_en: (revised ? s.booth_name_en : d.name_en) ?? "",
    note: (revised ? s.booth_note : "") ?? "",
  }
}

export function isBoothRevision(b: BoothDraft, d: BoothDefaults) {
  return b.name_ko !== d.name_ko || b.name_en !== (d.name_en ?? "") || b.note !== ""
}

/** 부대시설 현재 값 (임시 저장 > 대기 중인 변경 요청 > 접수된 신청) */
export function extraValues(s: ExhibitorState): ExtraRequest {
  return s.draft?.extra ?? s.extra_pending ?? currentExtra(s)
}

/** 제출하지 않은 임시 저장이 있는지 */
export const hasUnsubmittedDraft = (s: ExhibitorState) =>
  Boolean(s.draft && Object.keys(s.draft).length > 0)
