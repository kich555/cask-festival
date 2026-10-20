// 업체별 참가확인서. Supabase Storage 비공개 버킷 — 서버(서비스 키)만 꺼내서 로그인한 업체에게 직접 내려준다.
// 경로: <login_id>/<파일명 base64url> (Storage 경로에 한글을 쓸 수 없어 파일명을 인코딩한다)
import "server-only"
import { getSupabaseAdmin } from "./supabaseAdmin"

export const CERT_BUCKET = "exhibitor-certificates"
// 서버를 거쳐 내려주므로 Vercel 응답 한도(4.5MB) 안으로 제한
export const CERT_MAX_BYTES = 4 * 1024 * 1024

export type Certificate = { name: string; size: number }

const encodeName = (name: string) => Buffer.from(name.normalize("NFC")).toString("base64url")
const decodeName = (key: string) => Buffer.from(key, "base64url").toString("utf8")
const LOGIN_ID = /^[a-z0-9]+$/

export function certPath(loginId: string, name: string): string | null {
  const n = name.normalize("NFC").trim()
  if (!LOGIN_ID.test(loginId) || !n || n.startsWith(".") || /[/\\]/.test(n)) return null
  return `${loginId}/${encodeName(n)}`
}

export async function listCertificates(loginId: string): Promise<Certificate[]> {
  if (!LOGIN_ID.test(loginId)) return []
  const { data, error } = await getSupabaseAdmin().storage.from(CERT_BUCKET).list(loginId)
  if (error) {
    console.error("[certificate] 목록 실패:", error.message)
    return []
  }
  return data
    .filter((o) => o.id && !o.name.startsWith("."))
    .map((o) => ({ name: decodeName(o.name), size: Number(o.metadata?.size ?? 0) }))
    .sort((a, b) => a.name.localeCompare(b.name, "ko"))
}

/** 해당 업체 폴더의 파일 내용. 없으면 null. */
export async function downloadCertificate(loginId: string, name: string): Promise<Blob | null> {
  const path = certPath(loginId, name)
  if (!path) return null
  const { data } = await getSupabaseAdmin().storage.from(CERT_BUCKET).download(path)
  return data ?? null
}

export function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))}KB`
  return `${(bytes / 1024 / 1024).toFixed(1)}MB`
}
