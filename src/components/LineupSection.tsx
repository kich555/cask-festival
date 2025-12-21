"use client"

import CompanyCarousel from "@/components/CompanyCarousel"
import { useTranslation } from "@/i18n"
import { Suspense } from "react"

export interface Company {
  name: string
  image: string
}

type CompanyKey = keyof typeof import("@/i18n").translations.ko.lineup.companies

interface CompanyData {
  key: CompanyKey
  image: string
}

const companyData: CompanyData[] = [
  { key: "andongJinmaekSoju", image: "/lineup/andong-jinmaek-soju0.png" },
  { key: "antInternational", image: "/lineup/ant-international0.png" },
  { key: "caskTrade", image: "/lineup/cask-trade0.png" },
  { key: "corevest", image: "/lineup/corevest0.png" },
  { key: "craftbros", image: "/lineup/craftbros0.png" },
  { key: "danongbio", image: "/lineup/danongbio0.png" },
  { key: "distillersSelection", image: "/lineup/distillers-selection0.png" },
  { key: "dramMore", image: "/lineup/dram-more0.png" },
  { key: "hartBrothers", image: "/lineup/hart-brothers0.png" },
  { key: "hwasimJujo", image: "/lineup/hwasim-jujo0.png" },
  { key: "kamedaDistillery", image: "/lineup/kameda-distillery0.png" },
  { key: "kimChangSoo", image: "/lineup/kim-chang-soo0.png" },
  { key: "koreaBourbonClub", image: "/lineup/korea-bourbon-club0.png" },
  { key: "kujuDistillery", image: "/lineup/kuju-distillery0.png" },
  { key: "metabev", image: "/lineup/metabev0.png" },
  { key: "onDistillery", image: "/lineup/on-distillery0.png" },
  { key: "paulJohn", image: "/lineup/paul-john0.png" },
  { key: "pokenoDistillery", image: "/lineup/pokeno0.png" },
  { key: "sakuraoDistillery", image: "/lineup/sakurao0.png" },
  { key: "theSinglecask", image: "/lineup/the-singlecask0.png" },
  { key: "theWhiskyfind", image: "/lineup/the-whiskyfind0.png" },
  { key: "theWhiskytales", image: "/lineup/the-whiskytales0.png" },
  { key: "weoak", image: "/lineup/weoak0.png" },
  { key: "whiskyage", image: "/lineup/whiskyage0.png" },
  { key: "whiskynavi", image: "/lineup/whiskynavi0.png" },
  { key: "willowWood", image: "/lineup/willow-wood0.png" },
]

function LineupContent() {
  const { t } = useTranslation()

  const companies: Company[] = companyData.map((item) => ({
    name: t.lineup.companies[item.key],
    image: item.image,
  }))

  return (
    <section id="lineup" className="px-4 md:px-8 mt-[108px]">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#ea5514]">
            {t.lineup.title}
          </h2>
          <p className="text-[20px] md:text-[28px] font-medium">{t.lineup.subtitle}</p>
          <div className="mt-4 inline-block">
            <p className="text-[14px] md:text-[16px] text-amber-400/80 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2">
              {t.lineup.notice}
            </p>
          </div>
        </div>

        <CompanyCarousel companies={companies} />
      </div>
    </section>
  )
}

export default function LineupSection() {
  return (
    <Suspense fallback={null}>
      <LineupContent />
    </Suspense>
  )
}
