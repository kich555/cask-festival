// 캐스크 카니발 2026 프로그램 시간표. 모든 세션은 90분.

export type SessionKind = "masterclass" | "tasting" | "lecture"

export interface ProgramSession {
  hall: 1 | 2 | 3 | 4 | 5 | 6
  start: string // "HH:MM"
  kind: SessionKind
  nameKo: string // 브랜드명 (강연은 빈 값)
  nameEn: string
  logo?: string
  logoBg?: string
  logoWide?: boolean // 가로로 긴 로고는 칸을 넓혀 잘 보이게 한다
  speakerKo?: string // 강연자·강연 제목: 비워 두면 칸에 표시되지 않는다
  speakerEn?: string
  titleKo?: string
  titleEn?: string
}

export interface ProgramDay {
  id: "sat" | "sun"
  sessions: ProgramSession[]
}

export const SESSION_MINUTES = 90
export const HALLS = [1, 2, 3, 4, 5, 6] as const

// 강연자·제목이 정해지면 해당 세션에 아래처럼 필드를 추가하면 된다.
//   speakerKo: "홍길동", speakerEn: "Gildong Hong",
//   titleKo: "증류주의 패러다임", titleEn: "A New Paradigm of Spirits",
export const program2026: ProgramDay[] = [
  {
    id: "sat",
    sessions: [
      {
        hall: 1,
        start: "10:30",
        kind: "masterclass",
        nameKo: "캐스크 트레이드",
        nameEn: "Cask Trade",
        logo: "/brands/cask-trade.jpg",
        logoBg: "#2e172b",
      },
      {
        hall: 3,
        start: "10:30",
        kind: "masterclass",
        nameKo: "사쿠라오 증류소",
        nameEn: "Sakurao Distillery",
        logo: "/brands/sakurao-distillery.png",
      },
      {
        hall: 5,
        start: "10:30",
        kind: "masterclass",
        nameKo: "치프위스키",
        nameEn: "Chief Whisky",
        logo: "/program/chief-whisky.png",
      },
      {
        hall: 2,
        start: "12:00",
        kind: "masterclass",
        nameKo: "태평양조",
        nameEn: "Taepyung Brewing",
        logo: "/brands/taepyung-brewing.png",
      },
      {
        hall: 4,
        start: "12:00",
        kind: "masterclass",
        nameKo: "아일 오브 해리스",
        nameEn: "Isle of Harris",
        logo: "/brands/isle-of-harris.png",
        logoWide: true,
      },
      {
        hall: 6,
        start: "12:00",
        kind: "masterclass",
        nameKo: "위스키내비",
        nameEn: "WhiskyNavi",
        logo: "/program/whiskynavi.png",
      },
      {
        hall: 1,
        start: "13:30",
        kind: "masterclass",
        nameKo: "쿠주 증류소",
        nameEn: "Kuju Distillery",
        logo: "/brands/kuju-distillery.png",
      },
      {
        hall: 3,
        start: "13:30",
        kind: "masterclass",
        nameKo: "SMWS",
        nameEn: "SMWS",
        logo: "/brands/the-scotch-malt-whisky-society.png",
      },
      {
        hall: 5,
        start: "13:30",
        kind: "masterclass",
        nameKo: "갓코가와 증류소",
        nameEn: "Gakkogawa Distillery",
        logo: "/brands/gakkogawa-distillery.jpg",
      },
      {
        hall: 2,
        start: "15:00",
        kind: "masterclass",
        nameKo: "더 위스키파인드",
        nameEn: "The WhiskyFind",
        logo: "/brands/the-whiskyfind.jpg",
      },
      {
        hall: 4,
        start: "15:00",
        kind: "masterclass",
        nameKo: "더 싱글캐스크",
        nameEn: "The Single Cask",
        logo: "/brands/the-single-cask.jpg",
      },
      {
        hall: 6,
        start: "15:00",
        kind: "masterclass",
        nameKo: "마오웨이키",
        nameEn: "Maoweiki Distillery",
        logo: "/program/maoweiki.png",
      },
      {
        hall: 1,
        start: "16:30",
        kind: "masterclass",
        nameKo: "사부로마루 증류소",
        nameEn: "Saburomaru Distillery",
        logo: "/brands/saburomaru-distillery.png",
      },
      {
        hall: 3,
        start: "16:30",
        kind: "masterclass",
        nameKo: "한국버번위스키클럽",
        nameEn: "Korea Bourbon Whiskey Club",
        logo: "/brands/korea-bourbon-whisk-e-y-club.png",
      },
      {
        hall: 5,
        start: "16:30",
        kind: "lecture",
        nameKo: "",
        nameEn: "",
        speakerKo: "김태완 박사님",
        speakerEn: "Dr. Taewan Kim",
      },
    ],
  },
  {
    id: "sun",
    sessions: [
      {
        hall: 1,
        start: "11:30",
        kind: "masterclass",
        nameKo: "위스키에이지",
        nameEn: "WhiskyAGE",
        logo: "/brands/whiskyage.png",
      },
      {
        hall: 3,
        start: "11:30",
        kind: "masterclass",
        nameKo: "칸파이카이",
        nameEn: "Kanpaikai",
        logo: "/brands/kanpaikai.png",
        logoBg: "#000000",
      },
      {
        hall: 5,
        start: "11:30",
        kind: "masterclass",
        nameKo: "위스키내비",
        nameEn: "WhiskyNavi",
        logo: "/program/whiskynavi.png",
      },
      {
        hall: 2,
        start: "13:00",
        kind: "masterclass",
        nameKo: "고마가타케",
        nameEn: "Komagatake",
        logo: "/program/komagatake.png",
      },
      {
        hall: 4,
        start: "13:00",
        kind: "tasting",
        nameKo: "화심주조",
        nameEn: "HWASIMJUJO",
        logo: "/brands/hwasimjujo.png",
      },
      {
        hall: 6,
        start: "13:00",
        kind: "lecture",
        nameKo: "",
        nameEn: "",
        speakerKo: "문정훈 교수님",
        speakerEn: "Prof. Junghoon Moon",
      },
      {
        hall: 1,
        start: "14:30",
        kind: "masterclass",
        nameKo: "카메다 증류소",
        nameEn: "Kameda Distillery",
        logo: "/brands/kameda-distillery.png",
      },
      {
        hall: 3,
        start: "14:30",
        kind: "masterclass",
        nameKo: "한국 브랜디 협회",
        nameEn: "Korea Brandy Society",
        logo: "/brands/korea-brandy-society.jpg",
      },
      {
        hall: 5,
        start: "14:30",
        kind: "masterclass",
        nameKo: "티앤티 토야마",
        nameEn: "T&T Toyama",
        logo: "/program/t-t-toyama.png",
      },
      {
        hall: 2,
        start: "16:00",
        kind: "masterclass",
        nameKo: "스카웃드링크",
        nameEn: "Scout Drinks",
        logo: "/brands/scout-drinks.png",
      },
      {
        hall: 4,
        start: "16:00",
        kind: "masterclass",
        nameKo: "러더",
        nameEn: "Rudder",
        logo: "/brands/rudder-ltd.png",
        logoWide: true,
      },
      {
        hall: 6,
        start: "16:00",
        kind: "tasting",
        nameKo: "바 캠벨타운 로흐",
        nameEn: "Bar Campbelltoun Loch",
        logo: "/program/bar-campbelltoun-loch.png",
        logoWide: true,
      },
    ],
  },
]

export function toMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

export function fromMinutes(min: number): string {
  return `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`
}

export function endTime(start: string): string {
  return fromMinutes(toMinutes(start) + SESSION_MINUTES)
}
