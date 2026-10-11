import { exhibitorMetadata, renderExhibitorTab } from "../exhibitorPage"
import { cardCls } from "../exhibitorParts"

export const metadata = exhibitorMetadata
export const dynamic = "force-dynamic"

export default function ExhibitorLayoutPage() {
  return renderExhibitorTab("layout", () => (
    <section className={`${cardCls} text-center py-16 md:py-20`}>
      <h2 className="text-[18px] font-extrabold">부스 배치도</h2>
      <p className="text-[14px] text-[#666] mt-2">
        부스 배치도는 확정 후 이곳에 업데이트될 예정입니다.
      </p>
    </section>
  ))
}
