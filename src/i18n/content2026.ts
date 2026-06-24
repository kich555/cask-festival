// 2026 전용 콘텐츠/문구 (기존 translations.ts 와 분리 → /2025 영향 없음)
// 한국어 기본, 영어 전환. 컴포넌트에서 useContent2026() 로 사용.

export interface Content2026 {
  nav: {
    about: string
    theme: string
    program: string
    register: string
    openMenu: string
    closeMenu: string
  }
  hero: { date: string; place: string; recap: string; booth: string; scroll: string }
  teaser: {
    catch: string
    lead1: string
    lead2: string
    body1: string
    body2: string
    more: string
  }
  themeBand: {
    eyebrow: string
    title: string
    desc1: string
    desc2: string
    desc3: string
    notesTitle: string
  }
  masterclass: { eyebrow: string; title: string; tbd: string }
  exhibitor: {
    eyebrow: string
    title: string
    infoEvent: string
    infoEventV: string
    infoDate: string
    infoDateV: string
    infoVenue: string
    infoVenueV: string
    infoHost: string
    infoHostV: string
    catsTitle: string
    moreBtn: string
    applyBtn: string
    ebTag: string
    ebTitle: string
    ebBody: string
    ebUpto: string
    ebOff: string
  }
  themeP: {
    title: string
    subtitle: string
    archiveEyebrow: string
    archiveTitle: string
    notesTitle: string
  }
  programP: {
    title: string
    subtitle: string
    comingEyebrow: string
    comingTitle: string
    comingBody: string
  }
  registerP: {
    title: string
    subtitle: string
    brochureBtn: string
    ctaTitle: string
    ctaHl: string
    applyBtn: string
    processEyebrow: string
    processTitle: string
    process: { n: string; title: string; desc: string }[]
    forecastEyebrow: string
    forecastTitle: string
    forecast: { big: string; title: string; desc: string }[]
    boothEyebrow: string
    boothTitle: string
    boothSize: string
    boothWas: string
    boothNow: string
    boothVat: string
    boothTag: string
    boothImgNote: string
    boothIncludes: { label: string; value: string }[]
    catsEyebrow: string
    catsTitle: string
    cats: { name: string; desc: string }[]
    contactNote: string
    contactOffice: string
  }
  footer: { brand: string; copy: string }
  aboutP: {
    title: string
    subtitle: string
    introTagline: string
    introBody1: string
    introBody2: string
    whyTitle: string
    why: { title: string; desc: string }[]
    recapEyebrow: string
    recapTitle: string
    recapBody1: string
    recapBody2: string
    recapBtn: string
    recapStats: { value: string; label: string }[]
    forecastTitle: string
    forecastStats: { value: string; label: string }[]
    overviewTitle: string
    rowName: string
    rowNameV: string
    rowTheme: string
    rowDate: string
    rowDateV: string
    rowVenue: string
    rowVenueV: string
    rowHost: string
    rowSns: string
  }
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
      body1:
        "대한민국에서 캐스크 숙성 제품과 콘텐츠를 가장 깊이 있게 경험할 수 있는 페스티벌, 캐스크 카니발.",
      body2:
        "국내외 메이커와 수입사, 독립병입자 등 각 분야의 전문가들과 함께 숙성주에 담긴 새로운 인사이트를 발견해 보세요.",
      more: "더 자세히 알아보기 →",
    },
    themeBand: {
      eyebrow: "2026 THEME",
      title: "Oloroso Sherry Cask",
      desc1:
        "올로로소 셰리는 스페인 안달루시아 헤레스(Jerez) 지방에서 생산되는 대표적인 드라이 셰리 와인입니다.",
      desc2:
        "플로르(효모막) 없이 공기에 직접 노출되는 산화 숙성 과정을 거치며, 호두와 건포도, 다크 초콜릿, 시나몬 등이 어우러진 복합적이고 깊은 풍미를 완성합니다.",
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
      ebTag: "EARLY BIRD 진행중",
      ebTitle: "지금 신청하면 부스비 할인 혜택",
      ebBody: "6월 30일까지 얼리버드 할인가로 참가 신청하실 수 있습니다.",
      ebUpto: "UP TO",
      ebOff: "20% OFF",
    },
    footer: {
      brand: "Global Cask-Aged Drinks Festa · 2026 · Seoul",
      copy: "© 2026 Whiskynavi · caskcarnival@whiskynavi.com · @caskcarnival",
    },
    aboutP: {
      title: "행사 소개",
      subtitle: "Global Cask-Aged Drinks Festa, Cask Carnival",
      introTagline: "오직 '캐스크'에 집중한\n단 하나의 글로벌 주류 페스티벌",
      introBody1:
        "캐스크 카니발은 위스키의 맛과 향을 70% 이상 좌우하는 핵심 요소, '오크통(Cask)'의 가치와 예술성을 조명하는 전문 주류 박람회입니다.",
      introBody2:
        "전 세계의 유명 증류소와 인디펜던트 보틀러, 프리미엄 바가 한자리에 모여 각자의 철학이 담긴 다채로운 숙성 원액을 선보입니다. 단순한 시음을 넘어, 캐스크가 빚어내는 풍미의 깊이와 그 뒤의 이야기를 함께 경험하는 자리입니다.",
      whyTitle: "왜 캐스크 카니발인가",
      why: [
        { title: "캐스크라는 단 하나의 주제", desc: "수많은 주류 행사 중 오직 '캐스크 숙성'에 집중합니다. 캐스크가 만들어내는 맛의 차이를 가장 깊이 있게 탐구할 수 있습니다." },
        { title: "글로벌 라인업", desc: "세계 각국의 증류소, 독립병입자(IB), 프리미엄 바가 참여해 국내에서 만나기 어려운 숙성 원액을 선보입니다." },
        { title: "심화된 프로그램", desc: "브랜드 관계자가 직접 이끄는 마스터클래스와 테마 캐스크 테이스팅 세션으로 한 단계 깊은 경험을 제공합니다." },
        { title: "검증된 무대", desc: "2025년 전 회차 티켓과 마스터클래스 전석 매진. 고관여 애호가와 업계 관계자가 모이는 신뢰받는 플랫폼입니다." },
      ],
      recapEyebrow: "2025 Cask Carnival",
      recapTitle: "2025 RECAP",
      recapBody1: "다채로운 즐거움이 가득했던 Cask Carnival 2025의",
      recapBody2: "브랜드 라인업과 타임라인, 현장 사진을 확인해보세요!",
      recapBtn: "2025 다시보기 →",
      recapStats: [
        { value: "27+", label: "참가 브랜드" },
        { value: "1,200+", label: "관람객" },
        { value: "100%", label: "티켓 매진" },
      ],
      forecastTitle: "2026, 이렇게 준비합니다",
      forecastStats: [
        { value: "50~60", label: "참가 브랜드" },
        { value: "3,000~4,000", label: "예상 방문객" },
        { value: "24회", label: "마스터클래스" },
      ],
      overviewTitle: "캐스크 카니발 2026 개요",
      rowName: "명칭",
      rowNameV: "캐스크 카니발 2026",
      rowTheme: "테마",
      rowDate: "일시",
      rowDateV: "2026년 11월 21일(토) ~ 11월 22일(일)",
      rowVenue: "장소",
      rowVenueV: "SETEC 제3전시실 / 서울특별시 강남구 남부순환로 3104",
      rowHost: "주최·주관",
      rowSns: "공식 SNS",
    },
    themeP: {
      title: "테마 소개",
      subtitle: "캐스크 카니발은 매년 하나의 캐스크를 '올해의 테마'로 선정해 깊이 있게 조명합니다.",
      archiveEyebrow: "Theme Archive",
      archiveTitle: "목록",
      notesTitle: "TASTING NOTES",
    },
    programP: {
      title: "프로그램",
      subtitle:
        "마스터클래스와 테이스팅 세션으로 구성된 캐스크 카니발 2026의 프로그램 일정을 안내합니다.",
      comingEyebrow: "Coming Soon",
      comingTitle: "2026 마스터클래스 라인업",
      comingBody: "추후 공개 예정",
    },
    registerP: {
      title: "참가 업체 모집",
      subtitle:
        "캐스크 카니발 2026과 함께할 브랜드를 모집합니다. 부스 신청 안내와 참가 혜택을 확인하세요.",
      brochureBtn: "행사 소개 자료 다운로드",
      ctaTitle: "지금 바로 캐스크 카니발 2026에 참여하세요!",
      ctaHl: "6월 30일까지 신청 및 입금 완료 시 부스비 할인",
      applyBtn: "부스 신청하기 →",
      processEyebrow: "Join Us in 4 Steps",
      processTitle: "참가 신청 절차",
      process: [
        { n: "01", title: "온라인 참가신청", desc: "구글폼을 통한 신청 접수" },
        { n: "02", title: "세금계산서 발행", desc: "부스비 납부" },
        { n: "03", title: "운영사무국 승인", desc: "접수 검토 및 승인" },
        { n: "04", title: "부스 운영", desc: "성공적인 비즈니스의 무대" },
      ],
      forecastEyebrow: "What to Expect",
      forecastTitle: "행사 전망",
      forecast: [
        { big: "60–70", title: "예상 참여 브랜드", desc: "국내외 숙성 관련 브랜드" },
        { big: "4,000+", title: "예상 방문객", desc: "고관여 위스키·스피릿 애호가" },
        { big: "24", title: "마스터클래스", desc: "약 700명 이상 참석 예정" },
      ],
      boothEyebrow: "What's Included",
      boothTitle: "부스 패키지",
      boothSize: "3m × 3m (9sqm)",
      boothWas: "정상가 ₩750,000",
      boothNow: "₩600,000",
      boothVat: "(VAT 별도)",
      boothTag: "EARLY BIRD DISCOUNT ~ 6월 30일",
      boothImgNote: "3m × 3m 부스 공간 및 1000×500×1000(mm) 테이블 제공",
      boothIncludes: [
        { label: "· 시음잔", value: "1,000ea" },
        { label: "· 생수", value: "부스 인원당 지급" },
        { label: "· 기본 세팅", value: "테이블 / 배너 각 1개" },
        { label: "· 주차권", value: "일 3시간 지원" },
      ],
      catsEyebrow: "Who Can Join",
      catsTitle: "참가 카테고리",
      cats: [
        { name: "주류", desc: "모든 종류의 캐스크 숙성 주류" },
        { name: "BAR & 독립병입", desc: "IB 브랜드 및 커스텀 캐스크 셀렉션 병입자" },
        { name: "주류 용품", desc: "글라스웨어, 코스터, 오프너, 전용 케이스, 행사 굿즈" },
        { name: "푸드", desc: "페어링용 다크 초콜릿, 건과일, 치즈, 하몽" },
        { name: "비즈니스", desc: "수입/도매사 및 주류 테크 기업" },
        { name: "미디어", desc: "위스키 커뮤니티, 전문 잡지 및 인플루언서" },
      ],
      contactNote: "* 기타 문의 사항이 있으시면 운영사무국으로 연락바랍니다.",
      contactOffice: "운영사무국",
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
      body2:
        "Discover new insights into matured spirits with makers, importers, and independent bottlers from home and abroad.",
      more: "Learn more →",
    },
    themeBand: {
      eyebrow: "2026 THEME",
      title: "Oloroso Sherry Cask",
      desc1: "Oloroso Sherry is a classic dry sherry from the Jerez region of Andalusia, Spain.",
      desc2:
        "It undergoes oxidative aging in direct contact with air, without a protective layer of flor, developing a deep, complex character of walnut, raisin, dark chocolate, and cinnamon.",
      desc3: "True to its name — Spanish for 'fragrant' — it offers a rich, full-bodied aroma.",
      notesTitle: "TASTING NOTES",
    },
    masterclass: {
      eyebrow: "Master Class & Tasting Session",
      title: "Master Class & Tasting Session",
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
      ebTag: "EARLY BIRD OPEN",
      ebTitle: "Apply now for a booth-fee discount",
      ebBody: "Early-bird pricing is available for applications through June 30.",
      ebUpto: "UP TO",
      ebOff: "20% OFF",
    },
    footer: {
      brand: "Global Cask-Aged Drinks Festa · 2026 · Seoul",
      copy: "© 2026 Whiskynavi · caskcarnival@whiskynavi.com · @caskcarnival",
    },
    aboutP: {
      title: "About",
      subtitle: "Global Cask-Aged Drinks Festa, Cask Carnival",
      introTagline: "The one global drinks festival\ndevoted entirely to the cask",
      introBody1:
        "Cask Carnival is a specialized drinks expo spotlighting the value and artistry of the oak cask — the single element that shapes over 70% of a whisky's flavor and aroma.",
      introBody2:
        "Renowned distilleries, independent bottlers, and premium bars from around the world gather to present matured spirits that embody their own philosophies. Beyond simple tasting, it is a place to experience the depth of flavor the cask creates — and the stories behind it.",
      whyTitle: "Why Cask Carnival",
      why: [
        { title: "A single focus: the cask", desc: "Among countless drinks events, we focus solely on cask maturation — the deepest way to explore the difference a cask makes." },
        { title: "A global lineup", desc: "Distilleries, independent bottlers (IB), and premium bars from across the world present matured spirits rarely found in Korea." },
        { title: "In-depth programs", desc: "Master classes led by the brands themselves and themed cask tasting sessions take the experience a step further." },
        { title: "A proven stage", desc: "In 2025, every ticket and master class sold out — a trusted platform where dedicated enthusiasts and industry professionals meet." },
      ],
      recapEyebrow: "2025 Cask Carnival",
      recapTitle: "2025 RECAP",
      recapBody1: "Relive the highlights of Cask Carnival 2025 —",
      recapBody2: "explore the brand lineup, timeline, and event photos!",
      recapBtn: "Revisit 2025 →",
      recapStats: [
        { value: "27+", label: "Exhibitors" },
        { value: "1,200+", label: "Visitors" },
        { value: "100%", label: "Tickets sold out" },
      ],
      forecastTitle: "Preparing for 2026",
      forecastStats: [
        { value: "50–60", label: "Exhibitors" },
        { value: "3,000–4,000", label: "Expected visitors" },
        { value: "24", label: "Master classes" },
      ],
      overviewTitle: "Cask Carnival 2026 Overview",
      rowName: "Event",
      rowNameV: "Cask Carnival 2026",
      rowTheme: "Theme",
      rowDate: "Dates",
      rowDateV: "Sat, Nov 21 – Sun, Nov 22, 2026",
      rowVenue: "Venue",
      rowVenueV: "SETEC Hall 3, 3104, Nambusunhwan-ro, Gangnam-gu, Seoul, Republic of Korea",
      rowHost: "Organizer",
      rowSns: "Official SNS",
    },
    themeP: {
      title: "Themes",
      subtitle:
        "Each year, Cask Carnival selects a single cask as its Theme of the Year and explores it in depth.",
      archiveEyebrow: "Theme Archive",
      archiveTitle: "Archive",
      notesTitle: "TASTING NOTES",
    },
    programP: {
      title: "Program",
      subtitle: "Explore the Cask Carnival 2026 schedule of master classes and tasting sessions.",
      comingEyebrow: "Coming Soon",
      comingTitle: "2026 Master Class Lineup",
      comingBody: "To be announced",
    },
    registerP: {
      title: "Register",
      subtitle:
        "We're inviting brands to join Cask Carnival 2026. Discover how to apply for a booth and the benefits of taking part.",
      brochureBtn: "Download Event Brochure",
      ctaTitle: "Join Cask Carnival 2026 today!",
      ctaHl: "Apply and complete payment by June 30 for a discounted booth fee",
      applyBtn: "Apply for a Booth →",
      processEyebrow: "Join Us in 4 Steps",
      processTitle: "How to Apply",
      process: [
        { n: "01", title: "Online Application", desc: "Apply via Google Form" },
        { n: "02", title: "Invoice Issued", desc: "Booth fee payment" },
        { n: "03", title: "Organizer Approval", desc: "Review & confirmation" },
        { n: "04", title: "Run Your Booth", desc: "Your stage for great business" },
      ],
      forecastEyebrow: "What to Expect",
      forecastTitle: "Event Forecast",
      forecast: [
        { big: "60–70", title: "Expected Brands", desc: "Cask-aged brands from Korea & abroad" },
        {
          big: "4,000+",
          title: "Expected Visitors",
          desc: "Dedicated whisky & spirits enthusiasts",
        },
        { big: "24", title: "Master Classes", desc: "700+ attendees expected" },
      ],
      boothEyebrow: "What's Included",
      boothTitle: "Booth Package",
      boothSize: "3m × 3m (9sqm)",
      boothWas: "Regular ₩750,000",
      boothNow: "₩600,000",
      boothVat: "(excl. VAT)",
      boothTag: "EARLY BIRD DISCOUNT ~ Jun 30",
      boothImgNote: "3m × 3m booth space with a 1000×500×1000(mm) table provided",
      boothIncludes: [
        { label: "· Tasting glasses", value: "1,000ea" },
        { label: "· Bottled water", value: "Per booth staff" },
        { label: "· Basic setup", value: "1 table / 1 banner" },
        { label: "· Parking pass", value: "3 hours per day" },
      ],
      catsEyebrow: "Who Can Join",
      catsTitle: "Exhibitor Categories",
      cats: [
        { name: "Spirits", desc: "All kinds of cask-aged spirits" },
        {
          name: "Bars & Independent Bottlers",
          desc: "IB brands and custom cask-selection bottlers",
        },
        { name: "Barware & Goods", desc: "Glassware, coasters, openers, cases, and event goods" },
        { name: "Food", desc: "Dark chocolate, dried fruit, cheese, and jamón for pairing" },
        { name: "Business", desc: "Importers, distributors, and drinks-tech companies" },
        { name: "Media", desc: "Whisky communities, trade magazines, and influencers" },
      ],
      contactNote: "* For any other inquiries, please contact the organizing office.",
      contactOffice: "Organizing Office",
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
