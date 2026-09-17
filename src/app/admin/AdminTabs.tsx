import Link from "next/link"

const TABS = [
  { key: "brands", href: "/admin/brands", label: "브랜드 관리" },
  { key: "buyer", href: "/admin/buyer", label: "바이어 관리" },
] as const

export type AdminTabKey = (typeof TABS)[number]["key"]

/** 관리자 페이지 공통 상단 탭. 각 화면의 자체 헤더 위에 얹는다. */
export default function AdminTabs({ active }: { active?: AdminTabKey }) {
  return (
    <nav className="bg-[#111] text-white border-b border-white/10">
      <div className="max-w-[1280px] mx-auto px-5 md:px-8 flex gap-1">
        {TABS.map((t) => (
          <Link
            key={t.key}
            href={t.href}
            className={`px-4 py-3 text-[13px] font-bold border-b-2 transition-colors ${
              active === t.key
                ? "border-[#7d0b1c] text-white"
                : "border-transparent text-white/50 hover:text-white"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
