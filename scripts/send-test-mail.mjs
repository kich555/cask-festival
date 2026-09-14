// 승인 메일 설정 점검용. 사용법: node scripts/send-test-mail.mjs [받는주소]
import fs from "node:fs"
import nodemailer from "nodemailer"

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

const info = await transport.sendMail({
  from: env.MAIL_FROM || env.SMTP_USER,
  to,
  subject: "[테스트] CASK CARNIVAL 승인 메일 발송 점검",
  text: "이 메일이 보이면 승인 메일 발송 설정이 정상입니다.",
  html: `<div style="font-family:sans-serif;padding:20px">
    <h2 style="color:#7d0b1c;margin:0 0 12px">발송 설정 정상</h2>
    <p style="font-size:14px;color:#555">이 메일이 보이면 캐스크 카니발 승인 메일 발송 설정이 정상입니다.</p>
  </div>`,
})

console.log("발송 완료 →", to)
console.log("messageId:", info.messageId)
