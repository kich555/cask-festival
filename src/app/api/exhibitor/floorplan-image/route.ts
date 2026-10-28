import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import { fail, unauthorized } from "@/lib/exhibitorServer"
import { getFloorPlanVisibility } from "@/lib/floorPlanServer"
import { getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

const FILE = "floor-plan-image-kr.jpg"
const DOWNLOAD_NAME = "CC2026_부스배치도.jpg"

/** 참가사 페이지용 부스 배치도 이미지. 비공개 버킷에 두고, 참가사 게시 중일 때 로그인한 참가사(또는 관리자)에게만 내려준다. */
export async function GET(request: NextRequest) {
  const admin = await isAdminRequest()
  if (!admin) {
    if (!(await getExhibitorSlug())) return unauthorized()
    if (!(await getFloorPlanVisibility()).exhibitor) return fail("아직 게시되지 않았습니다.", 404)
  }
  const { data } = await getSupabaseAdmin().storage.from("site-data").download(FILE)
  if (!data) return fail("파일을 찾을 수 없습니다.", 404)
  const download = request.nextUrl.searchParams.has("download")
  return new NextResponse(data, {
    headers: {
      "Content-Type": "image/jpeg",
      ...(download && {
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(DOWNLOAD_NAME)}`,
      }),
      "Cache-Control": "private, max-age=300",
    },
  })
}
