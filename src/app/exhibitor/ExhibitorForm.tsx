"use client"

import { useEffect, useState } from "react"
import {
  type BoothDefaults,
  type BoothDraft,
  boothValues,
  currentExtra,
  EXTRA_ITEMS,
  EXTRA_NOTICES,
  type ExhibitorProduct,
  type ExhibitorState,
  type ExtraRequest,
  emptyProduct,
  extraTotal,
  extraValues,
  hasExtra,
  sanitizeExtraItems,
  won,
} from "@/lib/exhibitorRecord"
import {
  Badge,
  cardCls,
  ExtraSummary,
  inputCls,
  Msg,
  Notes,
  PasswordDialog,
  PaymentBox,
  ProductCard,
  primaryBtn,
  put,
} from "./exhibitorParts"

type Props = { state: ExhibitorState; defaults: BoothDefaults }
type ExtraForm = { qty: Record<string, string>; water_location: string; note: string }
type Message = { ok: boolean; text: string } | null

const outlineBtn =
  "border border-black/20 rounded px-8 py-3 font-bold text-[15px] min-w-[140px] hover:border-black hover:text-black disabled:opacity-50"

function extraFormFrom(r: ExtraRequest): ExtraForm {
  return {
    qty: Object.fromEntries(EXTRA_ITEMS.map((i) => [i.key, String(r.items?.[i.key] ?? "")])),
    water_location: r.water_location ?? "",
    note: r.note ?? "",
  }
}

const sameExtraForm = (f: ExtraForm, r: ExtraRequest) =>
  JSON.stringify([sanitizeExtraItems(f.qty), f.water_location.trim(), f.note.trim()]) ===
  JSON.stringify([sanitizeExtraItems(r.items), r.water_location ?? "", r.note ?? ""])

const productsKey = (list: ExhibitorProduct[]) =>
  JSON.stringify(
    list.map((p) => [
      p.name_ko.trim(),
      p.name_en.trim(),
      p.category.trim(),
      String(p.abv).trim().replace(/%$/, ""),
      p.volume.trim(),
      (p.description ?? "").trim(),
      p.photos,
    ]),
  )

const savedProductsOf = (s: ExhibitorState) => s.draft?.products ?? s.products ?? []

function SectionTitle({ n, title, badge }: { n: number; title: string; badge?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <h2 className="text-[18px] font-extrabold">
        {n}. {title}
      </h2>
      {badge}
    </div>
  )
}

/**
 * 섹션 하단 저장하기 버튼 + 결과 문구.
 * 고친 내용이 있으면 '저장하기', 저장된 내용만 있으면 '저장됨', 둘 다 없으면 버튼을 숨긴다.
 */
function SaveBar({
  dirty,
  hasSaved,
  busy,
  onSave,
  msg,
}: {
  dirty: boolean
  hasSaved: boolean
  busy: boolean
  onSave: () => void
  msg: Message
}) {
  if (!dirty && !hasSaved && !msg) return null
  return (
    <div className="mt-6">
      {(dirty || hasSaved) && (
        <div className="flex justify-center">
          <button type="button" disabled={busy || !dirty} onClick={onSave} className={primaryBtn}>
            {busy ? "저장 중..." : dirty ? "저장하기" : "저장됨"}
          </button>
        </div>
      )}
      {dirty && !msg && (
        <p className="text-center text-[13px] text-[#8a6100] mt-2">
          저장하지 않은 변경 사항이 있습니다.
        </p>
      )}
      <Msg msg={msg} />
    </div>
  )
}

export default function ExhibitorForm({ state: initial, defaults }: Props) {
  const [state, setState] = useState(initial)
  const [pwOpen, setPwOpen] = useState(false)
  const [pwChanged, setPwChanged] = useState(Boolean(initial.password_changed_at))

  // 1. 부스
  const [boothEditing, setBoothEditing] = useState(false)
  const [boothDraft, setBoothDraft] = useState<BoothDraft>(() => boothValues(initial, defaults))
  const [boothBusy, setBoothBusy] = useState(false)
  const [boothMsg, setBoothMsg] = useState<Message>(null)

  // 2. 부대시설
  const [extra, setExtra] = useState(() => extraFormFrom(extraValues(initial)))
  const [extraBusy, setExtraBusy] = useState(false)
  const [extraMsg, setExtraMsg] = useState<Message>(null)

  // 3. 출품 제품
  const [products, setProducts] = useState<ExhibitorProduct[]>(() => savedProductsOf(initial))
  const [productsBusy, setProductsBusy] = useState(false)
  const [productsMsg, setProductsMsg] = useState<Message>(null)

  // 제출
  const [submitBusy, setSubmitBusy] = useState(false)
  const [submitMsg, setSubmitMsg] = useState<{ ok: boolean; lines: string[] } | null>(null)

  const booth = boothValues(state, defaults)
  const boothDecided = Boolean(state.draft?.booth || state.booth_status)
  const extraDirty = !sameExtraForm(extra, extraValues(state))
  const productsDirty = productsKey(products) !== productsKey(savedProductsOf(state))
  const unsaved = [boothEditing && "1번", extraDirty && "2번", productsDirty && "3번"].filter(
    Boolean,
  ) as string[]

  // 저장하지 않고 페이지를 떠나려 하면 경고
  useEffect(() => {
    if (unsaved.length === 0) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener("beforeunload", warn)
    return () => window.removeEventListener("beforeunload", warn)
  }, [unsaved.length])

  async function saveDraft(section: "booth" | "extra" | "products", data: unknown) {
    const r = await put("/api/exhibitor/draft", { section, data })
    if (r.ok && r.state) {
      setState(r.state)
      setSubmitMsg(null)
    }
    return r
  }

  async function confirmBooth() {
    setBoothBusy(true)
    setBoothMsg(null)
    const r = await saveDraft("booth", booth)
    setBoothBusy(false)
    setBoothMsg(
      r.ok
        ? { ok: true, text: "저장되었습니다." }
        : { ok: false, text: r.error ?? "저장하지 못했습니다." },
    )
  }

  async function saveBoothEdit() {
    setBoothBusy(true)
    setBoothMsg(null)
    const r = await saveDraft("booth", boothDraft)
    setBoothBusy(false)
    if (r.ok) {
      setBoothEditing(false)
      setBoothMsg({ ok: true, text: "수정 내용이 저장되었습니다." })
    } else setBoothMsg({ ok: false, text: r.error ?? "저장하지 못했습니다." })
  }

  async function saveExtra() {
    setExtraBusy(true)
    setExtraMsg(null)
    const r = await saveDraft("extra", {
      items: extra.qty,
      water_location: extra.water_location,
      note: extra.note,
    })
    setExtraBusy(false)
    if (r.ok && r.state) {
      setExtra(extraFormFrom(extraValues(r.state)))
      setExtraMsg({ ok: true, text: "저장되었습니다." })
    } else setExtraMsg({ ok: false, text: r.error ?? "저장하지 못했습니다." })
  }

  async function saveProducts() {
    setProductsBusy(true)
    setProductsMsg(null)
    const r = await saveDraft("products", products)
    setProductsBusy(false)
    if (r.ok && r.state) {
      setProducts(savedProductsOf(r.state))
      setProductsMsg({ ok: true, text: "저장되었습니다." })
    } else setProductsMsg({ ok: false, text: r.error ?? "저장하지 못했습니다." })
  }

  async function submit() {
    if (unsaved.length) {
      setSubmitMsg({
        ok: false,
        lines: [
          `저장하지 않은 항목이 있습니다 (${unsaved.join(", ")}). 저장하기를 먼저 눌러 주십시오.`,
        ],
      })
      return
    }
    setSubmitBusy(true)
    setSubmitMsg(null)
    const r = await put("/api/exhibitor/submit", {}, "POST")
    setSubmitBusy(false)
    if (r.ok && r.state) {
      setState(r.state)
      setBoothDraft(boothValues(r.state, defaults))
      setExtra(extraFormFrom(extraValues(r.state)))
      setProducts(savedProductsOf(r.state))
      setBoothMsg(null)
      setExtraMsg(null)
      setProductsMsg(null)
      setSubmitMsg({ ok: true, lines: ["제출되었습니다. 감사합니다.", ...(r.notes ?? [])] })
    } else setSubmitMsg({ ok: false, lines: [r.error ?? "제출하지 못했습니다."] })
  }

  async function cancelPending() {
    if (!window.confirm("부대시설 변경 요청을 취소할까요?")) return
    const r = await put("/api/exhibitor/extra", undefined, "DELETE")
    if (r.ok && r.state) {
      setState(r.state)
      setExtra(extraFormFrom(extraValues(r.state)))
      setExtraMsg({ ok: true, text: "변경 요청을 취소했습니다." })
    } else setExtraMsg({ ok: false, text: r.error ?? "취소하지 못했습니다." })
  }

  async function logout() {
    await fetch("/api/exhibitor/logout", { method: "POST" })
    window.location.reload()
  }

  // ── 표시용 값 ──
  const revised = state.booth_status === "revised"
  const applied = hasExtra(state)
  const current = currentExtra(state)
  const pending = state.extra_pending
  const formItems = sanitizeExtraItems(extra.qty)
  const formTotal = extraTotal(formItems)
  const submittedProducts = state.products?.length ?? 0

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

        <div className="rounded-lg bg-white border border-black/10 px-5 py-4">
          <Notes
            items={[
              <>
                1~3번 각 항목을 작성하신 후 항목별 <b>저장하기</b>를 눌러 주십시오.
              </>,
              <>
                모든 항목을 저장하신 후 페이지 하단의 <b>제출하기</b>를 누르시면 사무국에
                접수됩니다.
              </>,
              "제출 후에도 내용을 수정하여 다시 저장·제출하실 수 있습니다.",
            ]}
          />
        </div>

        {/* 1. 부스 표기 정보 */}
        <section className={cardCls}>
          <SectionTitle
            n={1}
            title="부스 표기 정보 확인"
            badge={
              state.draft?.booth ? null : revised ? (
                state.booth_ack_at ? (
                  <Badge tone="info">수정 요청 확인됨</Badge>
                ) : (
                  <Badge tone="wait">수정 요청 접수</Badge>
                )
              ) : (
                state.booth_status && <Badge tone="ok">확인 완료</Badge>
              )
            }
          />
          <Notes className="mt-2" items={["행사 부스에 아래 내용으로 표기됩니다."]} />

          {!boothEditing ? (
            <>
              <dl className="mt-5 divide-y divide-black/10 border-y border-black/10 text-[15px]">
                {[
                  ["업체명 (한글)", booth.name_ko],
                  ["업체명 (영문)", booth.name_en],
                  ["부스 수", `${defaults.booths}개`],
                  ...(booth.note ? [["요청 메모", booth.note]] : []),
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-4 py-3">
                    <dt className="w-28 shrink-0 text-[#777] text-[14px]">{k}</dt>
                    <dd className="font-bold break-all whitespace-pre-wrap">
                      {v || <span className="text-[#bbb]">-</span>}
                    </dd>
                  </div>
                ))}
              </dl>
              {revised && state.booth_ack_at && !state.draft?.booth && (
                <p className="mt-4 text-center text-[14px] text-[#1f5fa8] font-bold">
                  사무국에서 수정 요청을 확인했습니다. 위 내용으로 부스에 표기됩니다.
                </p>
              )}
              <div className="mt-6 flex justify-center gap-2">
                <button
                  type="button"
                  disabled={boothBusy}
                  onClick={confirmBooth}
                  className={boothDecided ? primaryBtn : outlineBtn}
                >
                  {boothDecided ? "✓ 확인" : "확인"}
                </button>
                <button
                  type="button"
                  disabled={boothBusy}
                  onClick={() => {
                    setBoothDraft(booth)
                    setBoothMsg(null)
                    setBoothEditing(true)
                  }}
                  className={outlineBtn}
                >
                  수정
                </button>
              </div>
              <Msg msg={boothMsg} />
            </>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4">
              <label className="col-span-2 sm:col-span-1 text-[13px] font-bold">
                업체명 (한글) *
                <input
                  value={boothDraft.name_ko}
                  onChange={(e) => setBoothDraft({ ...boothDraft, name_ko: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="col-span-2 sm:col-span-1 text-[13px] font-bold">
                업체명 (영문)
                <input
                  value={boothDraft.name_en}
                  onChange={(e) => setBoothDraft({ ...boothDraft, name_en: e.target.value })}
                  className={inputCls}
                />
              </label>
              <label className="col-span-2 text-[13px] font-bold">
                요청 메모
                <textarea
                  value={boothDraft.note}
                  onChange={(e) => setBoothDraft({ ...boothDraft, note: e.target.value })}
                  rows={3}
                  placeholder="표기 관련 요청사항이 있으면 적어 주십시오."
                  className={`${inputCls} resize-y font-normal`}
                />
              </label>
              <div className="col-span-2 mt-2">
                <div className="flex justify-center">
                  <button
                    type="button"
                    disabled={boothBusy}
                    onClick={saveBoothEdit}
                    className={primaryBtn}
                  >
                    {boothBusy ? "저장 중..." : "저장하기"}
                  </button>
                </div>
                <Msg msg={boothMsg} />
              </div>
            </div>
          )}
        </section>

        {/* 2. 부대시설 추가 신청 */}
        <section className={cardCls}>
          <SectionTitle
            n={2}
            title="부대시설 추가 신청"
            badge={
              state.draft?.extra ? null : pending ? (
                <Badge tone="wait">변경 승인 대기</Badge>
              ) : (
                applied && <Badge tone="ok">신청 완료</Badge>
              )
            }
          />
          <Notes
            className="mt-2"
            items={[
              "필요한 항목의 수량을 입력해 주십시오. 전기 1kW는 부스당 기본 제공됩니다.",
              "최초 신청은 제출 즉시 접수되며, 이후 변경 사항은 사무국 승인 후 반영됩니다.",
              "추가로 필요한 항목이 없으시면 입력하지 않으셔도 괜찮습니다.",
            ]}
          />

          {applied && (
            <div className="mt-5 space-y-3">
              {!pending && state.extra_decision === "rejected" && (
                <p className="rounded bg-[#7d0b1c]/[0.06] px-4 py-3 text-[14px] text-[#7d0b1c] font-bold text-center">
                  요청하신 변경이 반려되었습니다. 자세한 내용은 사무국에 문의해 주십시오.
                </p>
              )}
              {!pending && state.extra_decision === "approved" && (
                <p className="rounded bg-[#2e7d32]/[0.08] px-4 py-3 text-[14px] text-[#2e7d32] font-bold text-center">
                  요청하신 변경이 승인되어 반영되었습니다.
                </p>
              )}
              <div className="rounded border border-black/10 p-4">
                <p className="text-[13px] font-bold text-[#777] mb-1">현재 접수된 신청</p>
                <ExtraSummary req={current} />
              </div>
              {pending && (
                <div className="rounded border-2 border-[#f0ad4e]/60 bg-[#f0ad4e]/[0.06] p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <p className="text-[13px] font-bold text-[#8a6100]">
                      변경 요청 (사무국 승인 대기 중)
                    </p>
                    <button
                      type="button"
                      onClick={cancelPending}
                      className="text-[12px] font-bold text-[#8a6100] underline"
                    >
                      변경 요청 취소
                    </button>
                  </div>
                  <ExtraSummary req={pending} />
                </div>
              )}
              <p className="text-[13px] font-bold text-[#555] pt-2">
                변경이 필요하시면 아래에서 수정 후 저장·제출해 주십시오.
              </p>
            </div>
          )}

          <ul className="mt-4 divide-y divide-black/10 border-y border-black/10">
            <li className="flex items-center gap-3 py-3.5">
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold">전기 · 기본</p>
                <p className="text-[13px] text-[#888] mt-0.5">부스당 기본 제공</p>
              </div>
              <p className="text-[14px] font-bold text-[#2e7d32]">1kW 기본 제공</p>
            </li>
            {EXTRA_ITEMS.map((it) => {
              const n = formItems[it.key] ?? 0
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
                        value={extra.qty[it.key] ?? ""}
                        onChange={(e) => {
                          setExtra({ ...extra, qty: { ...extra.qty, [it.key]: e.target.value } })
                          setExtraMsg(null)
                        }}
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
                        value={extra.water_location}
                        onChange={(e) => {
                          setExtra({ ...extra, water_location: e.target.value })
                          setExtraMsg(null)
                        }}
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
              {won(formTotal)}
            </span>
          </div>

          <label className="block mt-5 text-[13px] font-bold">
            기타 요청사항
            <textarea
              value={extra.note}
              onChange={(e) => {
                setExtra({ ...extra, note: e.target.value })
                setExtraMsg(null)
              }}
              rows={3}
              placeholder="커피머신·제빙기처럼 전력 소모가 큰 기기(삼상 전기) 등 사전 협의가 필요한 사항을 적어 주십시오."
              className={`${inputCls} resize-y font-normal`}
            />
          </label>

          <div className="mt-6 bg-black/[0.03] rounded p-4">
            <p className="text-[13px] font-bold mb-1.5">유의사항</p>
            <Notes items={EXTRA_NOTICES} className="text-[13px]" />
          </div>

          <PaymentBox total={applied ? current.total : formTotal} state={state} />

          <SaveBar
            dirty={extraDirty}
            hasSaved={(() => {
              const v = extraValues(state)
              return Object.keys(v.items ?? {}).length > 0 || Boolean(v.note)
            })()}
            busy={extraBusy}
            onSave={saveExtra}
            msg={extraMsg}
          />
        </section>

        {/* 3. 올로로소 셰리 캐스크 출품 제품 */}
        <section className={cardCls}>
          <SectionTitle
            n={3}
            title="올로로소 셰리 캐스크 출품 제품 등록"
            badge={
              state.draft?.products
                ? null
                : submittedProducts > 0 && <Badge tone="ok">{submittedProducts}개 등록</Badge>
            }
          />
          <Notes
            className="mt-2"
            items={[
              <>
                올해 캐스크 카니발의 테마는 <b>&lsquo;올로로소 셰리 캐스크&rsquo;</b>입니다.
              </>,
              <>
                테마에 해당하는 출품 제품을 등록해 주시면, 캐스크 카니발 <b>공식 SNS 소개 콘텐츠</b>
                로 제작되어 홍보될 예정입니다.
              </>,
              <>
                제품이 돋보이는 <b>고화질 연출 사진</b>과 <b>제품 설명</b>을 함께 등록해 주시기
                바랍니다.
              </>,
              <>
                복수 제품 출품 시 <b>+ 제품 추가</b>를 눌러 이어서 입력해 주십시오.
              </>,
              "올로로소 셰리 캐스크 제품 미출품 시 본 항목은 기재하지 않으셔도 됩니다.",
            ]}
          />

          <div className="mt-5 space-y-3">
            {products.map((p, i) => (
              <ProductCard
                key={p.id}
                index={i}
                product={p}
                onChange={(np) => {
                  setProducts(products.map((x) => (x.id === p.id ? np : x)))
                  setProductsMsg(null)
                }}
                onRemove={() => {
                  if (window.confirm(`제품 ${i + 1}을(를) 삭제할까요?`)) {
                    setProducts(products.filter((x) => x.id !== p.id))
                    setProductsMsg(null)
                  }
                }}
                onError={(text) => setProductsMsg({ ok: false, text })}
              />
            ))}
            <button
              type="button"
              onClick={() => {
                setProducts([...products, emptyProduct()])
                setProductsMsg(null)
              }}
              className="w-full rounded-lg border-2 border-dashed border-black/20 py-3.5 text-[15px] font-bold text-[#555] hover:border-black hover:text-black"
            >
              + 제품 추가
            </button>
          </div>

          <SaveBar
            dirty={productsDirty}
            hasSaved={savedProductsOf(state).length > 0}
            busy={productsBusy}
            onSave={saveProducts}
            msg={productsMsg}
          />
        </section>

        {/* 제출 — 페이지에서 유일한 빨간 버튼 */}
        <div className="pt-4 pb-6 text-center">
          <button
            type="button"
            disabled={submitBusy}
            onClick={submit}
            className="bg-[#7d0b1c] text-white rounded px-16 py-4 font-extrabold text-[17px] hover:bg-[#650916] disabled:opacity-50"
          >
            {submitBusy ? "제출 중..." : "제출하기"}
          </button>
          {submitMsg && (
            <div
              className={`mt-4 text-[14px] font-bold space-y-0.5 ${submitMsg.ok ? "text-[#2e7d32]" : "text-[#7d0b1c]"}`}
            >
              {submitMsg.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
            </div>
          )}
        </div>
      </main>

      {pwOpen && (
        <PasswordDialog onClose={() => setPwOpen(false)} onChanged={() => setPwChanged(true)} />
      )}
    </div>
  )
}
