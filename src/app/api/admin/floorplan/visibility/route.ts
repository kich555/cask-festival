import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, unauthorized } from "@/lib/brandAdmin"
import { setFloorPlanVisibility } from "@/lib/floorPlanServer"

export const runtime = "nodejs"

/** 부스 배치도 공개/비공개. body: { target: "site" | "exhibitor", public: boolean } */
export async function PUT(request: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()
  const body = (await request.json().catch(() => null)) as {
    target?: unknown
    public?: unknown
  } | null
  const target = body?.target ?? "site"
  if ((target !== "site" && target !== "exhibitor") || typeof body?.public !== "boolean")
    return fail("잘못된 요청입니다.", 400)
  const error = await setFloorPlanVisibility(target, body.public)
  if (error) return fail(`저장 실패: ${error}`, 500)
  return NextResponse.json({ ok: true, target, public: body.public })
}
