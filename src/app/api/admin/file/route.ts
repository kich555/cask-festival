import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { BUYER_BUCKET, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const SIGNED_URL_TTL = 60 * 5 // 5분

/**
 * 업로드 파일은 비공개 버킷에 있다.
 * 관리자에게만 짧은 수명의 서명 URL을 발급해 리다이렉트한다.
 */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 })
  }

  const path = request.nextUrl.searchParams.get("path")
  if (!path || !path.startsWith("applications/")) {
    return NextResponse.json({ ok: false, error: "잘못된 경로입니다." }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .storage.from(BUYER_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL)

  if (error || !data) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? "파일을 찾을 수 없습니다." },
      { status: 404 },
    )
  }

  return NextResponse.redirect(data.signedUrl)
}
