import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { APPLICATION_STATUSES, type ApplicationStatus, type BuyerApplication } from "@/lib/buyer"
import { BUYER_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

/** 신청 승인/반려 및 메모 저장 */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 })
  }

  const body = (await request.json()) as {
    id?: string
    status?: string
    admin_note?: string
  }

  if (!body.id) {
    return NextResponse.json({ ok: false, error: "id 가 필요합니다." }, { status: 400 })
  }

  const patch: Partial<BuyerApplication> = {}
  if (body.status !== undefined) {
    if (!APPLICATION_STATUSES.includes(body.status as ApplicationStatus)) {
      return NextResponse.json({ ok: false, error: "잘못된 상태값입니다." }, { status: 400 })
    }
    patch.status = body.status as ApplicationStatus
  }
  if (body.admin_note !== undefined) {
    patch.admin_note = body.admin_note.slice(0, 1000) || null
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ ok: false, error: "변경할 내용이 없습니다." }, { status: 400 })
  }

  const { error } = await getSupabaseAdmin().from(BUYER_TABLE).update(patch).eq("id", body.id)
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
