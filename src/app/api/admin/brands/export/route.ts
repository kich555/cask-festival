import ExcelJS from "exceljs"
import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, unauthorized } from "@/lib/brandAdmin"
import { getLayout } from "@/lib/floorPlanServer"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

/** 브랜드 한글/영문명·부스번호 목록 엑셀. 가나다순. */
export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()
  const [{ data, error }, layout] = await Promise.all([
    getSupabaseAdmin().from(BRAND_TABLE).select("slug,name_ko,name_en"),
    getLayout(),
  ])
  if (error) return fail(error.message, 500)

  const booths = new Map<string, string[]>()
  for (const i of layout.items) {
    if (i.type !== "booth" || !i.brand) continue
    booths.set(i.brand, [...(booths.get(i.brand) ?? []), i.no])
  }

  const rows = (data ?? []).sort((a, b) => a.name_ko.localeCompare(b.name_ko, "ko"))
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet("브랜드 목록")
  sheet.columns = [
    { header: "No.", width: 6 },
    { header: "브랜드명(한글)", width: 30 },
    { header: "브랜드명(영문)", width: 36 },
    { header: "부스번호", width: 12 },
  ]
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  sheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF1A1A1A" },
  }
  sheet.views = [{ state: "frozen", ySplit: 1 }]
  rows.forEach((r, i) =>
    sheet.addRow([i + 1, r.name_ko, r.name_en ?? "", (booths.get(r.slug) ?? []).sort().join(", ")]),
  )

  const buffer = await wb.xlsx.writeBuffer()
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="caskcarnival_brands_${today}.xlsx"`,
      "Cache-Control": "no-store",
    },
  })
}
