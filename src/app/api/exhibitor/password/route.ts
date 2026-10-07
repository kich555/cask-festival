import { type NextRequest, NextResponse } from "next/server"
import {
  getExhibitorSlug,
  hashExhibitorPassword,
  verifyExhibitorPassword,
} from "@/lib/exhibitorAuth"
import { EXHIBITOR_TABLE } from "@/lib/exhibitorRecord"
import { fail, unauthorized } from "@/lib/exhibitorServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const PASSWORD_MIN = 8

/** 비밀번호 변경: 현재 비밀번호 확인 후 새 비밀번호로 교체 */
export async function PUT(request: NextRequest) {
  const slug = await getExhibitorSlug()
  if (!slug) return unauthorized()
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const current = typeof body?.current === "string" ? body.current.trim() : ""
  const next = typeof body?.next === "string" ? body.next : ""

  if (next.length < PASSWORD_MIN || next.length > 64) {
    return fail(`새 비밀번호는 ${PASSWORD_MIN}자 이상이어야 합니다.`, 400)
  }
  if (/\s/.test(next)) return fail("비밀번호에는 공백을 쓸 수 없습니다.", 400)

  const db = getSupabaseAdmin()
  const { data } = await db
    .from(EXHIBITOR_TABLE)
    .select("password_hash")
    .eq("brand_slug", slug)
    .single()
  if (!data || !verifyExhibitorPassword(current, data.password_hash)) {
    await new Promise((r) => setTimeout(r, 700))
    return fail("현재 비밀번호가 올바르지 않습니다.", 400)
  }
  if (current === next) return fail("현재 비밀번호와 다른 비밀번호를 입력해 주세요.", 400)

  const { error } = await db
    .from(EXHIBITOR_TABLE)
    .update({
      password_hash: hashExhibitorPassword(next),
      password_changed_at: new Date().toISOString(),
    })
    .eq("brand_slug", slug)
  if (error) return fail(error.message, 500)
  return NextResponse.json({ ok: true })
}
