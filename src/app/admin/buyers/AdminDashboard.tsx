"use client"

import { useMemo, useState } from "react"
import { type BuyerApplication, isFreeEmail } from "@/lib/buyer"

const TYPE_LABEL: Record<string, string> = {
  wholesale: "도매/유통",
  retail: "소매/보틀샵",
  self_employed: "자영업",
  importer: "수입사",
  press: "프레스",
}

const DAY_LABEL: Record<string, string> = {
  day1: "11/21(토)",
  day2: "11/22(일)",
  both: "양일",
}

const STATUS_LABEL: Record<string, string> = {
  pending: "대기",
  approved: "승인",
  rejected: "반려",
}

const STATUS_STYLE: Record<string, string> = {
  pending: "bg-[#f0ad4e]/15 text-[#8a6100] border-[#f0ad4e]/40",
  approved: "bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/30",
  rejected: "bg-black/5 text-[#777] border-black/15",
}

function fileHref(path: string) {
  return `/api/admin/file?path=${encodeURIComponent(path)}`
}

export default function AdminDashboard({ initialRows }: { initialRows: BuyerApplication[] }) {
  const [rows, setRows] = useState(initialRows)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [busyId, setBusyId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const counts = useMemo(() => {
    const c = { all: rows.length, pending: 0, approved: 0, rejected: 0 }
    for (const r of rows) c[r.status] += 1
    return c
  }, [rows])

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter)

  async function updateStatus(id: string, status: BuyerApplication["status"]) {
    setBusyId(id)
    setError(null)
    try {
      const res = await fetch("/api/admin/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!data.ok) {
        setError(data.error ?? "변경에 실패했습니다.")
        return
      }
      setRows((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)))
    } catch {
      setError("변경에 실패했습니다.")
    } finally {
      setBusyId(null)
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" })
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-5 flex items-center gap-4">
          <div className="flex-1">
            <h1 className="text-[17px] font-extrabold tracking-tight">바이어 신청 관리</h1>
            <p className="text-white/50 text-[12px] mt-0.5">CASK CARNIVAL 2026</p>
          </div>
          <a
            href="/api/admin/export"
            className="bg-white text-[#1a1a1a] rounded px-4 py-2 text-[13px] font-bold"
          >
            엑셀 다운로드
          </a>
          <button
            type="button"
            onClick={logout}
            className="text-white/60 text-[13px] hover:text-white"
          >
            로그아웃
          </button>
        </div>
      </header>

      <div className="max-w-[1280px] mx-auto px-5 md:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          {(["all", "pending", "approved", "rejected"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`px-4 py-2 rounded text-[13px] font-semibold border transition-colors ${
                filter === k
                  ? "bg-[#7d0b1c] text-white border-[#7d0b1c]"
                  : "bg-white border-black/10 hover:border-black/25"
              }`}
            >
              {k === "all" ? "전체" : STATUS_LABEL[k]} {counts[k]}
            </button>
          ))}
        </div>

        {error && (
          <p className="mb-4 text-[13px] text-[#7d0b1c] font-semibold bg-white border border-[#7d0b1c]/30 rounded px-4 py-3">
            {error}
          </p>
        )}

        {visible.length === 0 ? (
          <p className="text-center text-[#888] py-24">신청 내역이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((r) => (
              <article key={r.id} className="bg-white border border-black/10 rounded p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span
                    className={`text-[12px] font-bold px-2.5 py-1 rounded border ${STATUS_STYLE[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded bg-black/5">
                    {TYPE_LABEL[r.buyer_type] ?? r.buyer_type}
                  </span>
                  {isFreeEmail(r.email) && (
                    <span
                      className="text-[12px] font-semibold px-2.5 py-1 rounded bg-[#f0ad4e]/15 text-[#8a6100]"
                      title="회사 도메인 이메일이 아닙니다"
                    >
                      개인 이메일
                    </span>
                  )}
                  <span className="text-[12px] text-[#999] ml-auto">
                    {new Date(r.created_at).toLocaleString("ko-KR")}
                  </span>
                </div>

                <h2 className="text-[17px] font-extrabold mt-3">
                  {r.company}
                  <span className="text-[#666] font-semibold text-[15px] ml-2.5">
                    {r.name} · {r.job_title}
                  </span>
                </h2>

                <dl className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-2.5 mt-4 text-[13px]">
                  {[
                    ["연락처", r.phone],
                    ["이메일", r.email],
                    ["국가", r.country],
                    ["참관일", DAY_LABEL[r.visit_day] ?? r.visit_day],
                    ["주소", r.company_address],
                    ["사업자번호", r.business_number],
                    ["매체명", r.media_name],
                    ["매체URL", r.media_url],
                    ["부서", r.department],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label as string}>
                        <dt className="text-[#999] text-[12px]">{label}</dt>
                        <dd className="mt-0.5 break-words">{value}</dd>
                      </div>
                    ))}
                </dl>

                {r.visit_purpose && (
                  <div className="mt-4 bg-black/[0.03] rounded px-4 py-3">
                    <p className="text-[#999] text-[12px]">참관 이유</p>
                    <p className="text-[13px] mt-1 whitespace-pre-line leading-relaxed">
                      {r.visit_purpose}
                    </p>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-black/10">
                  <a
                    href={fileHref(r.business_card_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold border border-black/15 rounded px-3.5 py-2 hover:border-black/40"
                  >
                    명함 보기
                  </a>

                  <div className="flex gap-2 ml-auto">
                    <button
                      type="button"
                      disabled={busyId === r.id || r.status === "approved"}
                      onClick={() => updateStatus(r.id, "approved")}
                      className="text-[13px] font-bold bg-[#2e7d32] text-white rounded px-4 py-2 disabled:opacity-30"
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      disabled={busyId === r.id || r.status === "rejected"}
                      onClick={() => updateStatus(r.id, "rejected")}
                      className="text-[13px] font-bold border border-black/20 rounded px-4 py-2 disabled:opacity-30"
                    >
                      반려
                    </button>
                    {r.status !== "pending" && (
                      <button
                        type="button"
                        disabled={busyId === r.id}
                        onClick={() => updateStatus(r.id, "pending")}
                        className="text-[13px] text-[#888] px-2 disabled:opacity-30"
                      >
                        대기로
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
