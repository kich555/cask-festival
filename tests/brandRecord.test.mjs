import assert from "node:assert/strict"
import { test } from "node:test"
import {
  COUNTRY_CODES,
  logoPathFromUrl,
  parseBrandInput,
  rowToBrand,
  slugify,
} from "../src/lib/brandRecord.ts"

test("slugify: 영문은 kebab-case, 중복이면 숫자 접미사", () => {
  const used = new Set()
  assert.equal(slugify("JINMAC Distillery ", used), "jinmac-distillery")
  assert.equal(slugify("JINMAC Distillery", used), "jinmac-distillery-2")
})

test("slugify: 영문이 없으면 brand 기반", () => {
  const used = new Set(["brand"])
  assert.equal(slugify("낫개오뎅", used), "brand-2")
})

test("parseBrandInput: 정상 입력을 정규화한다", () => {
  const r = parseBrandInput({
    name_ko: " 위오크 ",
    name_en: "",
    country_ko: "한국",
    website: "https://a.com",
    instagram: "",
    booths: "2",
  })
  assert.deepEqual(r, {
    ok: true,
    value: {
      name_ko: "위오크",
      name_en: null,
      country: "KR",
      country_ko: "한국",
      website: "https://a.com",
      instagram: null,
      booths: 2,
    },
  })
})

test("parseBrandInput: 한글명 누락·알 수 없는 국가·잘못된 URL·부스 0은 거부", () => {
  const base = { name_ko: "a", country_ko: "한국", booths: 1 }
  assert.equal(parseBrandInput({ ...base, name_ko: " " }).ok, false)
  assert.equal(parseBrandInput({ ...base, country_ko: "화성" }).ok, false)
  assert.equal(parseBrandInput({ ...base, website: "a.com" }).ok, false)
  assert.equal(parseBrandInput({ ...base, booths: 0 }).ok, false)
  assert.equal(parseBrandInput(null).ok, false)
})

test("COUNTRY_CODES: 스코틀랜드는 GB-SCT", () => {
  assert.equal(COUNTRY_CODES["스코틀랜드"], "GB-SCT")
})

test("rowToBrand: snake_case 행을 공개 Brand 로 바꾼다", () => {
  const b = rowToBrand({
    slug: "x",
    name_ko: "엑스",
    name_en: null,
    country: "KR",
    country_ko: "한국",
    website: null,
    instagram: null,
    booths: 1,
    logo: "https://p.supabase.co/storage/v1/object/public/brand-logos/x.png",
    logo_bg: null,
    visible: true,
    sort_order: 1,
    created_at: "",
    updated_at: "",
  })
  assert.deepEqual(b, {
    slug: "x",
    nameKo: "엑스",
    nameEn: "",
    country: "KR",
    countryKo: "한국",
    website: null,
    instagram: null,
    booths: 1,
    logo: "https://p.supabase.co/storage/v1/object/public/brand-logos/x.png",
    logoBg: null,
  })
})

test("logoPathFromUrl: 버킷 내부 경로만 뽑고 외부 URL은 null", () => {
  assert.equal(
    logoPathFromUrl("https://p.supabase.co/storage/v1/object/public/brand-logos/a-1.png"),
    "a-1.png",
  )
  assert.equal(logoPathFromUrl("/brands/a.png"), null)
  assert.equal(logoPathFromUrl(null), null)
})
