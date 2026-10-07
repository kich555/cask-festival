import { type NextRequest, NextResponse } from "next/server"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import {
  EXHIBITOR_STATE_COLUMNS,
  EXHIBITOR_TABLE,
  type ExhibitorDraft,
  extraTotal,
  PRODUCT_BUCKET,
  sanitizeExtraItems,
  sanitizeProducts,
} from "@/lib/exhibitorRecord"
import { fail, loadState, unauthorized } from "@/lib/exhibitorServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

/** 섹션 하나를 임시 저장한다 ({ section: "booth" | "extra" | "products", data }). */
export async function PUT(request: NextRequest) {
  const slug = await getExhibitorSlug()
  if (!slug) return unauthorized()
  const body = (await request.json().catch(() => null)) as {
    section?: string
    data?: Record<string, unknown> | unknown[]
  } | null
  if (!body) return fail("잘못된 요청입니다.", 400)
  const state = await loadState(slug)
  if (!state) return unauthorized()

  const draft: ExhibitorDraft = { ...(state.draft ?? {}) }
  const d = (body.data ?? {}) as Record<string, unknown>

  if (body.section === "booth") {
    const name_ko = text(d.name_ko, 100)
    if (!name_ko) return fail("업체명(한글)을 입력해 주십시오.", 400)
    draft.booth = { name_ko, name_en: text(d.name_en, 100), note: text(d.note, 1000) }
  } else if (body.section === "extra") {
    const items = sanitizeExtraItems(d.items)
    const water = text(d.water_location, 500)
    if (items.water && !water) return fail("급배수 설치 위치를 적어 주십시오.", 400)
    draft.extra = {
      items,
      water_location: items.water ? water : null,
      note: text(d.note, 1000) || null,
      total: extraTotal(items),
    }
  } else if (body.section === "products") {
    const prefix = getSupabaseAdmin().storage.from(PRODUCT_BUCKET).getPublicUrl(`${slug}/`)
      .data.publicUrl
    const parsed = sanitizeProducts(body.data ?? [], prefix)
    if ("error" in parsed) return fail(parsed.error, 400)
    draft.products = parsed.products
  } else {
    return fail("잘못된 요청입니다.", 400)
  }

  const { data, error } = await getSupabaseAdmin()
    .from(EXHIBITOR_TABLE)
    .update({ draft, draft_saved_at: new Date().toISOString() })
    .eq("brand_slug", slug)
    .select(EXHIBITOR_STATE_COLUMNS)
    .single()
  if (error) return fail(error.message, 500)
  return NextResponse.json({ ok: true, state: data })
}
