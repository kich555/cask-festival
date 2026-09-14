// public/brands/<업체 한글명>/ 폴더에 넣어둔 로고를 찾아 업체 데이터와 연결한다.
//
// 동작:
//   1. 업체별 폴더에서 이미지 파일을 하나 찾는다 (여러 개면 이름순 첫 번째)
//   2. 웹에서 안전하게 서빙되도록 public/brands/<slug>.<확장자> 로 복사한다
//      (한글·공백이 들어간 경로를 그대로 URL 로 쓰지 않기 위함)
//   3. brands2026.json 의 logo 값을 갱신한다
//
// 사용법: node scripts/link-logos.mjs
import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import sharp from "sharp"

const ROOT = fileURLToPath(new URL("..", import.meta.url))
const LOGO_DIR = path.join(ROOT, "public", "brands")
const JSON_PATH = path.join(ROOT, "src", "content", "brands2026.json")
const EXTS = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif", ".svg"])
// Next.js 이미지 최적화는 AVIF 를 '원본'으로 읽지 못한다. 이런 형식은 PNG 로 변환해 저장한다.
const CONVERT_TO_PNG = new Set([".avif"])

/**
 * 비교용 단순화: 소문자 + 영숫자/한글만 남긴다.
 * macOS 는 파일명을 자모 분리(NFD) 로 저장하므로 반드시 NFC 로 합쳐야 한글이 매칭된다.
 */
const norm = (s) =>
  String(s)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ン一-龯]/g, "")

/**
 * 로고 이미지의 배경색을 추정한다.
 * 네 모서리를 표본으로 삼아, 모두 투명하면 null(투명), 색이 일치하면 그 색을 돌려준다.
 * 모서리 색이 서로 다르면(사진 등) null 을 돌려 기본 배경을 쓰게 한다.
 */
async function detectBackground(file) {
  try {
    const { data, info } = await sharp(file)
      .resize(64, 64, { fit: "fill" })
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })

    const { width, height, channels } = info
    const at = (x, y) => {
      const i = (y * width + x) * channels
      return [data[i], data[i + 1], data[i + 2], data[i + 3]]
    }
    const corners = [at(1, 1), at(width - 2, 1), at(1, height - 2), at(width - 2, height - 2)]

    // 모두 투명하면 배경이 없는 로고다
    if (corners.every((c) => c[3] < 16)) return null

    // 일부만 투명하면 판단이 어려우니 기본값을 쓴다
    if (corners.some((c) => c[3] < 200)) return null

    const [r0, g0, b0] = corners[0]
    const same = corners.every(
      ([r, g, b]) => Math.abs(r - r0) < 12 && Math.abs(g - g0) < 12 && Math.abs(b - b0) < 12,
    )
    if (!same) return null

    const hex = (n) => n.toString(16).padStart(2, "0")
    return `#${hex(r0)}${hex(g0)}${hex(b0)}`
  } catch {
    return null
  }
}

const brands = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"))

const dirs = fs
  .readdirSync(LOGO_DIR, { withFileTypes: true })
  .filter((e) => e.isDirectory())
  .map((e) => e.name)

const dirByName = new Map(dirs.map((d) => [norm(d), d]))

const linked = []
const empty = []
const notFound = []

for (const brand of brands) {
  const key = [brand.nameKo, brand.nameEn, brand.slug]
    .filter(Boolean)
    .map(norm)
    .find((k) => dirByName.has(k))

  if (!key) {
    notFound.push(brand.nameKo)
    brand.logoBg = null
    continue
  }

  const dir = dirByName.get(key)
  const files = fs
    .readdirSync(path.join(LOGO_DIR, dir))
    .filter((f) => EXTS.has(path.extname(f).toLowerCase()) && !f.startsWith("."))
    .sort()

  if (files.length === 0) {
    empty.push(brand.nameKo)
    continue
  }

  const src = path.join(LOGO_DIR, dir, files[0])
  const srcExt = path.extname(files[0]).toLowerCase()
  const ext = CONVERT_TO_PNG.has(srcExt) ? ".png" : srcExt
  const destName = `${brand.slug}${ext}`
  const dest = path.join(LOGO_DIR, destName)

  // 이전에 다른 확장자로 복사해 둔 파일이 있으면 정리한다
  for (const e of EXTS) {
    const stale = path.join(LOGO_DIR, `${brand.slug}${e}`)
    if (e !== ext && fs.existsSync(stale)) fs.unlinkSync(stale)
  }

  if (CONVERT_TO_PNG.has(srcExt)) {
    await sharp(src).png().toFile(dest)
    linked.push(`${brand.nameKo} ← ${dir}/${files[0]} (PNG 변환)`)
  } else {
    fs.copyFileSync(src, dest)
    linked.push(`${brand.nameKo} ← ${dir}/${files[0]}`)
  }
  brand.logo = `/brands/${destName}`
  brand.logoBg = await detectBackground(dest)

  if (files.length > 1) {
    console.warn(`  ! ${brand.nameKo}: 파일이 ${files.length}개라 '${files[0]}' 만 사용했습니다`)
  }
}

fs.writeFileSync(JSON_PATH, `${JSON.stringify(brands, null, 2)}\n`)

console.log(`연결됨 ${linked.length}건`)
for (const l of linked) console.log("  ✓", l)

if (empty.length > 0) {
  console.log(`\n폴더는 있으나 파일이 없는 업체 ${empty.length}곳`)
  console.log(`  ${empty.join(", ")}`)
}
if (notFound.length > 0) {
  console.log(`\n폴더를 찾지 못한 업체 ${notFound.length}곳`)
  console.log(`  ${notFound.join(", ")}`)
}
