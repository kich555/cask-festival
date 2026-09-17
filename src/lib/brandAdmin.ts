import "server-only"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { logoPathFromUrl } from "./brandRecord"
import { BRAND_BUCKET, getSupabaseAdmin } from "./supabaseAdmin"

export function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status })
}

export const unauthorized = () => fail("권한이 없습니다.", 401)

/** 공개 참가업체 페이지를 즉시 다시 그리게 한다. */
export function revalidateBrands() {
  revalidatePath("/brands")
}

/** 버킷에 있는 로고 파일만 지운다. (실패해도 본 작업은 막지 않는다) */
export async function removeLogoFile(url: string | null) {
  const objectPath = logoPathFromUrl(url)
  if (!objectPath) return
  const { error } = await getSupabaseAdmin().storage.from(BRAND_BUCKET).remove([objectPath])
  if (error) console.error("[brands] 로고 파일 삭제 실패:", error.message)
}
