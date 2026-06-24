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
    introTitle: string
    introItems: { heading: string; body: string }[]
    valueTitle: string
    valueItems: { heading: string; body: string }[]
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
      introTitle: "캐스크가 빚어내는 풍미의 세계, 캐스크 카니발",
      introItems: [
        {
          heading: "숙성의 가치를 조명하는 전문 박람회",
          body: "캐스크 카니발은 한 잔의 음료가 완성되기까지 맛과 향을 결정짓는 핵심 요소, 캐스크의 가치를 조명하는 [[글로벌 숙성주 전문 박람회]]입니다. 숙성의 과정을 탐구하고 음료 본연의 철학을 공유합니다.",
        },
        {
          heading: "장르를 넘나드는 미각의 스펙트럼",
          body: "위스키, 럼, 브랜디, 프리미엄 숙성 소주는 물론 커피에 이르기까지, 캐스크 숙성을 거친 다양한 제품을 폭넓게 다룹니다. 각기 다른 재료가 캐스크라는 매개체를 통해 어떻게 새로운 풍미를 얻는지 한자리에서 선보입니다.",
        },
        {
          heading: "깊이를 더하는 연간 테마 큐레이션",
          body: "매년 단 하나의 캐스크를 메인 테마로 선정하여 심도 있는 큐레이션 전시를 진행합니다. 관람객은 오크통이 빚어내는 미세한 풍미의 변화를 하나의 테마 아래서 차분하고 몰입감 있게 경험할 수 있습니다.",
        },
      ],
      valueTitle: "캐스크 카니발만의 고유한 가치",
      valueItems: [
        {
          heading: "엄선된 글로벌 브랜드 라인업",
          body: "전 세계 5개국 이상, 30여 개 이상의 증류소와 독립병입자, [[프리미엄 바]]가 참여하여 수준 높은 라인업을 완성합니다. 정규 라인업과 더불어 현장에서만 공개되는 '캐스크 카니발 익스클루시브 보틀'을 통해 차별화된 시음 경험을 제공합니다.",
        },
        {
          heading: "경험의 깊이를 더하는 심화 프로그램",
          body: "각 브랜드를 대표하는 마스터 디스틸러와 업계 전문가들이 이끄는 프리미엄 마스터클래스를 진행합니다. 소수 정예 예약제로 운영되는 클래스와 테마별 테이스팅 세션을 통해 숙성주에 대한 식견을 나눕니다.",
        },
        {
          heading: "시간을 담아내는 캐스크 프로젝트",
          body: "국내 유수 증류소들과 동일한 캐스크로 숙성을 진행해 각기 다른 개성을 담아내는 협업을 선보입니다. 또한, 매년 행사에서 남은 원액을 하나의 오크통에 모아 솔레라 방식으로 보존하는 '인피니티 캐스크' 프로젝트를 통해 행사의 고유한 역사를 기록해 나갑니다.",
        },
        {
          heading: "업계와 애호가를 잇는 비즈니스 플랫폼",
          body: "고관여 애호가들에게는 새로운 미식의 발견을, 수입 및 유통사에게는 B2B 매칭 서비스를 통해 실질적인 비즈니스 교류의 기회를 제공합니다. 전문가와 대중이 자연스럽게 소통하는 스피릿 네트워크의 장을 마련합니다.",
        },
      ],
      recapEyebrow: "2025 Cask Carnival",
      recapTitle: "2025 RECAP",
      recapBody1: "다채로운 즐거움이 가득했던 Cask Carnival 2025의",
      recapBody2: "브랜드 라인업과 타임라인, 현장 사진을 확인해보세요!",
      recapBtn: "2025 다시보기 →",
      recapStats: [
        { value: "27", label: "참가 부스" },
        { value: "1,000+", label: "방문객" },
        { value: "16", label: "마스터클래스" },
        { value: "320+", label: "클래스 참관객" },
      ],
      forecastTitle: "2026, 이렇게 준비합니다",
      forecastStats: [
        { value: "60+", label: "참가 부스" },
        { value: "3,000+", label: "예상 방문객" },
        { value: "24", label: "마스터클래스" },
        { value: "700+", label: "예상 참관객" },
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
      introTitle: "Cask Carnival — the world of flavor the cask creates",
      introItems: [
        {
          heading: "A specialized expo spotlighting the value of maturation",
          body: "Cask Carnival is a [[global expo for matured drinks]] that spotlights the cask — the key element shaping the flavor and aroma of every glass. We explore the maturation process and share the philosophy behind each drink.",
        },
        {
          heading: "A spectrum of taste across genres",
          body: "From whisky, rum, brandy, and premium aged soju to coffee, we cover a wide range of products matured in casks — showing how different ingredients gain new flavors through the cask.",
        },
        {
          heading: "A yearly theme curation that adds depth",
          body: "Each year we select a single cask as the main theme for an in-depth curated exhibition. Visitors experience the subtle shifts in flavor the oak cask creates — calmly and immersively, under one theme.",
        },
      ],
      valueTitle: "What only Cask Carnival offers",
      valueItems: [
        {
          heading: "A curated global brand lineup",
          body: "More than 30 distilleries, independent bottlers, and premium bars from over 5 countries complete a high-caliber lineup. Beyond the regular lineup, 'Cask Carnival Exclusive Bottles' revealed only on-site offer a distinctive tasting experience.",
        },
        {
          heading: "In-depth programs that deepen the experience",
          body: "Premium master classes led by each brand's master distillers and industry experts. Through reservation-only, small-group classes and themed tasting sessions, we share deeper insight into matured drinks.",
        },
        {
          heading: "The Cask Project that captures time",
          body: "We collaborate with leading Korean distilleries, maturing in the same cask to capture distinct characters. And through the 'Infinity Cask' project — gathering each year's remaining spirits into one cask preserved solera-style — we record the event's own history.",
        },
        {
          heading: "A business platform linking industry and enthusiasts",
          body: "New culinary discoveries for dedicated enthusiasts, and B2B matching for importers and distributors — creating a spirits network where experts and the public connect naturally.",
        },
      ],
      recapEyebrow: "2025 Cask Carnival",
      recapTitle: "2025 RECAP",
      recapBody1: "Relive the highlights of Cask Carnival 2025 —",
      recapBody2: "explore the brand lineup, timeline, and event photos!",
      recapBtn: "Revisit 2025 →",
      recapStats: [
        { value: "27", label: "Booths" },
        { value: "1,000+", label: "Visitors" },
        { value: "16", label: "Master classes" },
        { value: "320+", label: "Class attendees" },
      ],
      forecastTitle: "Preparing for 2026",
      forecastStats: [
        { value: "60+", label: "Booths" },
        { value: "3,000+", label: "Expected visitors" },
        { value: "24", label: "Master classes" },
        { value: "700+", label: "Expected attendees" },
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
