import type { Metadata } from "next"
import { getExhibitorSlug } from "@/lib/exhibitorAuth"
import { loadExhibitor } from "@/lib/exhibitorServer"
import ExhibitorForm from "./ExhibitorForm"
import ExhibitorLogin from "./ExhibitorLogin"

// 참가업체에게 링크로만 전달하는 페이지. 메뉴·사이트맵에 넣지 않고 검색 노출도 막는다.
export const metadata: Metadata = {
  title: "참가업체 전용 페이지",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function ExhibitorPage() {
  const slug = await getExhibitorSlug()
  const data = slug ? await loadExhibitor(slug) : null
  if (!data) return <ExhibitorLogin />
  return <ExhibitorForm {...data} />
}
