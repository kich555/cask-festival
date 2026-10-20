import { revalidatePath } from "next/cache"
import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { revalidateBrands } from "@/lib/brandAdmin"
import { paymentStatus } from "@/lib/exhibitorRecord"
import { applyExhibitorUpdate, fail, loadState } from "@/lib/exhibitorServer"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ slug: string }> }

/**
 * 관리자 처리: booth_ack(수정 요청 확인) | booth_edit(업체명 직접 수정 → 브랜드 정보·부스 표기에 반영)
 *             | extra_approve(변경 승인) | extra_reject(변경 반려)
 *             | payment_confirm(입금 확인) | payment_cancel(입금 확인 취소)
 */
export async function POST(request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return fail("권한이 없습니다.", 401)
  const { slug } = await params
  const body = ((await request.json().catch(() => ({}))) ?? {}) as {
    action?: string
    name_ko?: string
    name_en?: string
  }
  const { action } = body

  const state = await loadState(slug)
  if (!state) return fail("업체를 찾을 수 없습니다.", 404)
  const now = new Date().toISOString()

  let r: Awaited<ReturnType<typeof applyExhibitorUpdate>>
  if (action === "booth_ack") {
    if (state.booth_status !== "revised") return fail("수정 요청이 없습니다.", 400)
    r = await applyExhibitorUpdate(slug, { booth_ack_at: now }, { kind: "booth_ack", data: {} })
  } else if (action === "booth_edit") {
    const name_ko = String(body.name_ko ?? "")
      .trim()
      .slice(0, 100)
    const name_en =
      String(body.name_en ?? "")
        .trim()
        .slice(0, 100) || null
    if (!name_ko) return fail("한글명을 입력해 주세요.", 400)
    // 브랜드 정보(공개 사이트 업체명)를 먼저 바꾼다 → 부스 표기 기본값도 이 값이 된다.
    const brand = await getSupabaseAdmin()
      .from(BRAND_TABLE)
      .update({ name_ko, name_en })
      .eq("slug", slug)
    if (brand.error) return fail(brand.error.message, 500)
    revalidateBrands()
    revalidatePath("/")
    // 수정 요청이 있었으면 확인 처리, 업체의 부스 임시 저장은 지워서 업체 화면에도 새 값이 보이게 한다.
    const { booth: _booth, ...restDraft } = state.draft ?? {}
    r = await applyExhibitorUpdate(
      slug,
      {
        ...(state.booth_status === "revised"
          ? { booth_name_ko: name_ko, booth_name_en: name_en, booth_ack_at: now }
          : {}),
        draft: Object.keys(restDraft).length ? restDraft : null,
      },
      { kind: "booth_edit", data: { name_ko, name_en } },
    )
  } else if (action === "extra_approve" || action === "extra_reject") {
    const p = state.extra_pending
    if (!p) return fail("대기 중인 변경 요청이 없습니다.", 400)
    const approve = action === "extra_approve"
    r = await applyExhibitorUpdate(
      slug,
      {
        ...(approve
          ? { extra_items: p.items, water_location: p.water_location, extra_note: p.note }
          : {}),
        extra_pending: null,
        extra_pending_at: null,
        extra_decision: approve ? "approved" : "rejected",
        extra_decided_at: now,
      },
      { kind: action, data: p },
    )
  } else if (action === "payment_confirm") {
    const { total } = paymentStatus(state)
    if (total <= 0) return fail("입금할 금액이 없습니다.", 400)
    r = await applyExhibitorUpdate(
      slug,
      { paid_at: now, paid_amount: total },
      { kind: "payment_confirm", data: { total } },
    )
  } else if (action === "payment_cancel") {
    if (!state.paid_at) return fail("입금 확인 내역이 없습니다.", 400)
    r = await applyExhibitorUpdate(
      slug,
      { paid_at: null, paid_amount: null },
      { kind: "payment_cancel", data: { total: state.paid_amount ?? 0 } },
    )
  } else {
    return fail("잘못된 요청입니다.", 400)
  }

  if (r.error) return fail(r.error, 500)
  return NextResponse.json({ ok: true, state: r.state })
}
