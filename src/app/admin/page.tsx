import type { Metadata } from "next"
import Link from "next/link"
import { isAdminRequest } from "@/lib/adminAuth"
import AdminLogin from "./AdminLogin"
import AdminTabs from "./AdminTabs"

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminHomePage() {
  if (!(await isAdminRequest())) return <AdminLogin />

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <AdminTabs />
      <div className="max-w-[720px] mx-auto px-5 py-16 grid sm:grid-cols-2 gap-4">
        <Link
          href="/admin/brands"
          className="bg-white border border-black/10 rounded p-6 hover:border-[#7d0b1c]"
        >
          <p className="text-[17px] font-extrabold">브랜드 관리</p>
          <p className="text-[13px] text-[#888] mt-1">참가업체 노출·로고·정보</p>
        </Link>
        <Link
          href="/admin/buyer"
          className="bg-white border border-black/10 rounded p-6 hover:border-[#7d0b1c]"
        >
          <p className="text-[17px] font-extrabold">바이어 관리</p>
          <p className="text-[13px] text-[#888] mt-1">바이어 신청 승인·메일 발송</p>
        </Link>
      </div>
    </div>
  )
}
