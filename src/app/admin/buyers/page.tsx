import type { Metadata } from "next"
import { isAdminRequest } from "@/lib/adminAuth"
import type { BuyerApplication } from "@/lib/buyer"
import { BUYER_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"
import AdminDashboard from "./AdminDashboard"
import AdminLogin from "./AdminLogin"

// 관리자 화면은 검색엔진에 노출되지 않아야 하고, 항상 최신 데이터를 보여줘야 한다.
export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminBuyersPage() {
  if (!(await isAdminRequest())) {
    return <AdminLogin />
  }

  const { data, error } = await getSupabaseAdmin()
    .from(BUYER_TABLE)
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5 text-center">
        <div>
          <p className="font-bold text-[#7d0b1c]">데이터를 불러오지 못했습니다.</p>
          <p className="text-[13px] text-[#888] mt-2">{error.message}</p>
        </div>
      </div>
    )
  }

  // supabase-js 의 select("*") 추론이 버전에 따라 달라 명시적으로 좁힌다.
  return <AdminDashboard initialRows={(data ?? []) as BuyerApplication[]} />
}
