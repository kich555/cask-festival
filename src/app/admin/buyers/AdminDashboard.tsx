"use client"

import { useMemo, useState } from "react"
import { type BuyerApplication, isFreeEmail } from "@/lib/buyer"

const TYPE_LABEL: Record<string, string> = {
  import_export: "수입/수출",
  wholesale: "도매/유통",
  food_service: "레스토랑/바",
  manufacturer: "제조업",
  distribution: "유통업계",
  equipment: "기기/설비",
  other: "기타",
}

const REFERRAL_LABEL: Record<string, string> = {
  sns: "SNS 홍보",
  website: "홈페이지",
  cafe_blog: "카페/블로그",
  industry_site: "업계 사이트",
  word_of_mouth: "지인 권유",
  invitation: "초청장",
  search: "검색",
  other: "기타",
}

const PURPOSE_LABEL: Record<string, string> = {
  new_products: "신제품 정보 수집",
  market_research: "시장 조사",
  new_partners: "신규 거래처 확보",
  tasting: "시음/시식",
  program: "프로그램 참가",
  other: "기타",
}

/** '기타'면 직접 입력값을, 아니면 라벨을 보여준다. */
function labelOf(map: Record<string, string>, value: string | null, other: string | null) {
  if (!value) return ""
  if (value === "other") return other ? `기타 — ${other}` : "기타"
  return map[value] ?? value
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

function formatSentAt(value: string) {
  return new Date(value).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function AdminDashboard({ initialRows }: { initialRows: BuyerApplication[] }) {
  const [rows, setRows] = useState(initialRows)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("all")
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ kind: "ok" | "error"; text: string } | null>(null)

  const counts = useMemo(() => {
    const c = { all: rows.length, pending: 0, approved: 0, rejected: 0 }
    for (const r of rows) c[r.status] += 1
    return c
  }, [rows])

  const visible = filter === "all" ? rows : rows.filter((r) => r.status === filter)
  const visibleIds = visible.map((r) => r.id)
  const selectedVisible = visibleIds.filter((id) => selected.has(id))
  const allVisibleSelected = visibleIds.length > 0 && selectedVisible.length === visibleIds.length

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAllVisible() {
    setSelected((prev) => {
      const next = new Set(prev)
      if (allVisibleSelected) {
        for (const id of visibleIds) next.delete(id)
      } else {
        for (const id of visibleIds) next.add(id)
      }
      return next
    })
  }

  async function updateStatus(ids: string[], status: BuyerApplication["status"]) {
    if (ids.length === 0) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, status }),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!data.ok) {
        setMessage({ kind: "error", text: data.error ?? "변경에 실패했습니다." })
        return
      }
      const set = new Set(ids)
      setRows((prev) => prev.map((r) => (set.has(r.id) ? { ...r, status } : r)))
      if (ids.length > 1) {
        setMessage({ kind: "ok", text: `${ids.length}건을 ${STATUS_LABEL[status]} 처리했습니다.` })
      }
    } catch {
      setMessage({ kind: "error", text: "변경에 실패했습니다." })
    } finally {
      setBusy(false)
    }
  }

  async function sendApproval(ids: string[], resend = false) {
    if (ids.length === 0) return
    setBusy(true)
    setMessage(null)
    try {
      const res = await fetch("/api/admin/send-approval", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, resend }),
      })
      const data = (await res.json()) as {
        ok: boolean
        error?: string
        sent?: string[]
        skipped?: { id: string; reason: string }[]
        failed?: { id: string; reason: string }[]
      }
      if (!data.ok) {
        setMessage({ kind: "error", text: data.error ?? "발송에 실패했습니다." })
        return
      }

      const sent = data.sent ?? []
      const now = new Date().toISOString()
      const sentSet = new Set(sent)
      setRows((prev) =>
        prev.map((r) => (sentSet.has(r.id) ? { ...r, approval_email_sent_at: now } : r)),
      )

      const parts = [`${sent.length}건 발송`]
      if (data.skipped?.length) parts.push(`${data.skipped.length}건 건너뜀`)
      if (data.failed?.length) parts.push(`${data.failed.length}건 실패`)
      setMessage({
        kind: data.failed?.length ? "error" : "ok",
        text: `${parts.join(" · ")}${data.failed?.length ? ` (${data.failed[0].reason})` : ""}`,
      })
    } catch {
      setMessage({ kind: "error", text: "발송에 실패했습니다." })
    } finally {
      setBusy(false)
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
        <div className="flex flex-wrap gap-2 mb-4">
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

        {/* 일괄 처리 바 */}
        {visible.length > 0 && (
          <div className="bg-white border border-black/10 rounded px-4 py-3 mb-4 flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-[13px] font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleAllVisible}
                className="accent-[#7d0b1c] w-4 h-4"
              />
              전체 선택
            </label>

            <span className="text-[13px] text-[#888]">
              {selectedVisible.length > 0
                ? `${selectedVisible.length}건 선택됨`
                : "선택된 항목 없음"}
            </span>

            <div className="flex flex-wrap gap-2 ml-auto">
              <button
                type="button"
                disabled={busy || selectedVisible.length === 0}
                onClick={() => updateStatus(selectedVisible, "approved")}
                className="text-[13px] font-bold bg-[#2e7d32] text-white rounded px-4 py-2 disabled:opacity-30"
              >
                일괄 승인
              </button>
              <button
                type="button"
                disabled={busy || selectedVisible.length === 0}
                onClick={() => updateStatus(selectedVisible, "rejected")}
                className="text-[13px] font-bold border border-black/20 rounded px-4 py-2 disabled:opacity-30"
              >
                일괄 반려
              </button>
              <button
                type="button"
                disabled={busy || selectedVisible.length === 0}
                onClick={() => sendApproval(selectedVisible)}
                className="text-[13px] font-bold bg-[#7d0b1c] text-white rounded px-4 py-2 disabled:opacity-30"
              >
                일괄 승인 메일 발송
              </button>
            </div>
          </div>
        )}

        {message && (
          <p
            className={`mb-4 text-[13px] font-semibold bg-white border rounded px-4 py-3 ${
              message.kind === "ok"
                ? "text-[#2e7d32] border-[#2e7d32]/30"
                : "text-[#7d0b1c] border-[#7d0b1c]/30"
            }`}
          >
            {message.text}
          </p>
        )}

        {visible.length === 0 ? (
          <p className="text-center text-[#888] py-24">신청 내역이 없습니다.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {visible.map((r) => (
              <article key={r.id} className="bg-white border border-black/10 rounded p-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggle(r.id)}
                    aria-label={`${r.company} 선택`}
                    className="accent-[#7d0b1c] w-4 h-4"
                  />
                  <span
                    className={`text-[12px] font-bold px-2.5 py-1 rounded border ${STATUS_STYLE[r.status]}`}
                  >
                    {STATUS_LABEL[r.status]}
                  </span>
                  <span className="text-[12px] font-semibold px-2.5 py-1 rounded bg-black/5">
                    {labelOf(TYPE_LABEL, r.buyer_type, r.buyer_type_other)}
                  </span>
                  {isFreeEmail(r.email) && (
                    <span
                      className="text-[12px] font-semibold px-2.5 py-1 rounded bg-[#f0ad4e]/15 text-[#8a6100]"
                      title="회사 도메인 이메일이 아닙니다"
                    >
                      개인 이메일
                    </span>
                  )}
                  {r.approval_email_sent_at && (
                    <span className="text-[12px] font-semibold px-2.5 py-1 rounded bg-[#2e7d32]/10 text-[#2e7d32]">
                      메일 발송 {formatSentAt(r.approval_email_sent_at)}
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
                    ["참관일", DAY_LABEL[r.visit_day] ?? r.visit_day],
                    ["바이어 구분", labelOf(TYPE_LABEL, r.buyer_type, r.buyer_type_other)],
                    ["인지 경로", labelOf(REFERRAL_LABEL, r.referral, r.referral_other)],
                    ["참관 목적", labelOf(PURPOSE_LABEL, r.purpose, r.purpose_other)],
                    ["광고 수신", r.marketing_opt_in ? "동의" : "미동의"],
                  ]
                    .filter(([, v]) => v)
                    .map(([label, value]) => (
                      <div key={label as string}>
                        <dt className="text-[#999] text-[12px]">{label}</dt>
                        <dd className="mt-0.5 break-words">{value}</dd>
                      </div>
                    ))}
                </dl>

                <div className="flex flex-wrap items-center gap-2.5 mt-5 pt-4 border-t border-black/10">
                  <a
                    href={fileHref(r.business_card_path)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] font-semibold border border-black/15 rounded px-3.5 py-2 hover:border-black/40"
                  >
                    명함 보기
                  </a>

                  {r.status === "approved" && (
                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => sendApproval([r.id], Boolean(r.approval_email_sent_at))}
                      className="text-[13px] font-bold bg-[#7d0b1c] text-white rounded px-4 py-2 disabled:opacity-30"
                    >
                      {r.approval_email_sent_at ? "승인 메일 재발송" : "승인 메일 보내기"}
                    </button>
                  )}

                  <div className="flex gap-2 ml-auto">
                    <button
                      type="button"
                      disabled={busy || r.status === "approved"}
                      onClick={() => updateStatus([r.id], "approved")}
                      className="text-[13px] font-bold bg-[#2e7d32] text-white rounded px-4 py-2 disabled:opacity-30"
                    >
                      승인
                    </button>
                    <button
                      type="button"
                      disabled={busy || r.status === "rejected"}
                      onClick={() => updateStatus([r.id], "rejected")}
                      className="text-[13px] font-bold border border-black/20 rounded px-4 py-2 disabled:opacity-30"
                    >
                      반려
                    </button>
                    {r.status !== "pending" && (
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => updateStatus([r.id], "pending")}
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
