import crypto from "node:crypto"
import { type NextRequest, NextResponse } from "next/server"
import {
  ACCEPTED_UPLOAD_TYPES,
  BUYER_TYPES,
  type BuyerType,
  extensionFor,
  MAX_UPLOAD_BYTES,
  PURPOSES,
  type Purpose,
  REFERRALS,
  type Referral,
  VISIT_DAYS,
  type VisitDay,
  withObjectParticle,
} from "@/lib/buyer"
import { BUYER_BUCKET, BUYER_TABLE, type Database, getSupabaseAdmin } from "@/lib/supabaseAdmin"

export const runtime = "nodejs"

/** 아주 단순한 제출 속도 제한 (인스턴스 메모리 기준, 봇 연타 방지용) */
const recentSubmits = new Map<string, number[]>()
const RATE_WINDOW_MS = 10 * 60 * 1000
const RATE_MAX = 3

function rateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (recentSubmits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS)
  hits.push(now)
  recentSubmits.set(ip, hits)
  return hits.length > RATE_MAX
}

function str(form: FormData, key: string): string {
  const v = form.get(key)
  return typeof v === "string" ? v.trim() : ""
}

function fail(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

async function uploadFile(file: File, dir: string, name: string) {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("파일 용량은 10MB 이하여야 합니다.")
  }
  if (!ACCEPTED_UPLOAD_TYPES.includes(file.type)) {
    throw new Error("이미지(JPG, PNG, WEBP, HEIC) 또는 PDF 파일만 업로드할 수 있습니다.")
  }

  const path = `${dir}/${name}.${extensionFor(file.type)}`
  const bytes = Buffer.from(await file.arrayBuffer())
  const { error } = await getSupabaseAdmin()
    .storage.from(BUYER_BUCKET)
    .upload(path, bytes, { contentType: file.type, upsert: false })

  if (error) {
    console.error("[buyer] storage upload failed", error)
    throw new Error("파일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요.")
  }
  return path
}

/**
 * 선택지 검증. '기타'를 고른 경우 직접 입력값이 있어야 한다.
 * 선택하지 않았으면 [null, null] 을 돌려주고, 필수 여부는 호출부가 판단한다.
 */
function readChoice<T extends string>(
  form: FormData,
  key: string,
  allowed: readonly T[],
): { value: T | null; other: string | null; invalid: boolean } {
  const raw = str(form, key)
  if (!raw) return { value: null, other: null, invalid: false }
  if (!allowed.includes(raw as T)) return { value: null, other: null, invalid: true }
  const other = raw === "other" ? str(form, `${key}_other`) : ""
  return { value: raw as T, other: other || null, invalid: raw === "other" && !other }
}

export async function POST(request: NextRequest) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown"

  if (rateLimited(ip)) {
    return fail("잠시 후 다시 시도해 주세요.", 429)
  }

  let form: FormData
  try {
    form = await request.formData()
  } catch {
    return fail("요청을 읽을 수 없습니다.")
  }

  // 봇 트랩: 사람에게는 보이지 않는 필드. 채워져 있으면 봇으로 간주한다.
  if (str(form, "website")) {
    return NextResponse.json({ ok: true })
  }

  // 1. 신청자 정보
  const required: Record<string, string> = {
    name: "성명",
    company: "회사명",
    job_title: "직함",
    phone: "연락처",
    email: "이메일",
  }
  const values: Record<string, string> = {}
  for (const [key, label] of Object.entries(required)) {
    const v = str(form, key)
    if (!v) return fail(`${withObjectParticle(label)} 입력해 주세요.`)
    values[key] = v
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) {
    return fail("이메일 형식을 확인해 주세요.")
  }

  // 2. 방문 희망일
  const visitDay = str(form, "visit_day")
  if (!VISIT_DAYS.includes(visitDay as VisitDay)) {
    return fail("방문 희망일을 선택해 주세요.")
  }

  // 3. 바이어 구분 (필수)
  const type = readChoice(form, "buyer_type", BUYER_TYPES)
  if (!type.value || type.invalid) {
    return fail(
      type.value === null && !type.invalid
        ? "바이어 구분을 선택해 주세요."
        : "바이어 구분의 기타 항목을 입력해 주세요.",
    )
  }

  // 4. 인지 경로 (필수)
  const ref = readChoice(form, "referral", REFERRALS)
  if (!ref.value || ref.invalid) {
    return fail(
      ref.value === null && !ref.invalid
        ? "인지 경로를 선택해 주세요."
        : "인지 경로의 기타 항목을 입력해 주세요.",
    )
  }

  // 5. 방문 목적 (필수)
  const purpose = readChoice(form, "purpose", PURPOSES)
  if (!purpose.value || purpose.invalid) {
    return fail(
      purpose.value === null && !purpose.invalid
        ? "방문 목적을 선택해 주세요."
        : "방문 목적의 기타 항목을 입력해 주세요.",
    )
  }

  // 6. 필수 확인
  if (str(form, "age_confirmed") !== "on") {
    return fail("만 19세 이상 여부를 확인해 주세요.")
  }
  if (str(form, "privacy_consent") !== "on") {
    return fail("개인정보 수집·이용에 동의해 주셔야 신청할 수 있습니다.")
  }

  const businessCard = form.get("business_card")
  if (!(businessCard instanceof File) || businessCard.size === 0) {
    return fail("명함 이미지를 첨부해 주세요.")
  }

  const id = crypto.randomUUID()
  const dir = `applications/${id}`

  let businessCardPath: string
  try {
    businessCardPath = await uploadFile(businessCard, dir, "business-card")
  } catch (e) {
    console.error("[buyer] upload error", e)
    const message =
      e instanceof Error && /10MB|업로드할 수 있습니다/.test(e.message)
        ? e.message
        : "파일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요."
    return fail(message, 500)
  }

  const row: Database["public"]["Tables"]["buyer_applications"]["Insert"] = {
    id,
    status: "pending" as const,
    name: values.name,
    company: values.company,
    job_title: values.job_title,
    phone: values.phone,
    email: values.email,
    business_card_path: businessCardPath,
    visit_day: visitDay as VisitDay,
    buyer_type: type.value as BuyerType,
    buyer_type_other: type.other,
    referral: ref.value as Referral,
    referral_other: ref.other,
    purpose: purpose.value as Purpose,
    purpose_other: purpose.other,
    age_confirmed: true,
    marketing_opt_in: str(form, "marketing_opt_in") === "on",
  }

  const { error } = await getSupabaseAdmin().from(BUYER_TABLE).insert(row)
  if (error) {
    // 저장에 실패하면 이미 올라간 파일은 남겨두지 않는다.
    await getSupabaseAdmin().storage.from(BUYER_BUCKET).remove([businessCardPath])
    console.error("[buyer] insert failed", error)
    return fail("신청 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.", 500)
  }

  return NextResponse.json({ ok: true })
}
