# 관리자 브랜드 관리 탭 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 참가업체(브랜드)를 Supabase로 옮기고 `/admin/brands`에서 노출 전환·로고 업로드·추가·수정·삭제를 하게 한다. 관리자 주소를 `/admin`(허브) · `/admin/brands` · `/admin/buyer`로 정리한다.

**Architecture:** `brands` 테이블 + public `brand-logos` 버킷. 순수 로직(타입·slug·입력 검증·행 변환)은 의존성 없는 `src/lib/brandRecord.ts`에 두고 Node 내장 테스트로 검증한다. 서버 API(`/api/admin/brands/*`)가 service role로 쓰고 `revalidatePath`로 공개 페이지를 갱신한다. 공개 `/brands`는 `visible=true`만 읽고(ISR 60초), 실패하면 기존 JSON으로 폴백한다.

**Tech Stack:** Next.js 15 App Router, React 19, Tailwind 4, @supabase/supabase-js, exceljs(초기 가져오기), Node 23 `node --test`(type stripping), biome, pnpm.

**작업 원칙:** 로컬(`pnpm dev`)에서 전부 확인하고 사용자에게 보여준 뒤, 사용자 확인을 받고 main에 push(=Vercel 배포)한다. 중간 커밋은 로컬에만.

**스펙 대비 조정 (공개 페이지 코드 확인 결과):**
- 공개 `/brands`는 `BrandsContent`에서 한글명 가나다순으로 정렬하므로 순서 변경 UI/API는 의미가 없어 뺀다. `sort_order`는 관리자 목록 정렬용(엑셀 번호)으로만 쓴다.
- `BrandsContent`는 클라이언트 컴포넌트라 `@/lib/brands`에서 유틸을 import한다. 서버 전용 Supabase 코드를 섞지 않도록 `getBrands`는 `src/lib/brandsServer.ts`로 분리한다.
- 로고 업로드는 png/jpg/webp만 받는다(next/image 원본 최적화 제약, 기존 link-logos.mjs와 동일한 이유로 SVG 제외).

---

## File Structure

| 파일 | 역할 |
|---|---|
| `supabase/brands.sql` (신규) | 테이블 DDL |
| `src/lib/brandRecord.ts` (신규) | `BrandRow`/`Brand` 타입, 국가 매핑, `slugify`, `parseBrandInput`, `rowToBrand`, `logoPathFromUrl` — import 없음 |
| `tests/brandRecord.test.mjs` (신규) | 위 순수 함수 테스트 |
| `src/lib/supabaseAdmin.ts` (수정) | `brands` 테이블 타입, `BRAND_TABLE`, `BRAND_BUCKET` |
| `src/lib/brands.ts` (수정) | 클라이언트 안전 유틸만 남김, `Brand` 재수출, 이니셜 폴백 |
| `src/lib/brandsServer.ts` (신규) | `getBrands()` Supabase + JSON 폴백 |
| `src/lib/brandAdmin.ts` (신규) | API 공통: 401 응답, revalidate, 로고 파일 삭제 |
| `src/app/api/admin/brands/route.ts` (신규) | GET 목록, POST 생성 |
| `src/app/api/admin/brands/[slug]/route.ts` (신규) | PATCH 수정/노출, DELETE |
| `src/app/api/admin/brands/[slug]/logo/route.ts` (신규) | POST 업로드, DELETE 제거 |
| `src/app/admin/AdminLogin.tsx` (이동) | `buyers/`에서 이동 |
| `src/app/admin/AdminTabs.tsx` (신규) | 상단 탭 바 |
| `src/app/admin/page.tsx` (신규) | 허브 |
| `src/app/admin/buyer/*` (이동) | 기존 `buyers/` |
| `src/app/admin/brands/page.tsx`, `BrandsAdmin.tsx`, `BrandEditor.tsx` (신규) | 브랜드 관리 화면 |
| `next.config.ts` (수정) | `/admin/buyers` 리다이렉트, Supabase 이미지 remotePatterns |
| `scripts/import-brands-supabase.mjs` (신규) | 엑셀 57 + JSON 33 → Supabase 1회 가져오기 |
| `package.json` (수정) | `test` 스크립트 |
| `../캐스크카니발_참가업체_추가하는법.md` (수정, 저장소 밖) | 관리자 페이지 사용법으로 교체 |

---

### Task 1: 순수 로직 `brandRecord.ts` (TDD)

**Files:**
- Create: `src/lib/brandRecord.ts`
- Test: `tests/brandRecord.test.mjs`
- Modify: `package.json` (scripts)

- [ ] **Step 1: 실패하는 테스트 작성** — `tests/brandRecord.test.mjs`

```js
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
```

`package.json` scripts에 추가:

```json
"test": "node --test tests/"
```

- [ ] **Step 2: 실패 확인**

Run: `pnpm test`
Expected: FAIL — `Cannot find module '.../src/lib/brandRecord.ts'`

- [ ] **Step 3: 구현** — `src/lib/brandRecord.ts`

```ts
// 브랜드 데이터의 순수 로직. 서버·클라이언트·Node 스크립트/테스트가 함께 쓰므로
// 어떤 모듈도 import 하지 않는다 (Node type stripping 으로 바로 실행되어야 함).

export interface Brand {
  /** kebab-case 고유 키 */
  slug: string
  nameKo: string
  nameEn: string
  /** ISO 3166-1 alpha-2. 스코틀랜드는 GB-SCT */
  country: string
  countryKo: string
  website: string | null
  instagram: string | null
  booths: number
  /** 로고 URL. null 이면 이니셜 플레이스홀더 */
  logo: string | null
  /** 로고 배경색. null 이면 흰 배경 */
  logoBg?: string | null
}

/** Supabase public.brands 행 */
export interface BrandRow {
  slug: string
  name_ko: string
  name_en: string | null
  country: string
  country_ko: string
  website: string | null
  instagram: string | null
  booths: number
  logo: string | null
  logo_bg: string | null
  visible: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/** 관리자 화면 국가 선택지 (한글명 → 코드) */
export const COUNTRY_CODES: Record<string, string> = {
  한국: "KR",
  일본: "JP",
  대만: "TW",
  영국: "GB",
  스코틀랜드: "GB-SCT",
  아일랜드: "IE",
  미국: "US",
  프랑스: "FR",
  네덜란드: "NL",
  인도: "IN",
}

export const BRAND_BUCKET_NAME = "brand-logos"

export function slugify(name: string, used: Set<string>): string {
  const base =
    name
      .normalize("NFKD")
      .replace(/[^A-Za-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "brand"
  let slug = base
  let n = 2
  while (used.has(slug)) {
    slug = `${base}-${n}`
    n += 1
  }
  used.add(slug)
  return slug
}

export interface BrandInput {
  name_ko: string
  name_en: string | null
  country: string
  country_ko: string
  website: string | null
  instagram: string | null
  booths: number
}

type ParseResult = { ok: true; value: BrandInput } | { ok: false; error: string }

function optionalText(v: unknown): string | null {
  if (typeof v !== "string") return null
  const t = v.replace(/ /g, " ").trim()
  return t === "" ? null : t
}

function optionalUrl(v: unknown): string | null | undefined {
  const t = optionalText(v)
  if (t === null) return null
  return /^https?:\/\/\S+$/i.test(t) ? t : undefined
}

/** 관리자 폼 입력을 검증·정규화한다. undefined 는 형식 오류를 뜻한다. */
export function parseBrandInput(raw: unknown): ParseResult {
  if (!raw || typeof raw !== "object") return { ok: false, error: "입력이 없습니다." }
  const r = raw as Record<string, unknown>

  const name_ko = optionalText(r.name_ko)
  if (!name_ko) return { ok: false, error: "한글명은 필수입니다." }

  const country_ko = optionalText(r.country_ko) ?? ""
  const country = COUNTRY_CODES[country_ko]
  if (!country) return { ok: false, error: "국가를 선택해 주세요." }

  const website = optionalUrl(r.website)
  if (website === undefined) return { ok: false, error: "홈페이지는 http(s):// 로 시작해야 합니다." }
  const instagram = optionalUrl(r.instagram)
  if (instagram === undefined) return { ok: false, error: "인스타그램은 http(s):// 로 시작해야 합니다." }

  const booths = Number(r.booths)
  if (!Number.isInteger(booths) || booths < 1) {
    return { ok: false, error: "부스 수는 1 이상의 정수여야 합니다." }
  }

  return {
    ok: true,
    value: {
      name_ko,
      name_en: optionalText(r.name_en),
      country,
      country_ko,
      website,
      instagram,
      booths,
    },
  }
}

export function rowToBrand(row: BrandRow): Brand {
  return {
    slug: row.slug,
    nameKo: row.name_ko,
    nameEn: row.name_en ?? "",
    country: row.country,
    countryKo: row.country_ko,
    website: row.website,
    instagram: row.instagram,
    booths: row.booths,
    logo: row.logo,
    logoBg: row.logo_bg,
  }
}

/** 버킷 public URL 에서 객체 경로를 뽑는다. 버킷 밖 경로면 null. */
export function logoPathFromUrl(url: string | null): string | null {
  if (!url) return null
  const marker = `/storage/v1/object/public/${BRAND_BUCKET_NAME}/`
  const i = url.indexOf(marker)
  return i === -1 ? null : decodeURIComponent(url.slice(i + marker.length))
}
```

- [ ] **Step 4: 통과 확인**

Run: `pnpm test`
Expected: 7 tests pass, 0 fail

- [ ] **Step 5: Commit**

```bash
git add src/lib/brandRecord.ts tests/brandRecord.test.mjs package.json
git commit -m "feat(brands): 브랜드 레코드 순수 로직과 테스트 추가"
```

---

### Task 2: Supabase 테이블 생성

**Files:**
- Create: `supabase/brands.sql`

- [ ] **Step 1: SQL 작성**

```sql
-- 참가업체(브랜드). 관리자 API(service role)만 읽고 쓴다.
create table if not exists public.brands (
  slug text primary key,
  name_ko text not null,
  name_en text,
  country text not null,
  country_ko text not null,
  website text,
  instagram text,
  booths int not null default 1 check (booths >= 1),
  logo text,
  logo_bg text,
  visible boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 정책을 두지 않아 anon 접근은 모두 막히고 service role 만 통과한다.
alter table public.brands enable row level security;
```

- [ ] **Step 2: 실행**

Supabase 대시보드 → SQL Editor → New query → 위 내용 붙여넣고 Run. (브라우저 자동화가 가능하면 claude-in-chrome으로, 로그인이 막히면 사용자에게 붙여넣기를 요청.)

확인:

```bash
node --env-file=.env.local -e 'const {createClient}=require("@supabase/supabase-js");createClient(process.env.SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY).from("brands").select("slug",{count:"exact",head:true}).then(r=>console.log(r.error?.message??`count=${r.count}`))'
```

Expected: `count=0`

- [ ] **Step 3: Commit**

```bash
git add supabase/brands.sql
git commit -m "feat(brands): brands 테이블 DDL 추가"
```

---

### Task 3: Supabase 타입과 서버 로더 분리

**Files:**
- Modify: `src/lib/supabaseAdmin.ts`
- Modify: `src/lib/brands.ts`
- Create: `src/lib/brandsServer.ts`
- Modify: `src/app/brands/page.tsx`
- Modify: `src/components/2026/BrandsContent.tsx:91`

- [ ] **Step 1: `supabaseAdmin.ts`에 테이블 타입·상수 추가**

import 추가:

```ts
import type { BrandRow } from "./brandRecord"
```

`Tables` 안 `buyer_applications` 뒤에:

```ts
      brands: {
        Row: BrandRow
        Insert: Omit<BrandRow, "created_at" | "updated_at"> & {
          created_at?: string
          updated_at?: string
        }
        Update: Partial<BrandRow>
        Relationships: []
      }
```

`BUYER_BUCKET` 아래:

```ts
export const BRAND_TABLE = "brands"
export { BRAND_BUCKET_NAME as BRAND_BUCKET } from "./brandRecord"
```

- [ ] **Step 2: `brands.ts`에서 로더를 걷어내고 타입을 재수출**

파일 상단(주석~`getBrands` 끝)을 다음으로 교체:

```ts
// 참가 업체 표시용 유틸. 클라이언트 컴포넌트도 import 하므로 서버 전용 코드를 두지 않는다.
// 데이터 로더는 brandsServer.ts 에 있다.

import type { Brand } from "./brandRecord"

export type { Brand }
```

`brandInitials`를 한글명 폴백을 받도록 교체:

```ts
/** 로고가 없을 때 쓰는 이니셜 (영문명 기준, 최대 2자). 영문명이 없으면 한글명 앞 2자. */
export function brandInitials(nameEn: string, nameKo = ""): string {
  const words = nameEn.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return nameKo.trim().slice(0, 2) || "?"
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return (words[0][0] + words[1][0]).toUpperCase()
}
```

- [ ] **Step 3: `src/lib/brandsServer.ts` 작성**

```ts
// 공개 페이지용 참가 업체 로더. Supabase 에서 노출 중인 업체만 읽고,
// 실패하면 배포 시점 JSON 으로 폴백해 페이지가 비지 않게 한다.
import "server-only"
import fallbackBrands from "@/content/brands2026.json"
import { type Brand, rowToBrand } from "./brandRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "./supabaseAdmin"

export async function getBrands(): Promise<Brand[]> {
  try {
    const { data, error } = await getSupabaseAdmin()
      .from(BRAND_TABLE)
      .select("*")
      .eq("visible", true)
      .order("sort_order")
    if (error) throw error
    return (data ?? []).map(rowToBrand)
  } catch (e) {
    console.error("[brands] Supabase 조회 실패, JSON 폴백 사용:", e)
    return fallbackBrands as Brand[]
  }
}
```

- [ ] **Step 4: `src/app/brands/page.tsx` 수정**

```ts
import { getBrands } from "@/lib/brandsServer"
```

`metadata` 아래에:

```ts
// 관리자 변경은 revalidatePath 로 즉시 반영되고, 그 외에도 60초마다 갱신한다.
export const revalidate = 60
```

함수를 async로:

```tsx
export default async function BrandsPage() {
  const brands = await getBrands()
```

- [ ] **Step 5: `BrandsContent.tsx:91` 이니셜 호출 수정**

```tsx
                      {brandInitials(brand.nameEn, brand.nameKo)}
```

- [ ] **Step 6: 타입 체크**

Run: `pnpm exec tsc --noEmit`
Expected: 에러 없음

- [ ] **Step 7: Commit**

```bash
git add src/lib src/app/brands/page.tsx src/components/2026/BrandsContent.tsx
git commit -m "refactor(brands): 공개 페이지가 Supabase 에서 노출 업체를 읽도록 로더 분리"
```

---

### Task 4: 이미지 도메인 허용 + 기존 주소 리다이렉트

**Files:**
- Modify: `next.config.ts`

- [ ] **Step 1: `images`와 `redirects` 추가**

```ts
  images: {
    formats: ["image/avif", "image/webp"],
    // 관리자 페이지에서 올린 로고 (Supabase Storage public 버킷)
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/brand-logos/**",
      },
    ],
  },
  async redirects() {
    // 공개 사이트 /buyer 와 맞추기 위해 이름을 바꿨다. 예전 북마크를 살린다.
    return [{ source: "/admin/buyers", destination: "/admin/buyer", permanent: true }]
  },
```

- [ ] **Step 2: Commit**

```bash
git add next.config.ts
git commit -m "chore(next): Supabase 로고 이미지 허용, /admin/buyers 리다이렉트"
```

---

### Task 5: 초기 가져오기 스크립트

**Files:**
- Create: `scripts/import-brands-supabase.mjs`

- [ ] **Step 1: 스크립트 작성**

```js
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
const MIME = { ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp" }

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
})

const norm = (s) => String(s ?? "").normalize("NFC").replace(/\s+/g, "").toLowerCase()
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
```

- [ ] **Step 2: 실행**

Run: `node --env-file=.env.local scripts/import-brands-supabase.mjs`
Expected: 마지막 줄 `완료: 전체 57 / 노출 33 / 숨김 24`, `JSON 에만 있고 엑셀에 없음` 경고 없음. 경고가 나오면 이름 차이를 확인하고 `norm` 매칭을 보정한 뒤 재실행.

- [ ] **Step 3: Commit**

```bash
git add scripts/import-brands-supabase.mjs
git commit -m "feat(brands): 엑셀·기존 JSON 을 Supabase 로 가져오는 스크립트"
```

---

### Task 6: 관리자 브랜드 API

**Files:**
- Create: `src/lib/brandAdmin.ts`
- Create: `src/app/api/admin/brands/route.ts`
- Create: `src/app/api/admin/brands/[slug]/route.ts`
- Create: `src/app/api/admin/brands/[slug]/logo/route.ts`

- [ ] **Step 1: 공통 헬퍼 `src/lib/brandAdmin.ts`**

```ts
import "server-only"
import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { logoPathFromUrl } from "./brandRecord"
import { BRAND_BUCKET, getSupabaseAdmin } from "./supabaseAdmin"

export function fail(error: string, status: number) {
  return NextResponse.json({ ok: false, error }, { status })
}

export const unauthorized = () => fail("권한이 없습니다.", 401)

/** 공개 참가업체 페이지를 즉시 다시 그리게 한다. */
export function revalidateBrands() {
  revalidatePath("/brands")
}

/** 버킷에 있는 로고 파일만 지운다. (실패해도 본 작업은 막지 않는다) */
export async function removeLogoFile(url: string | null) {
  const objectPath = logoPathFromUrl(url)
  if (!objectPath) return
  const { error } = await getSupabaseAdmin().storage.from(BRAND_BUCKET).remove([objectPath])
  if (error) console.error("[brands] 로고 파일 삭제 실패:", error.message)
}
```

- [ ] **Step 2: `src/app/api/admin/brands/route.ts`**

```ts
import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, unauthorized } from "@/lib/brandAdmin"
import { parseBrandInput, slugify } from "@/lib/brandRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

export async function GET() {
  if (!(await isAdminRequest())) return unauthorized()
  const { data, error } = await getSupabaseAdmin().from(BRAND_TABLE).select("*").order("sort_order")
  if (error) return fail(error.message, 500)
  return NextResponse.json({ ok: true, brands: data ?? [] })
}

/** 새 브랜드는 숨김 상태로 목록 맨 뒤에 추가한다. */
export async function POST(request: NextRequest) {
  if (!(await isAdminRequest())) return unauthorized()

  const parsed = parseBrandInput(await request.json().catch(() => null))
  if (!parsed.ok) return fail(parsed.error, 400)

  const db = getSupabaseAdmin()
  const { data: existing, error: listError } = await db.from(BRAND_TABLE).select("slug, sort_order")
  if (listError) return fail(listError.message, 500)

  const used = new Set((existing ?? []).map((b) => b.slug))
  const maxOrder = Math.max(0, ...(existing ?? []).map((b) => b.sort_order))

  const { data, error } = await db
    .from(BRAND_TABLE)
    .insert({
      ...parsed.value,
      slug: slugify(parsed.value.name_en ?? parsed.value.name_ko, used),
      logo: null,
      logo_bg: null,
      visible: false,
      sort_order: maxOrder + 1,
    })
    .select()
    .single()
  if (error) return fail(error.message, 500)

  return NextResponse.json({ ok: true, brand: data })
}
```

- [ ] **Step 3: `src/app/api/admin/brands/[slug]/route.ts`**

```ts
import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, removeLogoFile, revalidateBrands, unauthorized } from "@/lib/brandAdmin"
import { type BrandRow, parseBrandInput } from "@/lib/brandRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ slug: string }> }

/** 노출 전환({visible})과 정보 수정(폼 전체)을 모두 받는다. */
export async function PATCH(request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { slug } = await params
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null
  if (!body) return fail("입력이 없습니다.", 400)

  const patch: Partial<BrandRow> = { updated_at: new Date().toISOString() }
  if (typeof body.visible === "boolean") patch.visible = body.visible
  if ("name_ko" in body) {
    const parsed = parseBrandInput(body)
    if (!parsed.ok) return fail(parsed.error, 400)
    Object.assign(patch, parsed.value)
  }
  if (Object.keys(patch).length === 1) return fail("변경할 내용이 없습니다.", 400)

  const { data, error } = await getSupabaseAdmin()
    .from(BRAND_TABLE)
    .update(patch)
    .eq("slug", slug)
    .select()
    .single()
  if (error) return fail(error.message, 500)

  revalidateBrands()
  return NextResponse.json({ ok: true, brand: data })
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { slug } = await params

  const { data, error } = await getSupabaseAdmin()
    .from(BRAND_TABLE)
    .delete()
    .eq("slug", slug)
    .select("logo")
    .single()
  if (error) return fail(error.message, 500)

  await removeLogoFile(data.logo)
  revalidateBrands()
  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: `src/app/api/admin/brands/[slug]/logo/route.ts`**

```ts
import { type NextRequest, NextResponse } from "next/server"
import { isAdminRequest } from "@/lib/adminAuth"
import { fail, removeLogoFile, revalidateBrands, unauthorized } from "@/lib/brandAdmin"
import { BRAND_BUCKET, BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

type Ctx = { params: Promise<{ slug: string }> }

const EXT: Record<string, string> = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" }
const MAX_BYTES = 5 * 1024 * 1024

async function currentLogo(slug: string) {
  return getSupabaseAdmin().from(BRAND_TABLE).select("logo").eq("slug", slug).single()
}

async function setLogo(slug: string, logo: string | null) {
  return getSupabaseAdmin()
    .from(BRAND_TABLE)
    .update({ logo, logo_bg: null, updated_at: new Date().toISOString() })
    .eq("slug", slug)
    .select()
    .single()
}

/** 파일명에 시각을 넣어 CDN·next/image 캐시가 옛 로고를 보여주지 않게 한다. */
export async function POST(request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { slug } = await params

  const file = (await request.formData()).get("file")
  if (!(file instanceof File)) return fail("파일이 없습니다.", 400)
  const ext = EXT[file.type]
  if (!ext) return fail("PNG, JPG, WebP 파일만 올릴 수 있습니다.", 400)
  if (file.size > MAX_BYTES) return fail("5MB 이하 파일만 올릴 수 있습니다.", 400)

  const prev = await currentLogo(slug)
  if (prev.error) return fail("브랜드를 찾을 수 없습니다.", 404)

  const db = getSupabaseAdmin()
  const objectPath = `${slug}-${Date.now()}.${ext}`
  const { error: uploadError } = await db.storage
    .from(BRAND_BUCKET)
    .upload(objectPath, await file.arrayBuffer(), { contentType: file.type })
  if (uploadError) return fail(uploadError.message, 500)

  const url = db.storage.from(BRAND_BUCKET).getPublicUrl(objectPath).data.publicUrl
  const { data, error } = await setLogo(slug, url)
  if (error) return fail(error.message, 500)

  await removeLogoFile(prev.data.logo)
  revalidateBrands()
  return NextResponse.json({ ok: true, brand: data })
}

export async function DELETE(_request: NextRequest, { params }: Ctx) {
  if (!(await isAdminRequest())) return unauthorized()
  const { slug } = await params

  const prev = await currentLogo(slug)
  if (prev.error) return fail("브랜드를 찾을 수 없습니다.", 404)

  const { data, error } = await setLogo(slug, null)
  if (error) return fail(error.message, 500)

  await removeLogoFile(prev.data.logo)
  revalidateBrands()
  return NextResponse.json({ ok: true, brand: data })
}
```

- [ ] **Step 5: 타입 체크 + 비인증 요청 확인**

Run: `pnpm exec tsc --noEmit`
Expected: 에러 없음

`pnpm dev` 실행 후:

Run: `curl -s localhost:3000/api/admin/brands`
Expected: `{"ok":false,"error":"권한이 없습니다."}`

- [ ] **Step 6: Commit**

```bash
git add src/lib/brandAdmin.ts src/app/api/admin/brands
git commit -m "feat(admin): 브랜드 CRUD·노출 전환·로고 업로드 API"
```

---

### Task 7: 관리자 주소 재구성 (`/admin` 허브, `/admin/buyer`, 탭 바)

**Files:**
- Move: `src/app/admin/buyers/` → `src/app/admin/buyer/`
- Move: `src/app/admin/buyer/AdminLogin.tsx` → `src/app/admin/AdminLogin.tsx`
- Create: `src/app/admin/AdminTabs.tsx`
- Create: `src/app/admin/page.tsx`
- Modify: `src/app/admin/buyer/page.tsx`

- [ ] **Step 1: 이동**

```bash
git mv src/app/admin/buyers src/app/admin/buyer
git mv src/app/admin/buyer/AdminLogin.tsx src/app/admin/AdminLogin.tsx
```

- [ ] **Step 2: `src/app/admin/AdminTabs.tsx`**

```tsx
import Link from "next/link"

const TABS = [
  { key: "brands", href: "/admin/brands", label: "브랜드 관리" },
  { key: "buyer", href: "/admin/buyer", label: "바이어 관리" },
] as const

export type AdminTabKey = (typeof TABS)[number]["key"]

/** 관리자 페이지 공통 상단 탭. 각 화면의 자체 헤더 위에 얹는다. */
export default function AdminTabs({ active }: { active?: AdminTabKey }) {
  return (
    <nav className="bg-[#111] text-white border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 flex gap-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`px-4 py-3 text-[13px] font-bold border-b-2 transition-colors ${
              active === t.key
                ? "border-[#7d0b1c] text-white"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
```

- [ ] **Step 3: `src/app/admin/page.tsx` (허브)**

```tsx
import type { Metadata } from "next"
import Link from "next/link"
import { isAdminRequest } from "@/lib/adminAuth"
import AdminLogin from "./AdminLogin"
import AdminTabs from "./AdminTabs"

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminHomePage() {
  if (!(await isAdminRequest())) return <AdminLogin />

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <AdminTabs />
      <div className="max-w-[720px] mx-auto px-5 py-16 grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/brands"
          className="bg-white border border-black/10 rounded p-6 hover:border-[#7d0b1c]"
        >
          <p className="text-[17px] font-extrabold">브랜드 관리</p>
          <p className="text-[13px] text-[#888] mt-1">참가업체 노출·로고·정보</p>
        </Link>
        <Link
          href="/admin/buyer"
          className="bg-white border border-black/10 rounded p-6 hover:border-[#7d0b1c]"
        >
          <p className="text-[17px] font-extrabold">바이어 관리</p>
          <p className="text-[13px] text-[#888] mt-1">바이어 신청 승인·메일 발송</p>
        </Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: `src/app/admin/buyer/page.tsx` 수정**

import 교체:

```tsx
import AdminLogin from "../AdminLogin"
import AdminTabs from "../AdminTabs"
import AdminDashboard from "./AdminDashboard"
```

함수명 `AdminBuyersPage` → `AdminBuyerPage`, 마지막 return 교체:

```tsx
  return (
    <>
      <AdminTabs active="buyer" />
      <AdminDashboard initialRows={(data ?? []) as BuyerApplication[]} />
    </>
  )
```

- [ ] **Step 5: 확인**

Run: `pnpm exec tsc --noEmit` → 에러 없음
`pnpm dev`에서 `curl -sI localhost:3000/admin/buyers | head -3` → `308` 과 `location: /admin/buyer`
브라우저로 `/admin` 로그인 → 탭 2개와 카드 2개, `/admin/buyer` 기존 기능 정상.

- [ ] **Step 6: Commit**

```bash
git add -A src/app/admin
git commit -m "feat(admin): /admin 허브와 공통 탭 추가, 바이어 관리를 /admin/buyer 로 이동"
```

---

### Task 8: 브랜드 관리 화면

**Files:**
- Create: `src/app/admin/brands/page.tsx`
- Create: `src/app/admin/brands/BrandsAdmin.tsx`
- Create: `src/app/admin/brands/BrandEditor.tsx`

- [ ] **Step 1: `page.tsx`**

```tsx
import type { Metadata } from "next"
import { isAdminRequest } from "@/lib/adminAuth"
import type { BrandRow } from "@/lib/brandRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"
import AdminLogin from "../AdminLogin"
import AdminTabs from "../AdminTabs"
import BrandsAdmin from "./BrandsAdmin"

export const metadata: Metadata = {
  title: "브랜드 관리",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminBrandsPage() {
  if (!(await isAdminRequest())) return <AdminLogin />

  const { data, error } = await getSupabaseAdmin()
    .from(BRAND_TABLE)
    .select("*")
    .order("sort_order")

  return (
    <>
      <AdminTabs active="brands" />
      {error ? (
        <div className="min-h-[60vh] flex items-center justify-center px-5 text-center">
          <div>
            <p className="font-bold text-[#7d0b1c]">데이터를 불러오지 못했습니다.</p>
            <p className="text-[13px] text-[#888] mt-2">{error.message}</p>
          </div>
        </div>
      ) : (
        <BrandsAdmin initialRows={(data ?? []) as BrandRow[]} />
      )}
    </>
  )
}
```

- [ ] **Step 2: `BrandEditor.tsx`**

```tsx
"use client"

import { useRef, useState } from "react"
import { type BrandRow, COUNTRY_CODES } from "@/lib/brandRecord"

type Result = { ok: boolean; error?: string; brand?: BrandRow }

async function call(url: string, init: RequestInit): Promise<Result> {
  try {
    const res = await fetch(url, init)
    return (await res.json()) as Result
  } catch {
    return { ok: false, error: "네트워크 오류가 발생했습니다." }
  }
}

const inputCls =
  "w-full border border-black/15 rounded px-3 py-2 text-[14px] focus:outline-none focus:border-[#7d0b1c]"

/** row 가 null 이면 새 브랜드 작성. 저장하면 해당 행으로 전환돼 로고를 이어서 올릴 수 있다. */
export default function BrandEditor({
  row,
  onSaved,
  onDeleted,
  onClose,
}: {
  row: BrandRow | null
  onSaved: (row: BrandRow) => void
  onDeleted: (slug: string) => void
  onClose: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const body = JSON.stringify(Object.fromEntries(new FormData(e.currentTarget)))
    const r = row
      ? await call(`/api/admin/brands/${row.slug}`, { method: "PATCH", body })
      : await call("/api/admin/brands", { method: "POST", body })
    setBusy(false)
    if (r.ok && r.brand) onSaved(r.brand)
    else setError(r.error ?? "저장하지 못했습니다.")
  }

  async function upload(file: File) {
    if (!row) return
    setBusy(true)
    setError(null)
    const form = new FormData()
    form.append("file", file)
    const r = await call(`/api/admin/brands/${row.slug}/logo`, { method: "POST", body: form })
    setBusy(false)
    if (r.ok && r.brand) onSaved(r.brand)
    else setError(r.error ?? "업로드하지 못했습니다.")
  }

  async function removeLogo() {
    if (!row) return
    setBusy(true)
    const r = await call(`/api/admin/brands/${row.slug}/logo`, { method: "DELETE" })
    setBusy(false)
    if (r.ok && r.brand) onSaved(r.brand)
    else setError(r.error ?? "로고를 지우지 못했습니다.")
  }

  async function remove() {
    if (!row || !window.confirm(`'${row.name_ko}' 브랜드를 삭제할까요? 되돌릴 수 없습니다.`)) return
    setBusy(true)
    const r = await call(`/api/admin/brands/${row.slug}`, { method: "DELETE" })
    setBusy(false)
    if (r.ok) onDeleted(row.slug)
    else setError(r.error ?? "삭제하지 못했습니다.")
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-start md:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        className="bg-white rounded w-full max-w-[560px] p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[17px] font-extrabold">{row ? row.name_ko : "새 브랜드"}</h2>
          <button type="button" onClick={onClose} className="text-[#888] text-[13px]">
            닫기
          </button>
        </div>

        {row && (
          <div
            className={`mb-5 border-2 border-dashed rounded p-4 flex items-center gap-4 ${
              dragOver ? "border-[#7d0b1c] bg-[#7d0b1c]/5" : "border-black/15"
            }`}
            onDragOver={(e) => {
              e.preventDefault()
              setDragOver(true)
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault()
              setDragOver(false)
              const f = e.dataTransfer.files[0]
              if (f) upload(f)
            }}
          >
            <div className="w-20 h-20 shrink-0 bg-[#f6f5f5] rounded flex items-center justify-center overflow-hidden">
              {row.logo ? (
                // biome-ignore lint/performance/noImgElement: 관리자 미리보기라 최적화 불필요
                <img src={row.logo} alt="" className="max-w-full max-h-full object-contain" />
              ) : (
                <span className="text-[11px] text-[#aaa]">로고 없음</span>
              )}
            </div>
            <div className="text-[13px]">
              <p className="text-[#666]">여기로 끌어다 놓거나</p>
              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileRef.current?.click()}
                  className="border border-black/15 rounded px-3 py-1.5 font-semibold"
                >
                  파일 선택
                </button>
                {row.logo && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={removeLogo}
                    className="text-[#7d0b1c] px-2 font-semibold"
                  >
                    로고 삭제
                  </button>
                )}
              </div>
              <p className="text-[11px] text-[#aaa] mt-2">PNG·JPG·WebP, 5MB 이하. 투명 배경 정사각형 권장</p>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0]
                if (f) upload(f)
                e.target.value = ""
              }}
            />
          </div>
        )}

        <form onSubmit={save} className="grid grid-cols-2 gap-3 text-[13px]">
          <label className="col-span-2 sm:col-span-1">
            한글명 *
            <input name="name_ko" required defaultValue={row?.name_ko ?? ""} className={inputCls} />
          </label>
          <label className="col-span-2 sm:col-span-1">
            영문명
            <input name="name_en" defaultValue={row?.name_en ?? ""} className={inputCls} />
          </label>
          <label>
            국가 *
            <select name="country_ko" required defaultValue={row?.country_ko ?? ""} className={inputCls}>
              <option value="" disabled>
                선택
              </option>
              {Object.keys(COUNTRY_CODES).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>
          <label>
            부스 수 *
            <input
              name="booths"
              type="number"
              min={1}
              required
              defaultValue={row?.booths ?? 1}
              className={inputCls}
            />
          </label>
          <label className="col-span-2">
            홈페이지
            <input name="website" type="url" defaultValue={row?.website ?? ""} className={inputCls} />
          </label>
          <label className="col-span-2">
            인스타그램
            <input name="instagram" type="url" defaultValue={row?.instagram ?? ""} className={inputCls} />
          </label>

          {error && <p className="col-span-2 text-[#7d0b1c] font-semibold">{error}</p>}

          <div className="col-span-2 flex items-center gap-2 mt-2">
            {row && (
              <button type="button" disabled={busy} onClick={remove} className="text-[#7d0b1c] font-semibold">
                브랜드 삭제
              </button>
            )}
            <button
              type="submit"
              disabled={busy}
              className="ml-auto bg-[#7d0b1c] text-white rounded px-5 py-2 font-bold disabled:opacity-50"
            >
              {busy ? "처리 중…" : row ? "저장" : "추가"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: `BrandsAdmin.tsx`**

```tsx
"use client"

import { useMemo, useState } from "react"
import type { BrandRow } from "@/lib/brandRecord"
import BrandEditor from "./BrandEditor"

type Filter = "all" | "visible" | "hidden" | "nologo"

const FILTER_LABEL: Record<Filter, string> = {
  all: "전체",
  visible: "노출중",
  hidden: "숨김",
  nologo: "로고 없음",
}

function matches(row: BrandRow, f: Filter) {
  if (f === "visible") return row.visible
  if (f === "hidden") return !row.visible
  if (f === "nologo") return !row.logo
  return true
}

export default function BrandsAdmin({ initialRows }: { initialRows: BrandRow[] }) {
  const [rows, setRows] = useState(initialRows)
  const [filter, setFilter] = useState<Filter>("all")
  const [query, setQuery] = useState("")
  // undefined: 닫힘, null: 새 브랜드, string: 편집 중인 slug
  const [editing, setEditing] = useState<string | null | undefined>(undefined)
  const [message, setMessage] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c = { all: 0, visible: 0, hidden: 0, nologo: 0 } as Record<Filter, number>
    for (const r of rows) for (const f of Object.keys(c) as Filter[]) if (matches(r, f)) c[f]++
    return c
  }, [rows])

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return rows.filter(
      (r) =>
        matches(r, filter) &&
        (!q || r.name_ko.toLowerCase().includes(q) || (r.name_en ?? "").toLowerCase().includes(q)),
    )
  }, [rows, filter, query])

  function upsertRow(row: BrandRow) {
    setRows((prev) =>
      prev.some((r) => r.slug === row.slug)
        ? prev.map((r) => (r.slug === row.slug ? row : r))
        : [...prev, row],
    )
  }

  async function toggle(row: BrandRow) {
    const next = !row.visible
    if (next && !row.logo && !window.confirm(`'${row.name_ko}'은(는) 로고가 없습니다. 로고 없이 노출할까요?`)) {
      return
    }
    setMessage(null)
    upsertRow({ ...row, visible: next })
    try {
      const res = await fetch(`/api/admin/brands/${row.slug}`, {
        method: "PATCH",
        body: JSON.stringify({ visible: next }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string; brand?: BrandRow }
      if (!data.ok || !data.brand) throw new Error(data.error)
      upsertRow(data.brand)
    } catch (e) {
      upsertRow(row)
      setMessage(`노출 상태를 바꾸지 못했습니다. ${e instanceof Error ? (e.message ?? "") : ""}`)
    }
  }

  const editingRow = typeof editing === "string" ? (rows.find((r) => r.slug === editing) ?? null) : null

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-5 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-[17px] font-extrabold tracking-tight">브랜드 관리</h1>
            <p className="text-white/50 text-[12px] mt-0.5">노출중인 브랜드만 참가업체 페이지에 보입니다</p>
          </div>
          <button
            type="button"
            onClick={() => setEditing(null)}
            className="bg-white text-[#1a1a1a] rounded px-4 py-2 text-[13px] font-bold"
          >
            + 브랜드 추가
          </button>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-8">
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {(Object.keys(FILTER_LABEL) as Filter[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded text-[13px] font-semibold border transition-colors ${
                filter === k
                  ? "bg-[#7d0b1c] text-white border-[#7d0b1c]"
                  : "bg-white border-black/10 hover:border-black/25"
              }`}
            >
              {FILTER_LABEL[k]} {counts[k]}
            </button>
          ))}
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="이름 검색"
            className="ml-auto bg-white border border-black/10 rounded px-3 py-2 text-[13px] w-full sm:w-[220px]"
          />
        </div>

        {message && <p className="mb-4 text-[13px] font-semibold text-[#7d0b1c]">{message}</p>}

        <ul className="bg-white border border-black/10 rounded divide-y divide-black/5">
          {shown.map((row) => (
            <li key={row.slug} className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => setEditing(row.slug)}
                className="flex items-center gap-3 flex-1 min-w-0 text-left"
              >
                <span className="w-12 h-12 shrink-0 rounded bg-[#f6f5f5] flex items-center justify-center overflow-hidden">
                  {row.logo ? (
                    // biome-ignore lint/performance/noImgElement: 관리자 썸네일
                    <img src={row.logo} alt="" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <span className="text-[10px] text-[#aaa]">없음</span>
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block text-[14px] font-bold truncate">{row.name_ko}</span>
                  <span className="block text-[12px] text-[#888] truncate">
                    {row.name_en ?? "-"} · {row.country_ko} · 부스 {row.booths}
                  </span>
                </span>
              </button>
              <button
                type="button"
                onClick={() => toggle(row)}
                aria-pressed={row.visible}
                className={`shrink-0 rounded-full px-3 py-1.5 text-[12px] font-bold border ${
                  row.visible
                    ? "bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/30"
                    : "bg-black/5 text-[#777] border-black/15"
                }`}
              >
                {row.visible ? "노출중" : "숨김"}
              </button>
            </li>
          ))}
          {shown.length === 0 && <li className="px-4 py-10 text-center text-[13px] text-[#888]">결과가 없습니다.</li>}
        </ul>
      </div>

      {editing !== undefined && (
        <BrandEditor
          key={editingRow?.slug ?? "new"}
          row={editingRow}
          onSaved={(saved) => {
            upsertRow(saved)
            setEditing(saved.slug)
          }}
          onDeleted={(slug) => {
            setRows((prev) => prev.filter((r) => r.slug !== slug))
            setEditing(undefined)
          }}
          onClose={() => setEditing(undefined)}
        />
      )}
    </div>
  )
}
```

주의: 새 브랜드를 저장하면 `setEditing(saved.slug)`로 `key`가 바뀌어 편집기가 새 행 기준으로 다시 열린다 → 바로 로고 업로드 가능.

- [ ] **Step 4: 린트·타입**

Run: `pnpm lint && pnpm exec tsc --noEmit`
Expected: 에러 없음 (biome 자동 포맷 변경은 그대로 둔다)

- [ ] **Step 5: Commit**

```bash
git add src/app/admin/brands
git commit -m "feat(admin): 브랜드 관리 화면 (노출 전환·추가·수정·삭제·로고 업로드)"
```

---

### Task 9: 로컬 통합 확인

- [ ] **Step 1:** `pnpm test` → 전부 통과
- [ ] **Step 2:** `pnpm build` → 성공 (`/brands`가 ISR `revalidate: 60`으로 표시)
- [ ] **Step 3:** `pnpm dev` 후 브라우저(claude-in-chrome)로 확인:
  1. `/admin` 로그인 → 탭 2개와 카드 2개
  2. `/admin/buyers` → `/admin/buyer`로 이동, 기존 목록·승인·메일 탭 정상
  3. `/admin/brands` → 전체 57 / 노출중 33 / 숨김 24
  4. `/brands` → 기존과 같은 33개, 로고가 Supabase URL로 정상 표시
  5. 테스트 브랜드 "테스트브랜드" 추가 → 로고 업로드 → 노출 전환 → `/brands` 새로고침 시 보임 → 숨김 → 사라짐 → 삭제
  6. 로고 없는 숨김 브랜드 노출 시 확인창이 뜨는지
- [ ] **Step 4:** 결과(스크린샷 포함)를 사용자에게 보고하고 `http://localhost:3000/admin`에서 직접 확인을 요청한다. **사용자 확인 전에는 push하지 않는다.**

---

### Task 10: 문서 갱신 후 배포 (사용자 확인 후)

**Files:**
- Modify: `../캐스크카니발_참가업체_추가하는법.md` (저장소 밖)

- [ ] **Step 1: 사용법 문서 교체**

```markdown
# 참가 업체 관리하는 법

참가 업체는 관리자 페이지에서 관리합니다. 코드 수정이나 배포가 필요 없습니다.

1. https://<사이트 주소>/admin 접속 → 관리자 비밀번호로 로그인
2. **브랜드 관리** 탭

| 하고 싶은 일 | 방법 |
|---|---|
| 사이트에 보이기/숨기기 | 오른쪽 **노출중/숨김** 버튼 클릭 |
| 로고 등록·교체 | 브랜드 클릭 → 로고 칸에 파일을 끌어다 놓거나 **파일 선택** |
| 정보 수정 | 브랜드 클릭 → 수정 → **저장** |
| 새 업체 추가 | 상단 **+ 브랜드 추가** → 저장 후 이어서 로고 등록 → 노출 전환 |
| 삭제 | 브랜드 클릭 → **브랜드 삭제** |

- 변경은 저장 즉시(늦어도 1분 안에) 참가업체 페이지에 반영됩니다.
- 사이트 표시 순서는 한글명 가나다순입니다.
- 로고는 PNG·JPG·WebP, 5MB 이하. 배경이 투명한 정사각형에 가까운 PNG가 가장 보기 좋습니다.
- 로고 없이 노출하면 회색 칸에 이니셜이 표시됩니다 (노출 전에 확인창이 뜹니다).
```

- [ ] **Step 2: 배포**

Vercel 환경변수에 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`가 이미 있는지 확인(바이어 기능이 쓰므로 존재해야 함). 그 뒤:

```bash
git push origin main
```

- [ ] **Step 3: 배포 확인** — Vercel 배포 완료 후 운영 `/brands`에 33개, `/admin/brands` 정상, `/admin/buyers` 리다이렉트 확인.
