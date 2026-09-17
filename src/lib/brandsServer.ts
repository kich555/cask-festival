// 공개 페이지용 참가 업체 로더. Supabase 에서 노출 중인 업체만 읽고,
// 실패하면 배포 시점 JSON 으로 폴백해 페이지가 비지 않게 한다.
import "server-only"
import fallbackBrands from "@/content/brands2026.json"
import { type Brand, rowToBrand } from "./brandRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "./supabaseAdmin"

export async function getBrands(): Promise<Brand[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from(BRAND_TABLE)
      .select("*")
      .eq("visible", true)
      .order("sort_order")
    if (error) throw error
    return (data ?? []).map(rowToBrand)
  } catch (e) {
    console.error("[brands] Supabase 조회 실패, JSON 폴백 사용:", e)
    return fallbackBrands as Brand[]
  }
}
