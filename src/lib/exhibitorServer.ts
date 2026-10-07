import "server-only"
import { NextResponse } from "next/server"
import {
  type BoothDefaults,
  EXHIBITOR_LOG_TABLE,
  EXHIBITOR_STATE_COLUMNS,
  EXHIBITOR_TABLE,
  type ExhibitorLogRow,
  type ExhibitorState,
} from "./exhibitorRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "./supabaseAdmin"

export function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status })
}

export const unauthorized = () => fail("로그인이 필요합니다.", 401)

export async function loadExhibitor(slug: string) {
  const db = getSupabaseAdmin()
  const [account, brand] = await Promise.all([
    db.from(EXHIBITOR_TABLE).select(EXHIBITOR_STATE_COLUMNS).eq("brand_slug", slug).maybeSingle(),
    db.from(BRAND_TABLE).select("name_ko,name_en,booths").eq("slug", slug).maybeSingle(),
  ])
  if (!account.data || !brand.data) return null
  return { state: account.data as unknown as ExhibitorState, defaults: brand.data as BoothDefaults }
}

export async function loadState(slug: string) {
  const { data } = await getSupabaseAdmin()
    .from(EXHIBITOR_TABLE)
    .select(EXHIBITOR_STATE_COLUMNS)
    .eq("brand_slug", slug)
    .maybeSingle()
  return data as unknown as ExhibitorState | null
}

/** 업체 행을 고치고 내역을 남긴다. 업체·관리자 화면이 함께 쓴다. */
export async function applyExhibitorUpdate(
  slug: string,
  patch: Partial<ExhibitorState>,
  log: Pick<ExhibitorLogRow, "kind" | "data">,
) {
  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(EXHIBITOR_TABLE)
    .update(patch)
    .eq("brand_slug", slug)
    .select(EXHIBITOR_STATE_COLUMNS)
    .single()
  if (error) return { error: error.message }
  const logged = await db.from(EXHIBITOR_LOG_TABLE).insert({ brand_slug: slug, ...log })
  if (logged.error) console.error("[exhibitor] 내역 기록 실패:", logged.error.message)
  return { state: data as unknown as ExhibitorState }
}

/** applyExhibitorUpdate 결과를 응답으로 */
export async function updateExhibitor(
  slug: string,
  patch: Partial<ExhibitorState>,
  log: Pick<ExhibitorLogRow, "kind" | "data">,
) {
  const r = await applyExhibitorUpdate(slug, patch, log)
  if (r.error) return fail(r.error, 500)
  return NextResponse.json({ ok: true, state: r.state })
}
