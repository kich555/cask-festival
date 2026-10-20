import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import {
  CERT_BUCKET,
  CERT_MAX_BYTES,
  certPath,
  listCertificates,
} from "@/lib/exhibitorCertificates"
import { fail } from "@/lib/exhibitorServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

type Body = { login?: string; name?: string; size?: number }

/** 업체 참가확인서 목록 (?login=아이디) */
export async function GET(request: NextRequest) {
  if (!(await isAdminRequest())) return fail("권한이 없습니다.", 401)
  const login = request.nextUrl.searchParams.get("login") ?? ""
  return NextResponse.json({ ok: true, files: await listCertificates(login) })
}

/** 업로드 준비: 브라우저가 서명 URL 로 Storage 에 직접 올린다 (Vercel 본문 한도 회피). 같은 이름은 덮어쓴다. */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) return fail("권한이 없습니다.", 401)
  const body = ((await request.json().catch(() => null)) ?? {}) as Body
  const path = certPath(body.login ?? "", body.name ?? "")
  if (!path) return fail("파일 이름이 올바르지 않습니다.", 400)
  if (!body.size || body.size > CERT_MAX_BYTES)
    return fail("4MB 이하 파일만 올릴 수 있습니다.", 400)
  const { data, error } = await getSupabaseAdmin()
    .storage.from(CERT_BUCKET)
    .createSignedUploadUrl(path, { upsert: true })
  if (error || !data) return fail(error?.message ?? "업로드 준비 실패", 500)
  return NextResponse.json({ ok: true, signedUrl: data.signedUrl })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdminRequest())) return fail("권한이 없습니다.", 401)
  const body = ((await request.json().catch(() => null)) ?? {}) as Body
  const path = certPath(body.login ?? "", body.name ?? "")
  if (!path) return fail("파일 이름이 올바르지 않습니다.", 400)
  const { error } = await getSupabaseAdmin().storage.from(CERT_BUCKET).remove([path])
  if (error) return fail(error.message, 500)
  return NextResponse.json({ ok: true })
}
