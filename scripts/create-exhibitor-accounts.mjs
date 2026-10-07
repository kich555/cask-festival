// 참가업체 부스 확인 · 추가 신청(/exhibitor) 로그인 계정 일괄 생성.
// - brands 테이블의 모든 업체 중 계정이 없는 업체만 새로 만든다 (기존 비밀번호는 유지).
// - 아이디 = 브랜드 slug, 비밀번호 = 무작위 8자리.
// - 결과는 ../캐스크카니발_참가업체_계정.xlsx 에 누적 저장 (업체에 전달할 때 사용).
//   DB 에는 해시만 저장되므로 이 엑셀이 비밀번호 원본이다.
//
// 사용법:
//   node --env-file=.env.local scripts/create-exhibitor-accounts.mjs
//   node --env-file=.env.local scripts/create-exhibitor-accounts.mjs --reset slug1,slug2   (비밀번호 재발급)
import crypto from "node:crypto"
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import ExcelJS from "exceljs"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const OUT = path.join(ROOT, "..", "캐스크카니발_참가업체_계정.xlsx")
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.caskcarnival.com"

const resetArg = process.argv.indexOf("--reset")
const RESET = new Set(resetArg > 0 ? (process.argv[resetArg + 1] ?? "").split(",") : [])

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

// 헷갈리는 문자(0/O, 1/l/I) 제외
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"
function randomPassword(len = 8) {
  return Array.from(crypto.randomBytes(len), (b) => ALPHABET[b % ALPHABET.length]).join("")
}
function hashPassword(pw) {
  const salt = crypto.randomBytes(16)
  return `scrypt$${salt.toString("hex")}$${crypto.scryptSync(pw, salt, 32).toString("hex")}`
}

async function readExisting() {
  const map = new Map()
  if (!fs.existsSync(OUT)) return map
  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(OUT)
  wb.worksheets[0].eachRow((row, i) => {
    if (i === 1) return
    const [, name, loginId, password] = row.values
    if (loginId) map.set(String(loginId), { name, password: String(password ?? "") })
  })
  return map
}

const { data: brands, error: bErr } = await supabase
  .from("brands")
  .select("slug,name_ko")
  .order("name_ko")
if (bErr) throw bErr
const { data: accounts, error: aErr } = await supabase
  .from("exhibitor_accounts")
  .select("brand_slug")
if (aErr) throw aErr
const has = new Set(accounts.map((a) => a.brand_slug))
const sheet = await readExisting()

let created = 0
for (const b of brands) {
  if (has.has(b.slug) && !RESET.has(b.slug)) {
    if (!sheet.has(b.slug))
      sheet.set(b.slug, { name: b.name_ko, password: "(엑셀에 없음 — --reset 으로 재발급)" })
    continue
  }
  const password = randomPassword()
  const { error } = await supabase.from("exhibitor_accounts").upsert(
    {
      brand_slug: b.slug,
      login_id: b.slug,
      password_hash: hashPassword(password),
      password_changed_at: null,
    },
    { onConflict: "brand_slug" },
  )
  if (error) throw error
  sheet.set(b.slug, { name: b.name_ko, password })
  created++
}

const wb = new ExcelJS.Workbook()
const ws = wb.addWorksheet("참가업체 계정")
ws.columns = [
  { header: "접속 주소", width: 36 },
  { header: "업체명", width: 28 },
  { header: "아이디", width: 36 },
  { header: "비밀번호", width: 14 },
]
ws.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } }
ws.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF7D0B1C" } }
const names = new Map(brands.map((b) => [b.slug, b.name_ko]))
const sorted = [...sheet.entries()].sort((a, b) =>
  String(names.get(a[0]) ?? a[1].name).localeCompare(String(names.get(b[0]) ?? b[1].name), "ko"),
)
for (const [loginId, v] of sorted) {
  ws.addRow([`${SITE}/exhibitor`, names.get(loginId) ?? v.name, loginId, v.password])
}
await wb.xlsx.writeFile(OUT)

console.log(`새 계정 ${created}개 생성 · 전체 ${sorted.length}개 → ${OUT}`)
