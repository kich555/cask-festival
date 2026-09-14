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
// Next.js 이미지 최적화는 AVIF·SVG 를 '원본'으로 다루지 못한다. 이런 형식은 PNG 로 변환해 저장한다.
const CONVERT_TO_PNG = new Set([".avif", ".svg"])

/**
 * 여백을 다 걷어내면 오히려 칸을 꽉 채워 답답해 보이는 로고가 있다.
 * 그런 로고에만 투명 여백을 조금 되돌려 준다. (값은 가로 길이 대비 비율)
 */
const EXTRA_MARGIN = {
  "jinmac-distillery": 0.1,
  "korea-brandy-society": 0.22,
}

/**
 * 비교용 단순화: 소문자 + 영숫자/한글/일본어만 남긴다.
 * macOS 는 파일명을 자모 분리(NFD) 로 저장하므로 반드시 NFC 로 합쳐야 한글이 매칭된다.
 */
const norm = (s) =>
  String(s)
    .normalize("NFC")
    .toLowerCase()
    .replace(/[^a-z0-9가-힣ぁ-んァ-ン一-龯]/g, "")

/** 괄호 안 부연설명을 떼어낸 형태. "SMWS(흑)" → "SMWS" */
const stripParens = (s) =>
  String(s)
    .normalize("NFC")
    .replace(/[(（[【][^)）\]】]*[)）\]】]/g, "")

/** 한 이름에서 나올 수 있는 비교 후보들 */
const variants = (name) => [norm(name), norm(stripParens(name))].filter(Boolean)

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

/**
 * 로고 가장자리의 균일한 여백·테두리를 잘라낸다.
 * 원본마다 여백이 제각각이라 그대로 두면 카드 안에서 크기가 들쭉날쭉해진다.
 * 잘린 결과가 지나치게 작으면(잘못 잘린 것으로 보고) 원본을 유지한다.
 */
async function trimEdges(file) {
  if (path.extname(file).toLowerCase() === ".svg") return

  /** 한 번 잘라내고, 실제로 줄어들었는지 알려준다. */
  async function trimOnce(options) {
    try {
      const before = await sharp(file).metadata()
      const out = await sharp(file).trim(options).toBuffer({ resolveWithObject: true })
      const ratio = (out.info.width * out.info.height) / (before.width * before.height)
      if (ratio < 0.02 || ratio > 0.995) return false // 다 잘렸거나 변화가 없으면 버린다
      fs.writeFileSync(file, out.data)
      return true
    } catch {
      return false
    }
  }

  // 1) 바깥 여백 제거
  await trimOnce({ threshold: 12 })

  // 2) 액자처럼 선이 둘린 로고는 테두리 색을 지정해 한 번 더 벗겨낸다.
  //    (가장자리 색을 그대로 배경으로 지정하므로, 테두리가 없으면 아무것도 잘리지 않는다)
  try {
    const { data, info } = await sharp(file)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true })
    const ch = info.channels
    const at = (x, y) => {
      const i = (y * info.width + x) * ch
      return { r: data[i], g: data[i + 1], b: data[i + 2], alpha: data[i + 3] }
    }
    const edge = at(0, 0)
    const sameAsEdge = (p) =>
      Math.abs(p.r - edge.r) < 10 && Math.abs(p.g - edge.g) < 10 && Math.abs(p.b - edge.b) < 10
    // 네 변의 중앙이 모두 같은 색이면 테두리로 본다
    const looksFramed =
      edge.alpha > 200 &&
      sameAsEdge(at(Math.floor(info.width / 2), 0)) &&
      sameAsEdge(at(Math.floor(info.width / 2), info.height - 1)) &&
      sameAsEdge(at(0, Math.floor(info.height / 2))) &&
      sameAsEdge(at(info.width - 1, Math.floor(info.height / 2)))

    if (looksFramed) {
      await trimOnce({ background: { r: edge.r, g: edge.g, b: edge.b }, threshold: 30 })
      await trimOnce({ threshold: 12 }) // 테두리 안쪽 여백까지 정리
    }
  } catch {
    // 분석에 실패하면 1단계 결과만 쓴다
  }
}

/** 로고 둘레에 여백을 더한다. 배경색이 있으면 같은 색으로 채워 이음매가 보이지 않게 한다. */
async function addMargin(file, ratio, bg) {
  if (!ratio) return
  try {
    const meta = await sharp(file).metadata()
    const pad = Math.round(meta.width * ratio)
    const background = bg
      ? {
          r: Number.parseInt(bg.slice(1, 3), 16),
          g: Number.parseInt(bg.slice(3, 5), 16),
          b: Number.parseInt(bg.slice(5, 7), 16),
          alpha: 1,
        }
      : { r: 0, g: 0, b: 0, alpha: 0 }
    const out = await sharp(file)
      .extend({ top: pad, bottom: pad, left: pad, right: pad, background })
      .toBuffer()
    fs.writeFileSync(file, out)
  } catch {
    // 실패하면 여백 없이 둔다
  }
}

const brands = JSON.parse(fs.readFileSync(JSON_PATH, "utf8"))

// 이전 실행이 만들어 둔 결과물(<slug>.<확장자>)은 원본으로 취급하지 않는다
const generated = new Set()
for (const b of brands) {
  for (const e of EXTS) generated.add(`${b.slug}${e}`)
}

/** 후보 파일 모으기: 업체 폴더 안 + brands 루트에 직접 올려둔 것 */
function collectCandidates() {
  const byKey = new Map() // 비교용 이름 → { file, label }

  const entries = fs.readdirSync(LOGO_DIR, { withFileTypes: true })

  // 1) 업체 폴더: 폴더 이름으로 매칭
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const files = fs
      .readdirSync(path.join(LOGO_DIR, entry.name))
      .filter((f) => EXTS.has(path.extname(f).toLowerCase()) && !f.startsWith("."))
      .sort()
    if (files.length === 0) continue
    const file = path.join(LOGO_DIR, entry.name, files[0])
    for (const key of variants(entry.name)) {
      if (!byKey.has(key))
        byKey.set(key, { file, label: `${entry.name}/${files[0]}`, extra: files.length - 1 })
    }
  }

  // 2) 루트에 직접 올린 파일: 파일 이름으로 매칭 (폴더 쪽이 우선)
  for (const entry of entries) {
    if (!entry.isFile()) continue
    const name = entry.name
    if (name.startsWith(".") || generated.has(name)) continue
    if (!EXTS.has(path.extname(name).toLowerCase())) continue
    const base = path.basename(name, path.extname(name))
    for (const key of variants(base)) {
      if (!byKey.has(key))
        byKey.set(key, { file: path.join(LOGO_DIR, name), label: name, extra: 0 })
    }
  }

  return byKey
}

const candidates = collectCandidates()

const linked = []
const noLogo = []
const usedKeys = new Set()

for (const brand of brands) {
  const keys = [...variants(brand.nameKo), ...variants(brand.nameEn), ...variants(brand.slug)]
  // 1차: 이름이 정확히 일치하는 파일
  let key = keys.find((k) => candidates.has(k))

  // 2차: 파일명이 업체명을 포함하거나 그 반대인 경우
  // ("스페이스컴퍼니코리아.png" ↔ 업체명 "스페이스 컴퍼니")
  if (!key) {
    key = [...candidates.keys()].find((candidateKey) =>
      keys.some((k) => k.length >= 4 && (candidateKey.startsWith(k) || k.startsWith(candidateKey))),
    )
  }

  if (!key) {
    brand.logo = null
    brand.logoBg = null
    noLogo.push(brand.nameKo)
    continue
  }

  const { file: src, label, extra } = candidates.get(key)
  // 같은 파일을 가리키는 다른 이름 표기도 '사용됨'으로 처리해야 보고가 정확하다
  for (const [k, v] of candidates) {
    if (v.file === src) usedKeys.add(k)
  }

  const srcExt = path.extname(src).toLowerCase()
  const ext = CONVERT_TO_PNG.has(srcExt) ? ".png" : srcExt
  const destName = `${brand.slug}${ext}`
  const dest = path.join(LOGO_DIR, destName)

  // 이전에 다른 확장자로 만들어 둔 결과물은 정리한다
  for (const e of EXTS) {
    const stale = path.join(LOGO_DIR, `${brand.slug}${e}`)
    if (e !== ext && fs.existsSync(stale)) fs.unlinkSync(stale)
  }

  if (path.resolve(src) !== path.resolve(dest)) {
    if (CONVERT_TO_PNG.has(srcExt)) {
      // density 를 높여야 벡터가 또렷하게 그려진다
      await sharp(src, { density: 384 }).png().toFile(dest)
    } else {
      fs.copyFileSync(src, dest)
    }
  }

  brand.logo = `/brands/${destName}`
  brand.logoBg = await detectBackground(dest)
  await trimEdges(dest)
  await addMargin(dest, EXTRA_MARGIN[brand.slug], brand.logoBg)
  linked.push(`${brand.nameKo} ← ${label}${extra > 0 ? ` (파일 ${extra + 1}개 중 첫 번째)` : ""}`)
}

fs.writeFileSync(JSON_PATH, `${JSON.stringify(brands, null, 2)}\n`)

console.log(`연결됨 ${linked.length}건`)
for (const l of linked) console.log("  ✓", l)

const unmatched = [
  ...new Set([...candidates.entries()].filter(([k]) => !usedKeys.has(k)).map(([, v]) => v.label)),
]
if (unmatched.length > 0) {
  console.log(
    `\n업체와 짝이 없는 파일 ${unmatched.length}개 (이름이 다르거나, 아직 홈페이지에 노출되지 않는 업체)`,
  )
  for (const f of unmatched) console.log("  ·", f)
}

if (noLogo.length > 0) {
  console.log(`\n로고가 없는 업체 ${noLogo.length}곳`)
  console.log(`  ${noLogo.join(", ")}`)
}
