// 승인 안내 메일 발송 (네이버웍스 SMTP).
// 서버 전용 — 클라이언트에서 import 하지 않는다.
import "server-only"
import nodemailer, { type Transporter } from "nodemailer"
import type { BuyerApplication } from "./buyer"

let cached: Transporter | null = null

function getTransport() {
  if (cached) return cached

  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS

  if (!host || !user || !pass) {
    throw new Error("SMTP_HOST / SMTP_USER / SMTP_PASS 환경변수가 없습니다.")
  }

  const port = Number(process.env.SMTP_PORT || "465")

  cached = nodemailer.createTransport({
    host,
    port,
    // 465 는 접속부터 암호화(SSL), 587 은 접속 후 STARTTLS 로 전환
    secure: port === 465,
    auth: { user, pass },
  })
  return cached
}

/** 발신 주소. 미설정 시 SMTP 계정을 그대로 쓴다. */
function fromAddress() {
  const from = process.env.MAIL_FROM || process.env.SMTP_USER || ""
  return from.includes("<") ? from : `CASK CARNIVAL <${from}>`
}

const EVENT_INFO = {
  date: "2026년 11월 21일(토) ~ 22일(일)",
  dateEn: "Saturday 21 – Sunday 22 November 2026",
  venue: "SETEC 제3전시실",
  venueEn: "SETEC Hall 3, Seoul",
  contact: "caskcarnival@whiskynavi.com",
}

/** 승인 안내 메일 본문. 한국어와 영어를 함께 담아 발송한다. */
export function buildApprovalEmail(app: BuyerApplication) {
  const entryKo =
    "현장 등록 데스크에서 바이어 할인가로 티켓을 구매하실 수 있습니다. <strong>일일권 50,000원</strong> (정가 60,000원)"
  const entryEn =
    "You may purchase a ticket at the buyer rate at the on-site desk. <strong>1-day ticket KRW 50,000</strong> (regular KRW 60,000)"

  const subject = `[CASK CARNIVAL 2026] 바이어 참관 신청이 승인되었습니다 / Your buyer registration is approved`

  const text = [
    `${app.name}님, 안녕하세요.`,
    "",
    "캐스크 카니발 2026 바이어 참관 신청이 승인되었습니다.",
    "",
    `일정: ${EVENT_INFO.date}`,
    `장소: ${EVENT_INFO.venue}`,
    "입장: 현장에서 바이어 할인가 일일권 50,000원 (정가 60,000원)",
    "",
    "현장 등록 데스크에서 명함을 제시해 주시면 안내해 드리겠습니다.",
    `문의: ${EVENT_INFO.contact}`,
    "",
    "----",
    "",
    `Dear ${app.name},`,
    "",
    "Your buyer registration for CASK CARNIVAL 2026 has been approved.",
    "",
    `Date: ${EVENT_INFO.dateEn}`,
    `Venue: ${EVENT_INFO.venueEn}`,
    "Entry: Buyer rate 1-day ticket KRW 50,000 (regular KRW 60,000), payable on site",
    "",
    "Please present your business card at the registration desk.",
    `Enquiries: ${EVENT_INFO.contact}`,
  ].join("\n")

  const html = `<!doctype html>
<html lang="ko"><body style="margin:0;padding:24px;background:#f6f5f5;font-family:-apple-system,BlinkMacSystemFont,'Apple SD Gothic Neo','Malgun Gothic',sans-serif;color:#1a1a1a;">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid rgba(0,0,0,0.08);border-radius:6px;overflow:hidden;">
    <div style="background:#1a1a1a;padding:22px 28px;">
      <div style="color:#ffffff;font-size:17px;font-weight:800;letter-spacing:0.04em;">CASK CARNIVAL 2026</div>
      <div style="color:rgba(255,255,255,0.55);font-size:12px;margin-top:4px;">Global Cask-Aged Drinks Festa</div>
    </div>

    <div style="padding:28px;">
      <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">
        <strong>${app.name}</strong>님, 캐스크 카니발 2026 바이어 참관 신청이 <strong style="color:#7d0b1c;">승인</strong>되었습니다.
      </p>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin:0 0 18px;">
        <tr><td style="padding:8px 0;color:#888;width:64px;">일정</td><td style="padding:8px 0;">${EVENT_INFO.date}</td></tr>
        <tr><td style="padding:8px 0;color:#888;">장소</td><td style="padding:8px 0;">${EVENT_INFO.venue}</td></tr>
        <tr><td style="padding:8px 0;color:#888;vertical-align:top;">입장</td><td style="padding:8px 0;line-height:1.6;">${entryKo}</td></tr>
      </table>

      <p style="margin:0 0 6px;font-size:13px;color:#555;line-height:1.7;">
        현장 등록 데스크에서 명함을 제시해 주시면 안내해 드리겠습니다.<br>
        문의: <a href="mailto:${EVENT_INFO.contact}" style="color:#7d0b1c;">${EVENT_INFO.contact}</a>
      </p>

      <hr style="border:none;border-top:1px solid rgba(0,0,0,0.08);margin:26px 0;">

      <p style="margin:0 0 14px;font-size:14px;line-height:1.7;">
        Dear <strong>${app.name}</strong>, your buyer registration for CASK CARNIVAL 2026 has been <strong style="color:#7d0b1c;">approved</strong>.
      </p>
      <table style="width:100%;border-collapse:collapse;font-size:13px;margin:0 0 14px;">
        <tr><td style="padding:6px 0;color:#888;width:64px;">Date</td><td style="padding:6px 0;">${EVENT_INFO.dateEn}</td></tr>
        <tr><td style="padding:6px 0;color:#888;">Venue</td><td style="padding:6px 0;">${EVENT_INFO.venueEn}</td></tr>
        <tr><td style="padding:6px 0;color:#888;vertical-align:top;">Entry</td><td style="padding:6px 0;line-height:1.6;">${entryEn}</td></tr>
      </table>
      <p style="margin:0;font-size:12px;color:#777;line-height:1.7;">
        Please present your business card at the registration desk.<br>
        Enquiries: <a href="mailto:${EVENT_INFO.contact}" style="color:#7d0b1c;">${EVENT_INFO.contact}</a>
      </p>
    </div>

    <div style="background:#faf9f9;padding:16px 28px;font-size:11px;color:#999;line-height:1.6;">
      본 메일은 캐스크 카니발 2026 바이어 참관 신청자에게 발송되었습니다.<br>
      © 2026 Whiskynavi
    </div>
  </div>
</body></html>`

  return { subject, text, html }
}

export async function sendApprovalEmail(app: BuyerApplication) {
  const { subject, text, html } = buildApprovalEmail(app)
  await getTransport().sendMail({
    from: fromAddress(),
    to: app.email,
    subject,
    text,
    html,
  })
}

/** 설정 점검용 — 지정한 주소로 견본 메일을 보낸다. */
export async function sendTestEmail(to: string) {
  const sample: BuyerApplication = {
    id: "test",
    created_at: new Date().toISOString(),
    status: "approved",
    name: "홍길동",
    company: "테스트 상사",
    job_title: "구매팀장",
    phone: "010-0000-0000",
    email: to,
    business_card_path: "",
    visit_day: "both",
    buyer_type: "wholesale",
    buyer_type_other: null,
    referral: "website",
    referral_other: null,
    purpose: "new_products",
    purpose_other: null,
    age_confirmed: true,
    marketing_opt_in: false,
    admin_note: null,
    approval_email_sent_at: null,
  }
  const { subject, text, html } = buildApprovalEmail(sample)
  await getTransport().sendMail({
    from: fromAddress(),
    to,
    subject: `[테스트] ${subject}`,
    text,
    html,
  })
}
