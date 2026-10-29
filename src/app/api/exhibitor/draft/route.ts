import { type NextRequest, NextResponse } from "next/server"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import {
  boothPatch,
  EXHIBITOR_LOG_TABLE,
  EXHIBITOR_STATE_COLUMNS,
  EXHIBITOR_TABLE,
  type ExhibitorDraft,
  extraTotal,
  PRODUCT_BUCKET,
  sanitizeExtraItems,
  sanitizeProducts,
} from "@/lib/exhibitorRecord"
import { fail, loadExhibitor, loadState, unauthorized } from "@/lib/exhibitorServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const text = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "")

/**
 * 섹션 하나를 임시 저장한다 ({ section: "booth" | "extra" | "products", data }).
 * 부스 표기는 저장 즉시 사무국에 접수된다 (제출하기를 따로 누르지 않아도 admin 에 수정 요청으로 뜬다)
 */
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
    if (!name_ko) return fail("부스 표기명을 입력해 주십시오.", 400)
    const loaded = await loadExhibitor(slug)
    if (!loaded) return unauthorized()
    const booth = { name_ko, name_en: text(d.name_en, 100), note: text(d.note, 1000) }
    const now = new Date().toISOString()
    const { patch, log } = boothPatch(state, loaded.defaults, booth, now)
    delete draft.booth
    const rest = Object.keys(draft).length > 0
    const db = getSupabaseAdmin()
    const { data, error } = await db
      .from(EXHIBITOR_TABLE)
      .update({
        ...patch,
        draft: rest ? draft : null,
        draft_saved_at: rest ? state.draft_saved_at : null,
      })
      .eq("brand_slug", slug)
      .select(EXHIBITOR_STATE_COLUMNS)
      .single()
    if (error) return fail(error.message, 500)
    if (log) {
      const logged = await db.from(EXHIBITOR_LOG_TABLE).insert({ brand_slug: slug, ...log })
      if (logged.error) console.error("[exhibitor] 내역 기록 실패:", logged.error.message)
    }
    return NextResponse.json({ ok: true, state: data, submitted: Boolean(log) })
  } else if (body.section === "extra") {
    const items = sanitizeExtraItems(d.items)
    draft.extra = {
      items,
      // 급배수 설치 위치는 사무국이 별도 연락으로 확인한다.
      water_location: null,
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
