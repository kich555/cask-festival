// 바이어 신청 페이지 전용 문구.
// 폼 항목이 많아 content2026 과 분리한다. (content2026 인터페이스에 영향 없음)

export interface BuyerContent {
  title: string
  subtitle: string
  intro: string
  typeLegend: string
  types: { value: string; label: string; desc: string }[]
  sectionBasic: string
  sectionCompany: string
  sectionVisit: string
  sectionUpload: string
  sectionConsent: string
  labels: Record<string, string>
  hints: Record<string, string>
  days: { value: string; label: string }[]
  privacyTitle: string
  privacyBody: string
  privacyAgree: string
  marketingAgree: string
  submit: string
  submitting: string
  requiredMark: string
  successTitle: string
  successBody: string
  errorPrefix: string
  reviewNotice: string
}

export const buyerContent: Record<"ko" | "en", BuyerContent> = {
  ko: {
    title: "바이어 참관 신청",
    subtitle: "업계 관계자를 위한 사전 등록입니다.",
    intro:
      "캐스크 카니발 2026은 주류 업계 관계자를 위한 바이어 참관 등록을 운영합니다. 신청 내용은 담당자가 확인 후 개별 안내드리며, 자격 확인을 위해 명함 첨부가 필요합니다.",
    typeLegend: "참가 유형",
    types: [
      { value: "wholesale", label: "도매 / 유통", desc: "주류 도매·유통사" },
      { value: "retail", label: "소매 / 보틀샵", desc: "주류 판매점, 보틀샵" },
      { value: "bar", label: "바 / 레스토랑", desc: "바, 펍, 레스토랑" },
      { value: "importer", label: "수입사", desc: "주류 수입·소싱" },
      { value: "press", label: "프레스 / 미디어", desc: "매체, 기자, 콘텐츠 제작" },
    ],
    sectionBasic: "신청자 정보",
    sectionCompany: "회사 정보",
    sectionVisit: "참관 정보",
    sectionUpload: "자격 확인 서류",
    sectionConsent: "동의",
    labels: {
      name: "이름",
      job_title: "직함 / 직책",
      company: "회사(업체)명",
      department: "부서",
      phone: "휴대폰 번호",
      email: "이메일",
      company_address: "회사 주소",
      country: "국가",
      business_number: "사업자등록번호",
      categories: "취급 주종",
      outlets: "매장 / 거래처 수",
      media_name: "매체명",
      media_url: "매체 URL",
      press_purpose: "취재 목적",
      visit_day: "참관 희망일",
      companions: "동반 인원 수",
      business_card: "명함 이미지",
      document: "사업자등록증 / 기자증",
    },
    hints: {
      email: "회사 도메인 이메일을 권장합니다. 승인 안내를 이 주소로 보내드립니다.",
      country: "예: 대한민국, 일본",
      categories: "예: 위스키, 럼, 소주, 사케",
      outlets: "예: 3개 매장 / 거래처 40곳",
      press_purpose: "취재 계획과 보도 예정 시기를 간단히 적어주세요.",
      companions: "본인 제외 인원",
      business_card: "필수. JPG, PNG, WEBP, HEIC 또는 PDF · 10MB 이하",
      document: "선택. 첨부해 주시면 확인이 빠릅니다.",
    },
    days: [
      { value: "day1", label: "11월 21일 (토)" },
      { value: "day2", label: "11월 22일 (일)" },
      { value: "both", label: "양일 모두" },
    ],
    privacyTitle: "개인정보 수집·이용 동의 (필수)",
    privacyBody:
      "수집 항목: 이름, 직함, 회사명, 부서, 연락처, 이메일, 회사 주소, 국가, 명함 및 제출 서류 이미지\n수집 목적: 바이어 자격 확인, 참관 등록 및 행사 운영 안내\n보유 기간: 행사 종료 후 6개월 이내 파기\n동의를 거부하실 수 있으나, 이 경우 바이어 참관 신청이 제한됩니다.",
    privacyAgree: "위 내용에 동의합니다.",
    marketingAgree: "행사 및 프로그램 소식 수신에 동의합니다. (선택)",
    submit: "신청하기",
    submitting: "제출 중...",
    requiredMark: "필수",
    successTitle: "신청이 접수되었습니다.",
    successBody:
      "담당자가 제출해 주신 내용을 확인한 뒤 기재하신 이메일로 결과를 안내드립니다. 확인에는 영업일 기준 며칠이 소요될 수 있습니다.",
    errorPrefix: "신청을 완료하지 못했습니다",
    reviewNotice: "제출 후 담당자 확인 절차가 있습니다. 즉시 승인되지 않습니다.",
  },
  en: {
    title: "Buyer Registration",
    subtitle: "Pre-registration for trade professionals.",
    intro:
      "CASK CARNIVAL 2026 offers buyer registration for drinks-industry professionals. Each application is reviewed by our team, and a business card is required to verify eligibility.",
    typeLegend: "Category",
    types: [
      { value: "wholesale", label: "Wholesale", desc: "Wholesalers and distributors" },
      { value: "retail", label: "Retail / Bottle Shop", desc: "Liquor retailers, bottle shops" },
      { value: "bar", label: "Bar / Restaurant", desc: "Bars, pubs, restaurants" },
      { value: "importer", label: "Importer", desc: "Import and sourcing" },
      { value: "press", label: "Press / Media", desc: "Media, journalists, creators" },
    ],
    sectionBasic: "Applicant",
    sectionCompany: "Company",
    sectionVisit: "Visit",
    sectionUpload: "Verification documents",
    sectionConsent: "Consent",
    labels: {
      name: "Full name",
      job_title: "Job title",
      company: "Company",
      department: "Department",
      phone: "Mobile number",
      email: "Email",
      company_address: "Company address",
      country: "Country",
      business_number: "Business registration no.",
      categories: "Categories handled",
      outlets: "Outlets / accounts",
      media_name: "Media outlet",
      media_url: "Media URL",
      press_purpose: "Purpose of coverage",
      visit_day: "Preferred day",
      companions: "Additional attendees",
      business_card: "Business card",
      document: "Business licence / press ID",
    },
    hints: {
      email: "A company domain email is preferred. We will send the result to this address.",
      country: "e.g. South Korea, Japan",
      categories: "e.g. whisky, rum, soju, sake",
      outlets: "e.g. 3 stores / 40 accounts",
      press_purpose: "Briefly describe your coverage plan and expected publication date.",
      companions: "Excluding yourself",
      business_card: "Required. JPG, PNG, WEBP, HEIC or PDF · max 10MB",
      document: "Optional, but speeds up review.",
    },
    days: [
      { value: "day1", label: "Sat, Nov 21" },
      { value: "day2", label: "Sun, Nov 22" },
      { value: "both", label: "Both days" },
    ],
    privacyTitle: "Consent to collection and use of personal data (required)",
    privacyBody:
      "Data collected: name, job title, company, department, phone, email, company address, country, business card and submitted documents\nPurpose: verifying buyer eligibility, registration and event communications\nRetention: destroyed within 6 months after the event\nYou may decline, but buyer registration cannot be processed without consent.",
    privacyAgree: "I agree to the above.",
    marketingAgree: "I agree to receive event and programme news. (optional)",
    submit: "Submit application",
    submitting: "Submitting...",
    requiredMark: "required",
    successTitle: "Your application has been received.",
    successBody:
      "Our team will review your submission and send the result to the email address you provided. Review may take a few business days.",
    errorPrefix: "We could not submit your application",
    reviewNotice: "Applications are reviewed manually and are not approved instantly.",
  },
}
