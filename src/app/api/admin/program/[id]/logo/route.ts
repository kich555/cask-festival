import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, removeLogoFile, unauthorized } from "@/lib/brandAdmin"
import { PROGRAM_TABLE } from "@/lib/programRecord"
import { revalidateProgram } from "@/lib/programServer"
import { BRAND_BUCKET, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ id: string }> }

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
}
const MAX_BYTES = 5 * 1024 * 1024

async function currentLogo(id: string) {
  return getSupabaseAdmin().from(PROGRAM_TABLE).select("logo").eq("id", id).single()
}

async function setLogo(id: string, logo: string | null) {
  return getSupabaseAdmin()
    .from(PROGRAM_TABLE)
    .update({ logo, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single()
}

/** 참가업체 로고와 같은 버킷에 program- 접두어로 올린다. */
export async function POST(request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { id } = await params

  const file = (await request.formData()).get("file")
  if (!(file instanceof File)) return fail("파일이 없습니다.", 400)
  const ext = EXT[file.type]
  if (!ext) return fail("PNG, JPG, WebP 파일만 올릴 수 있습니다.", 400)
  if (file.size > MAX_BYTES) return fail("5MB 이하 파일만 올릴 수 있습니다.", 400)

  const prev = await currentLogo(id)
  if (prev.error) return fail("세션을 찾을 수 없습니다.", 404)

  const db = getSupabaseAdmin()
  const objectPath = `program-${id}-${Date.now()}.${ext}`
  const { error: uploadError } = await db.storage
    .from(BRAND_BUCKET)
    .upload(objectPath, await file.arrayBuffer(), { contentType: file.type })
  if (uploadError) return fail(uploadError.message, 500)

  const url = db.storage.from(BRAND_BUCKET).getPublicUrl(objectPath).data.publicUrl
  const { data, error } = await setLogo(id, url)
  if (error) return fail(error.message, 500)

  if (prev.data.logo?.includes("/brand-logos/program-")) await removeLogoFile(prev.data.logo)
  revalidateProgram()
  return NextResponse.json({ ok: true, session: data })
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { id } = await params

  const prev = await currentLogo(id)
  if (prev.error) return fail("세션을 찾을 수 없습니다.", 404)

  const { data, error } = await setLogo(id, null)
  if (error) return fail(error.message, 500)

  if (prev.data.logo?.includes("/brand-logos/program-")) await removeLogoFile(prev.data.logo)
  revalidateProgram()
  return NextResponse.json({ ok: true, session: data })
}
