// 엑셀 참가업체(57) + 기존 brands2026.json(노출 33, 로고 포함) → Supabase brands 로 1회 가져오기.
// upsert 라 다시 실행해도 안전하다 (관리자가 바꾼 값은 덮어쓰므로 최초 1회만 권장).
//
// 사용법: node --env-file=.env.local scripts/import-brands-supabase.mjs
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { createClient } from "@supabase/supabase-js"
import ExcelJS from "exceljs"
import { BRAND_BUCKET_NAME, COUNTRY_CODES, slugify } from "../src/lib/brandRecord.ts"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const EXCEL = path.join(ROOT, "..", "캐스크카니발_참가업체_목록.xlsx")
const JSON_PATH = path.join(ROOT, "src", "content", "brands2026.json")
const MIME = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
}

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const norm = (s) =>
  String(s ?? "")
    .normalize("NFC")
    .replace(/\s+/g, "")
    .toLowerCase()
const text = (v) => {
  if (v == null) return null
  const t = String(typeof v === "object" ? (v.text ?? v.hyperlink ?? "") : v)
    .replace(/ /g, " ")
    .trim()
  return t === "" ? null : t
}

async function ensureBucket() {
  const { data } = await supabase.storage.getBucket(BRAND_BUCKET_NAME)
  if (data) return
  const { error } = await supabase.storage.createBucket(BRAND_BUCKET_NAME, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: Object.values(MIME),
  })
  if (error) throw error
  console.log(`버킷 생성: ${BRAND_BUCKET_NAME}`)
}

async function uploadLogo(slug, publicPath) {
  const file = path.join(ROOT, "public", publicPath)
  const ext = path.extname(file).toLowerCase()
  if (!fs.existsSync(file) || !MIME[ext]) {
    console.warn(`  로고 건너뜀(${slug}): ${publicPath}`)
    return null
  }
  const objectPath = `${slug}-import${ext}`
  const { error } = await supabase.storage
    .from(BRAND_BUCKET_NAME)
    .upload(objectPath, fs.readFileSync(file), { contentType: MIME[ext], upsert: true })
  if (error) throw error
  return supabase.storage.from(BRAND_BUCKET_NAME).getPublicUrl(objectPath).data.publicUrl
}

async function main() {
  await ensureBucket()

  const json = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"))
  const jsonByName = new Map(json.map((b) => [norm(b.nameKo), b]))

  const wb = new ExcelJS.Workbook()
  await wb.xlsx.readFile(EXCEL)
  const ws = wb.getWorksheet("참가업체")

  const used = new Set(json.map((b) => b.slug))
  const matched = new Set()
  const rows = []

  for (let i = 2; i <= ws.rowCount; i++) {
    const r = ws.getRow(i)
    const nameKo = text(r.getCell(2).value)
    if (!nameKo) continue
    const no = Number(r.getCell(1).value) || i - 1
    const hit = jsonByName.get(norm(nameKo))

    if (hit) {
      matched.add(hit.slug)
      rows.push({
        slug: hit.slug,
        name_ko: hit.nameKo,
        name_en: hit.nameEn || null,
        country: hit.country,
        country_ko: hit.countryKo,
        website: hit.website,
        instagram: hit.instagram,
        booths: hit.booths,
        logo: hit.logo ? await uploadLogo(hit.slug, hit.logo) : null,
        logo_bg: hit.logoBg ?? null,
        visible: true,
        sort_order: no,
      })
    } else {
      const nameEn = text(r.getCell(3).value)
      const countryKo = text(r.getCell(4).value) ?? ""
      if (!COUNTRY_CODES[countryKo]) console.warn(`  국가 매핑 없음(${nameKo}): "${countryKo}"`)
      rows.push({
        slug: slugify(nameEn ?? nameKo, used),
        name_ko: nameKo,
        name_en: nameEn,
        country: COUNTRY_CODES[countryKo] ?? "",
        country_ko: countryKo,
        website: text(r.getCell(5).value),
        instagram: text(r.getCell(6).value),
        booths: Number(r.getCell(7).value) || 1,
        logo: null,
        logo_bg: null,
        visible: false,
        sort_order: no,
      })
    }
  }

  for (const b of json) {
    if (!matched.has(b.slug)) console.warn(`  JSON 에만 있고 엑셀에 없음: ${b.nameKo}`)
  }

  const { error } = await supabase.from("brands").upsert(rows, { onConflict: "slug" })
  if (error) throw error

  const visible = rows.filter((r) => r.visible).length
  console.log(`완료: 전체 ${rows.length} / 노출 ${visible} / 숨김 ${rows.length - visible}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
