import ExcelJS from "exceljs"
import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { type BuyerApplication, isFreeEmail } from "@/lib/buyer"
import { BUYER_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const TYPE_LABEL: Record<string, string> = {
  wholesale: "도매/유통",
  retail: "소매/보틀샵",
  self_employed: "자영업",
  importer: "수입사",
  press: "프레스",
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
    { header: "유형", width: 12, get: (r) => TYPE_LABEL[r.buyer_type] ?? r.buyer_type },
    { header: "이름", width: 12, get: (r) => r.name },
    { header: "직함", width: 14, get: (r) => r.job_title },
    { header: "회사명", width: 24, get: (r) => r.company },
    { header: "부서", width: 14, get: (r) => r.department ?? "" },
    { header: "휴대폰", width: 16, get: (r) => r.phone },
    { header: "이메일", width: 28, get: (r) => r.email },
    { header: "회사이메일여부", width: 14, get: (r) => (isFreeEmail(r.email) ? "개인" : "회사") },
    { header: "국가", width: 10, get: (r) => r.country },
    { header: "회사주소", width: 36, get: (r) => r.company_address },
    { header: "참관일", width: 12, get: (r) => DAY_LABEL[r.visit_day] ?? r.visit_day },
    { header: "사업자등록번호", width: 16, get: (r) => r.business_number ?? "" },
    { header: "매체명", width: 18, get: (r) => r.media_name ?? "" },
    { header: "매체URL", width: 28, get: (r) => r.media_url ?? "" },
    { header: "참관이유", width: 44, get: (r) => r.visit_purpose ?? "" },
    { header: "마케팅수신", width: 10, get: (r) => (r.marketing_opt_in ? "동의" : "미동의") },
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
  const ws = wb.addWorksheet("바이어 신청")

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
