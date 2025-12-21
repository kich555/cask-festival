export type Language = "ko" | "en"

export const translations = {
  ko: {
    // Navigation
    nav: {
      lineup: "참여업체",
      masterClass: "마스터클래스 & 테이스팅 세션",
      openMenu: "메뉴 열기",
    },

    // Hero Section
    hero: {
      coming: "CASK CARNIVAL IS COMING!",
      date: "2026. 11. 21(토) - 22(일)",
      venue: "SETEC",
      address: "서울 강남구 대치동 514 SETEC 3관 (학여울역)",
      check2025: "2025 행사",
      applyBooth: "부스 신청",
    },

    // Lineup Section
    lineup: {
      title: "참여 업체",
      subtitle: "LINE-UP",
      notice: "※ 참여 업체는 행사 준비 상황에 따라 변경될 수 있습니다",
      companies: {
        andongJinmaekSoju: "안동진맥소주",
        antInternational: "앤트 인터내셔널",
        caskTrade: "캐스크 트레이드",
        corevest: "코아베스트",
        craftbros: "크래프트브로스",
        danongbio: "다농바이오",
        distillersSelection: "디스틸러스셀렉트",
        dramMore: "드램모어",
        hartBrothers: "하트 브라더스",
        hwasimJujo: "화심주조",
        kamedaDistillery: "카메다 증류소",
        kimChangSoo: "김창수 위스키 증류소",
        koreaBourbonClub: "한국버번위스키클럽",
        kujuDistillery: "쿠주 증류소",
        metabev: "메타베브",
        onDistillery: "온 증류소",
        paulJohn: "폴존",
        pokenoDistillery: "포케노 증류소",
        sakuraoDistillery: "사쿠라오 증류소",
        theSinglecask: "더 싱글캐스크",
        theWhiskyfind: "더 위스키파인드",
        theWhiskytales: "더 위스키테일즈",
        weoak: "위오크",
        whiskyage: "위스키에이지",
        whiskynavi: "위스키내비",
        willowWood: "윌로우드",
      },
    },

    // Master Class Section
    masterClass: {
      title: "마스터클래스 & 테이스팅 세션",
      subtitle: "Master Class & Tasting Session",
      notice: "※ 세션 일정 및 내용은 행사 준비 상황에 따라 변경될 수 있습니다",
      sat: "11.01 (SAT)",
      sun: "11.02 (SUN)",
      loungeA: "Lounge A",
      loungeB: "Lounge B",
    },

    // Countdown Section
    countdown: {
      title: "CARNIVAL START IN",
      days: "DAYS",
      hours: "HOURS",
      minutes: "MINUTES",
      seconds: "SECONDS",
      buyTickets: "티켓 구매",
    },

    // Footer Section
    footer: {
      contact: "Contact",
      instagram: "Instagram",
      email: "Email",
      copyright: "Copyright © 2025 • Whiskynavi",
    },

    // 2025 Page
    page2025: {
      title: "About 2025",
    },
  },

  en: {
    // Navigation
    nav: {
      lineup: "Lineup",
      masterClass: "Master Class & Tasting Session",
      openMenu: "Open menu",
    },

    // Hero Section
    hero: {
      coming: "CASK CARNIVAL IS COMING!",
      date: "Nov 21 (Sat) - 22 (Sun), 2026",
      venue: "SETEC",
      address: "SETEC Hall 3, 3104, Nambusunhwan-ro, Gangnam-gu, Seoul",
      check2025: "Check 2025 Event",
      applyBooth: "Apply for a Booth",
    },

    // Lineup Section
    lineup: {
      title: "Lineup",
      subtitle: "LINE-UP",
      notice: "※ Lineup may change depending on event preparation",
      companies: {
        andongJinmaekSoju: "Andong Jinmaek Soju",
        antInternational: "ANT International",
        caskTrade: "Cask Trade",
        corevest: "Corevest",
        craftbros: "Craftbros",
        danongbio: "Danong Bio",
        distillersSelection: "Distillers Selection",
        dramMore: "Dram Mor",
        hartBrothers: "Hart Brothers",
        hwasimJujo: "Hwasim Jujo",
        kamedaDistillery: "Kameda Distillery",
        kimChangSoo: "Kim Chang Soo Distillery",
        koreaBourbonClub: "Korea Bourbon Club",
        kujuDistillery: "Kuju Distillery",
        metabev: "Metabev",
        onDistillery: "On Distillery",
        paulJohn: "Paul John",
        pokenoDistillery: "Pokeno Distillery",
        sakuraoDistillery: "Sakurao Distillery",
        theSinglecask: "The Single Cask",
        theWhiskyfind: "The Whisky Find",
        theWhiskytales: "The Whisky Tales",
        weoak: "Weoak",
        whiskyage: "Whisky Age",
        whiskynavi: "Whisky Navi",
        willowWood: "Willow Wood",
      },
    },

    // Master Class Section
    masterClass: {
      title: "Master Class & Tasting Session",
      subtitle: "Master Class & Tasting Session",
      notice: "※ Session schedule and content may change depending on event preparation",
      sat: "Nov 1 (SAT)",
      sun: "Nov 2 (SUN)",
      loungeA: "Lounge A",
      loungeB: "Lounge B",
    },

    // Countdown Section
    countdown: {
      title: "CARNIVAL START IN",
      days: "DAYS",
      hours: "HOURS",
      minutes: "MINUTES",
      seconds: "SECONDS",
      buyTickets: "Buy Tickets",
    },

    // Footer Section
    footer: {
      contact: "Contact",
      instagram: "Instagram",
      email: "Email",
      copyright: "Copyright © 2025 • Whiskynavi",
    },

    // 2025 Page
    page2025: {
      title: "About 2025",
    },
  },
} as const

export type Translations = (typeof translations)[Language]

