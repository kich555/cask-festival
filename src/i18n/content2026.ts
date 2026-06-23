// 2026 전용 콘텐츠/문구 (기존 translations.ts 와 분리 → /2025 영향 없음)
// 한국어 기본, 영어 전환. 컴포넌트에서 useContent2026() 로 사용.

export interface Content2026 {
  nav: { about: string; theme: string; program: string; register: string; openMenu: string; closeMenu: string }
  hero: { date: string; place: string; recap: string; booth: string; scroll: string }
  teaser: { catch: string; lead1: string; lead2: string; body1: string; body2: string; more: string }
  themeBand: { eyebrow: string; title: string; desc1: string; desc2: string; desc3: string; notesTitle: string }
  masterclass: { eyebrow: string; title: string; tbd: string }
  exhibitor: {
    eyebrow: string; title: string
    infoEvent: string; infoEventV: string; infoDate: string; infoDateV: string
    infoVenue: string; infoVenueV: string; infoHost: string; infoHostV: string
    catsTitle: string; moreBtn: string; applyBtn: string
  }
  footer: { brand: string; copy: string }
}

export const content2026: Record<"ko" | "en", Content2026> = {
  ko: {
    nav: {
      about: "행사 소개",
      theme: "테마 소개",
      program: "프로그램",
      register: "참가 업체 모집",
      openMenu: "메뉴 열기",
      closeMenu: "메뉴 닫기",
    },
    hero: {
      date: "11월 21일(토) — 22일(일)",
      place: "SETEC 제3전시실",
      recap: "2025 행사 RECAP",
      booth: "부스 참가 신청하기 (업체용)",
      scroll: "SCROLL",
    },
    teaser: {
      catch: "Global Cask-Aged Drinks Festa",
      lead1: "캐스크에 담긴 취향의 시작, 미학의 완성",
      lead2: "캐스크 숙성의 모든 것을 캐스크 카니발에서",
      body1: "대한민국에서 캐스크 숙성 제품과 콘텐츠를 가장 깊이 있게 경험할 수 있는 페스티벌, 캐스크 카니발.",
      body2: "국내외 메이커와 수입사, 독립병입자 등 각 분야의 전문가들과 함께 숙성주에 담긴 새로운 인사이트를 발견해 보세요.",
      more: "더 자세히 알아보기 →",
    },
    themeBand: {
      eyebrow: "2026 THEME",
      title: "Oloroso Sherry Cask",
      desc1: "올로로소 셰리는 스페인 안달루시아 헤레스(Jerez) 지방에서 생산되는 대표적인 드라이 셰리 와인입니다.",
      desc2: "플로르(효모막) 없이 공기에 직접 노출되는 산화 숙성 과정을 거치며, 호두와 건포도, 다크 초콜릿, 시나몬 등이 어우러진 복합적이고 깊은 풍미를 완성합니다.",
      desc3: "스페인어로 '향기로운'이라는 뜻을 가진 이름처럼 진하고 풍성한 아로마가 특징입니다.",
      notesTitle: "TASTING NOTES",
    },
    masterclass: {
      eyebrow: "Master Class & Tasting Session",
      title: "마스터클래스 & 테이스팅",
      tbd: "2026 마스터클래스 라인업 - 추후 공개 예정",
    },
    exhibitor: {
      eyebrow: "Exhibitor Recruitment",
      title: "참가 업체 모집",
      infoEvent: "행사명",
      infoEventV: "캐스크 카니발 2026",
      infoDate: "일정",
      infoDateV: "2026. 11. 21(토)~22(일)",
      infoVenue: "장소",
      infoVenueV: "SETEC 제3전시실",
      infoHost: "주관",
      infoHostV: "(주)위스키내비",
      catsTitle: "모집 카테고리",
      moreBtn: "부스 신청 자세히보기",
      applyBtn: "부스 신청하기 →",
    },
    footer: {
      brand: "Global Cask-Aged Drinks Festa · 2026 · Seoul",
      copy: "© 2026 Whiskynavi · caskcarnival@whiskynavi.com · @caskcarnival",
    },
  },
  en: {
    nav: {
      about: "About",
      theme: "Themes",
      program: "Program",
      register: "Register",
      openMenu: "Open menu",
      closeMenu: "Close menu",
    },
    hero: {
      date: "Sat, Nov 21 — Sun, Nov 22",
      place: "SETEC Hall 3",
      recap: "2025 Event Recap",
      booth: "Apply for a Booth (Exhibitors)",
      scroll: "SCROLL",
    },
    teaser: {
      catch: "Global Cask-Aged Drinks Festa",
      lead1: "Where taste begins and aesthetics are perfected.",
      lead2: "Everything about cask aging, at Cask Carnival.",
      body1: "Korea's most in-depth festival for cask-aged products and culture.",
      body2: "Discover new insights into matured spirits with makers, importers, and independent bottlers from home and abroad.",
      more: "Learn more →",
    },
    themeBand: {
      eyebrow: "2026 THEME",
      title: "Oloroso Sherry Cask",
      desc1: "Oloroso Sherry is a classic dry sherry from the Jerez region of Andalusia, Spain.",
      desc2: "It undergoes oxidative aging in direct contact with air, without a protective layer of flor, developing a deep, complex character of walnut, raisin, dark chocolate, and cinnamon.",
      desc3: "True to its name — Spanish for 'fragrant' — it offers a rich, full-bodied aroma.",
      notesTitle: "TASTING NOTES",
    },
    masterclass: {
      eyebrow: "Master Class & Tasting Session",
      title: "Master Class & Tasting",
      tbd: "2026 Master Class lineup — coming soon",
    },
    exhibitor: {
      eyebrow: "Exhibitor Recruitment",
      title: "Register",
      infoEvent: "Event",
      infoEventV: "Cask Carnival 2026",
      infoDate: "Date",
      infoDateV: "Nov 21 (Sat) – 22 (Sun), 2026",
      infoVenue: "Venue",
      infoVenueV: "SETEC Hall 3",
      infoHost: "Host",
      infoHostV: "Whiskynavi Inc.",
      catsTitle: "Recruiting Categories",
      moreBtn: "Booth Details",
      applyBtn: "Apply for a Booth →",
    },
    footer: {
      brand: "Global Cask-Aged Drinks Festa · 2026 · Seoul",
      copy: "© 2026 Whiskynavi · caskcarnival@whiskynavi.com · @caskcarnival",
    },
  },
}

// 언어별 외부 링크 (부스 신청 구글폼)
export const BOOTH_FORM_2026: Record<"ko" | "en", string> = {
  ko: "https://forms.gle/GmCXkarDNGzquj9a7",
  en: "https://forms.gle/cagUWjWVubs1VndY8",
}

// 언어별 브로슈어 PDF
export const BROCHURE_2026: Record<"ko" | "en", string> = {
  ko: "/2026/cask-carnival-2026-brochure-ko.pdf",
  en: "/2026/cask-carnival-2026-brochure-en.pdf",
}
