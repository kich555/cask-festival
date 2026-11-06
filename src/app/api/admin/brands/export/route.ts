import ExcelJS from "exceljs"
import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, unauthorized } from "@/lib/brandAdmin"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

/** 브랜드 한글/영문명 목록 엑셀. 가나다순. */
export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()
  const { data, error } = await getSupabaseAdmin()
    .from(BRAND_TABLE)
    .select("name_ko,name_en,country_ko,visible")
  if (error) return fail(error.message, 500)

  const rows = (data ?? []).sort((a, b) => a.name_ko.localeCompare(b.name_ko, "ko"))
  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet("브랜드 목록")
  sheet.columns = [
    { header: "No.", width: 6 },
    { header: "브랜드명(한글)", width: 30 },
    { header: "브랜드명(영문)", width: 36 },
    { header: "국가", width: 12 },
    { header: "노출", width: 8 },
  ]
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1A1A1A" } }
  sheet.views = [{ state: "frozen", ySplit: 1 }]
  rows.forEach((r, i) =>
    sheet.addRow([i + 1, r.name_ko, r.name_en ?? "", r.country_ko ?? "", r.visible ? "O" : "숨김"]),
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
