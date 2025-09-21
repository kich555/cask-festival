import Image from "next/image"
import type { FC } from "react"

interface LoungeCardProps {
  lounge: string
  loungeImageSrc: string
  address: string
}
const LoungeCard: FC<LoungeCardProps> = ({ lounge, loungeImageSrc, address }) => {
  return (
    <div className="flex max-w-[400px] w-full flex-col items-center justify-center">
      <h3 className="text-[24px] md:text-[32px] font-bold text-center mb-1">{lounge}</h3>
      <Image src={loungeImageSrc} alt={lounge} width={400} height={320} className="mb-5" />
      <p className="text-[16px] md:text-[20px] text-center font-medium">{address}</p>
    </div>
  )
}

const LOUNGES: LoungeCardProps[] = [
  {
    lounge: "Lounge A",
    loungeImageSrc: "/lounge/lounge-a.png",
    address: "서울특별시 강남구 영동대로112길 38, NSC빌딩 1층 카페촉",
  },
  {
    lounge: "Lounge B",
    loungeImageSrc: "/lounge/lounge-b.png",
    address: "서울특별시 강남구 봉은사로112길 12, 1층 iL coffee",
  },
]

const LoungeSection = () => {
  return (
    <section id="lounge" className="px-4 md:px-8 mt-28">
      <div className="max-w-[1440px] mx-auto">
        <div className="flex justify-center gap-20">
          {LOUNGES.map((lounge) => (
            <LoungeCard key={lounge.lounge} {...lounge} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default LoungeSection
