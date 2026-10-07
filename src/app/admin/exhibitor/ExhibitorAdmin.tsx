"use client"

import { useState } from "react"
import type { ExhibitorOverview } from "@/lib/exhibitorAdmin"
import {
  currentExtra,
  EXTRA_ITEMS,
  type ExhibitorLogKind,
  type ExhibitorLogRow,
  type ExtraRequest,
  hasExtra,
  itemsText,
  paymentStatus,
  won,
} from "@/lib/exhibitorRecord"

function formatDate(v: string) {
  return new Date(v).toLocaleString("ko-KR", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const TONE = {
  gray: "bg-black/5 text-[#888] border-black/10",
  green: "bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/30",
  amber: "bg-[#f0ad4e]/15 text-[#8a6100] border-[#f0ad4e]/40",
  blue: "bg-[#1f5fa8]/10 text-[#1f5fa8] border-[#1f5fa8]/30",
}

function Tag({ tone, children }: { tone: keyof typeof TONE; children: React.ReactNode }) {
  return (
    <span
      className={`shrink-0 inline-block text-center text-[12px] font-bold border rounded px-2 py-1 ${TONE[tone]}`}
    >
      {children}
    </span>
  )
}

function boothTag(r: ExhibitorOverview) {
  if (r.booth_status === "revised")
    return r.booth_ack_at ? <Tag tone="blue">수정확인</Tag> : <Tag tone="amber">수정요청</Tag>
  if (r.booth_status === "approved") return <Tag tone="green">확인</Tag>
  return <Tag tone="gray">미확인</Tag>
}

function payTag(r: ExhibitorOverview) {
  const k = paymentStatus(r).kind
  if (k === "paid") return <Tag tone="green">입금확인</Tag>
  if (k === "partial") return <Tag tone="amber">추가입금</Tag>
  if (k === "unpaid") return <Tag tone="gray">입금대기</Tag>
  return null
}

/** 관리자가 처리해야 할 일이 있는 업체 */
const needsAction = (r: ExhibitorOverview) =>
  (r.booth_status === "revised" && !r.booth_ack_at) || Boolean(r.extra_pending)

function Diff({
  label,
  before,
  after,
}: {
  label: string
  before: string | null
  after: string | null
}) {
  const changed = (before ?? "") !== (after ?? "")
  return (
    <div className="flex gap-3 py-1">
      <span className="w-24 shrink-0 text-[#777]">{label}</span>
      {changed ? (
        <span>
          <span className="text-[#999] line-through">{before || "(없음)"}</span>
          <span className="mx-2 text-[#999]">→</span>
          <b className="text-[#8a6100]">{after || "(없음)"}</b>
        </span>
      ) : (
        <span>{after || "-"}</span>
      )}
    </div>
  )
}

function ExtraDetail({ req }: { req: ExtraRequest }) {
  const rows = EXTRA_ITEMS.filter((i) => req.items?.[i.key])
  return (
    <>
      {rows.map((i) => (
        <div key={i.key} className="flex justify-between py-0.5">
          <span>
            {i.label} × {req.items[i.key]}
            {i.unit}
          </span>
          <span className="tabular-nums">{won(req.items[i.key] * i.price)}</span>
        </div>
      ))}
      {rows.length === 0 && <p className="text-[#999]">미신청 (모든 항목 0개)</p>}
      <div className="flex justify-between border-t border-black/10 mt-1.5 pt-1.5 font-bold">
        <span>합계</span>
        <span className="tabular-nums">{won(req.total)}</span>
      </div>
      {req.water_location && (
        <p className="mt-2">
          <b>급배수 위치</b> {req.water_location}
        </p>
      )}
      {req.note && <p className="mt-2 whitespace-pre-wrap bg-white rounded p-2">{req.note}</p>}
    </>
  )
}

const LOG_KIND: Record<ExhibitorLogKind, { label: string; cls: string }> = {
  booth_approve: { label: "부스 확인", cls: "text-[#2e7d32]" },
  booth_revise: { label: "부스 수정요청", cls: "text-[#8a6100]" },
  extra: { label: "부대시설 신청", cls: "text-[#7d0b1c]" },
  extra_change: { label: "부대시설 변경요청", cls: "text-[#8a6100]" },
  extra_cancel: { label: "변경요청 취소", cls: "text-[#888]" },
  booth_ack: { label: "[관리자] 수정요청 확인", cls: "text-[#1f5fa8]" },
  extra_approve: { label: "[관리자] 변경 승인", cls: "text-[#1f5fa8]" },
  extra_reject: { label: "[관리자] 변경 반려", cls: "text-[#1f5fa8]" },
  payment_confirm: { label: "[관리자] 입금 확인", cls: "text-[#1f5fa8]" },
  payment_cancel: { label: "[관리자] 입금 확인 취소", cls: "text-[#1f5fa8]" },
  products: { label: "출품 제품 저장", cls: "text-[#555]" },
}

/** 내역 한 줄: 무엇을 했는지 + 그때 보낸 내용 */
function LogEntry({ log }: { log: ExhibitorLogRow }) {
  const k = LOG_KIND[log.kind] ?? { label: log.kind, cls: "" }
  const d = log.data
  return (
    <div className="flex gap-4 py-3 text-[14px]">
      <span className="w-28 shrink-0 text-[13px] text-[#999] tabular-nums">
        {formatDate(log.created_at)}
      </span>
      <div className="flex-1 min-w-0">
        <p>
          <span className={`font-bold ${k.cls}`}>{k.label}</span>
        </p>
        {log.kind === "booth_revise" && (
          <p className="mt-1 text-[#555]">
            한글명 <b>{d.name_ko}</b> · 영문명 <b>{d.name_en || "(없음)"}</b>
            {d.note && <span className="block mt-1 whitespace-pre-wrap">메모: {d.note}</span>}
          </p>
        )}
        {log.kind === "products" && <p className="mt-1 text-[#555]">{d.count ?? 0}개</p>}
        {log.kind === "payment_confirm" && d.total ? (
          <p className="mt-1 text-[#555]">{won(d.total)}</p>
        ) : null}
        {(log.kind === "extra" || log.kind === "extra_change") && (
          <p className="mt-1 text-[#555]">
            {itemsText(d.items ?? {}) || "모든 항목 0개"}
            {d.total ? <b className="ml-2 text-[#1a1a1a]">{won(d.total)}</b> : null}
            {d.water_location && (
              <span className="block mt-1">급배수 위치: {d.water_location}</span>
            )}
            {d.note && <span className="block mt-1 whitespace-pre-wrap">요청: {d.note}</span>}
          </p>
        )}
      </div>
    </div>
  )
}

function PaymentControl({
  r,
  busy,
  act,
}: {
  r: ExhibitorOverview
  busy: boolean
  act: (slug: string, action: string, confirmText: string) => void
}) {
  const pay = paymentStatus(r)
  if (pay.kind === "none" && !r.paid_at) return null
  const name = r.defaults.name_ko
  return (
    <div className="mt-4 rounded bg-white border border-black/10 p-3">
      <p className="font-bold mb-2">입금</p>
      {r.paid_at && (
        <p className="text-[13px] text-[#2e7d32] font-bold">
          {formatDate(r.paid_at)} {won(pay.paid)} 입금 확인
        </p>
      )}
      {pay.kind === "partial" && (
        <p className="text-[13px] text-[#8a6100] font-bold mt-1">
          변경 승인으로 {won(pay.due)} 추가 입금 필요 (현재 합계 {won(pay.total)})
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        {pay.kind !== "paid" && pay.total > 0 && (
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              act(
                r.brand_slug,
                "payment_confirm",
                `${name}의 입금을 확인 처리할까요?\n금액: ${won(pay.total)}\n업체 화면에 '입금이 확인되었습니다'가 표시됩니다.`,
              )
            }
            className={`${actionBtn} bg-[#2e7d32] text-white`}
          >
            {pay.kind === "partial"
              ? `추가 입금 확인 (합계 ${won(pay.total)})`
              : `입금 확인 (${won(pay.total)})`}
          </button>
        )}
        {r.paid_at && (
          <button
            type="button"
            disabled={busy}
            onClick={() => act(r.brand_slug, "payment_cancel", `${name}의 입금 확인을 취소할까요?`)}
            className={`${actionBtn} border border-black/20 bg-white`}
          >
            입금 확인 취소
          </button>
        )}
      </div>
    </div>
  )
}

const actionBtn = "rounded px-4 py-2 text-[13px] font-bold disabled:opacity-50"

const FILTERS = {
  all: { label: "전체", test: () => true },
  todo: { label: "처리 필요", test: needsAction },
  booth_none: { label: "부스 미확인", test: (r: ExhibitorOverview) => !r.booth_status },
  booth_revised: {
    label: "부스 수정요청",
    test: (r: ExhibitorOverview) => r.booth_status === "revised",
  },
  extra_yes: {
    label: "부대시설 신청",
    test: hasExtra,
  },
  extra_no: { label: "부대시설 미신청", test: (r: ExhibitorOverview) => !hasExtra(r) },
  unpaid: {
    label: "입금 대기",
    test: (r: ExhibitorOverview) => ["unpaid", "partial"].includes(paymentStatus(r).kind),
  },
  paid: { label: "입금 완료", test: (r: ExhibitorOverview) => paymentStatus(r).kind === "paid" },
  products: {
    label: "출품 제품 등록",
    test: (r: ExhibitorOverview) => (r.products?.length ?? 0) > 0,
  },
} as const
type FilterKey = keyof typeof FILTERS

const lastActivity = (r: ExhibitorOverview) => r.logs[0]?.created_at ?? ""
const byName = (a: ExhibitorOverview, b: ExhibitorOverview) =>
  a.defaults.name_ko.localeCompare(b.defaults.name_ko, "ko")

const SORTS = {
  todo: {
    label: "처리 필요 우선",
    cmp: (a: ExhibitorOverview, b: ExhibitorOverview) =>
      Number(needsAction(b)) - Number(needsAction(a)) ||
      lastActivity(b).localeCompare(lastActivity(a)) ||
      byName(a, b),
  },
  recent: {
    label: "최근 활동순",
    cmp: (a: ExhibitorOverview, b: ExhibitorOverview) =>
      lastActivity(b).localeCompare(lastActivity(a)) || byName(a, b),
  },
  name: { label: "업체명순", cmp: byName },
  amount: {
    label: "신청 금액순",
    cmp: (a: ExhibitorOverview, b: ExhibitorOverview) =>
      currentExtra(b).total - currentExtra(a).total || byName(a, b),
  },
} as const
type SortKey = keyof typeof SORTS

function matches(r: ExhibitorOverview, q: string) {
  if (!q) return true
  const hay = [r.defaults.name_ko, r.defaults.name_en, r.booth_name_ko, r.booth_name_en, r.login_id]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
  return hay.includes(q.toLowerCase())
}

export default function ExhibitorAdmin({ rows }: { rows: ExhibitorOverview[] }) {
  const [open, setOpen] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<FilterKey>("all")
  const [sort, setSort] = useState<SortKey>("todo")

  const todo = rows.filter(needsAction).length
  const extraRows = rows.filter(hasExtra)
  const grand = extraRows.reduce((s, r) => s + currentExtra(r).total, 0)
  const searched = rows.filter((r) => matches(r, query.trim()))
  const sorted = searched.filter(FILTERS[filter].test).sort(SORTS[sort].cmp)

  async function act(slug: string, action: string, confirmText: string) {
    if (!window.confirm(confirmText)) return
    setBusy(true)
    try {
      const res = await fetch(`/api/admin/exhibitor/${slug}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!data.ok) throw new Error(data.error)
      // 내역까지 최신으로 보려면 새로고침이 가장 간단하다.
      window.location.reload()
    } catch (e) {
      window.alert(e instanceof Error ? e.message : "처리하지 못했습니다.")
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <div className="max-w-[1180px] mx-auto px-5 md:px-8 py-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-[22px] font-extrabold">부대시설 신청</h1>
            <p className="text-[13px] text-[#777] mt-1">
              계정 {rows.length}개 · 부스 확인 {rows.filter((r) => r.booth_status).length}곳 ·
              부대시설 신청 {extraRows.length}곳 ({won(grand)}) · 업체용 주소{" "}
              <a href="/exhibitor" target="_blank" className="underline" rel="noopener">
                /exhibitor
              </a>
            </p>
          </div>
          <a
            href="/api/admin/exhibitor/export"
            className="bg-[#1a1a1a] text-white rounded px-4 py-2.5 text-[14px] font-bold"
          >
            엑셀 다운로드
          </a>
        </div>

        {todo > 0 && filter !== "todo" && (
          <button
            type="button"
            onClick={() => setFilter("todo")}
            className="mt-4 w-full text-left rounded bg-[#f0ad4e]/15 border border-[#f0ad4e]/40 px-4 py-3 text-[14px] font-bold text-[#8a6100] hover:bg-[#f0ad4e]/25"
          >
            처리할 요청이 {todo}건 있습니다. 눌러서 보기 →
          </button>
        )}

        <div className="mt-6 flex flex-col md:flex-row gap-2">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="업체명(한글·영문) 또는 아이디로 검색"
            className="flex-1 bg-white border border-black/15 rounded px-4 py-2.5 text-[14px] outline-none focus:border-[#7d0b1c]"
          />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="bg-white border border-black/15 rounded px-3 py-2.5 text-[14px] outline-none focus:border-[#7d0b1c]"
          >
            {(Object.keys(SORTS) as SortKey[]).map((k) => (
              <option key={k} value={k}>
                {SORTS[k].label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap gap-1.5">
          {(Object.keys(FILTERS) as FilterKey[]).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              className={`px-3 py-1.5 rounded-full text-[13px] font-bold ${
                filter === k
                  ? "bg-[#7d0b1c] text-white"
                  : "bg-white border border-black/10 text-[#555] hover:border-black/30"
              }`}
            >
              {FILTERS[k].label}{" "}
              <span className={filter === k ? "text-white/70" : "text-[#aaa]"}>
                {searched.filter(FILTERS[k].test).length}
              </span>
            </button>
          ))}
        </div>

        <div className="mt-3 bg-white border border-black/10 rounded-lg divide-y divide-black/10">
          <div className="hidden md:flex items-center gap-4 px-5 py-2 text-[12px] text-[#999] bg-black/[0.02]">
            <span className="w-[72px] text-center">부스 표기</span>
            <span className="w-[84px] text-center">부대시설</span>
            <span className="w-48">업체명</span>
            <span className="flex-1">신청 내용</span>
            <span className="w-28 text-right">금액</span>
            <span className="w-[72px] text-center">입금</span>
            <span className="w-24 text-right">최근 활동</span>
          </div>
          {sorted.length === 0 && (
            <p className="px-5 py-10 text-center text-[#999]">조건에 맞는 업체가 없습니다.</p>
          )}
          {sorted.map((r) => {
            const isOpen = open === r.brand_slug
            const cur = currentExtra(r)
            const pending = r.extra_pending
            return (
              <div key={r.brand_slug} className={needsAction(r) ? "bg-[#f0ad4e]/[0.04]" : ""}>
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : r.brand_slug)}
                  className="w-full flex items-center gap-4 px-5 py-3 text-left hover:bg-black/[0.02] cursor-pointer"
                >
                  <span className="w-[72px] shrink-0 flex justify-center">{boothTag(r)}</span>
                  <span className="w-[84px] shrink-0 flex justify-center">
                    {pending ? (
                      <Tag tone="amber">변경대기</Tag>
                    ) : hasExtra(r) ? (
                      <Tag tone="green">신청</Tag>
                    ) : (
                      <Tag tone="gray">미신청</Tag>
                    )}
                  </span>
                  <span className="w-48 shrink-0 font-bold truncate">
                    {r.defaults.name_ko}
                    {r.products?.length ? (
                      <span className="ml-1.5 text-[11px] font-bold text-[#7d0b1c]">
                        출품 {r.products.length}
                      </span>
                    ) : null}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-[14px] text-[#555]">
                    {hasExtra(r) ? itemsText(cur.items) : ""}
                  </span>
                  <span className="shrink-0 w-28 text-right text-[14px] font-bold tabular-nums">
                    {cur.total ? won(cur.total) : ""}
                  </span>
                  <span className="w-[72px] shrink-0 flex justify-center">{payTag(r)}</span>
                  <span className="hidden md:block shrink-0 w-24 text-right text-[12px] text-[#999] tabular-nums">
                    {r.logs[0] ? formatDate(r.logs[0].created_at) : ""}
                  </span>
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 grid md:grid-cols-2 gap-4 text-[14px]">
                    <div className="bg-black/[0.03] rounded p-4">
                      <p className="font-bold mb-2">
                        부스 표기{" "}
                        {r.booth_confirmed_at && (
                          <span className="font-normal text-[12px] text-[#999]">
                            {formatDate(r.booth_confirmed_at)}
                          </span>
                        )}
                      </p>
                      {r.booth_status === "revised" ? (
                        <>
                          <Diff
                            label="한글명"
                            before={r.defaults.name_ko}
                            after={r.booth_name_ko}
                          />
                          <Diff
                            label="영문명"
                            before={r.defaults.name_en}
                            after={r.booth_name_en}
                          />
                          {r.booth_note && (
                            <p className="mt-2 whitespace-pre-wrap bg-white rounded p-2">
                              {r.booth_note}
                            </p>
                          )}
                          <div className="mt-3">
                            {r.booth_ack_at ? (
                              <p className="text-[13px] text-[#1f5fa8] font-bold">
                                {formatDate(r.booth_ack_at)} 수정 요청 확인함
                              </p>
                            ) : (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  act(
                                    r.brand_slug,
                                    "booth_ack",
                                    `${r.defaults.name_ko}의 수정 요청을 확인 처리할까요?\n업체 화면에 '수정 요청 확인됨'이 표시됩니다.`,
                                  )
                                }
                                className={`${actionBtn} bg-[#1f5fa8] text-white`}
                              >
                                수정 요청 확인
                              </button>
                            )}
                          </div>
                        </>
                      ) : (
                        <>
                          <Diff label="한글명" before={null} after={r.defaults.name_ko} />
                          <Diff label="영문명" before={null} after={r.defaults.name_en} />
                        </>
                      )}
                      <p className="mt-2 text-[12px] text-[#999]">
                        부스 {r.defaults.booths}개 · 아이디 {r.login_id}
                      </p>
                    </div>
                    <div className="bg-black/[0.03] rounded p-4">
                      <p className="font-bold mb-2">
                        부대시설 추가 신청{" "}
                        {hasExtra(r) && r.extra_submitted_at && (
                          <span className="font-normal text-[12px] text-[#999]">
                            최초 {formatDate(r.extra_submitted_at)}
                          </span>
                        )}
                      </p>
                      {hasExtra(r) ? (
                        <ExtraDetail req={cur} />
                      ) : (
                        <p className="text-[#999]">미신청</p>
                      )}
                      <PaymentControl r={r} busy={busy} act={act} />
                      {pending && (
                        <div className="mt-4 rounded border-2 border-[#f0ad4e]/60 bg-white p-3">
                          <p className="font-bold text-[#8a6100] mb-1">
                            변경 요청{" "}
                            {r.extra_pending_at && (
                              <span className="font-normal text-[12px] text-[#999]">
                                {formatDate(r.extra_pending_at)}
                              </span>
                            )}
                          </p>
                          <ExtraDetail req={pending} />
                          <div className="mt-3 flex gap-2">
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                act(
                                  r.brand_slug,
                                  "extra_approve",
                                  `${r.defaults.name_ko}의 변경 요청을 승인할까요?\n신청 내용이 변경 요청대로 바뀝니다.`,
                                )
                              }
                              className={`${actionBtn} bg-[#2e7d32] text-white`}
                            >
                              변경 승인
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                act(
                                  r.brand_slug,
                                  "extra_reject",
                                  `${r.defaults.name_ko}의 변경 요청을 반려할까요?\n기존 신청 내용이 유지됩니다.`,
                                )
                              }
                              className={`${actionBtn} border border-black/20 bg-white`}
                            >
                              반려
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                    {r.products?.length ? (
                      <div className="md:col-span-2 bg-black/[0.03] rounded p-4">
                        <p className="font-bold mb-3">
                          올로로소 셰리 캐스크 출품 제품 ({r.products.length}){" "}
                          {r.products_updated_at && (
                            <span className="font-normal text-[12px] text-[#999]">
                              {formatDate(r.products_updated_at)}
                            </span>
                          )}
                        </p>
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {r.products.map((p, i) => (
                            <div key={p.id} className="bg-white rounded border border-black/10 p-3">
                              <p className="text-[12px] text-[#999]">제품 {i + 1}</p>
                              <p className="font-bold">{p.name_ko}</p>
                              {p.name_en && <p className="text-[13px] text-[#555]">{p.name_en}</p>}
                              <p className="text-[13px] mt-1">
                                {p.category} · {p.abv}% · {p.volume}
                              </p>
                              {p.description && (
                                <p className="text-[13px] text-[#555] mt-2 whitespace-pre-wrap leading-relaxed">
                                  {p.description}
                                </p>
                              )}
                              {p.photos.length > 0 && (
                                <div className="mt-2 flex gap-1.5">
                                  {p.photos.map((url) => (
                                    <a key={url} href={url} target="_blank" rel="noopener">
                                      {/* biome-ignore lint/performance/noImgElement: 관리자 미리보기 */}
                                      <img
                                        src={url}
                                        alt=""
                                        className="w-16 h-16 object-cover rounded border border-black/10"
                                      />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                    <div className="md:col-span-2">
                      <p className="font-bold">변경 내역 ({r.logs.length})</p>
                      {r.logs.length ? (
                        <div className="divide-y divide-black/10">
                          {r.logs.map((l) => (
                            <LogEntry key={l.id} log={l} />
                          ))}
                        </div>
                      ) : (
                        <p className="text-[#999] mt-1">아직 내역이 없습니다.</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
