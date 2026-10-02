import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, removeLogoFile, unauthorized } from "@/lib/brandAdmin"
import {
  duplicateMessage,
  PROGRAM_TABLE,
  type ProgramSessionRow,
  parseSessionInput,
} from "@/lib/programRecord"
import { revalidateProgram } from "@/lib/programServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { id } = await params

  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  const parsed = parseSessionInput(body)
  if (!parsed.ok) return fail(parsed.error, 400)

  const patch: Partial<ProgramSessionRow> = {
    ...parsed.value,
    updated_at: new Date().toISOString(),
  }
  // 참가업체에서 고른 로고로 바꿀 때만 logo 를 덮어쓴다.
  if (typeof body?.brand_logo === "string" && body.brand_logo) patch.logo = body.brand_logo

  const { data, error } = await getSupabaseAdmin()
    .from(PROGRAM_TABLE)
    .update(patch)
    .eq("id", id)
    .select()
    .single()
  if (error) return fail(duplicateMessage(error.message), 400)

  revalidateProgram()
  return NextResponse.json({ ok: true, session: data })
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { id } = await params

  const { data, error } = await getSupabaseAdmin()
    .from(PROGRAM_TABLE)
    .delete()
    .eq("id", id)
    .select("logo")
    .single()
  if (error) return fail(error.message, 500)

  // 프로그램 전용으로 올린 로고만 지운다 (참가업체 로고는 공유 중일 수 있음).
  if (data.logo?.includes("/brand-logos/program-")) await removeLogoFile(data.logo)
  revalidateProgram()
  return NextResponse.json({ ok: true })
}
