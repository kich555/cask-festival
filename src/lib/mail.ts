// 승인 안내 메일 발송 (네이버웍스 SMTP).
// 서버 전용 — 클라이언트에서 import 하지 않는다.
// 메일 본문은 approvalEmail.ts 가 만든다.
import "server-only"
import nodemailer, { type Transporter } from "nodemailer"
import { buildApprovalEmail } from "./approvalEmail"
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

  const port = Number(process.env.SMTP_PORT || "587")

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
