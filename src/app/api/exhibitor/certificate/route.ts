import { type NextRequest, NextResponse } from "next/server"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import { downloadCertificate } from "@/lib/exhibitorCertificates"
import { fail, loadState, unauthorized } from "@/lib/exhibitorServer"

export const runtime = "nodejs"

/** 참가확인서 다운로드. 로그인한 업체 자기 폴더의 파일만 서버가 꺼내서 내려준다. */
export async function GET(request: NextRequest) {
  const slug = await getExhibitorSlug()
  if (!slug) return unauthorized()
  const state = await loadState(slug)
  if (!state) return unauthorized()

  const name = (request.nextUrl.searchParams.get("file") ?? "").normalize("NFC")
  const file = await downloadCertificate(state.login_id, name)
  if (!file) return fail("파일을 찾을 수 없습니다.", 404)
  return new NextResponse(file, {
    headers: {
      "Content-Type": file.type || "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(name)}`,
      "Cache-Control": "private, no-store",
    },
  })
}
