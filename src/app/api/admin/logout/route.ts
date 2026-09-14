import { NextResponse } from "next/server"
import { ADMIN_COOKIE, SESSION_COOKIE_OPTIONS } from "@/lib/adminAuth"

export const runtime = "nodejs"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(ADMIN_COOKIE, "", { ...SESSION_COOKIE_OPTIONS, maxAge: 0 })
  return response
}
