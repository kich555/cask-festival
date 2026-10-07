import ExcelJS from "exceljs"
import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { loadExhibitorOverview } from "@/lib/exhibitorAdmin"
import { EXTRA_ITEMS, extraTotal } from "@/lib/exhibitorRecord"

export const runtime = "nodejs"

const dt = (v: string | null) => (v ? new Date(v).toLocaleString("ko-KR") : "")

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 })
  }
  const rows = await loadExhibitorOverview()

  const ws = new ExcelJS.Workbook()
  const sheet = ws.addWorksheet("부스 확인 · 추가 신청")
  sheet.columns = [
    { header: "업체명(등록)", width: 24 },
    { header: "부스 수", width: 8 },
    { header: "부스표기 상태", width: 12 },
    { header: "부스표기 한글명", width: 24 },
    { header: "부스표기 영문명", width: 28 },
    { header: "표기 요청메모", width: 30 },
    { header: "부스 확인일시", width: 20 },
    ...EXTRA_ITEMS.map((i) => ({ header: `${i.label}(${i.unit})`, width: 14 })),
    { header: "합계(원)", width: 14 },
    { header: "급배수 위치", width: 30 },
    { header: "기타 요청사항", width: 40 },
    { header: "추가신청 일시", width: 20 },
    { header: "변경 승인대기", width: 14 },
  ]
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7D0B1C" } }
  sheet.views = [{ state: "frozen", ySplit: 1 }]

  for (const r of rows) {
    const revised = r.booth_status === "revised"
    sheet.addRow([
      r.defaults.name_ko,
      r.defaults.booths,
      revised ? (r.booth_ack_at ? "수정확인" : "수정요청") : r.booth_status ? "승인" : "미확인",
      revised ? r.booth_name_ko : r.defaults.name_ko,
      (revised ? r.booth_name_en : r.defaults.name_en) ?? "",
      r.booth_note ?? "",
      dt(r.booth_confirmed_at),
      ...EXTRA_ITEMS.map((i) => r.extra_items?.[i.key] ?? ""),
      r.extra_submitted_at ? extraTotal(r.extra_items) : "",
      r.water_location ?? "",
      r.extra_note ?? "",
      dt(r.extra_submitted_at),
      r.extra_pending ? "있음 (승인 전)" : "",
    ])
  }

  const buffer = await ws.xlsx.writeBuffer()
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="caskcarnival_exhibitor_${today}.xlsx"`,
      "Cache-Control": "no-store",
    },
  })
}
