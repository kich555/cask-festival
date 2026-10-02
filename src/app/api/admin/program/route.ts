import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, unauthorized } from "@/lib/brandAdmin"
import { duplicateMessage, PROGRAM_TABLE, parseSessionInput } from "@/lib/programRecord"
import { revalidateProgram } from "@/lib/programServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()
  const { data, error } = await getSupabaseAdmin()
    .from(PROGRAM_TABLE)
    .select("*")
    .order("start_time")
  if (error) return fail(error.message, 500)
  return NextResponse.json({ ok: true, sessions: data ?? [] })
}

/** brand_logo 를 함께 보내면 참가업체 로고를 그대로 쓴다. */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const parsed = parseSessionInput(body)
  if (!parsed.ok) return fail(parsed.error, 400)

  const logo = typeof body?.brand_logo === "string" && body.brand_logo ? body.brand_logo : null
  const { data, error } = await getSupabaseAdmin()
    .from(PROGRAM_TABLE)
    .insert({ ...parsed.value, logo })
    .select()
    .single()
  if (error) return fail(duplicateMessage(error.message), 400)

  revalidateProgram()
  return NextResponse.json({ ok: true, session: data })
}
