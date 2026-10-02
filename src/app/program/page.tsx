import type { Metadata } from "next"
import Footer2026 from "@/components/2026/Footer2026"
import Nav2026 from "@/components/2026/Nav2026"
import ProgramContent from "@/components/2026/ProgramContent"
import { getProgram } from "@/lib/programServer"

export const metadata: Metadata = {
  title: "프로그램",
  description: "캐스크 카니발 2026 프로그램 — 마스터클래스·테이스팅 세션·강연 시간표.",
  openGraph: {
    title: "프로그램 | CASK CARNIVAL 2026",
    description: "마스터클래스 & 테이스팅 세션 일정.",
  },
}

// 관리자 변경은 revalidatePath 로 즉시 반영되고, 그 외에도 60초마다 갱신한다.
export const revalidate = 60

export default async function ProgramPage() {
  const days = await getProgram()

  return (
    <div className="min-h-screen bg-white pt-[88px] flex flex-col">
      <Nav2026 />
      <main className="flex-1 flex flex-col">
        <ProgramContent days={days} />
      </main>
      <Footer2026 />
    </div>
  )
}
