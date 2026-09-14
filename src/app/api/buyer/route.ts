import crypto from "node:crypto"
import { type NextRequest, NextResponse } from "next/server"
import {
  ACCEPTED_UPLOAD_TYPES,
  BUYER_TYPES,
  type BuyerType,
  extensionFor,
  isBusiness,
  isPress,
  MAX_UPLOAD_BYTES,
  VISIT_DAYS,
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

  const buyerType = str(form, "buyer_type")
  if (!BUYER_TYPES.includes(buyerType as BuyerType)) {
    return fail("참가 유형을 선택해 주세요.")
  }

  const required: Record<string, string> = {
    name: "이름",
    job_title: "직함",
    company: "회사명",
    phone: "휴대폰 번호",
    email: "이메일",
    company_address: "회사 주소",
    country: "국가",
  }

  const values: Record<string, string> = {}
  for (const [key, label] of Object.entries(required)) {
    const v = str(form, key)
    if (!v) return fail(`${label}을(를) 입력해 주세요.`)
    values[key] = v
  }

  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(values.email)) {
    return fail("이메일 형식을 확인해 주세요.")
  }

  const visitDay = str(form, "visit_day")
  if (!VISIT_DAYS.includes(visitDay as (typeof VISIT_DAYS)[number])) {
    return fail("참관 희망일을 선택해 주세요.")
  }

  const companions = Number(str(form, "companions") || "0")
  if (!Number.isInteger(companions) || companions < 0 || companions > 20) {
    return fail("동반 인원 수를 확인해 주세요. (0~20)")
  }

  if (str(form, "privacy_consent") !== "on") {
    return fail("개인정보 수집·이용에 동의해 주셔야 신청할 수 있습니다.")
  }

  // 유형별 필수값
  const businessNumber = str(form, "business_number")
  const mediaName = str(form, "media_name")
  if (isBusiness(buyerType) && !businessNumber) {
    return fail("사업자등록번호를 입력해 주세요.")
  }
  if (isPress(buyerType) && !mediaName) {
    return fail("매체명을 입력해 주세요.")
  }

  const businessCard = form.get("business_card")
  if (!(businessCard instanceof File) || businessCard.size === 0) {
    return fail("명함 이미지를 첨부해 주세요.")
  }
  const document = form.get("document")
  const hasDocument = document instanceof File && document.size > 0

  const id = crypto.randomUUID()
  const dir = `applications/${id}`

  let businessCardPath: string
  let documentPath: string | null = null
  try {
    businessCardPath = await uploadFile(businessCard, dir, "business-card")
    if (hasDocument) {
      documentPath = await uploadFile(document as File, dir, "document")
    }
  } catch (e) {
    console.error("[buyer] upload error", e)
    // 검증 실패(용량/형식) 메시지는 그대로, 그 외 내부 오류는 일반 문구로 바꾼다.
    const message =
      e instanceof Error && /10MB|업로드할 수 있습니다/.test(e.message)
        ? e.message
        : "파일 업로드에 실패했습니다. 잠시 후 다시 시도해 주세요."
    return fail(message, 500)
  }

  const row: Database["public"]["Tables"]["buyer_applications"]["Insert"] = {
    id,
    status: "pending" as const,
    buyer_type: buyerType as BuyerType,
    name: values.name,
    job_title: values.job_title,
    company: values.company,
    department: str(form, "department") || null,
    phone: values.phone,
    email: values.email,
    company_address: values.company_address,
    country: values.country,
    visit_day: visitDay as (typeof VISIT_DAYS)[number],
    companions,
    business_number: businessNumber || null,
    categories: str(form, "categories") || null,
    outlets: str(form, "outlets") || null,
    media_name: mediaName || null,
    media_url: str(form, "media_url") || null,
    press_purpose: str(form, "press_purpose") || null,
    business_card_path: businessCardPath,
    document_path: documentPath,
    marketing_opt_in: str(form, "marketing_opt_in") === "on",
  }

  const { error } = await getSupabaseAdmin().from(BUYER_TABLE).insert(row)
  if (error) {
    // 저장에 실패하면 이미 올라간 파일은 남겨두지 않는다.
    await getSupabaseAdmin()
      .storage.from(BUYER_BUCKET)
      .remove([businessCardPath, ...(documentPath ? [documentPath] : [])])
    console.error("[buyer] insert failed", error)
    return fail("신청 저장에 실패했습니다. 잠시 후 다시 시도해 주세요.", 500)
  }

  return NextResponse.json({ ok: true })
}
