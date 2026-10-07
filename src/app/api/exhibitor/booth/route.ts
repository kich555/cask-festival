import type { NextRequest } from "next/server"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import { fail, unauthorized, updateExhibitor } from "@/lib/exhibitorServer"

export const runtime = "nodejs"

const text = (v: unknown, max: number) => {
  const t = typeof v === "string" ? v.trim().slice(0, max) : ""
  return t === "" ? null : t
}

/** 부스 표기 정보 승인({action:"approve"}) 또는 수정 요청({action:"revise", ...}) */
export async function PUT(request: NextRequest) {
  const slug = await getExhibitorSlug()
  if (!slug) return unauthorized()
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return fail("잘못된 요청입니다.", 400)

  const now = new Date().toISOString()
  if (body.action === "approve") {
    return updateExhibitor(
      slug,
      {
        booth_status: "approved",
        booth_name_ko: null,
        booth_name_en: null,
        booth_note: null,
        booth_confirmed_at: now,
        booth_ack_at: null,
      },
      { kind: "booth_approve", data: {} },
    )
  }

  if (body.action === "revise") {
    const name_ko = text(body.name_ko, 100)
    if (!name_ko) return fail("업체명(한글)을 입력해 주세요.", 400)
    const name_en = text(body.name_en, 100)
    const note = text(body.note, 1000)
    return updateExhibitor(
      slug,
      {
        booth_status: "revised",
        booth_name_ko: name_ko,
        booth_name_en: name_en,
        booth_note: note,
        booth_confirmed_at: now,
        booth_ack_at: null,
      },
      { kind: "booth_revise", data: { name_ko, name_en, note } },
    )
  }

  return fail("잘못된 요청입니다.", 400)
}
