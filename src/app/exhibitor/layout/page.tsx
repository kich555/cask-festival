import FloorPlanContent from "@/components/2026/FloorPlanContent"
import { getFloorBrands, getFloorPlanVisibility, getLayout } from "@/lib/floorPlanServer"
import { getProgram } from "@/lib/programServer"
import { exhibitorMetadata, renderExhibitorTab } from "../exhibitorPage"
import { cardCls } from "../exhibitorParts"

export const metadata = exhibitorMetadata
export const dynamic = "force-dynamic"

export default async function ExhibitorLayoutPage() {
  // 참가사 페이지 게시 전에는 안내만 보여 준다 (admin 부스 배치도 > 참가사 페이지 게시)
  if (!(await getFloorPlanVisibility()).exhibitor) {
    return renderExhibitorTab("layout", () => (
      <section className={`${cardCls} text-center py-16 md:py-20`}>
        <h2 className="text-[18px] font-extrabold">부스 배치도</h2>
        <p className="text-[14px] text-[#666] mt-2">부스 배치도는 추후 업데이트 예정입니다.</p>
      </section>
    ))
  }
  const [layout, brands, days] = await Promise.all([getLayout(), getFloorBrands(), getProgram()])
  return renderExhibitorTab(
    "layout",
    (data) => (
      <section className="bg-white border border-black/10 rounded-lg overflow-hidden">
        <FloorPlanContent
          layout={layout}
          brands={brands}
          days={days}
          embedded
          initialBrand={data.state.brand_slug}
        />
      </section>
    ),
    { wide: true },
  )
}
