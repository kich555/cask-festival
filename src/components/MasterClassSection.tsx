"use client"

import { useTranslation } from "@/i18n"
import { Suspense } from "react"
import MasterClassDesktop from "./MasterClassDesktop"
import MasterClassMobile from "./MasterClassMobile"

export interface Session {
  title: string
  subtitle: string
  imageSrc: string
  alt?: string
}

export type Sessions = {
  time: string
  sat: {
    loungeA: Session
    loungeB: Session
  }
  sun: {
    loungeA: Session
    loungeB: Session
  }
}[]

const SESSIONS: Sessions = [
  {
    time: "10:30",
    sat: {
      loungeA: {
        title: "Hitomi Kato",
        subtitle: "Sakurao Distillery",
        imageSrc: "/class/sakurao-class.png",
        alt: "sakurao-class",
      },
      loungeB: {
        title: "Mark Abram",
        subtitle: "Hart Brothers",
        imageSrc: "/class/hart-brothers-class.png",
        alt: "hart-brothers-class",
      },
    },
    sun: {
      loungeA: {
        title: "Dongmin Hwang",
        subtitle: "Danong Bio",
        imageSrc: "/class/hwang_danong_bio.png",
        alt: "hwang_danong_bio",
      },
      loungeB: {
        title: "Kwanho Chun",
        subtitle: "WhiskyNavi",
        imageSrc: "/class/navi-class.png",
        alt: "navi-class",
      },
    },
  },
  {
    time: "12:30",
    sat: {
      loungeA: {
        title: "Nakamura Nobuyuki",
        subtitle: "Campbelltown Loch",
        imageSrc: "/class/roch-class.png",
        alt: "navi-class",
      },
      loungeB: {
        title: "Jordan Edwards",
        subtitle: "Cask Trade",
        imageSrc: "/class/cask-trade-class.png",
        alt: "cask-trade-class",
      },
    },
    sun: {
      loungeA: {
        title: "Odin Chou",
        subtitle: "The Whiskyfind",
        imageSrc: "/class/whisky-find-class.png",
        alt: "whisky-find-class",
      },
      loungeB: {
        title: "Yu Takeishi",
        subtitle: "KUJU Distillery",
        imageSrc: "/class/kuzu-class.png",
        alt: "kuzu-class",
      },
    },
  },
  {
    time: "15:30",
    sat: {
      loungeA: {
        title: "Tsuyoshi Kitakaji",
        subtitle: "Rudder LTD",
        imageSrc: "/class/rudder-class.png",
        alt: "navi-class",
      },
      loungeB: {
        title: "Soomin Oh",
        subtitle: "Hwasim Jujo",
        imageSrc: "/class/hwasim-class.png",
        alt: "hwasim-class",
      },
    },
    sun: {
      loungeA: {
        title: "Rex Weng",
        subtitle: "Whisky Age",
        imageSrc: "/class/whisky-age-class.png",
        alt: "whisky-age-class",
      },
      loungeB: {
        title: "Hiroyuki Doda",
        subtitle: "Kameda Distillery",
        imageSrc: "/class/kameda-class.png",
        alt: "kameda-class",
      },
    },
  },
  {
    time: "17:30",
    sat: {
      loungeA: {
        title: "Kwanho Chun",
        subtitle: "WhiskyNavi",
        imageSrc: "/class/navi-class.png",
        alt: "navi-class",
      },
      loungeB: {
        title: "Kenny Macdonald",
        subtitle: "Dram mor",
        imageSrc: "/class/dram-mor-class.png",
        alt: "dram-mor-class",
      },
    },
    sun: {
      loungeA: {
        title: "Vincent Flint-Hill",
        subtitle: "The Single Cask",
        imageSrc: "/class/single-cask-class.png",
        alt: "navi-class",
      },
      loungeB: {
        title: "Nakamura Nobuyuki",
        subtitle: "Campbelltown Loch",
        imageSrc: "/class/roch-class.png",
        alt: "navi-class",
      },
    },
  },
]

function MasterClassContent() {
  const { t } = useTranslation()

  return (
    <section id="master-class" className="px-4 md:px-8 mt-28">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#ea5514]">
            {t.masterClass.title}
          </h2>
          <p className="text-[20px] md:text-[28px] font-medium">{t.masterClass.subtitle}</p>
          <div className="mt-4 inline-block">
            <p className="text-[14px] md:text-[16px] text-amber-400/80 bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2">
              {t.masterClass.notice}
            </p>
          </div>
        </div>

        <MasterClassDesktop sessions={SESSIONS} />
        <MasterClassMobile />
      </div>
    </section>
  )
}

export default function MasterClassSection() {
  return (
    <Suspense fallback={null}>
      <MasterClassContent />
    </Suspense>
  )
}
