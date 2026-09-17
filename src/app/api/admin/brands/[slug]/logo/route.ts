import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, removeLogoFile, revalidateBrands, unauthorized } from "@/lib/brandAdmin"
import { BRAND_BUCKET, BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ slug: string }> }

const EXT: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
}
const MAX_BYTES = 5 * 1024 * 1024

async function currentLogo(slug: string) {
  return getSupabaseAdmin().from(BRAND_TABLE).select("logo").eq("slug", slug).single()
}

async function setLogo(slug: string, logo: string | null) {
  return getSupabaseAdmin()
    .from(BRAND_TABLE)
    .update({ logo, logo_bg: null, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select()
    .single()
}

/** 파일명에 시각을 넣어 CDN·next/image 캐시가 옛 로고를 보여주지 않게 한다. */
export async function POST(request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { slug } = await params

  const file = (await request.formData()).get("file")
  if (!(file instanceof File)) return fail("파일이 없습니다.", 400)
  const ext = EXT[file.type]
  if (!ext) return fail("PNG, JPG, WebP 파일만 올릴 수 있습니다.", 400)
  if (file.size > MAX_BYTES) return fail("5MB 이하 파일만 올릴 수 있습니다.", 400)

  const prev = await currentLogo(slug)
  if (prev.error) return fail("브랜드를 찾을 수 없습니다.", 404)

  const db = getSupabaseAdmin()
  const objectPath = `${slug}-${Date.now()}.${ext}`
  const { error: uploadError } = await db.storage
    .from(BRAND_BUCKET)
    .upload(objectPath, await file.arrayBuffer(), { contentType: file.type })
  if (uploadError) return fail(uploadError.message, 500)

  const url = db.storage.from(BRAND_BUCKET).getPublicUrl(objectPath).data.publicUrl
  const { data, error } = await setLogo(slug, url)
  if (error) return fail(error.message, 500)

  await removeLogoFile(prev.data.logo)
  revalidateBrands()
  return NextResponse.json({ ok: true, brand: data })
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { slug } = await params

  const prev = await currentLogo(slug)
  if (prev.error) return fail("브랜드를 찾을 수 없습니다.", 404)

  const { data, error } = await setLogo(slug, null)
  if (error) return fail(error.message, 500)

  await removeLogoFile(prev.data.logo)
  revalidateBrands()
  return NextResponse.json({ ok: true, brand: data })
}
