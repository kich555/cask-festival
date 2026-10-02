import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { BUYER_BUCKET, BUYER_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

/** 신청 삭제 (테스트 데이터 정리용). 명함 사진도 함께 지운다. */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 })
  }

  const body = (await request.json().catch(() => null)) as { ids?: string[] } | null
  const ids = body?.ids ?? []
  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "대상이 없습니다." }, { status: 400 })
  }

  const db = getSupabaseAdmin()
  const { data, error } = await db
    .from(BUYER_TABLE)
    .delete()
    .in("id", ids)
    .select("business_card_path")
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  // 파일 삭제는 실패해도 본 작업은 막지 않는다.
  const paths = (data ?? []).map((r) => r.business_card_path).filter(Boolean)
  if (paths.length > 0) {
    const { error: removeError } = await db.storage.from(BUYER_BUCKET).remove(paths)
    if (removeError) console.error("[buyer] 명함 파일 삭제 실패:", removeError.message)
  }

  return NextResponse.json({ ok: true, deleted: data?.length ?? 0 })
}
