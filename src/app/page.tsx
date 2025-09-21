/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
import CountdownSection from "@/components/CountdownSection"
import FloorPlanSection from "@/components/FloorPlanSection"
import FooterSection from "@/components/FooterSection"
import HeroSection from "@/components/HeroSection"
import LineupSection from "@/components/LineupSection"
import LoungeSection from "@/components/LoungeSection"
import MasterClassSection from "@/components/MasterClassSection"
import NavigationBar from "@/components/NavigationBar"

export default function CaskCarnival() {
  return (
    <div className="text-white min-h-screen bg-[#121212]">
      <NavigationBar />
      <main>
        <HeroSection />
        <CountdownSection />
        <LineupSection />
        <FloorPlanSection />
        <MasterClassSection />
        <LoungeSection />
        <FooterSection />
      </main>
    </div>
  )
}
