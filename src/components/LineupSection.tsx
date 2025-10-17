"use client"

import CompanyCarousel from "@/components/CompanyCarousel"

export interface Company {
  name: string
  image: string
}

const companies: Company[] = [
  { name: "안동 진맥소주", image: "/lineup/andong-jinmaek-soju0.png" },
  { name: "ANT 인터내셔널", image: "/lineup/ant-international0.png" },
  { name: "캐스크 트레이드", image: "/lineup/cask-trade0.png" },
  { name: "코어베스트", image: "/lineup/corevest0.png" },
  { name: "크래프트브로스", image: "/lineup/craftbros0.png" },
  { name: "단옹바이오", image: "/lineup/danongbio0.png" },
  { name: "디스틸러스 셀렉션", image: "/lineup/distillers-selection0.png" },
  { name: "드램모어", image: "/lineup/dram-more0.png" },
  { name: "하트 브라더스", image: "/lineup/hart-brothers0.png" },
  { name: "화심주조", image: "/lineup/hwasim-jujo0.png" },
  { name: "카메다 증류소", image: "/lineup/kameda-distillery0.png" },
  { name: "김창수", image: "/lineup/kim-chang-soo0.png" },
  { name: "코리아 버번 클럽", image: "/lineup/korea-bourbon-club0.png" },
  { name: "쿠주 증류소", image: "/lineup/kuju-distillery0.png" },
  { name: "메타베브", image: "/lineup/metabev0.png" },
  { name: "온 디스틸러리", image: "/lineup/on-distillery0.png" },
  { name: "폴 존", image: "/lineup/paul-john0.png" },
  { name: "포케노", image: "/lineup/pokeno0.png" },
  { name: "사쿠라오", image: "/lineup/sakurao0.png" },
  { name: "더 싱글캐스크", image: "/lineup/the-singlecask0.png" },
  { name: "더 위스키파인드", image: "/lineup/the-whiskyfind0.png" },
  { name: "더 위스키테일즈", image: "/lineup/the-whiskytales0.png" },
  { name: "위오크", image: "/lineup/weoak0.png" },
  { name: "위스키에이지", image: "/lineup/whiskyage0.png" },
  { name: "위스키나비", image: "/lineup/whiskynavi0.png" },
  { name: "윌로우 우드", image: "/lineup/willow-wood0.png" },
]

export default function LineupSection() {
  return (
    <section id="lineup" className="px-4 md:px-8 mt-[108px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#ea5514]">참여 업체</h2>
          <p className="text-[20px] md:text-[28px] font-medium">LINE-UP</p>
          <div className="mt-4 inline-block">
            <p className="text-[14px] md:text-[16px] text-amber-400/80 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2">
              ※ 참여 업체는 행사 준비 상황에 따라 변경될 수 있습니다
            </p>
          </div>
        </div>

        <CompanyCarousel companies={companies} />
      </div>
    </section>
  )
}
