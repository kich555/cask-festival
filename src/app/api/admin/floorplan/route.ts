import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, unauthorized } from "@/lib/brandAdmin"
import { parseLayout } from "@/lib/floorPlan"
import { saveLayout } from "@/lib/floorPlanServer"

export const runtime = "nodejs"

/** 배치 전체를 한 번에 저장한다. body: { layout: { cols, rows, items } } */
export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()
  const body = (await request.json().catch(() => null)) as { layout?: unknown } | null
  const layout = parseLayout(body?.layout)
  if (!layout) return fail("잘못된 요청입니다.", 400)

  const error = await saveLayout(layout)
  if (error) return fail(`저장 실패: ${error}`, 500)
  return NextResponse.json({ ok: true, layout })
}
