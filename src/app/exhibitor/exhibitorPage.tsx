// /exhibitor 탭 페이지 공통 (서버): 로그인 확인 후 셸로 감싸고, 미로그인이면 로그인 화면

import type { Metadata } from "next"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import { loadExhibitor } from "@/lib/exhibitorServer"
import { getFloorPlanVisibility } from "@/lib/floorPlanServer"
import ExhibitorLogin from "./ExhibitorLogin"
import ExhibitorShell, { type ExhibitorTabKey } from "./ExhibitorShell"

// 참가업체에게 링크로만 전달하는 페이지. 메뉴·사이트맵에 넣지 않고 검색 노출도 막는다.
export const exhibitorMetadata: Metadata = {
  title: "참가업체 전용 페이지",
  robots: { index: false, follow: false },
}

type ExhibitorData = NonNullable<Awaited<ReturnType<typeof loadExhibitor>>>

export async function renderExhibitorTab(
  active: ExhibitorTabKey,
  content: (data: ExhibitorData) => React.ReactNode,
  opts: { wide?: boolean } = {},
) {
  const slug = await getExhibitorSlug()
  const data = slug ? await loadExhibitor(slug) : null
  if (!data) return <ExhibitorLogin />
  const layoutReady = (await getFloorPlanVisibility()).exhibitor
  return (
    <ExhibitorShell
      name={data.defaults.name_ko}
      passwordChanged={Boolean(data.state.password_changed_at)}
      active={active}
      wide={opts.wide}
      layoutReady={layoutReady}
    >
      {content(data)}
    </ExhibitorShell>
  )
}
