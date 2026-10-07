import type { Metadata } from "next"
import { isAdminRequest } from "@/lib/adminAuth"
import { loadExhibitorOverview } from "@/lib/exhibitorAdmin"
import AdminLogin from "../AdminLogin"
import AdminTabs from "../AdminTabs"
import ExhibitorAdmin from "./ExhibitorAdmin"

export const metadata: Metadata = {
  title: "참가업체 부스 확인",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminExhibitorPage() {
  if (!(await isAdminRequest())) return <AdminLogin />

  let rows: Awaited<ReturnType<typeof loadExhibitorOverview>> | null = null
  let error: string | null = null
  try {
    rows = await loadExhibitorOverview()
  } catch (e) {
    error = e instanceof Error ? e.message : String(e)
  }

  return (
    <>
      <AdminTabs active="exhibitor" />
      {rows ? (
        <ExhibitorAdmin rows={rows} />
      ) : (
        <div className="min-h-[60vh] flex items-center justify-center px-5 text-center">
          <div>
            <p className="font-bold text-[#7d0b1c]">데이터를 불러오지 못했습니다.</p>
            <p className="text-[13px] text-[#888] mt-2">{error}</p>
          </div>
        </div>
      )}
    </>
  )
}
