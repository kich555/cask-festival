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

  const { data, error } = await getSupabaseAdmin().from(BRAND_TABLE).select("*").order("sort_order")

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
