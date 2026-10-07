import { type NextRequest, NextResponse } from "next/server"
import {
  createExhibitorSession,
  EXHIBITOR_COOKIE,
  EXHIBITOR_COOKIE_OPTIONS,
  verifyExhibitorPassword,
} from "@/lib/exhibitorAuth"
import { EXHIBITOR_TABLE } from "@/lib/exhibitorRecord"
import { fail } from "@/lib/exhibitorServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const FAIL_DELAY_MS = 700

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const loginId = String(form.get("loginId") ?? "")
    .trim()
    .toLowerCase()
  const password = String(form.get("password") ?? "").trim()

  const { data } = await getSupabaseAdmin()
    .from(EXHIBITOR_TABLE)
    .select("brand_slug,password_hash")
    .eq("login_id", loginId)
    .maybeSingle()

  if (!data || !verifyExhibitorPassword(password, data.password_hash)) {
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS))
    return fail("아이디 또는 비밀번호가 올바르지 않습니다.", 401)
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(
    EXHIBITOR_COOKIE,
    createExhibitorSession(data.brand_slug),
    EXHIBITOR_COOKIE_OPTIONS,
  )
  return response
}
