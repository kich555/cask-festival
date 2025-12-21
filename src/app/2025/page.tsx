/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
import FooterSection from "@/components/FooterSection"
import LineupSection from "@/components/LineupSection"
import MasterClassSection from "@/components/MasterClassSection"
import NavigationBar from "@/components/NavigationBar"
import Page2025Content from "./Page2025Content"

export default function CaskCarnival() {
  return (
    <div className="text-white min-h-screen bg-[#121212]">
      <NavigationBar />
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
