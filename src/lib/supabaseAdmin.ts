// 서버 전용 Supabase 클라이언트.
// service role 키를 쓰므로 절대 클라이언트 컴포넌트에서 import 하지 않는다.
import "server-only"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { BuyerApplication } from "./buyer"

/** 테이블 스키마 타입 — supabase-js 가 select/insert 결과를 추론하는 데 쓴다. */
export interface Database {
  public: {
    Tables: {
      buyer_applications: {
        Row: BuyerApplication
        Insert: Omit<BuyerApplication, "created_at" | "admin_note"> & {
          created_at?: string
          admin_note?: string | null
        }
        Update: Partial<BuyerApplication>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export const BUYER_TABLE = "buyer_applications"
export const BUYER_BUCKET = "buyer-uploads"

let cached: SupabaseClient<Database> | null = null

/**
 * 환경변수가 없으면 명확한 에러를 던진다.
 * (빌드 타임에 평가되지 않도록 반드시 요청 처리 중에만 호출한다.)
 */
export function getSupabaseAdmin() {
  if (cached) return cached

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      "SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 환경변수가 없습니다. .env.local 을 확인하세요.",
    )
  }

  cached = createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
  return cached
}
