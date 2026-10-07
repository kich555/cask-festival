// 참가업체 세션 — 업체별 아이디/비밀번호(scrypt 해시) + HMAC 서명 쿠키.
import "server-only"
import crypto from "node:crypto"
import { cookies } from "next/headers"

export const EXHIBITOR_COOKIE = "cc_exh"
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7일

function secret(): string {
  const s = process.env.ADMIN_SESSION_SECRET
  if (!s || s.length < 16) {
    throw new Error("ADMIN_SESSION_SECRET 환경변수가 없거나 너무 짧습니다 (16자 이상).")
  }
  return s
}

// 관리자 쿠키와 서명이 겹치지 않도록 접두어를 붙인다.
function sign(payload: string): string {
  return crypto.createHmac("sha256", secret()).update(`exh:${payload}`).digest("hex")
}

function safeEqual(a: string, b: string): boolean {
  const ba = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ba.length !== bb.length) return false
  return crypto.timingSafeEqual(ba, bb)
}

/** 저장 형식: scrypt$<salt hex>$<hash hex> (scripts/create-exhibitor-accounts.mjs 와 동일) */
export function verifyExhibitorPassword(input: string, stored: string): boolean {
  const [algo, salt, hash] = stored.split("$")
  if (algo !== "scrypt" || !salt || !hash) return false
  const derived = crypto.scryptSync(input, Buffer.from(salt, "hex"), 32).toString("hex")
  return safeEqual(derived, hash)
}

export function hashExhibitorPassword(pw: string): string {
  const salt = crypto.randomBytes(16)
  return `scrypt$${salt.toString("hex")}$${crypto.scryptSync(pw, salt, 32).toString("hex")}`
}

export function createExhibitorSession(slug: string): string {
  const payload = `${slug}.${Date.now() + SESSION_MAX_AGE * 1000}`
  return `${payload}.${sign(payload)}`
}

/** 유효하면 브랜드 slug, 아니면 null */
export async function getExhibitorSlug(): Promise<string | null> {
  const value = (await cookies()).get(EXHIBITOR_COOKIE)?.value
  if (!value) return null
  const [slug, expiresRaw, signature] = value.split(".")
  if (!slug || !expiresRaw || !signature) return null
  const expires = Number(expiresRaw)
  if (!Number.isFinite(expires) || expires < Date.now()) return null
  return safeEqual(signature, sign(`${slug}.${expiresRaw}`)) ? slug : null
}

export const EXHIBITOR_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
}
