// 개인정보처리방침 본문.
// 법적 효력의 기준은 한국어본이며, 영문은 참고용 번역이다.
// 내용 변경 시 EFFECTIVE_DATE 를 함께 갱신한다.

export const PRIVACY_EFFECTIVE_DATE = "2026년 9월 14일"
export const PRIVACY_EFFECTIVE_DATE_EN = "14 September 2026"

export interface PrivacySection {
  heading: string
  /** 문단. 배열 항목 하나가 <p> 하나가 된다. */
  paragraphs?: string[]
  /** 불릿 목록 */
  items?: string[]
  /** 표 (헤더 + 행) */
  table?: { head: string[]; rows: string[][] }
}

export const privacyContent: Record<
  "ko" | "en",
  { title: string; intro: string; sections: PrivacySection[]; footer: string }
> = {
  ko: {
    title: "개인정보처리방침",
    intro:
      "주식회사 위스키내비(이하 '회사')는 개인정보 보호법에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하게 처리할 수 있도록 다음과 같이 개인정보처리방침을 수립·공개합니다.",
    sections: [
      {
        heading: "1. 개인정보의 수집 항목 및 이용 목적",
        paragraphs: [
          "회사는 캐스크 카니발 2026 운영을 위해 아래와 같이 개인정보를 수집·이용합니다. 수집한 개인정보는 명시한 목적 외의 용도로 이용하지 않으며, 목적이 변경되는 경우에는 별도의 동의를 받습니다.",
        ],
        table: {
          head: ["구분", "수집 항목", "이용 목적"],
          rows: [
            [
              "바이어 등록",
              "이름, 직함, 회사명, 부서, 휴대폰 번호, 이메일, 회사 주소, 국가, 사업자등록번호, 매체명·매체 URL, 방문 이유, 명함 이미지",
              "바이어 자격 확인, 바이어 등록 및 행사 운영 안내",
            ],
            ["마케팅 수신 동의자", "이름, 이메일", "행사 및 프로그램 소식 안내"],
            ["자동 수집 항목", "접속 IP 주소, 접속 일시", "부정 이용 및 중복·자동 제출 방지"],
          ],
        },
      },
      {
        heading: "2. 개인정보의 보유 및 이용 기간",
        items: [
          "바이어 등록 정보: 행사 종료 후 6개월 이내 파기",
          "마케팅 수신 동의 정보: 동의 철회 시 또는 수집일로부터 2년 경과 시 파기",
          "관계 법령에 따라 보존이 필요한 경우 해당 법령이 정한 기간 동안 보관",
        ],
        paragraphs: [
          "보유 기간이 지나거나 처리 목적이 달성된 개인정보는 지체 없이 파기합니다. 전자적 파일은 복구할 수 없는 방법으로 영구 삭제하며, 출력물이 있는 경우 분쇄 또는 소각합니다.",
        ],
      },
      {
        heading: "3. 개인정보의 제3자 제공",
        paragraphs: [
          "회사는 정보주체의 개인정보를 제3자에게 제공하지 않습니다. 다만 정보주체가 별도로 동의한 경우 또는 법령에 따라 제공 의무가 있는 경우에 한하여 제공할 수 있습니다.",
        ],
      },
      {
        heading: "4. 개인정보 처리업무의 위탁",
        paragraphs: [
          "회사는 원활한 서비스 제공을 위해 아래와 같이 개인정보 처리업무를 위탁하고 있습니다. 위탁계약 시 개인정보 보호 관련 의무를 명확히 규정하고, 수탁자가 이를 준수하는지 감독합니다.",
        ],
        table: {
          head: ["수탁자", "위탁 업무", "보관 위치"],
          rows: [
            ["Supabase, Inc.", "신청 데이터 및 첨부 이미지 저장·관리", "대한민국(서울 리전)"],
            ["Vercel Inc.", "웹사이트 호스팅 및 운영", "해외 서버(글로벌 CDN)"],
          ],
        },
      },
      {
        heading: "5. 정보주체의 권리와 행사 방법",
        paragraphs: [
          "정보주체는 언제든지 다음의 권리를 행사할 수 있습니다. 권리 행사는 아래 연락처로 서면, 이메일 등을 통해 하실 수 있으며, 회사는 지체 없이 조치합니다.",
        ],
        items: [
          "개인정보 열람 요구",
          "오류 등이 있을 경우 정정 요구",
          "삭제 요구",
          "처리 정지 요구",
          "동의 철회",
        ],
      },
      {
        heading: "6. 개인정보의 안전성 확보 조치",
        items: [
          "개인정보에 접근할 수 있는 담당자를 최소한으로 제한하고, 접근 권한을 관리합니다.",
          "명함 등 첨부 이미지는 외부에 공개되지 않는 저장소에 보관하며, 관리자 인증을 거친 경우에만 일시적으로 열람할 수 있습니다.",
          "개인정보가 저장·전송되는 구간은 암호화된 통신(HTTPS)을 사용합니다.",
          "관리자 인증 정보는 별도로 안전하게 관리하며 주기적으로 점검합니다.",
        ],
      },
      {
        heading: "7. 개인정보 보호책임자",
        paragraphs: [
          "회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만 처리 및 피해 구제를 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.",
        ],
        items: [
          "개인정보 보호책임자: (주)위스키내비 캐스크 카니발 운영팀",
          "이메일: caskcarnival@whiskynavi.com",
          "전화: 010-3351-6231",
        ],
      },
      {
        heading: "8. 권익침해 구제방법",
        paragraphs: [
          "개인정보 침해로 인한 신고나 상담이 필요하신 경우 아래 기관에 문의하실 수 있습니다.",
        ],
        items: [
          "개인정보 침해신고센터 (privacy.kisa.or.kr / 국번없이 118)",
          "개인정보 분쟁조정위원회 (kopico.go.kr / 1833-6972)",
          "대검찰청 사이버수사과 (spo.go.kr / 국번없이 1301)",
          "경찰청 사이버수사국 (ecrm.police.go.kr / 국번없이 182)",
        ],
      },
      {
        heading: "9. 개인정보처리방침의 변경",
        paragraphs: [
          "이 개인정보처리방침은 시행일로부터 적용되며, 법령이나 방침에 따른 변경 내용의 추가·삭제 및 정정이 있는 경우에는 변경 사항의 시행 7일 전부터 본 페이지를 통하여 고지합니다.",
        ],
      },
    ],
    footer: `시행일: ${PRIVACY_EFFECTIVE_DATE}`,
  },
  en: {
    title: "Privacy Policy",
    intro:
      "Whiskynavi Co., Ltd. ('the Company') establishes and discloses this Privacy Policy in accordance with the Personal Information Protection Act of the Republic of Korea. The Korean version prevails in the event of any discrepancy.",
    sections: [
      {
        heading: "1. Personal data collected and purpose of use",
        paragraphs: [
          "The Company collects and uses personal data for the operation of CASK CARNIVAL 2026 as set out below. Data is not used for purposes other than those stated; separate consent is obtained if the purpose changes.",
        ],
        table: {
          head: ["Category", "Data collected", "Purpose"],
          rows: [
            [
              "Buyer registration",
              "Name, job title, company, department, mobile number, email, company address, country, business registration number, media outlet and URL, reason for attending, business card image",
              "Verifying buyer eligibility, registration and event communications",
            ],
            ["Marketing opt-in", "Name, email", "Event and programme news"],
            [
              "Automatically collected",
              "IP address, access time",
              "Preventing abuse and duplicate or automated submissions",
            ],
          ],
        },
      },
      {
        heading: "2. Retention period",
        items: [
          "Buyer registration data: destroyed within 6 months after the event",
          "Marketing opt-in data: destroyed upon withdrawal of consent, or 2 years after collection",
          "Where retention is required by law, data is kept for the period prescribed by that law",
        ],
        paragraphs: [
          "Personal data is destroyed without delay once the retention period expires or the purpose is fulfilled. Electronic files are permanently deleted by irrecoverable means; printed materials are shredded or incinerated.",
        ],
      },
      {
        heading: "3. Provision to third parties",
        paragraphs: [
          "The Company does not provide personal data to third parties, except where the data subject has given separate consent or where disclosure is required by law.",
        ],
      },
      {
        heading: "4. Outsourced processing",
        paragraphs: [
          "The Company outsources certain processing activities as set out below. Data protection obligations are stipulated in each contract and compliance is supervised.",
        ],
        table: {
          head: ["Processor", "Scope", "Storage location"],
          rows: [
            [
              "Supabase, Inc.",
              "Storage and management of application data and uploaded images",
              "Republic of Korea (Seoul region)",
            ],
            ["Vercel Inc.", "Website hosting and operation", "Overseas servers (global CDN)"],
          ],
        },
      },
      {
        heading: "5. Rights of the data subject",
        paragraphs: [
          "You may exercise the following rights at any time by contacting us in writing or by email. The Company will act without delay.",
        ],
        items: [
          "Request access to your personal data",
          "Request correction of errors",
          "Request deletion",
          "Request suspension of processing",
          "Withdraw consent",
        ],
      },
      {
        heading: "6. Security measures",
        items: [
          "Access to personal data is limited to the minimum number of staff, with managed access rights.",
          "Uploaded images such as business cards are stored in a non-public store and can be viewed only temporarily by authenticated administrators.",
          "Encrypted communication (HTTPS) is used wherever personal data is stored or transmitted.",
          "Administrator credentials are managed separately and reviewed periodically.",
        ],
      },
      {
        heading: "7. Privacy officer",
        items: [
          "Privacy officer: CASK CARNIVAL operations team, Whiskynavi Co., Ltd.",
          "Email: caskcarnival@whiskynavi.com",
          "Phone: +82 10-3351-6231",
        ],
      },
      {
        heading: "8. Remedies",
        paragraphs: [
          "For reports or consultation regarding personal data infringement, you may contact the following Korean authorities.",
        ],
        items: [
          "Privacy Infringement Report Centre (privacy.kisa.or.kr / 118)",
          "Personal Information Dispute Mediation Committee (kopico.go.kr / 1833-6972)",
          "Cyber Investigation Division, Supreme Prosecutors' Office (spo.go.kr / 1301)",
          "National Police Agency Cyber Bureau (ecrm.police.go.kr / 182)",
        ],
      },
      {
        heading: "9. Changes to this policy",
        paragraphs: [
          "This policy applies from its effective date. Any additions, deletions or corrections will be announced on this page at least 7 days before they take effect.",
        ],
      },
    ],
    footer: `Effective date: ${PRIVACY_EFFECTIVE_DATE_EN}`,
  },
}
