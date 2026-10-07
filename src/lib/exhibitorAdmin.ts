import "server-only"
import {
  type BoothDefaults,
  EXHIBITOR_LOG_TABLE,
  EXHIBITOR_STATE_COLUMNS,
  EXHIBITOR_TABLE,
  type ExhibitorLogRow,
  type ExhibitorState,
} from "./exhibitorRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "./supabaseAdmin"

export type ExhibitorOverview = ExhibitorState & {
  defaults: BoothDefaults
  logs: ExhibitorLogRow[]
}

/** 계정이 있는 모든 업체 (수정 요청 → 미확인 → 승인 순, 같은 그룹은 이름순) */
export async function loadExhibitorOverview(): Promise<ExhibitorOverview[]> {
  const db = getSupabaseAdmin()
  const [accounts, brands, logs] = await Promise.all([
    db.from(EXHIBITOR_TABLE).select(EXHIBITOR_STATE_COLUMNS),
    db.from(BRAND_TABLE).select("slug,name_ko,name_en,booths"),
    db.from(EXHIBITOR_LOG_TABLE).select("*").order("created_at", { ascending: false }),
  ])
  if (accounts.error) throw accounts.error
  const logRows = (logs.data ?? []) as ExhibitorLogRow[]
  const bySlug = new Map((brands.data ?? []).map((b) => [b.slug, b]))
  const rank = (s: ExhibitorState["booth_status"]) => (s === "revised" ? 0 : s ? 2 : 1)
  return (accounts.data as unknown as ExhibitorState[])
    .map((a) => {
      const b = bySlug.get(a.brand_slug)
      return {
        ...a,
        logs: logRows.filter((l) => l.brand_slug === a.brand_slug),
        defaults: {
          name_ko: b?.name_ko ?? a.brand_slug,
          name_en: b?.name_en ?? null,
          booths: b?.booths ?? 1,
        },
      }
    })
    .sort(
      (a, b) =>
        rank(a.booth_status) - rank(b.booth_status) ||
        a.defaults.name_ko.localeCompare(b.defaults.name_ko, "ko"),
    )
}
