import { NextResponse } from "next/server"
import { EXHIBITOR_COOKIE, EXHIBITOR_COOKIE_OPTIONS } from "@/lib/exhibitorAuth"

export const runtime = "nodejs"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(EXHIBITOR_COOKIE, "", { ...EXHIBITOR_COOKIE_OPTIONS, maxAge: 0 })
  return response
}
