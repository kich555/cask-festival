import type { Metadata } from "next"
import { isAdminRequest } from "@/lib/adminAuth"
import { PROGRAM_TABLE, type ProgramSessionRow } from "@/lib/programRecord"
import { BRAND_TABLE, getSupabaseAdmin } from "@/lib/supabaseAdmin"
import AdminLogin from "../AdminLogin"
import AdminTabs from "../AdminTabs"
import ProgramAdmin, { type BrandOption } from "./ProgramAdmin"

export const metadata: Metadata = {
  title: "프로그램 관리",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminProgramPage() {
  if (!(await isAdminRequest())) return <AdminLogin />

  const db = getSupabaseAdmin()
  const [sessions, brands] = await Promise.all([
    db.from(PROGRAM_TABLE).select("*").order("start_time"),
    db.from(BRAND_TABLE).select("slug, name_ko, name_en, logo, logo_bg").order("name_ko"),
  ])
  const error = sessions.error ?? brands.error

  return (
    <>
      <AdminTabs active="program" />
      {error ? (
        <div className="min-h-[60vh] flex items-center justify-center px-5 text-center">
          <div>
            <p className="font-bold text-[#7d0b1c]">데이터를 불러오지 못했습니다.</p>
            <p className="text-[13px] text-[#888] mt-2">{error.message}</p>
          </div>
        </div>
      ) : (
        <ProgramAdmin
          initialRows={(sessions.data ?? []) as ProgramSessionRow[]}
          brands={(brands.data ?? []) as BrandOption[]}
        />
      )}
    </>
  )
}
