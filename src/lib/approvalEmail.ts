// 승인 안내 메일 본문 생성 — 순수 함수 (서버 전용 의존성 없음).
// 발송은 mail.ts 가 담당하고, 이 파일은 내용만 만든다.
import type { BuyerApplication } from "./buyer"

export const EVENT = {
  name: "CASK CARNIVAL 2026",
  nameKo: "캐스크 카니발 2026",
  tagline: "Global Cask-Aged Drinks Festa",
  date: "2026년 11월 21일(토) ~ 11월 22일(일)",
  dateEn: "Saturday 21 – Sunday 22 November 2026",
  hours: "10:00 ~ 18:00",
  venue: "SETEC 제3전시실 (서울 강남구 남부순환로 3104)",
  venueEn: "SETEC Hall 3, 3104 Nambusunhwan-ro, Gangnam-gu, Seoul",
  host: "(주)위스키내비",
  hostEn: "Whiskynavi Co., Ltd.",
  contact: "caskcarnival@whiskynavi.com",
  site: "https://www.caskcarnival.com",
  instagram: "@caskcarnival",
}

const TICKET_KO = "일일권 50,000원 (정가 60,000원)"
const TICKET_EN = "1-day ticket KRW 50,000 (regular KRW 60,000)"

const GUIDE_KO = [
  "행사 당일 현장 등록 데스크에서 성함을 말씀해 주시면 확인 후 안내해 드립니다.",
  "현장 등록 데스크에서 신분증 대조가 이루어집니다. <strong>반드시 명함 정보와 동일한 신분증을 지참</strong>해 주세요.",
  `바이어 할인가로 티켓을 구매하실 수 있습니다. ${TICKET_KO}`,
]

const GUIDE_EN = [
  "Please give your name at the registration desk on the day of the event.",
  "Identity is verified at the desk. Please bring a photo ID matching the details on your business card.",
  `You may purchase a ticket at the buyer rate: ${TICKET_EN}`,
]

export function buildApprovalEmail(app: BuyerApplication) {
  const subject = `[${EVENT.name}] 바이어 등록 승인 안내 / Buyer Registration Approved`

  const text = [
    `${app.name}님께,`,
    "",
    `안녕하세요. ${EVENT.nameKo} 사무국입니다.`,
    "",
    "먼저 바이어 등록에 관심을 가져주셔서 진심으로 감사드립니다.",
    "제출해 주신 내용을 검토한 결과, 귀하의 바이어 등록이 승인되었음을 안내드립니다.",
    "",
    "─────────────────────────",
    "■ 행사 개요",
    `  행사명   ${EVENT.nameKo}`,
    `  일정     ${EVENT.date}`,
    `  시간     ${EVENT.hours}`,
    `  장소     ${EVENT.venue}`,
    `  주최     ${EVENT.host}`,
    "",
    "■ 신청 내역",
    `  성함     ${app.name}`,
    `  소속     ${app.company}`,
    `  방문일   ${visitDayKo(app.visit_day)}`,
    "",
    "■ 현장 안내",
    ...GUIDE_KO.map((line) => `  · ${stripTags(line)}`),
    "─────────────────────────",
    "",
    "행사 관련 문의는 본 메일 주소로 회신해 주시기 바랍니다.",
    "현장에서 뵙겠습니다. 감사합니다.",
    "",
    `${EVENT.nameKo} 사무국`,
    `${EVENT.host}`,
    `${EVENT.contact}`,
    `${EVENT.site}`,
    "",
    "",
    "────────────────────────────────────────",
    "",
    `Dear ${app.name},`,
    "",
    `Thank you for registering as a buyer for ${EVENT.name}.`,
    "We are pleased to confirm that your application has been approved.",
    "",
    "■ Event",
    `  Date    ${EVENT.dateEn}`,
    `  Hours   ${EVENT.hours}`,
    `  Venue   ${EVENT.venueEn}`,
    `  Host    ${EVENT.hostEn}`,
    "",
    "■ On-site",
    ...GUIDE_EN.map((line) => `  · ${line}`),
    "",
    "We look forward to welcoming you.",
    "",
    `${EVENT.name} Secretariat`,
    `${EVENT.contact}`,
  ].join("\n")

  const html = `<!doctype html>
<html lang="ko">
<body style="margin:0;padding:32px 16px;background:#f2f0f0;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
    <tr><td align="center">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;border-collapse:collapse;background:#ffffff;border:1px solid rgba(0,0,0,0.08);">

        <tr>
          <td style="background:#1a1a1a;padding:30px 36px;">
            <div style="color:#ffffff;font-size:19px;font-weight:800;letter-spacing:0.06em;">${EVENT.name}</div>
            <div style="color:rgba(255,255,255,0.5);font-size:11px;margin-top:6px;letter-spacing:0.04em;">${EVENT.tagline}</div>
          </td>
        </tr>

        <tr>
          <td style="padding:36px 36px 8px;">
            <div style="display:inline-block;background:#7d0b1c;color:#ffffff;font-size:12px;font-weight:700;padding:6px 14px;letter-spacing:0.04em;">바이어 등록 승인</div>

            <p style="margin:22px 0 0;font-size:16px;font-weight:700;line-height:1.6;">${app.name} 님께</p>

            <p style="margin:16px 0 0;font-size:14px;line-height:1.85;color:#444;">
              안녕하세요. ${EVENT.nameKo} 사무국입니다.<br>
              바이어 등록에 관심을 가져주셔서 진심으로 감사드립니다.<br>
              제출해 주신 내용을 검토한 결과, <strong style="color:#7d0b1c;">귀하의 바이어 등록이 승인</strong>되었음을 안내드립니다.
            </p>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 36px 0;">
            <div style="font-size:12px;font-weight:800;letter-spacing:0.08em;color:#7d0b1c;padding-bottom:10px;border-bottom:2px solid #1a1a1a;">행사 개요</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
              ${infoRow("행사명", EVENT.nameKo)}
              ${infoRow("일정", EVENT.date)}
              ${infoRow("시간", EVENT.hours)}
              ${infoRow("장소", EVENT.venue)}
              ${infoRow("주최", EVENT.host)}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 36px 0;">
            <div style="font-size:12px;font-weight:800;letter-spacing:0.08em;color:#7d0b1c;padding-bottom:10px;border-bottom:2px solid #1a1a1a;">신청 내역</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:14px;">
              ${infoRow("성함", app.name)}
              ${infoRow("소속", app.company)}
              ${infoRow("방문일", visitDayKo(app.visit_day))}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:28px 36px 0;">
            <div style="font-size:12px;font-weight:800;letter-spacing:0.08em;color:#7d0b1c;padding-bottom:10px;border-bottom:2px solid #1a1a1a;">현장 안내</div>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
              ${GUIDE_KO.map(guideRow).join("")}
            </table>
          </td>
        </tr>

        <tr>
          <td style="padding:30px 36px 0;">
            <p style="margin:0;font-size:14px;line-height:1.85;color:#444;">
              행사 관련 문의는 본 메일 주소로 회신해 주시기 바랍니다.<br>
              현장에서 뵙겠습니다. 감사합니다.
            </p>
            <p style="margin:20px 0 0;font-size:13px;line-height:1.8;color:#1a1a1a;">
              <strong>${EVENT.nameKo} 사무국</strong><br>
              <span style="color:#777;">${EVENT.host}</span><br>
              <a href="mailto:${EVENT.contact}" style="color:#7d0b1c;text-decoration:none;">${EVENT.contact}</a><br>
              <a href="${EVENT.site}" style="color:#7d0b1c;text-decoration:none;">${EVENT.site}</a>
            </p>
          </td>
        </tr>

        <tr><td style="padding:28px 36px 0;"><div style="border-top:1px solid rgba(0,0,0,0.1);"></div></td></tr>

        <tr>
          <td style="padding:22px 36px 34px;">
            <p style="margin:0;font-size:13px;font-weight:700;">Dear ${app.name},</p>
            <p style="margin:12px 0 0;font-size:13px;line-height:1.8;color:#555;">
              Thank you for registering as a buyer for ${EVENT.name}. We are pleased to confirm that
              <strong style="color:#7d0b1c;">your application has been approved</strong>.
            </p>
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-size:13px;margin-top:14px;">
              ${infoRow("Date", EVENT.dateEn, true)}
              ${infoRow("Hours", EVENT.hours, true)}
              ${infoRow("Venue", EVENT.venueEn, true)}
            </table>
            <ul style="margin:14px 0 0;padding-left:18px;font-size:13px;line-height:1.8;color:#555;">
              ${GUIDE_EN.map((g) => `<li>${g}</li>`).join("")}
            </ul>
            <p style="margin:16px 0 0;font-size:13px;line-height:1.8;color:#555;">
              We look forward to welcoming you.<br>
              <strong>${EVENT.name} Secretariat</strong> · ${EVENT.contact}
            </p>
          </td>
        </tr>

        <tr>
          <td style="background:#faf9f9;padding:18px 36px;font-size:11px;color:#999;line-height:1.7;border-top:1px solid rgba(0,0,0,0.06);">
            본 메일은 ${EVENT.nameKo} 바이어 등록자에게 발송되었습니다.<br>
            ${EVENT.instagram} · © 2026 ${EVENT.host}
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`

  return { subject, text, html }
}

/** 텍스트 전용 본문에서 강조 태그를 걷어낸다. */
function stripTags(html: string) {
  return html.replace(/<[^>]+>/g, "")
}

function infoRow(label: string, value: string, small = false) {
  const size = small ? "13px" : "14px"
  return `<tr>
    <td style="padding:11px 0;width:74px;color:#999;font-size:${size};vertical-align:top;border-bottom:1px solid rgba(0,0,0,0.06);">${label}</td>
    <td style="padding:11px 0;font-size:${size};line-height:1.6;border-bottom:1px solid rgba(0,0,0,0.06);">${value}</td>
  </tr>`
}

function guideRow(text: string) {
  return `<tr>
    <td style="padding:10px 0;font-size:14px;line-height:1.7;color:#444;border-bottom:1px solid rgba(0,0,0,0.06);">
      <span style="color:#7d0b1c;font-weight:700;margin-right:8px;">·</span>${text}
    </td>
  </tr>`
}

function visitDayKo(day: string) {
  switch (day) {
    case "day1":
      return "11월 21일(토)"
    case "day2":
      return "11월 22일(일)"
    default:
      return "11월 21일(토) ~ 22일(일) 양일"
  }
}
