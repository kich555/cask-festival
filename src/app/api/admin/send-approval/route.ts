import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import type { BuyerApplication } from "@/lib/buyer"
import { sendApprovalEmail } from "@/lib/mail"
import { BUYER_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"
export const maxDuration = 60

/** 한 번에 처리할 수 있는 최대 건수 (메일 서버 부하 및 타임아웃 방지) */
const MAX_BATCH = 50

/**
 * 승인 안내 메일 발송.
 * 승인 상태인 신청에만 보내며, 이미 보낸 건은 resend=true 일 때만 다시 보낸다.
 */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ ok: false, error: "권한이 없습니다." }, { status: 401 })
  }

  const body = (await request.json()) as { ids?: string[]; resend?: boolean }
  const ids = body.ids ?? []

  if (ids.length === 0) {
    return NextResponse.json({ ok: false, error: "대상이 없습니다." }, { status: 400 })
  }
  if (ids.length > MAX_BATCH) {
    return NextResponse.json(
      { ok: false, error: `한 번에 최대 ${MAX_BATCH}건까지 보낼 수 있습니다.` },
      { status: 400 },
    )
  }

  const sb = getSupabaseAdmin()
  const { data, error } = await sb.from(BUYER_TABLE).select("*").in("id", ids)
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  const rows = (data ?? []) as BuyerApplication[]
  const sent: string[] = []
  const skipped: { id: string; reason: string }[] = []
  const failed: { id: string; reason: string }[] = []

  // 메일 서버가 연속 발송을 거부하지 않도록 순차 처리한다.
  for (const app of rows) {
    if (app.status !== "approved") {
      skipped.push({ id: app.id, reason: "승인 상태가 아닙니다" })
      continue
    }
    if (app.approval_email_sent_at && !body.resend) {
      skipped.push({ id: app.id, reason: "이미 발송됨" })
      continue
    }

    try {
      await sendApprovalEmail(app)
      const now = new Date().toISOString()
      await sb.from(BUYER_TABLE).update({ approval_email_sent_at: now }).eq("id", app.id)
      sent.push(app.id)
    } catch (e) {
      console.error("[send-approval] failed", app.id, e)
      failed.push({ id: app.id, reason: e instanceof Error ? e.message : "발송 실패" })
    }
  }

  return NextResponse.json({ ok: true, sent, skipped, failed })
}
