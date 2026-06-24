/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
import Nav2026 from "@/components/2026/Nav2026"
import FooterSection from "@/components/FooterSection"
import LineupSection from "@/components/LineupSection"
import MasterClassSection from "@/components/MasterClassSection"
import Page2025Content from "./Page2025Content"

export default function CaskCarnival() {
  return (
    <div className="text-white min-h-screen bg-[#121212]">
      <Nav2026 />
      <main>
        <Page2025Content />
        <LineupSection />
        {/* <FloorPlanSection /> */}
        <MasterClassSection />
        {/* <LoungeSection /> */}
        <FooterSection />
      </main>
    </div>
  )
}
