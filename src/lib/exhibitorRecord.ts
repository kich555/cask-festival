// 참가업체 부스 정보 확인 · 부대시설 추가 신청(/exhibitor) 공용 정의. 서버·클라이언트가 함께 쓴다.
// 신청 항목·안내 문구·입금 정보를 바꾸려면 이 파일만 고치면 된다.

export const EXHIBITOR_TABLE = "exhibitor_accounts"
export const EXHIBITOR_LOG_TABLE = "exhibitor_log"

export type ExhibitorLogKind =
  | "booth_approve"
  | "booth_revise"
  | "extra" // 첫 신청 (바로 접수)
  | "extra_change" // 변경 요청 (승인 대기)
  | "extra_cancel" // 업체가 변경 요청 취소
  | "booth_ack" // 관리자: 수정 요청 확인
  | "extra_approve" // 관리자: 변경 승인
  | "extra_reject" // 관리자: 변경 반려

export type ExhibitorLogRow = {
  id: string
  brand_slug: string
  kind: ExhibitorLogKind
  data: Partial<ExtraRequest> & { name_ko?: string | null; name_en?: string | null }
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
  created_at: string
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
  "brand_slug,login_id,booth_status,booth_name_ko,booth_name_en,booth_note,booth_confirmed_at,extra_items,water_location,extra_note,extra_submitted_at,booth_ack_at,extra_pending,extra_pending_at,extra_decision,extra_decided_at,password_changed_at"

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
