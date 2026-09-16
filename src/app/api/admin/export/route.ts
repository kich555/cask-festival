import ExcelJS from "exceljs"
import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { type BuyerApplication, isFreeEmail } from "@/lib/buyer"
import { BUYER_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const TYPE_LABEL: Record<string, string> = {
  import_export: "주류 수입/수출",
  wholesale: "주류 도매/유통",
  food_service: "레스토랑/바/외식업",
  manufacturer: "주류 제조업",
  distribution: "유통업계",
  equipment: "기기/설비 제조업",
  other: "기타",
}

const REFERRAL_LABEL: Record<string, string> = {
  sns: "SNS 홍보",
  website: "홈페이지",
  cafe_blog: "카페/블로그",
  industry_site: "주류 업계 사이트",
  word_of_mouth: "지인 권유",
  invitation: "초청장",
  search: "검색",
  other: "기타",
}

const PURPOSE_LABEL: Record<string, string> = {
  new_products: "신제품 정보 수집",
  market_research: "시장 조사",
  new_partners: "신규 거래처 확보",
  tasting: "신제품 시음/시식",
  program: "프로그램 참가",
  other: "기타",
}

/** '기타'면 직접 입력값을 함께 적는다. */
function labelOf(map: Record<string, string>, value: string | null, other: string | null) {
  if (!value) return ""
  if (value === "other") return other ? `기타 (${other})` : "기타"
  return map[value] ?? value
}

const DAY_LABEL: Record<string, string> = {
  day1: "11/21(토)",
  day2: "11/22(일)",
  both: "양일",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "반려",
}

const COLUMNS: { header: string; width: number; get: (r: BuyerApplication) => string | number }[] =
  [
    { header: "신청일시", width: 20, get: (r) => new Date(r.created_at).toLocaleString("ko-KR") },
    { header: "상태", width: 8, get: (r) => STATUS_LABEL[r.status] ?? r.status },
    { header: "성명", width: 12, get: (r) => r.name },
    { header: "회사명", width: 24, get: (r) => r.company },
    { header: "직함", width: 16, get: (r) => r.job_title },
    { header: "연락처", width: 16, get: (r) => r.phone },
    { header: "이메일", width: 28, get: (r) => r.email },
    { header: "회사이메일여부", width: 14, get: (r) => (isFreeEmail(r.email) ? "개인" : "회사") },
    { header: "방문일", width: 12, get: (r) => DAY_LABEL[r.visit_day] ?? r.visit_day },
    {
      header: "바이어 구분",
      width: 22,
      get: (r) => labelOf(TYPE_LABEL, r.buyer_type, r.buyer_type_other),
    },
    {
      header: "인지 경로",
      width: 18,
      get: (r) => labelOf(REFERRAL_LABEL, r.referral, r.referral_other),
    },
    {
      header: "방문 목적",
      width: 22,
      get: (r) => labelOf(PURPOSE_LABEL, r.purpose, r.purpose_other),
    },
    { header: "만19세확인", width: 11, get: (r) => (r.age_confirmed ? "확인" : "미확인") },
    { header: "광고수신", width: 10, get: (r) => (r.marketing_opt_in ? "동의" : "미동의") },
    {
      header: "승인메일발송",
      width: 20,
      get: (r) =>
        r.approval_email_sent_at ? new Date(r.approval_email_sent_at).toLocaleString("ko-KR") : "",
    },
    { header: "관리자메모", width: 30, get: (r) => r.admin_note ?? "" },
    { header: "명함파일", width: 40, get: (r) => r.business_card_path },
  ]

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from(BUYER_TABLE)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  // supabase-js 의 select("*") 추론이 버전에 따라 달라 명시적으로 좁힌다.
  const rows = (data ?? []) as BuyerApplication[]

  const wb = new ExcelJS.Workbook()
  const ws = wb.addWorksheet("바이어 등록")

  ws.columns = COLUMNS.map((c) => ({ header: c.header, width: c.width }))
  ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7D0B1C" } }
  ws.getRow(1).height = 22
  ws.views = [{ state: "frozen", ySplit: 1 }]

  for (const r of rows) {
    ws.addRow(COLUMNS.map((c) => c.get(r)))
  }

  const buffer = await wb.xlsx.writeBuffer()
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")

  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="caskcarnival_buyers_${today}.xlsx"`,
      "Cache-Control": "no-store",
    },
  })
}
