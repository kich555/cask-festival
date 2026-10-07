"use client"
// /exhibitor 화면의 보조 컴포넌트 (입금 안내, 비밀번호 변경, 출품 제품 카드 등)

import { useRef, useState } from "react"
import {
  EXTRA_ITEMS,
  type ExhibitorProduct,
  type ExhibitorState,
  type ExtraRequest,
  PAYMENT_INFO,
  PRODUCT_PHOTO_MAX,
  PRODUCT_PHOTO_MAX_BYTES,
  PRODUCT_PHOTO_TYPES,
  paymentStatus,
  won,
} from "@/lib/exhibitorRecord"

export const inputCls =
  "w-full mt-1.5 bg-white border border-black/15 rounded px-3 py-2.5 text-[15px] outline-none focus:border-[#7d0b1c]"
export const cardCls = "bg-white border border-black/10 rounded-lg p-5 md:p-7"

export type Result = { ok: boolean; error?: string; state?: ExhibitorState; notes?: string[] }

export async function put(url: string, body?: object, method = "PUT"): Promise<Result> {
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

/** "-" 말머리 안내 목록 */
export function Notes({ items, className = "" }: { items: React.ReactNode[]; className?: string }) {
  return (
    <ul className={`space-y-1 text-[14px] text-[#555] leading-relaxed ${className}`}>
      {items.map((t, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: 고정 문구 목록
        <li key={i} className="flex gap-2">
          <span className="shrink-0 text-[#999]">-</span>
          <span>{t}</span>
        </li>
      ))}
    </ul>
  )
}

export function Msg({ msg }: { msg: { ok: boolean; text: string } | null }) {
  if (!msg) return null
  return (
    <p className={`text-center text-[14px] mt-3 ${msg.ok ? "text-[#2e7d32]" : "text-[#7d0b1c]"}`}>
      {msg.text}
    </p>
  )
}

export function Badge({
  tone,
  children,
}: {
  tone: "ok" | "wait" | "info"
  children: React.ReactNode
}) {
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

export const primaryBtn =
  "bg-[#1a1a1a] text-white rounded px-8 py-3 font-bold text-[15px] min-w-[140px] hover:bg-black disabled:opacity-40"
export const secondaryBtn =
  "border border-black/20 rounded px-8 py-3 font-bold text-[15px] min-w-[140px] hover:border-black hover:text-black disabled:opacity-50"

export function ExtraSummary({ req }: { req: ExtraRequest }) {
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

export function PaymentBox({ total, state }: { total: number; state: ExhibitorState }) {
  const pay = paymentStatus(state)
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
      {pay.kind === "paid" && (
        <p className="bg-[#2e7d32]/10 text-[#2e7d32] px-4 py-3 text-[15px] font-extrabold text-center">
          ✓ 입금이 확인되었습니다 ({won(pay.paid)})
        </p>
      )}
      {pay.kind === "partial" && (
        <p className="bg-[#f0ad4e]/15 text-[#8a6100] px-4 py-3 text-[14px] font-bold text-center">
          {won(pay.paid)} 입금 확인 · 변경된 신청에 따라 <b>{won(pay.due)}</b> 추가 입금이
          필요합니다.
        </p>
      )}
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
                className="text-[12px] font-bold border border-black/20 rounded px-2 py-1 hover:border-black hover:text-black"
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
        {total > 0 && pay.kind !== "paid" && (
          <div className="flex items-center gap-4 py-3">
            <dt className="w-20 shrink-0 text-[14px] text-[#777]">
              {pay.kind === "partial" ? "추가 입금" : "입금 금액"}
            </dt>
            <dd className="text-[20px] font-extrabold tabular-nums">
              {won(pay.kind === "partial" ? Math.max(total - pay.paid, 0) : total)}
            </dd>
          </div>
        )}
      </dl>
      {pay.kind !== "paid" && (
        <p className="bg-[#7d0b1c]/[0.06] px-4 py-3 text-[14px] font-bold">
          입금 후 사무국에 확인 연락 부탁드립니다.
        </p>
      )}
    </div>
  )
}

export function PasswordDialog({
  onClose,
  onChanged,
}: {
  onClose: () => void
  onChanged: () => void
}) {
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

export async function uploadPhoto(file: File): Promise<string> {
  if (!PRODUCT_PHOTO_TYPES.includes(file.type))
    throw new Error("JPG, PNG, WebP 사진만 올릴 수 있습니다.")
  if (file.size > PRODUCT_PHOTO_MAX_BYTES) throw new Error("사진은 10MB 이하만 올릴 수 있습니다.")
  const res = await fetch("/api/exhibitor/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type: file.type, size: file.size }),
  })
  const data = (await res.json()) as {
    ok: boolean
    error?: string
    signedUrl?: string
    url?: string
  }
  if (!data.ok || !data.signedUrl || !data.url) throw new Error(data.error ?? "업로드 준비 실패")
  const form = new FormData()
  form.append("cacheControl", "3600")
  form.append("", file)
  const put = await fetch(data.signedUrl, { method: "PUT", body: form })
  if (!put.ok) throw new Error("사진을 올리지 못했습니다.")
  return data.url
}

export function ProductCard({
  index,
  product,
  onChange,
  onRemove,
  onError,
}: {
  index: number
  product: ExhibitorProduct
  onChange: (p: ExhibitorProduct) => void
  onRemove: () => void
  onError: (text: string) => void
}) {
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const set = (k: keyof ExhibitorProduct, v: string) => onChange({ ...product, [k]: v })
  const left = PRODUCT_PHOTO_MAX - product.photos.length

  async function addPhotos(files: FileList | null) {
    if (!files?.length) return
    setUploading(true)
    const urls: string[] = []
    for (const f of Array.from(files).slice(0, left)) {
      try {
        urls.push(await uploadPhoto(f))
      } catch (e) {
        onError(`${f.name}: ${e instanceof Error ? e.message : "업로드 실패"}`)
      }
    }
    setUploading(false)
    if (urls.length) onChange({ ...product, photos: [...product.photos, ...urls] })
  }

  return (
    <div className="border border-black/15 rounded-lg p-4 md:p-5">
      <div className="flex items-center justify-between">
        <p className="text-[15px] font-extrabold">제품 {index + 1}</p>
        <button
          type="button"
          onClick={onRemove}
          className="text-[13px] text-[#999] hover:text-[#7d0b1c]"
        >
          삭제
        </button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-3">
        <label className="col-span-2 sm:col-span-1 text-[13px] font-bold">
          제품명 (한글) *
          <input
            value={product.name_ko}
            onChange={(e) => set("name_ko", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="col-span-2 sm:col-span-1 text-[13px] font-bold">
          제품명 (영문)
          <input
            value={product.name_en}
            onChange={(e) => set("name_en", e.target.value)}
            className={inputCls}
          />
        </label>
        <label className="col-span-2 sm:col-span-1 text-[13px] font-bold">
          주종 *
          <input
            value={product.category}
            onChange={(e) => set("category", e.target.value)}
            placeholder="예: 위스키"
            className={inputCls}
          />
        </label>
        <div className="col-span-2 sm:col-span-1 grid grid-cols-2 gap-3">
          <label className="text-[13px] font-bold">
            도수 *
            <span className="relative block">
              <input
                value={product.abv}
                onChange={(e) => set("abv", e.target.value)}
                inputMode="decimal"
                placeholder="46"
                className={`${inputCls} pr-8`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 mt-[3px] text-[14px] text-[#888] font-normal">
                %
              </span>
            </span>
          </label>
          <label className="text-[13px] font-bold">
            용량 *
            <input
              value={product.volume}
              onChange={(e) => set("volume", e.target.value)}
              placeholder="700ml"
              className={inputCls}
            />
          </label>
        </div>
      </div>

      <label className="block mt-3 text-[13px] font-bold">
        제품 설명
        <textarea
          value={product.description ?? ""}
          onChange={(e) => set("description", e.target.value)}
          rows={5}
          placeholder="숙성 캐스크, 숙성 연수, 테이스팅 노트, 제품 특징 등을 자세히 적어 주십시오."
          className={`${inputCls} resize-y font-normal leading-relaxed`}
        />
      </label>

      <p className="mt-4 text-[13px] font-bold">
        제품 사진{" "}
        <span className="font-normal text-[#888]">
          (최대 {PRODUCT_PHOTO_MAX}장, 장당 10MB 이하)
        </span>
      </p>
      <div className="mt-1.5 flex flex-wrap gap-2">
        {product.photos.map((url) => (
          <div
            key={url}
            className="relative w-24 h-24 rounded border border-black/10 bg-[#f6f5f5] overflow-hidden"
          >
            {/* biome-ignore lint/performance/noImgElement: 업로드 미리보기 */}
            <img src={url} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() =>
                onChange({ ...product, photos: product.photos.filter((u) => u !== url) })
              }
              aria-label="사진 삭제"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white text-[14px] leading-none"
            >
              ×
            </button>
          </div>
        ))}
        {left > 0 && (
          <button
            type="button"
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
            className="w-24 h-24 rounded border-2 border-dashed border-black/20 text-[13px] text-[#777] font-bold hover:border-black hover:text-black disabled:opacity-50"
          >
            {uploading ? "올리는 중..." : "+ 사진"}
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={(e) => {
            addPhotos(e.target.files)
            e.target.value = ""
          }}
        />
      </div>
    </div>
  )
}
