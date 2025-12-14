/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
import HeroSection from "@/components/HeroSection"
import NavigationBar from "@/components/NavigationBar"

export default function CaskCarnival() {
  return (
    <div className="text-white min-h-screen bg-[#121212]">
      <NavigationBar />
      <main>
        <HeroSection />
        {/* <CountdownSection /> */}
        {/* <LineupSection />
        <FloorPlanSection />
        <MasterClassSection /> */}
        {/* <LoungeSection /> */}
        {/* <FooterSection /> */}
      </main>
    </div>
  )
}
