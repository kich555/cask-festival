import type { NextRequest } from "next/server"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import {
  currentExtra,
  type ExtraRequest,
  extraTotal,
  sanitizeExtraItems,
} from "@/lib/exhibitorRecord"
import { fail, loadState, unauthorized, updateExhibitor } from "@/lib/exhibitorServer"

export const runtime = "nodejs"

const text = (v: unknown, max: number) => {
  const t = typeof v === "string" ? v.trim().slice(0, max) : ""
  return t === "" ? null : t
}

const same = (a: ExtraRequest, b: ExtraRequest) =>
  JSON.stringify([a.items, a.water_location, a.note]) ===
  JSON.stringify([b.items, b.water_location, b.note])

/**
 * 부대시설 추가 신청.
 * - 첫 신청은 바로 접수된다.
 * - 이후 변경은 extra_pending 에 보류되고, 관리자가 승인해야 반영된다.
 */
export async function PUT(request: NextRequest) {
  const slug = await getExhibitorSlug()
  if (!slug) return unauthorized()
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return fail("잘못된 요청입니다.", 400)

  const items = sanitizeExtraItems(body.items)
  const water_location = text(body.water_location, 500)
  if (items.water && !water_location) return fail("급배수 설치 위치를 적어 주세요.", 400)
  const req: ExtraRequest = {
    items,
    water_location: items.water ? water_location : null,
    note: text(body.note, 1000),
    total: extraTotal(items),
  }

  const state = await loadState(slug)
  if (!state) return unauthorized()
  const now = new Date().toISOString()

  if (!state.extra_submitted_at) {
    return updateExhibitor(
      slug,
      {
        extra_items: req.items,
        water_location: req.water_location,
        extra_note: req.note,
        extra_submitted_at: now,
      },
      { kind: "extra", data: req },
    )
  }

  if (same(req, currentExtra(state))) {
    return fail("현재 신청 내용과 달라진 점이 없습니다.", 400)
  }
  return updateExhibitor(
    slug,
    { extra_pending: req, extra_pending_at: now, extra_decision: null, extra_decided_at: null },
    { kind: "extra_change", data: req },
  )
}

/** 승인 대기 중인 변경 요청 취소 */
export async function DELETE() {
  const slug = await getExhibitorSlug()
  if (!slug) return unauthorized()
  const state = await loadState(slug)
  if (!state?.extra_pending) return fail("대기 중인 변경 요청이 없습니다.", 400)
  return updateExhibitor(
    slug,
    { extra_pending: null, extra_pending_at: null },
    { kind: "extra_cancel", data: {} },
  )
}
