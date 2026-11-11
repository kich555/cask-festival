import type { Metadata } from "next"
import Image from "next/image"
import FloorPlanContent, { FloorPlanSoon } from "@/components/2026/FloorPlanContent"
import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"
import { isAdminRequest } from "@/lib/adminAuth"
import { getFloorBrands, getFloorPlanPublic, getPublicLayout } from "@/lib/floorPlanServer"
import { getProgram } from "@/lib/programServer"

const metadata: Metadata = {
  title: "부스 배치도",
  description: "캐스크 카니발 2026 부스 배치도 — 참가 업체 부스 위치 검색.",
  openGraph: {
    title: "부스 배치도 | CASK CARNIVAL 2026",
    description: "참가 업체 부스 위치 검색.",
  },
}

// 공개 전에는 검색에 노출하지 않는다
export async function generateMetadata(): Promise<Metadata> {
  if (await getFloorPlanPublic()) return metadata
  return { ...metadata, robots: { index: false, follow: false } }
}

// 관리자 변경은 revalidatePath 로 즉시 반영되고, 그 외에도 60초마다 갱신한다.
export const revalidate = 60

export default async function FloorPlanPage() {
  // 공개 전: 관리자만 실제 배치도를 미리 보고, 그 외에는 안내만 보여 준다
  if (!(await getFloorPlanPublic()) && !(await isAdminRequest())) {
    return (
      <div className="min-h-screen bg-[var(--c-bg)] pt-[88px] flex flex-col">
        <Nav2026 />
        <main className="flex-1 flex flex-col">
          <FloorPlanSoon />
        </main>
        <Footer2026 />
      </div>
    )
  }
  const [layout, brands, days] = await Promise.all([
    getPublicLayout({ tables: false }),
    getFloorBrands(),
    getProgram(),
  ])

  return (
    <div className="min-h-screen fp-theme pt-[88px] flex flex-col">
      <Nav2026 />
      <main className="flex-1 flex flex-col">
        <FloorPlanContent layout={layout} brands={brands} days={days} outline />
        {/* 인쇄용 배치도 이미지. 모바일은 화면이 좁아 읽기 어려우므로 데스크톱에서만 보여 준다 */}
        <section className="hidden lg:block w-full max-w-[1100px] mx-auto px-8 pt-8 pb-16">
          <Image
            src="/floorplan/cc2026-floor-plan.png"
            alt="캐스크 카니발 2026 부스 배치도"
            width={2240}
            height={2439}
            sizes="1100px"
            className="w-full h-auto"
          />
        </section>
      </main>
      <Footer2026 />
    </div>
  )
}
