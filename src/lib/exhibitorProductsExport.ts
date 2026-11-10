// 올로로소 셰리 캐스크 출품 제품 엑셀 (사진 제외)
import ExcelJS from "exceljs"
import { compareBoothNos, type ExhibitorProduct } from "./exhibitorRecord"

export type ProductExportBrand = {
  booth_nos: string[]
  name_ko: string
  name_en: string | null
  website: string | null
  instagram: string | null
  products: ExhibitorProduct[]
}

export function buildProductsWorkbook(brands: ProductExportBrand[]) {
  const sorted = brands
    .filter((b) => b.products.length > 0)
    .sort(
      (a, b) =>
        compareBoothNos(a.booth_nos, b.booth_nos) || a.name_ko.localeCompare(b.name_ko, "ko"),
    )

  const wb = new ExcelJS.Workbook()
  const sheet = wb.addWorksheet("올로로소 출품 제품")
  sheet.columns = [
    { header: "부스번호", width: 12 },
    { header: "업체명(한글)", width: 22 },
    { header: "업체명(영문)", width: 24 },
    { header: "홈페이지", width: 28 },
    { header: "인스타그램", width: 28 },
    { header: "제품명(한글)", width: 28 },
    { header: "제품명(영문)", width: 32 },
    { header: "주종", width: 12 },
    { header: "도수(%)", width: 9 },
    { header: "용량", width: 10 },
    { header: "제품 설명", width: 90 },
  ]
  sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
  sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7D0B1C" } }
  sheet.views = [{ state: "frozen", ySplit: 1 }]

  for (const b of sorted) {
    for (const p of b.products) {
      const row = sheet.addRow([
        b.booth_nos.join(", "),
        b.name_ko,
        b.name_en ?? "",
        b.website ?? "",
        b.instagram ?? "",
        p.name_ko,
        p.name_en,
        p.category,
        p.abv,
        p.volume,
        p.description ?? "",
      ])
      row.alignment = { vertical: "top", wrapText: true }
    }
  }
  return wb
}
