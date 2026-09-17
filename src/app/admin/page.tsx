import type { Metadata } from "next"
import Link from "next/link"
import { isAdminRequest } from "@/lib/adminAuth"
import AdminLogin from "./AdminLogin"

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
}
export const dynamic = "force-dynamic"

export default async function AdminHomePage() {
  if (!(await isAdminRequest())) return <AdminLogin />

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a] flex flex-col items-center justify-center px-5">
      <h1 className="text-[22px] md:text-[26px] font-extrabold tracking-tight mb-10">
        CASK CARNIVAL 관리자 페이지
      </h1>
      <div className="w-full max-w-[640px] grid sm:grid-cols-2 gap-4">
        {[
          { href: "/admin/brands", label: "브랜드 관리" },
          { href: "/admin/buyer", label: "바이어 관리" },
        ].map((b) => (
          <Link
            key={b.href}
            href={b.href}
            className="bg-white border border-black/10 rounded-lg h-40 flex items-center justify-center text-[22px] font-extrabold transition-colors hover:bg-[#7d0b1c] hover:border-[#7d0b1c] hover:text-white"
          >
            {b.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
