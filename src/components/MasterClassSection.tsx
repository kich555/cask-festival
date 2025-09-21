"use client"

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
        subtitle: "사쿠라오 증류소",
        imageSrc: "/class/sakurao-class.png",
        alt: "sakurao-class",
      },
      loungeB: {
        title: "Mark Abram",
        subtitle: "하트 브라더스",
        imageSrc: "/class/hart-brothers-class.png",
        alt: "hart-brothers-class",
      },
    },
    sun: {
      loungeA: {
        title: "황 종 민",
        subtitle: "화심주조",
        imageSrc: "/class/hwasim-class.png",
        alt: "hwasim-class",
      },
      loungeB: {
        title: "천 관 호",
        subtitle: "위스키내비",
        imageSrc: "/class/navi-class.png",
        alt: "navi-class",
      },
    },
  },
  {
    time: "12:30",
    sat: {
      loungeA: {
        title: "천 관 호",
        subtitle: "위스키내비",
        imageSrc: "/class/navi-class.png",
        alt: "navi-class",
      },
      loungeB: {
        title: "Jordan Edwards",
        subtitle: "캐스크 트레이드",
        imageSrc: "/class/cask-trade-class.png",
        alt: "cask-trade-class",
      },
    },
    sun: {
      loungeA: {
        title: "Odin Chou",
        subtitle: "더 위스키파인드",
        imageSrc: "/class/whisky-find-class.png",
        alt: "whisky-find-class",
      },
      loungeB: {
        title: "Yu Takeishi",
        subtitle: "쿠주 증류소",
        imageSrc: "/class/kuzu-class.png",
        alt: "kuzu-class",
      },
    },
  },
  {
    time: "15:30",
    sat: {
      loungeA: {
        title: "테이스팅 세션",
        subtitle: "캠벨타운 로호",
        imageSrc: "/class/loch-class.png",
        alt: "navi-class",
      },
      loungeB: {
        title: "오 수 민",
        subtitle: "화심주조",
        imageSrc: "/class/hwasim-class.png",
        alt: "hwasim-class",
      },
    },
    sun: {
      loungeA: {
        title: "Rex Weng",
        subtitle: "위스키에이지",
        imageSrc: "/class/whisky-age-class.png",
        alt: "whisky-age-class",
      },
      loungeB: {
        title: "Hiroyuki Doda",
        subtitle: "카메다 증류소",
        imageSrc: "/class/kameda-class.png",
        alt: "kameda-class",
      },
    },
  },
  {
    time: "17:30",
    sat: {
      loungeA: {
        title: "천 관 호",
        subtitle: "위스키내비",
        imageSrc: "/class/navi-class.png",
        alt: "navi-class",
      },
      loungeB: {
        title: "Kenny Macdonald",
        subtitle: "드램모어",
        imageSrc: "/class/dram-mor-class.png",
        alt: "dram-mor-class",
      },
    },
    sun: {
      loungeA: {
        title: "테이스팅 세션",
        subtitle: "캠벨타운 로호",
        imageSrc: "/class/loch-class.png",
        alt: "navi-class",
      },
      loungeB: {
        title: "Vincent Flint-Hill",
        subtitle: "더 싱글캐스크",
        imageSrc: "/class/single-cask-class.png",
        alt: "navi-class",
      },
    },
  },
]

export default function MasterClassSection() {
  return (
    <section id="master-class" className="px-4 md:px-8 mt-28">
      <div className="max-w-[1440px] mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-[28px] md:text-[36px] font-extrabold text-[#ea5514]">
            마스터클래스 & 테이스팅 세션
          </h2>
          <p className="text-[20px] md:text-[28px] font-medium">Master Class & Tasting Session</p>
        </div>

        <MasterClassDesktop sessions={SESSIONS} />
        <MasterClassMobile sessions={SESSIONS} />
      </div>
    </section>
  )
}
