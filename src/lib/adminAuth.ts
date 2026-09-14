// 관리자 세션 — 환경변수 비밀번호 1개 + HMAC 서명 쿠키.
// 계정 시스템을 두지 않는 대신, 쿠키는 위조 불가능하게 서명하고 httpOnly 로 내려준다.
import "server-only"
import crypto from "node:crypto"
import { cookies } from "next/headers"

export const ADMIN_COOKIE = "cc_admin"
const SESSION_MAX_AGE = 60 * 60 * 8 // 8시간

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 없거나 너무 짧습니다 (16자 이상).")
  }
  return s
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(payload).digest("hex")
}

/** 타이밍 공격을 피하기 위해 길이를 맞춘 뒤 상수 시간 비교한다. */
function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

export function verifyPassword(input: string): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) throw new Error("ADMIN_PASSWORD 환경변수가 없습니다.")
  return safeEqual(input, expected)
}

export function createSessionValue(): string {
  const expires = Date.now() + SESSION_MAX_AGE * 1000
  return `${expires}.${sign(String(expires))}`
}

export function isValidSessionValue(value: string | undefined): boolean {
  if (!value) return false
  const [expiresRaw, signature] = value.split(".")
  if (!expiresRaw || !signature) return false
  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || expires < Date.now()) return false
  return safeEqual(signature, sign(expiresRaw))
}

export async function isAdminRequest(): Promise<boolean> {
  const store = await cookies()
  return isValidSessionValue(store.get(ADMIN_COOKIE)?.value)
}

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
}
