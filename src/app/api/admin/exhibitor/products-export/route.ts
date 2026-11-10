import { NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { loadExhibitorOverview } from "@/lib/exhibitorAdmin"
import { buildProductsWorkbook } from "@/lib/exhibitorProductsExport"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

export async function GET() {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 })
  }
  const [rows, brands] = await Promise.all([
    loadExhibitorOverview(),
    getSupabaseAdmin().from(BRAND_TABLE).select("slug,website,instagram"),
  ])
  const bySlug = new Map((brands.data ?? []).map((b) => [b.slug, b]))

  const wb = buildProductsWorkbook(
    rows.map((r) => ({
      booth_nos: r.booth_nos,
      name_ko: r.defaults.name_ko,
      name_en: r.defaults.name_en,
      website: bySlug.get(r.brand_slug)?.website ?? null,
      instagram: bySlug.get(r.brand_slug)?.instagram ?? null,
      products: r.products ?? [],
    })),
  )
  const buffer = await wb.xlsx.writeBuffer()
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "")
  return new NextResponse(buffer as ArrayBuffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="caskcarnival_oloroso_products_${today}.xlsx"`,
      "Cache-Control": "no-store",
    },
  })
}
