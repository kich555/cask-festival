"use client"

import { useState } from "react"
import {
  type BoothDefaults,
  currentExtra,
  EXTRA_ITEMS,
  EXTRA_NOTICES,
  type ExhibitorState,
  type ExtraRequest,
  extraTotal,
  PAYMENT_INFO,
  sanitizeExtraItems,
  won,
} from "@/lib/exhibitorRecord"

type Props = { state: ExhibitorState; defaults: BoothDefaults }
type Result = { ok: boolean; error?: string; state?: ExhibitorState }

const inputCls =
  "w-full mt-1.5 bg-white border border-black/15 rounded px-3 py-2.5 text-[15px] outline-none focus:border-[#7d0b1c]"
const cardCls = "bg-white border border-black/10 rounded-lg p-5 md:p-7"

async function put(url: string, body?: object, method = "PUT"): Promise<Result> {
  try {
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    return (await res.json()) as Result
  } catch {
    return { ok: false, error: "네트워크 오류가 발생했습니다." }
  }
}

function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null
  return (
    <p className={`text-center text-[14px] mt-3 ${msg.ok ? "text-[#2e7d32]" : "text-[#7d0b1c]"}`}>
      {msg.text}
    </p>
  )
}

function Badge({ tone, children }: { tone: "ok" | "wait" | "info"; children: React.ReactNode }) {
  const cls = {
    ok: "bg-[#2e7d32]/10 text-[#2e7d32] border-[#2e7d32]/30",
    wait: "bg-[#f0ad4e]/15 text-[#8a6100] border-[#f0ad4e]/40",
    info: "bg-[#1f5fa8]/10 text-[#1f5fa8] border-[#1f5fa8]/30",
  }[tone]
  return (
    <span className={`shrink-0 text-[12px] font-bold border rounded px-2 py-1 ${cls}`}>
      {children}
    </span>
  )
}

const primaryBtn =
  "bg-[#7d0b1c] text-white rounded px-8 py-3 font-bold text-[15px] min-w-[140px] disabled:opacity-50"
const secondaryBtn =
  "border border-black/20 rounded px-8 py-3 font-bold text-[15px] min-w-[140px] hover:border-[#7d0b1c] hover:text-[#7d0b1c] disabled:opacity-50"

export default function ExhibitorForm({ state: initial, defaults }: Props) {
  const [state, setState] = useState(initial)
  const [pwOpen, setPwOpen] = useState(false)
  const [pwChanged, setPwChanged] = useState(Boolean(initial.password_changed_at))

  async function logout() {
    await fetch("/api/exhibitor/logout", { method: "POST" })
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-[720px] mx-auto px-5 py-5 flex items-center justify-between gap-4">
          <div>
            <p className="text-[12px] text-white/50 font-bold tracking-wide">
              CASK CARNIVAL 2026 · 참가업체
            </p>
            <h1 className="text-[20px] md:text-[22px] font-extrabold mt-1">{defaults.name_ko}</h1>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => setPwOpen(true)}
              className="text-[13px] text-white/60 hover:text-white"
            >
              비밀번호 변경
            </button>
            <button
              type="button"
              onClick={logout}
              className="text-[13px] text-white/60 hover:text-white"
            >
              로그아웃
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-[720px] mx-auto px-5 py-8 space-y-6">
        {!pwChanged && (
          <div className="rounded-lg border border-[#f0ad4e]/50 bg-[#f0ad4e]/10 px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
            <p className="flex-1 text-[14px] text-[#6b4b00] leading-relaxed">
              <b>임시 비밀번호로 로그인하셨습니다.</b>
              <br className="hidden sm:block" /> 보안을 위해 원하시는 비밀번호로 변경해 주세요.
            </p>
            <button
              type="button"
              onClick={() => setPwOpen(true)}
              className="shrink-0 bg-[#1a1a1a] text-white rounded px-5 py-2.5 text-[14px] font-bold"
            >
              비밀번호 변경
            </button>
          </div>
        )}
        <BoothSection state={state} defaults={defaults} onSaved={setState} />
        <ExtraSection state={state} onSaved={setState} />
      </main>
      {pwOpen && (
        <PasswordDialog onClose={() => setPwOpen(false)} onChanged={() => setPwChanged(true)} />
      )}
    </div>
  )
}

function BoothSection({
  state,
  defaults,
  onSaved,
}: {
  state: ExhibitorState
  defaults: BoothDefaults
  onSaved: (s: ExhibitorState) => void
}) {
  const [editing, setEditing] = useState(false)
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const revised = state.booth_status === "revised"
  const shown = {
    name_ko: revised ? state.booth_name_ko : defaults.name_ko,
    name_en: revised ? state.booth_name_en : defaults.name_en,
  }

  async function send(body: object, okText: string) {
    setBusy(true)
    setMsg(null)
    const r = await put("/api/exhibitor/booth", body)
    setBusy(false)
    if (r.ok && r.state) {
      onSaved(r.state)
      setEditing(false)
      setMsg({ ok: true, text: okText })
    } else setMsg({ ok: false, text: r.error ?? "저장하지 못했습니다." })
  }

  function revise(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget))
    send({ action: "revise", ...f }, "수정 요청이 접수되었습니다.")
  }

  return (
    <section className={cardCls}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold">1. 부스 표기 정보 확인</h2>
          <p className="text-[14px] text-[#666] mt-1.5 leading-relaxed">
            행사 부스에 아래 내용으로 표기됩니다. 맞으면 <b>승인</b>, 다르면 <b>수정</b>을 눌러
            주세요.
          </p>
        </div>
        {!editing &&
          (revised ? (
            state.booth_ack_at ? (
              <Badge tone="info">수정 요청 확인됨</Badge>
            ) : (
              <Badge tone="wait">수정 요청 접수</Badge>
            )
          ) : (
            state.booth_status && <Badge tone="ok">승인 완료</Badge>
          ))}
      </div>

      {!editing ? (
        <>
          <dl className="mt-5 divide-y divide-black/10 border-y border-black/10 text-[15px]">
            {[
              ["업체명 (한글)", shown.name_ko],
              ["업체명 (영문)", shown.name_en],
              ["부스 수", `${defaults.booths}개`],
            ].map(([k, v]) => (
              <div key={k} className="flex gap-4 py-3">
                <dt className="w-28 shrink-0 text-[#777] text-[14px]">{k}</dt>
                <dd className="font-bold break-all">
                  {v || <span className="text-[#bbb]">-</span>}
                </dd>
              </div>
            ))}
            {revised && state.booth_note && (
              <div className="flex gap-4 py-3">
                <dt className="w-28 shrink-0 text-[#777] text-[14px]">요청 메모</dt>
                <dd className="whitespace-pre-wrap">{state.booth_note}</dd>
              </div>
            )}
          </dl>
          {revised && state.booth_ack_at && (
            <p className="mt-4 text-center text-[14px] text-[#1f5fa8] font-bold">
              사무국에서 수정 요청을 확인했습니다. 위 내용으로 부스에 표기됩니다.
            </p>
          )}
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => send({ action: "approve" }, "승인되었습니다. 감사합니다.")}
              className={primaryBtn}
            >
              승인
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setMsg(null)
                setEditing(true)
              }}
              className={secondaryBtn}
            >
              수정
            </button>
          </div>
          <Msg msg={msg} />
        </>
      ) : (
        <form onSubmit={revise} className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4">
          <label className="col-span-2 sm:col-span-1 text-[13px] font-bold">
            업체명 (한글) *
            <input
              name="name_ko"
              required
              defaultValue={shown.name_ko ?? ""}
              className={inputCls}
            />
          </label>
          <label className="col-span-2 sm:col-span-1 text-[13px] font-bold">
            업체명 (영문)
            <input name="name_en" defaultValue={shown.name_en ?? ""} className={inputCls} />
          </label>
          <div className="col-span-2 text-[13px] font-bold">
            부스 수
            <p className="mt-1.5 px-3 py-2.5 text-[15px] font-normal text-[#666] bg-black/[0.03] rounded">
              {defaults.booths}개 <span className="text-[12px]">(변경은 사무국 문의)</span>
            </p>
          </div>
          <label className="col-span-2 text-[13px] font-bold">
            요청 메모
            <textarea
              name="note"
              rows={3}
              defaultValue={revised ? (state.booth_note ?? "") : ""}
              placeholder="표기 관련 요청사항이 있으면 적어 주세요."
              className={`${inputCls} resize-y`}
            />
          </label>
          <div className="col-span-2 mt-2 flex justify-center gap-2">
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? "처리 중..." : "수정 요청 보내기"}
            </button>
            <button type="button" onClick={() => setEditing(false)} className={secondaryBtn}>
              취소
            </button>
          </div>
          <div className="col-span-2">
            <Msg msg={msg} />
          </div>
        </form>
      )}
    </section>
  )
}

/** 신청 내용 읽기 전용 요약 */
function ExtraSummary({ req }: { req: ExtraRequest }) {
  const rows = EXTRA_ITEMS.filter((i) => req.items?.[i.key])
  return (
    <div className="text-[15px]">
      <ul className="divide-y divide-black/10 border-y border-black/10">
        {rows.map((i) => (
          <li key={i.key} className="flex justify-between gap-3 py-2.5">
            <span>
              {i.label} <b>{req.items[i.key]}</b>
              {i.unit}
            </span>
            <span className="tabular-nums">{won(req.items[i.key] * i.price)}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="py-2.5 text-[#888]">추가 신청 항목 없음</li>}
      </ul>
      <div className="flex justify-between py-2.5 font-extrabold">
        <span>합계</span>
        <span className="tabular-nums text-[#7d0b1c]">{won(req.total)}</span>
      </div>
      {req.water_location && (
        <p className="text-[14px] text-[#555]">급배수 설치 위치: {req.water_location}</p>
      )}
      {req.note && (
        <p className="text-[14px] text-[#555] whitespace-pre-wrap mt-1">기타 요청: {req.note}</p>
      )}
    </div>
  )
}

function ExtraSection({
  state,
  onSaved,
}: {
  state: ExhibitorState
  onSaved: (s: ExhibitorState) => void
}) {
  const submitted = Boolean(state.extra_submitted_at)
  const current = currentExtra(state)
  const pending = state.extra_pending
  // 폼을 열면 대기 중인 변경 요청(있으면) 또는 현재 신청 내용으로 채운다.
  const base = pending ?? current

  const [editing, setEditing] = useState(!submitted)
  const [qty, setQty] = useState<Record<string, string>>({})
  const [waterLocation, setWaterLocation] = useState("")
  const [note, setNote] = useState("")
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)

  function openForm(from: ExtraRequest) {
    setQty(Object.fromEntries(EXTRA_ITEMS.map((i) => [i.key, String(from.items?.[i.key] ?? "")])))
    setWaterLocation(from.water_location ?? "")
    setNote(from.note ?? "")
    setMsg(null)
    setEditing(true)
  }

  const items = sanitizeExtraItems(qty)
  const total = extraTotal(items)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMsg(null)
    const r = await put("/api/exhibitor/extra", { items: qty, water_location: waterLocation, note })
    setBusy(false)
    if (r.ok && r.state) {
      onSaved(r.state)
      setEditing(false)
      setMsg({
        ok: true,
        text: submitted
          ? "변경 요청이 접수되었습니다. 사무국 승인 후 반영됩니다."
          : "신청이 접수되었습니다.",
      })
    } else setMsg({ ok: false, text: r.error ?? "저장하지 못했습니다." })
  }

  async function cancelPending() {
    if (!window.confirm("변경 요청을 취소할까요?")) return
    setBusy(true)
    const r = await put("/api/exhibitor/extra", undefined, "DELETE")
    setBusy(false)
    if (r.ok && r.state) {
      onSaved(r.state)
      setMsg({ ok: true, text: "변경 요청을 취소했습니다." })
    } else setMsg({ ok: false, text: r.error ?? "취소하지 못했습니다." })
  }

  return (
    <section className={cardCls}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-[18px] font-extrabold">2. 부대시설 추가 신청</h2>
          <p className="text-[14px] text-[#666] mt-1.5">
            {submitted
              ? "신청 후 변경은 사무국 승인 후 반영됩니다."
              : "필요한 항목의 수량을 입력해 주세요."}
          </p>
        </div>
        {submitted &&
          !editing &&
          (pending ? (
            <Badge tone="wait">변경 승인 대기</Badge>
          ) : (
            <Badge tone="ok">신청 완료</Badge>
          ))}
      </div>

      {!editing ? (
        <div className="mt-5">
          {!pending && state.extra_decision === "rejected" && (
            <p className="mb-4 rounded bg-[#7d0b1c]/[0.06] px-4 py-3 text-[14px] text-[#7d0b1c] font-bold text-center">
              요청하신 변경이 반려되었습니다. 자세한 내용은 사무국에 문의해 주세요.
            </p>
          )}
          {!pending && state.extra_decision === "approved" && (
            <p className="mb-4 rounded bg-[#2e7d32]/[0.08] px-4 py-3 text-[14px] text-[#2e7d32] font-bold text-center">
              요청하신 변경이 승인되어 반영되었습니다.
            </p>
          )}
          <p className="text-[13px] font-bold text-[#777] mb-1">현재 신청 내용</p>
          <ExtraSummary req={current} />
          {pending && (
            <div className="mt-5 rounded border-2 border-[#f0ad4e]/60 bg-[#f0ad4e]/[0.06] p-4">
              <p className="text-[13px] font-bold text-[#8a6100] mb-1">
                변경 요청 (사무국 승인 대기 중)
              </p>
              <ExtraSummary req={pending} />
            </div>
          )}
          <div className="mt-6 flex justify-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => openForm(base)}
              className={primaryBtn}
            >
              {pending ? "변경 요청 수정" : "신청 내용 변경"}
            </button>
            {pending && (
              <button
                type="button"
                disabled={busy}
                onClick={cancelPending}
                className={secondaryBtn}
              >
                변경 요청 취소
              </button>
            )}
          </div>
          <Msg msg={msg} />
        </div>
      ) : (
        <form onSubmit={submit}>
          <ul className="mt-5 divide-y divide-black/10 border-y border-black/10">
            <li className="flex items-center gap-3 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold">전기 · 기본</p>
                <p className="text-[13px] text-[#888] mt-0.5">부스당 기본 제공</p>
              </div>
              <p className="text-[14px] font-bold text-[#2e7d32]">1kW 기본 제공</p>
            </li>
            {EXTRA_ITEMS.map((it) => {
              const n = items[it.key] ?? 0
              return (
                <li key={it.key} className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold">{it.label}</p>
                      <p className="text-[13px] text-[#888] mt-0.5">
                        {won(it.price)} / {it.unit}
                        {it.desc && ` · ${it.desc}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <input
                        type="number"
                        inputMode="numeric"
                        min={0}
                        max={99}
                        value={qty[it.key] ?? ""}
                        onChange={(e) => setQty((p) => ({ ...p, [it.key]: e.target.value }))}
                        placeholder="0"
                        aria-label={`${it.label} 수량`}
                        className="w-16 bg-white border border-black/15 rounded px-2 py-2 text-[15px] text-right outline-none focus:border-[#7d0b1c]"
                      />
                      <span className="w-8 text-[13px] text-[#777]">{it.unit}</span>
                    </div>
                    <p className="hidden sm:block w-24 shrink-0 text-right text-[14px] tabular-nums">
                      {n ? won(n * it.price) : "-"}
                    </p>
                  </div>
                  {it.key === "water" && n > 0 && (
                    <label className="block mt-3 text-[13px] font-bold">
                      급배수 설치 위치 *
                      <textarea
                        value={waterLocation}
                        onChange={(e) => setWaterLocation(e.target.value)}
                        rows={2}
                        placeholder="예: 부스 뒤편 왼쪽 모서리 (준비 기간 중 위치 변경 불가)"
                        className={`${inputCls} resize-y font-normal`}
                      />
                    </label>
                  )}
                </li>
              )
            })}
          </ul>

          <div className="flex items-baseline justify-between mt-4">
            <span className="text-[15px] font-bold">합계</span>
            <span className="text-[22px] font-extrabold text-[#7d0b1c] tabular-nums">
              {won(total)}
            </span>
          </div>

          <label className="block mt-5 text-[13px] font-bold">
            기타 요청사항
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="삼상 전기 등 사전 협의가 필요한 사항을 적어 주세요."
              className={`${inputCls} resize-y font-normal`}
            />
          </label>

          <div className="mt-6 flex justify-center gap-2">
            <button type="submit" disabled={busy} className={primaryBtn}>
              {busy ? "처리 중..." : submitted ? "변경 요청 보내기" : "신청하기"}
            </button>
            {submitted && (
              <button type="button" onClick={() => setEditing(false)} className={secondaryBtn}>
                취소
              </button>
            )}
          </div>
          <Msg msg={msg} />
        </form>
      )}

      <ul className="mt-6 space-y-1.5 text-[13px] text-[#555] leading-relaxed bg-black/[0.03] rounded p-4">
        {EXTRA_NOTICES.map((t) => (
          <li key={t} className="flex gap-2">
            <span className="shrink-0">·</span>
            <span>{t}</span>
          </li>
        ))}
      </ul>

      <PaymentBox total={editing ? total : current.total} />
    </section>
  )
}

function PaymentBox({ total }: { total: number }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(PAYMENT_INFO.account.replace(/-/g, ""))
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {}
  }

  return (
    <div className="mt-6 rounded-lg overflow-hidden border-2 border-[#7d0b1c]">
      <p className="bg-[#7d0b1c] text-white px-4 py-2.5 text-[15px] font-extrabold">입금 안내</p>
      <dl className="px-4 py-2 divide-y divide-black/10">
        <div className="flex items-center gap-4 py-3">
          <dt className="w-20 shrink-0 text-[14px] text-[#777]">입금 계좌</dt>
          <dd className="flex-1 min-w-0">
            <p className="text-[14px]">{PAYMENT_INFO.bank}</p>
            <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="text-[22px] md:text-[24px] font-extrabold tabular-nums tracking-tight">
                {PAYMENT_INFO.account}
              </span>
              <button
                type="button"
                onClick={copy}
                className="text-[12px] font-bold border border-black/20 rounded px-2 py-1 hover:border-[#7d0b1c] hover:text-[#7d0b1c]"
              >
                {copied ? "복사됨" : "계좌번호 복사"}
              </button>
            </p>
          </dd>
        </div>
        <div className="flex items-center gap-4 py-3">
          <dt className="w-20 shrink-0 text-[14px] text-[#777]">예금주</dt>
          <dd className="text-[17px] font-bold">{PAYMENT_INFO.holder}</dd>
        </div>
        <div className="flex items-center gap-4 py-3">
          <dt className="w-20 shrink-0 text-[14px] text-[#777]">납부 기한</dt>
          <dd className="text-[20px] font-extrabold text-[#7d0b1c]">~ {PAYMENT_INFO.deadline}</dd>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-4 py-3">
            <dt className="w-20 shrink-0 text-[14px] text-[#777]">입금 금액</dt>
            <dd className="text-[20px] font-extrabold tabular-nums">{won(total)}</dd>
          </div>
        )}
      </dl>
      <p className="bg-[#7d0b1c]/[0.06] px-4 py-3 text-[14px] font-bold">
        입금 후 사무국에 확인 연락 부탁드립니다.
      </p>
    </div>
  )
}

function PasswordDialog({ onClose, onChanged }: { onClose: () => void; onChanged: () => void }) {
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const [done, setDone] = useState(false)

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>
    if (f.next !== f.confirm) {
      setMsg({ ok: false, text: "새 비밀번호가 서로 다릅니다." })
      return
    }
    setBusy(true)
    setMsg(null)
    const r = await put("/api/exhibitor/password", { current: f.current, next: f.next })
    setBusy(false)
    if (r.ok) {
      setDone(true)
      onChanged()
    } else setMsg({ ok: false, text: r.error ?? "변경하지 못했습니다." })
  }

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: 바깥 클릭·Esc 로 닫는 배경
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
      role="presentation"
    >
      <div
        className="bg-white rounded-lg w-full max-w-[400px] p-6"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <h2 className="text-[18px] font-extrabold text-center">비밀번호 변경</h2>
        {done ? (
          <>
            <p className="mt-5 text-center text-[15px] text-[#2e7d32] font-bold">
              비밀번호가 변경되었습니다.
            </p>
            <p className="mt-1 text-center text-[13px] text-[#777]">
              다음 로그인부터 새 비밀번호를 사용해 주세요.
            </p>
            <div className="mt-6 flex justify-center">
              <button type="button" onClick={onClose} className={primaryBtn}>
                확인
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="block text-[13px] font-bold">
              현재 비밀번호
              <input
                type="password"
                name="current"
                required
                autoComplete="current-password"
                className={inputCls}
              />
            </label>
            <label className="block text-[13px] font-bold">
              새 비밀번호 <span className="font-normal text-[#888]">(8자 이상)</span>
              <input
                type="password"
                name="next"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputCls}
              />
            </label>
            <label className="block text-[13px] font-bold">
              새 비밀번호 확인
              <input
                type="password"
                name="confirm"
                required
                minLength={8}
                autoComplete="new-password"
                className={inputCls}
              />
            </label>
            <div className="pt-3 flex justify-center gap-2">
              <button type="submit" disabled={busy} className={primaryBtn}>
                {busy ? "변경 중..." : "변경하기"}
              </button>
              <button type="button" onClick={onClose} className={secondaryBtn}>
                취소
              </button>
            </div>
            <Msg msg={msg} />
          </form>
        )}
      </div>
    </div>
  )
}
