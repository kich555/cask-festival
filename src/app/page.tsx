import Footer2026 from "@/components/2026/Footer2026"
import Home2026 from "@/components/2026/Home2026"
import Nav2026 from "@/components/2026/Nav2026"
import { getProgram } from "@/lib/programServer"

// 프로그램 시간표 때문에 60초마다 갱신 (관리자 변경은 즉시 반영)
export const revalidate = 60

export default async function CaskCarnival2026() {
  const program = await getProgram()

  return (
    <div className="min-h-screen bg-white">
      <Nav2026 />
      <main>
        <Home2026 program={program} />
      </main>
      <Footer2026 />
    </div>
  )
}
