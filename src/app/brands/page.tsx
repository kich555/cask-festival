import type { Metadata } from "next"
import BrandsContent from "@/components/2026/BrandsContent"
import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"
import { getBrands } from "@/lib/brandsServer"

export const metadata: Metadata = {
  title: "참가 업체",
  description: "캐스크 카니발 2026에 함께하는 참가 업체를 소개합니다.",
  openGraph: {
    title: "참가 업체 | CASK CARNIVAL 2026",
    description: "캐스크 카니발 2026에 함께하는 참가 업체를 소개합니다.",
  },
}

// 관리자 변경은 revalidatePath 로 즉시 반영되고, 그 외에도 60초마다 갱신한다.
export const revalidate = 60

export default async function BrandsPage() {
  const brands = await getBrands()

  return (
    <div className="min-h-screen bg-white pt-[88px] flex flex-col">
      <Nav2026 />
      <main className="flex-1">
        <BrandsContent brands={brands} />
      </main>
      <Footer2026 />
    </div>
  )
}
