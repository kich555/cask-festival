/** biome-ignore-all lint/correctness/useUniqueElementIds: <explanation> */
import FooterSection from "@/components/FooterSection"
import ImageList from "@/components/ImageList"
import LineupSection from "@/components/LineupSection"
import MasterClassSection from "@/components/MasterClassSection"
import NavigationBar from "@/components/NavigationBar"

export default function CaskCarnival() {
  return (
    <div className="text-white min-h-screen bg-[#121212]">
      <NavigationBar />
      <main>
        <section id="gallery" className="px-4 md:px-40 py-4 bg-[#121212]/50 mt-[80px]">
          <h1 className="text-[28px] md:text-[36px] font-extrabold text-[#ea5514]">About 2025</h1>
          <ImageList />
        </section>
        <LineupSection />
        {/* <FloorPlanSection /> */}
        <MasterClassSection />
        {/* <LoungeSection /> */}
        <FooterSection />
      </main>
    </div>
  )
}
