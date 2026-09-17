import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, removeLogoFile, revalidateBrands, unauthorized } from "@/lib/brandAdmin"
import { type BrandRow, parseBrandInput } from "@/lib/brandRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ slug: string }> }

/** 노출 전환({visible})과 정보 수정(폼 전체)을 모두 받는다. */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { slug } = await params
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return fail("입력이 없습니다.", 400)

  const patch: Partial<BrandRow> = { updated_at: new Date().toISOString() }
  if (typeof body.visible === "boolean") patch.visible = body.visible
  if ("name_ko" in body) {
    const parsed = parseBrandInput(body)
    if (!parsed.ok) return fail(parsed.error, 400)
    Object.assign(patch, parsed.value)
  }
  if (Object.keys(patch).length === 1) return fail("변경할 내용이 없습니다.", 400)

  const { data, error } = await getSupabaseAdmin()
    .from(BRAND_TABLE)
    .update(patch)
    .eq("slug", slug)
    .select()
    .single()
  if (error) return fail(error.message, 500)

  revalidateBrands()
  return NextResponse.json({ ok: true, brand: data })
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { slug } = await params

  const { data, error } = await getSupabaseAdmin()
    .from(BRAND_TABLE)
    .delete()
    .eq("slug", slug)
    .select("logo")
    .single()
  if (error) return fail(error.message, 500)

  await removeLogoFile(data.logo)
  revalidateBrands()
  return NextResponse.json({ ok: true })
}
