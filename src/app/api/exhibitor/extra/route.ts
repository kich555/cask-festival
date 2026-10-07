import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import { fail, loadState, unauthorized, updateExhibitor } from "@/lib/exhibitorServer"

export const runtime = "nodejs"

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
