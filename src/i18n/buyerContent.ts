// 바이어 신청 페이지 전용 문구.
// 폼 항목이 많아 content2026 과 분리한다. (content2026 인터페이스에 영향 없음)

export interface Choice {
  value: string
  label: string
}

export interface BuyerContent {
  title: string
  subtitle: string
  intro: string[]
  pressNote: string

  ticketTitle: string
  ticketNote: string
  ticketRows: { label: string; was: string; now: string }[]

  sectionApplicant: string
  sectionVisitDay: string
  sectionBuyerType: string
  sectionReferral: string
  sectionPurpose: string
  sectionConsent: string

  labels: Record<string, string>
  otherPlaceholder: string

  days: Choice[]
  buyerTypes: Choice[]
  referrals: Choice[]
  purposes: Choice[]

  ageConfirm: string
  marketingAgree: string
  privacyTitle: string
  privacyBody: string
  privacyAgree: string
  privacyProcessor: string
  privacyLink: string

  submit: string
  submitting: string
  requiredMark: string
  optional: string
  successTitle: string
  successBody: string
  errorPrefix: string
}

export const buyerContent: Record<"ko" | "en", BuyerContent> = {
  ko: {
    title: "바이어 참관 신청",
    subtitle: "업계 관계자를 위한 사전 등록입니다.",
    intro: [
      "캐스크 카니발 2026은 주류 업계 관계자를 위한 바이어 참관 등록을 운영합니다.",
      "업계 관계자 확인을 위해 명함 첨부가 필요하며, 신청 내용 검토 후 담당자가 개별 연락드립니다.",
    ],
    pressNote:
      "＊ 프레스/미디어 담당자께서는 캐스크 카니발 공식 메일(caskcarnival@whiskynavi.com)로 별도 문의 부탁드립니다.",

    ticketTitle: "바이어 현장 구매 할인",
    ticketNote: "승인된 바이어는 현장에서 아래 할인가로 티켓을 구매해 입장하실 수 있습니다.",
    ticketRows: [{ label: "일일권", was: "60,000원", now: "50,000원" }],

    sectionApplicant: "1. 신청자 정보",
    sectionVisitDay: "2. 참관 희망일",
    sectionBuyerType: "3. 바이어 구분",
    sectionReferral: "4. 인지 경로",
    sectionPurpose: "5. 참관 목적",
    sectionConsent: "6. 확인 및 동의",

    labels: {
      name: "성명",
      company: "회사명",
      job_title: "직함 / 직책",
      phone: "연락처",
      email: "이메일",
      business_card: "명함 이미지",
    },
    otherPlaceholder: "직접 입력",

    days: [
      { value: "day1", label: "11월 21일 (토)" },
      { value: "day2", label: "11월 22일 (일)" },
      { value: "both", label: "양일" },
    ],
    buyerTypes: [
      { value: "import_export", label: "주류 수입/수출 종사자" },
      { value: "wholesale", label: "주류 도매/유통 종사자" },
      { value: "food_service", label: "레스토랑/바/외식업 종사자" },
      { value: "manufacturer", label: "주류 제조업 종사자" },
      { value: "distribution", label: "유통업계 종사자" },
      { value: "equipment", label: "관련 기기/설비 제조업 종사자" },
      { value: "other", label: "기타" },
    ],
    referrals: [
      { value: "sns", label: "SNS 홍보" },
      { value: "website", label: "홈페이지" },
      { value: "cafe_blog", label: "카페 / 블로그" },
      { value: "industry_site", label: "주류 업계 사이트" },
      { value: "word_of_mouth", label: "지인 권유" },
      { value: "invitation", label: "초청장" },
      { value: "search", label: "검색" },
      { value: "other", label: "기타" },
    ],
    purposes: [
      { value: "new_products", label: "신제품 정보 수집" },
      { value: "market_research", label: "시장 조사" },
      { value: "new_partners", label: "신규 거래처 확보" },
      { value: "tasting", label: "신제품 시음 / 시식" },
      { value: "program", label: "프로그램 참가" },
      { value: "other", label: "기타" },
    ],

    ageConfirm: "만 19세 이상입니다.",
    marketingAgree: "광고성 정보 수신에 동의합니다.",
    privacyTitle: "개인정보 수집·이용 동의",
    privacyBody:
      "수집 항목: 성명, 회사명, 직함, 연락처, 이메일, 명함 이미지\n수집 목적: 바이어 자격 확인, 참관 등록 및 행사 운영 안내\n보유 기간: 행사 종료 후 6개월 이내 파기\n동의를 거부하실 수 있으나, 이 경우 바이어 참관 신청이 제한됩니다.",
    privacyAgree: "개인정보 수집 및 이용에 동의합니다.",
    privacyProcessor:
      "제출하신 정보는 Supabase(서울 리전)에 위탁 보관되며, 제3자에게 제공되지 않습니다.",
    privacyLink: "개인정보처리방침 전문 보기",

    submit: "신청하기",
    submitting: "제출 중...",
    requiredMark: "필수",
    optional: "선택",
    successTitle: "신청이 접수되었습니다.",
    successBody:
      "담당자가 제출해 주신 내용을 확인한 뒤 기재하신 연락처로 개별 안내드립니다. 확인에는 영업일 기준 며칠이 소요될 수 있습니다.",
    errorPrefix: "신청을 완료하지 못했습니다",
  },

  en: {
    title: "Buyer Registration",
    subtitle: "Pre-registration for trade professionals.",
    intro: [
      "CASK CARNIVAL 2026 offers buyer registration for drinks-industry professionals.",
      "A business card is required to verify your industry credentials. Our team reviews each application and will contact you individually.",
    ],
    pressNote: "* Press and media enquiries: please contact caskcarnival@whiskynavi.com directly.",

    ticketTitle: "On-site buyer discount",
    ticketNote: "Approved buyers can purchase tickets on site at the discounted price below.",
    ticketRows: [{ label: "1-day", was: "KRW 60,000", now: "KRW 50,000" }],

    sectionApplicant: "1. Applicant",
    sectionVisitDay: "2. Preferred day",
    sectionBuyerType: "3. Buyer category",
    sectionReferral: "4. How you heard about us",
    sectionPurpose: "5. Purpose of visit",
    sectionConsent: "6. Confirmation and consent",

    labels: {
      name: "Full name",
      company: "Company",
      job_title: "Job title",
      phone: "Phone",
      email: "Email",
      business_card: "Business card",
    },
    otherPlaceholder: "Please specify",

    days: [
      { value: "day1", label: "Sat, 21 Nov" },
      { value: "day2", label: "Sun, 22 Nov" },
      { value: "both", label: "Both days" },
    ],
    buyerTypes: [
      { value: "import_export", label: "Import / export" },
      { value: "wholesale", label: "Wholesale / distribution" },
      { value: "food_service", label: "Restaurant / bar / food service" },
      { value: "manufacturer", label: "Beverage production" },
      { value: "distribution", label: "Retail distribution" },
      { value: "equipment", label: "Equipment / facilities" },
      { value: "other", label: "Other" },
    ],
    referrals: [
      { value: "sns", label: "Social media" },
      { value: "website", label: "Website" },
      { value: "cafe_blog", label: "Cafe / blog" },
      { value: "industry_site", label: "Industry site" },
      { value: "word_of_mouth", label: "Word of mouth" },
      { value: "invitation", label: "Invitation" },
      { value: "search", label: "Search" },
      { value: "other", label: "Other" },
    ],
    purposes: [
      { value: "new_products", label: "New product information" },
      { value: "market_research", label: "Market research" },
      { value: "new_partners", label: "Finding new partners" },
      { value: "tasting", label: "Tasting" },
      { value: "program", label: "Attending programmes" },
      { value: "other", label: "Other" },
    ],

    ageConfirm: "I am 19 years of age or older.",
    marketingAgree: "I agree to receive marketing communications.",
    privacyTitle: "Consent to collection and use of personal data",
    privacyBody:
      "Data collected: name, company, job title, phone, email, business card image\nPurpose: verifying buyer eligibility, registration and event communications\nRetention: destroyed within 6 months after the event\nYou may decline, but buyer registration cannot be processed without consent.",
    privacyAgree: "I consent to the collection and use of my personal data.",
    privacyProcessor:
      "Your data is stored with Supabase (Seoul region) as our processor and is not shared with third parties.",
    privacyLink: "Read the full privacy policy",

    submit: "Submit application",
    submitting: "Submitting...",
    requiredMark: "required",
    optional: "optional",
    successTitle: "Your application has been received.",
    successBody:
      "Our team will review your submission and contact you individually. Review may take a few business days.",
    errorPrefix: "We could not submit your application",
  },
}
