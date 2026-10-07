import crypto from "node:crypto"
import { type NextRequest, NextResponse } from "next/server"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import { PRODUCT_BUCKET, PRODUCT_PHOTO_MAX_BYTES, PRODUCT_PHOTO_TYPES } from "@/lib/exhibitorRecord"
import { fail, unauthorized } from "@/lib/exhibitorServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}

/**
 * 제품 사진 업로드 준비. Vercel 본문 한도(4.5MB)를 피하려고
 * 브라우저가 서명 URL 로 Supabase 에 직접 올린다.
 */
export async function POST(request: NextRequest) {
  const slug = await getExhibitorSlug()
  if (!slug) return unauthorized()
  const body = (await request.json().catch(() => null)) as { type?: string; size?: number } | null
  const type = body?.type ?? ""
  if (!PRODUCT_PHOTO_TYPES.includes(type))
    return fail("JPG, PNG, WebP 사진만 올릴 수 있습니다.", 400)
  if (!body?.size || body.size > PRODUCT_PHOTO_MAX_BYTES)
    return fail("사진은 10MB 이하만 올릴 수 있습니다.", 400)

  const path = `${slug}/${Date.now()}-${crypto.randomBytes(6).toString("hex")}.${EXT[type]}`
  const storage = getSupabaseAdmin().storage.from(PRODUCT_BUCKET)
  const { data, error } = await storage.createSignedUploadUrl(path)
  if (error || !data) return fail(error?.message ?? "업로드 준비에 실패했습니다.", 500)
  return NextResponse.json({
    ok: true,
    signedUrl: data.signedUrl,
    url: storage.getPublicUrl(path).data.publicUrl,
  })
}
