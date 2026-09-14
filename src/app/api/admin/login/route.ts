import { type NextRequest, NextResponse } from "next/server"
import {
  ADMIN_COOKIE,
  createSessionValue,
  SESSION_COOKIE_OPTIONS,
  verifyPassword,
} from "@/lib/adminAuth"

export const runtime = "nodejs"

/** 무차별 대입 완화: 실패 시 고정 지연 */
const FAIL_DELAY_MS = 700

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const password = typeof form.get("password") === "string" ? String(form.get("password")) : ""

  let ok = false
  try {
    ok = verifyPassword(password)
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : "설정 오류" },
      { status: 500 },
    )
  }

  if (!ok) {
    await new Promise((r) => setTimeout(r, FAIL_DELAY_MS))
    return NextResponse.json({ ok: false, error: "비밀번호가 올바르지 않습니다." }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, createSessionValue(), SESSION_COOKIE_OPTIONS)
  return response
}
