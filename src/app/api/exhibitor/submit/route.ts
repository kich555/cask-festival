import { NextResponse } from "next/server"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import {
  type BoothDefaults,
  boothValues,
  currentExtra,
  EXHIBITOR_LOG_TABLE,
  EXHIBITOR_STATE_COLUMNS,
  EXHIBITOR_TABLE,
  type ExhibitorLogRow,
  type ExhibitorState,
  type ExtraRequest,
  hasExtra,
  isBoothRevision,
  PRODUCT_BUCKET,
  sanitizeExtraItems,
  sanitizeProducts,
} from "@/lib/exhibitorRecord"
import { fail, loadExhibitor, unauthorized } from "@/lib/exhibitorServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

// DB(jsonb)는 키 순서를 바꿔 저장하므로 양쪽을 같은 방식으로 정리한 뒤 비교한다.
const sameExtra = (a: ExtraRequest, b: ExtraRequest) =>
  JSON.stringify([sanitizeExtraItems(a.items), a.water_location, a.note]) ===
  JSON.stringify([sanitizeExtraItems(b.items), b.water_location, b.note])

type Log = Pick<ExhibitorLogRow, "kind" | "data">

/**
 * 섹션별로 임시 저장(draft)한 내용을 최종 제출한다. 바뀐 부분만 반영·기록한다.
 * 임시 저장이 없는 섹션은 현재 접수된 내용을 그대로 둔다.
 * - 부스 표기: 확인(approve) 또는 수정 요청(revise)
 * - 부대시설: 기존 신청이 없으면 바로 접수, 있으면 변경 요청(관리자 승인 대기)
 * - 출품 제품: 목록 전체 교체 (빠진 사진은 저장소에서도 삭제)
 */
export async function POST() {
  const slug = await getExhibitorSlug()
  if (!slug) return unauthorized()
  const loaded = await loadExhibitor(slug)
  if (!loaded) return unauthorized()
  const { state, defaults } = loaded as { state: ExhibitorState; defaults: BoothDefaults }
  const draft = state.draft ?? {}

  // ── 검증 ──
  if (!draft.booth && !state.booth_status) {
    return fail("1. 부스 표기 정보: 내용을 확인하신 후 '확인'을 눌러 주십시오.", 400)
  }
  const boothDraft = draft.booth ?? boothValues(state, defaults)
  const boothChoice = isBoothRevision(boothDraft, defaults) ? "revise" : "approve"
  const boothName = boothDraft.name_ko

  const extra: ExtraRequest = draft.extra ?? state.extra_pending ?? currentExtra(state)

  const storage = getSupabaseAdmin().storage.from(PRODUCT_BUCKET)
  const prefix = storage.getPublicUrl(`${slug}/`).data.publicUrl
  const parsed = sanitizeProducts(draft.products ?? state.products ?? [], prefix)
  if ("error" in parsed) return fail(`3. 출품 제품: ${parsed.error}`, 400)

  // ── 바뀐 부분 계산 ──
  const now = new Date().toISOString()
  const patch: Partial<ExhibitorState> = {}
  const logs: Log[] = []
  const notes: string[] = []

  if (boothChoice === "approve") {
    if (state.booth_status !== "approved") {
      Object.assign(patch, {
        booth_status: "approved",
        booth_name_ko: null,
        booth_name_en: null,
        booth_note: null,
        booth_confirmed_at: now,
        booth_ack_at: null,
      })
      logs.push({ kind: "booth_approve", data: {} })
    }
  } else {
    const name_en = boothDraft.name_en || null
    const note = boothDraft.note || null
    const changed =
      state.booth_status !== "revised" ||
      state.booth_name_ko !== boothName ||
      state.booth_name_en !== name_en ||
      state.booth_note !== note
    if (changed) {
      Object.assign(patch, {
        booth_status: "revised",
        booth_name_ko: boothName,
        booth_name_en: name_en,
        booth_note: note,
        booth_confirmed_at: now,
        booth_ack_at: null,
      })
      logs.push({ kind: "booth_revise", data: { name_ko: boothName, name_en, note } })
    }
  }

  const current = currentExtra(state)
  if (!hasExtra(state)) {
    // 기존 신청이 없으면 바로 접수 (모두 0개면 접수할 것 없음)
    if (!sameExtra(extra, current)) {
      Object.assign(patch, {
        extra_items: extra.items,
        water_location: extra.water_location,
        extra_note: extra.note,
        extra_submitted_at: now,
        extra_pending: null,
        extra_pending_at: null,
      })
      logs.push({ kind: "extra", data: extra })
    }
  } else if (sameExtra(extra, current)) {
    if (state.extra_pending) {
      Object.assign(patch, { extra_pending: null, extra_pending_at: null })
      logs.push({ kind: "extra_cancel", data: {} })
    }
  } else if (!state.extra_pending || !sameExtra(extra, state.extra_pending)) {
    Object.assign(patch, {
      extra_pending: extra,
      extra_pending_at: now,
      extra_decision: null,
      extra_decided_at: null,
    })
    logs.push({ kind: "extra_change", data: extra })
    notes.push("부대시설 변경 요청은 사무국 승인 후 반영됩니다.")
  }

  const saved = sanitizeProducts(state.products ?? [], prefix)
  const savedJson = JSON.stringify("products" in saved ? saved.products : state.products)
  if (JSON.stringify(parsed.products) !== savedJson) {
    const keep = new Set(parsed.products.flatMap((p) => p.photos))
    const removed = (state.products ?? [])
      .flatMap((p) => p.photos)
      .filter((u) => !keep.has(u) && u.startsWith(prefix))
      .map((u) => `${slug}/${u.slice(prefix.length)}`)
    if (removed.length) {
      const { error } = await storage.remove(removed)
      if (error) console.error("[exhibitor] 제품 사진 삭제 실패:", error.message)
    }
    Object.assign(patch, { products: parsed.products, products_updated_at: now })
    logs.push({ kind: "products", data: { count: parsed.products.length } })
  }

  // 제출 완료: 임시 저장을 비우고 제출 시각을 남긴다.
  Object.assign(patch, { draft: null, draft_saved_at: null, submitted_at: now })
  if (logs.length === 0) notes.push("이전에 제출하신 내용과 달라진 점이 없습니다.")

  // ── 반영 ──
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(EXHIBITOR_TABLE)
    .update(patch)
    .eq("brand_slug", slug)
    .select(EXHIBITOR_STATE_COLUMNS)
    .single()
  if (error) return fail(error.message, 500)
  if (logs.length) {
    const logged = await db
      .from(EXHIBITOR_LOG_TABLE)
      .insert(logs.map((l) => ({ brand_slug: slug, ...l })))
    if (logged.error) console.error("[exhibitor] 내역 기록 실패:", logged.error.message)
  }

  return NextResponse.json({ ok: true, state: data, notes })
}
