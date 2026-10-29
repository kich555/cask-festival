import FloorPlanContent from "@/components/2026/FloorPlanContent"
import { OFFICE_CONTACT } from "@/lib/exhibitorRecord"
import { getFloorBrands, getFloorPlanVisibility, getPublicLayout } from "@/lib/floorPlanServer"
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
  const [layout, brands, days] = await Promise.all([
    getPublicLayout(),
    getFloorBrands(),
    getProgram(),
  ])
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
        {/* 인쇄용 배치도 이미지 (비공개 버킷 → 로그인한 참가사에게만) */}
        <div className="border-t border-black/10 p-3 md:p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-extrabold">부스 배치도 이미지</h3>
            <a
              href="/api/exhibitor/floorplan-image?download"
              className="text-[13px] font-bold border border-black/15 rounded px-3 py-1.5 hover:bg-black/5"
            >
              이미지 저장
            </a>
          </div>
          {/* biome-ignore lint/performance/noImgElement: 로그인 확인 후 내려주는 비공개 이미지라 최적화 경로를 거치지 않는다 */}
          <img
            src="/api/exhibitor/floorplan-image"
            alt="캐스크 카니발 2026 부스 배치도"
            width={2602}
            height={1962}
            loading="lazy"
            className="w-full h-auto"
          />
        </div>
        <div className="border-t border-black/10 px-6 md:px-10 py-5 text-[13px] text-[#777] leading-relaxed text-center">
          <p>부스 위치 변경을 원하시면 운영사무국 공식 메일 혹은 연락처로 연락 부탁드립니다.</p>
          <p className="mt-1.5 text-[#555]">
            <a href={`tel:${OFFICE_CONTACT.phone.replace(/-/g, "")}`} className="hover:underline">
              {OFFICE_CONTACT.phone}
            </a>
            <span className="mx-2 text-black/20">|</span>
            <a href={`mailto:${OFFICE_CONTACT.email}`} className="hover:underline">
              {OFFICE_CONTACT.email}
            </a>
          </p>
        </div>
      </section>
    ),
    { wide: true },
  )
}
