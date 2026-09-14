// 실제 승인 메일과 동일한 본문으로 시험 발송한다.
// 사용법: npx tsx scripts/send-test-mail.mjs [받는주소]
import fs from "node:fs"
import nodemailer from "nodemailer"
import { buildApprovalEmail } from "../src/lib/approvalEmail.ts"

const env = Object.fromEntries(
  fs
    .readFileSync(new URL("../.env.local", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("=") && !l.trim().startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim()]),
)

const to = process.argv[2] || env.SMTP_USER
const missing = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASS"].filter((k) => !env[k])
if (missing.length) {
  console.error(`.env.local 에 값이 비어 있습니다: ${missing.join(", ")}`)
  process.exit(1)
}

const sample = {
  id: "sample",
  created_at: new Date().toISOString(),
  status: "approved",
  name: "홍길동",
  company: "테스트 주류상사",
  job_title: "구매팀장",
  phone: "010-0000-0000",
  email: to,
  business_card_path: "",
  visit_day: "both",
  buyer_type: "wholesale",
  buyer_type_other: null,
  referral: "website",
  referral_other: null,
  purpose: "new_partners",
  purpose_other: null,
  age_confirmed: true,
  marketing_opt_in: false,
  admin_note: null,
  approval_email_sent_at: null,
}

const port = Number(env.SMTP_PORT)
const transport = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port,
  secure: port === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
})

try {
  await transport.verify()
  console.log("SMTP 접속 성공")
} catch (e) {
  console.error("SMTP 접속 실패:", e.message)
  process.exit(1)
}

const { subject, text, html } = buildApprovalEmail(sample)
const info = await transport.sendMail({
  from: env.MAIL_FROM || env.SMTP_USER,
  to,
  subject,
  text,
  html,
})

console.log("발송 완료 →", to)
console.log("제목:", subject)
console.log("messageId:", info.messageId)
