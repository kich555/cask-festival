import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { paymentStatus } from "@/lib/exhibitorRecord"
import { applyExhibitorUpdate, fail, loadState } from "@/lib/exhibitorServer"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ slug: string }> }

/**
 * 관리자 처리: booth_ack(수정 요청 확인) | extra_approve(변경 승인) | extra_reject(변경 반려)
 *             | payment_confirm(입금 확인) | payment_cancel(입금 확인 취소)
 */
export async function POST(request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return fail("권한이 없습니다.", 401)
  const { slug } = await params
  const { action } = ((await request.json().catch(() => ({}))) ?? {}) as { action?: string }

  const state = await loadState(slug)
  if (!state) return fail("업체를 찾을 수 없습니다.", 404)
  const now = new Date().toISOString()

  let r: Awaited<ReturnType<typeof applyExhibitorUpdate>>
  if (action === "booth_ack") {
    if (state.booth_status !== "revised") return fail("수정 요청이 없습니다.", 400)
    r = await applyExhibitorUpdate(slug, { booth_ack_at: now }, { kind: "booth_ack", data: {} })
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
