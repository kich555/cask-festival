// 참가업체 전용 페이지(/exhibitor) 로그인 계정 동기화.
// ../캐스크카니발_참가업체_계정.xlsx (접속 주소 | 업체명 | 아이디 | 비밀번호) 가 기준이다.
// - 엑셀에 있는 업체마다 계정을 만들거나 갱신한다. 엑셀에 없는 업체는 건드리지 않는다.
// - 아이디: 하이픈(-)·공백을 지운 영문 소문자·숫자
// - 비밀번호: 영문+숫자가 섞인 8자리. 비어 있거나 형식이 다르면 새로 만들어 엑셀에 채운다.
// - 업체(브랜드)는 아이디(=기존 slug) 또는 업체명으로 찾고, 없으면 사이트에 숨김 상태로 새로 만든다.
// - DB 에는 비밀번호 해시만 저장되므로 이 엑셀이 비밀번호 원본이다.
//
// 사용법:
//   node --env-file=.env.local scripts/create-exhibitor-accounts.mjs
//   node --env-file=.env.local scripts/create-exhibitor-accounts.mjs --reset id1,id2   (비밀번호 재발급)
import crypto from "node:crypto"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import ExcelJS from "exceljs"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const FILE = path.join(ROOT, "..", "캐스크카니발_참가업체_계정.xlsx")
const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.caskcarnival.com"

const resetArg = process.argv.indexOf("--reset")
const RESET = new Set(resetArg > 0 ? (process.argv[resetArg + 1] ?? "").split(",") : [])

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const VALID_PW = /^(?=.*[a-z])(?=.*\d)[a-z0-9]{8}$/
// 헷갈리는 문자(0/o, 1/l/i) 제외
const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789"
function randomPassword() {
  for (;;) {
    const pw = Array.from(crypto.randomBytes(8), (b) => ALPHABET[b % ALPHABET.length]).join("")
    if (VALID_PW.test(pw)) return pw
  }
}
function hashPassword(pw) {
  const salt = crypto.randomBytes(16)
  return `scrypt$${salt.toString("hex")}$${crypto.scryptSync(pw, salt, 32).toString("hex")}`
}
const cellText = (v) =>
  v == null ? "" : String(typeof v === "object" ? (v.text ?? v.result ?? "") : v).trim()

// 출품 제품 사진 버킷 (공개 — 제품 사진이라 민감 정보 아님, 경로는 추측 불가)
{
  const { data } = await supabase.storage.getBucket("exhibitor-products")
  if (!data) {
    const { error } = await supabase.storage.createBucket("exhibitor-products", {
      public: true,
      fileSizeLimit: 10 * 1024 * 1024,
      allowedMimeTypes: ["image/jpeg", "image/png", "image/webp"],
    })
    if (error) throw error
  }
}

const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(FILE)
const ws = wb.worksheets[0]

const { data: brands, error: bErr } = await supabase.from("brands").select("slug,name_ko")
if (bErr) throw bErr
const { data: accounts, error: aErr } = await supabase
  .from("exhibitor_accounts")
  .select("brand_slug,login_id")
if (aErr) throw aErr
const bySlug = new Map(brands.map((b) => [b.slug, b]))
const byName = new Map(brands.map((b) => [b.name_ko, b]))
const accountByBrand = new Map(accounts.map((a) => [a.brand_slug, a]))
const accountById = new Map(accounts.map((a) => [a.login_id, a]))

const log = []
const seen = new Set()
const rows = []
ws.eachRow((r, i) => {
  if (i > 1 && cellText(r.getCell(2).value)) rows.push(r)
})

for (const r of rows) {
  const name = cellText(r.getCell(2).value)
  const rawId = cellText(r.getCell(3).value)
  const id = rawId.replace(/[-\s]/g, "").toLowerCase()
  if (!/^[a-z0-9]+$/.test(id))
    throw new Error(`${name}: 아이디는 영문·숫자만 가능합니다 (${rawId})`)
  if (seen.has(id)) throw new Error(`아이디 중복: ${id}`)
  seen.add(id)

  let pw = cellText(r.getCell(4).value)
  const newPw = !VALID_PW.test(pw) || RESET.has(id)
  if (newPw) pw = randomPassword()

  // 업체 찾기: 기존 계정 아이디 → slug → 업체명 순. 없으면 숨김 상태로 새로 만든다.
  let brand = bySlug.get(accountById.get(id)?.brand_slug) ?? bySlug.get(rawId) ?? byName.get(name)
  if (!brand) {
    const { error } = await supabase.from("brands").insert({
      slug: id,
      name_ko: name,
      country: "",
      country_ko: "",
      booths: 1,
      visible: false,
    })
    if (error) throw new Error(`${name}: ${error.message}`)
    brand = { slug: id, name_ko: name }
    log.push(`업체 새로 등록(숨김): ${name}`)
  }

  const account = accountByBrand.get(brand.slug)
  if (!account) {
    const { error } = await supabase
      .from("exhibitor_accounts")
      .insert({ brand_slug: brand.slug, login_id: id, password_hash: hashPassword(pw) })
    if (error) throw new Error(`${name}: ${error.message}`)
    log.push(`계정 생성: ${name} (${id})`)
  } else if (account.login_id !== id || newPw) {
    const patch = { login_id: id }
    if (newPw) Object.assign(patch, { password_hash: hashPassword(pw), password_changed_at: null })
    const { error } = await supabase
      .from("exhibitor_accounts")
      .update(patch)
      .eq("brand_slug", brand.slug)
    if (error) throw new Error(`${name}: ${error.message}`)
    if (account.login_id !== id) log.push(`아이디 변경: ${name} ${account.login_id} → ${id}`)
    if (newPw) log.push(`비밀번호 발급: ${name}`)
  }

  r.getCell(1).value = `${SITE}/exhibitor`
  r.getCell(3).value = id
  r.getCell(4).value = pw
}

await wb.xlsx.writeFile(FILE)
console.log(log.length ? log.join("\n") : "바뀐 내용 없음")
console.log(`엑셀 ${rows.length}개 업체 반영 → ${FILE}`)
