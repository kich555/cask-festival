import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, unauthorized } from "@/lib/brandAdmin"
import { parseBrandInput, slugify } from "@/lib/brandRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()
  const { data, error } = await getSupabaseAdmin().from(BRAND_TABLE).select("*").order("sort_order")
  if (error) return fail(error.message, 500)
  return NextResponse.json({ ok: true, brands: data ?? [] })
}

/** 새 브랜드는 숨김 상태로 목록 맨 뒤에 추가한다. */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()

  const parsed = parseBrandInput(await request.json().catch(() => null))
  if (!parsed.ok) return fail(parsed.error, 400)

  const db = getSupabaseAdmin()
  const { data: existing, error: listError } = await db.from(BRAND_TABLE).select("slug, sort_order")
  if (listError) return fail(listError.message, 500)

  const used = new Set((existing ?? []).map((b) => b.slug))
  const maxOrder = Math.max(0, ...(existing ?? []).map((b) => b.sort_order))

  const { data, error } = await db
    .from(BRAND_TABLE)
    .insert({
      ...parsed.value,
      slug: slugify(parsed.value.name_en ?? parsed.value.name_ko, used),
      logo: null,
      logo_bg: null,
      visible: false,
      sort_order: maxOrder + 1,
    })
    .select()
    .single()
  if (error) return fail(error.message, 500)

  return NextResponse.json({ ok: true, brand: data })
}
