// 부스 배치도 저장소. 테이블 대신 Supabase Storage 비공개 버킷에 JSON 한 개로 둔다.
// 아직 저장한 적이 없거나 읽기에 실패하면 처음 도면을 옮긴 기본 배치를 쓴다.
import "server-only"
import { revalidatePath } from "next/cache"
import { DEFAULT_LAYOUT, type FloorBrand, type Layout, parseLayout } from "./floorPlan"
import { BRAND_TABLE, getSupabaseAdmin } from "./supabaseAdmin"

const BUCKET = "site-data"
const FILE = "floor-plan.json"
/** 공개 여부 (홈페이지·참가사 페이지 따로). 파일이 없거나 읽기 실패면 둘 다 비공개로 본다 */
const VISIBILITY_FILE = "floor-plan-visibility.json"

export type FloorPlanTarget = "site" | "exhibitor"
export type FloorPlanVisibility = Record<FloorPlanTarget, boolean>

export async function getFloorPlanVisibility(): Promise<FloorPlanVisibility> {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).download(VISIBILITY_FILE)
  if (error || !data) return { site: false, exhibitor: false }
  try {
    const v = JSON.parse(await data.text())
    // 예전 형식 { public } 은 홈페이지 공개 여부
    return { site: v?.public === true, exhibitor: v?.exhibitor === true }
  } catch {
    return { site: false, exhibitor: false }
  }
}

/** 홈페이지 공개 여부 */
export async function getFloorPlanPublic(): Promise<boolean> {
  return (await getFloorPlanVisibility()).site
}

export async function setFloorPlanVisibility(
  target: FloorPlanTarget,
  value: boolean,
): Promise<string | null> {
  const storage = getSupabaseAdmin().storage
  await storage.createBucket(BUCKET, { public: false }).catch(() => null)
  const now = await getFloorPlanVisibility()
  const next = { ...now, [target]: value }
  const body = new Blob([JSON.stringify({ public: next.site, exhibitor: next.exhibitor })], {
    type: "application/json",
  })
  const { error } = await storage
    .from(BUCKET)
    .upload(VISIBILITY_FILE, body, { upsert: true, contentType: "application/json" })
  if (error) return error.message
  revalidatePath("/floorplan")
  revalidatePath("/api/floorplan/visibility")
  return null
}

export async function getLayout(): Promise<Layout> {
  const { data, error } = await getSupabaseAdmin().storage.from(BUCKET).download(FILE)
  if (error || !data) return DEFAULT_LAYOUT
  try {
    return parseLayout(JSON.parse(await data.text())) ?? DEFAULT_LAYOUT
  } catch (e) {
    console.error("[floorplan] 배치 파일 읽기 실패, 기본 배치 사용:", e)
    return DEFAULT_LAYOUT
  }
}

/**
 * 홈페이지·참가사 페이지용: admin 전용(숨김) 항목을 뺀 배치.
 * walls 가 거짓이면 파티션(벽)도 뺀다 (홈페이지는 관람객용이라 벽을 보여 주지 않는다)
 */
export async function getPublicLayout({ walls = true } = {}): Promise<Layout> {
  const layout = await getLayout()
  return {
    ...layout,
    items: layout.items.filter((i) => !i.hidden && (walls || i.type !== "partition")),
  }
}

export async function saveLayout(layout: Layout): Promise<string | null> {
  const storage = getSupabaseAdmin().storage
  // 첫 저장 때 버킷을 만든다 (이미 있으면 에러를 무시)
  await storage.createBucket(BUCKET, { public: false }).catch(() => null)
  const body = new Blob([JSON.stringify(layout)], { type: "application/json" })
  const { error } = await storage
    .from(BUCKET)
    .upload(FILE, body, { upsert: true, contentType: "application/json" })
  if (error) return error.message
  revalidatePath("/floorplan")
  return null
}

/** 숨김 처리된 브랜드도 배정될 수 있어 전부 읽는다 (공개 페이지에선 링크만 막는다) */
export async function getFloorBrands(): Promise<FloorBrand[]> {
  const { data, error } = await getSupabaseAdmin()
    .from(BRAND_TABLE)
    .select("slug, name_ko, name_en, logo, logo_bg, visible")
    .order("name_ko")
  if (error) {
    console.error("[floorplan] 브랜드 조회 실패:", error.message)
    return []
  }
  return (data ?? []).map((b) => ({
    slug: b.slug,
    nameKo: b.name_ko ?? "",
    nameEn: b.name_en ?? "",
    logo: b.logo,
    logoBg: b.logo_bg,
    visible: b.visible,
  }))
}
