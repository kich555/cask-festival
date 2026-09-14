"use client"

import { Suspense, useState } from "react"
import { useLanguage } from "@/i18n"
import { buyerContent } from "@/i18n/buyerContent"
import { isBusiness, isPress } from "@/lib/buyer"
import PageHeader2026 from "./PageHeader2026"

const inputClass =
  "w-full border border-black/15 rounded px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[#7d0b1c] bg-white"
const labelClass = "block text-[13px] font-semibold mb-1.5"
const hintClass = "text-[12px] text-[#999] mt-1.5 leading-relaxed"

function Field({
  label,
  required,
  hint,
  children,
  requiredMark,
}: {
  label: string
  required?: boolean
  hint?: string
  children: React.ReactNode
  requiredMark: string
}) {
  return (
    <div>
      <span className={labelClass}>
        {label}
        {required && (
          <span className="text-[#7d0b1c] ml-1" title={requiredMark}>
            *
          </span>
        )}
      </span>
      {children}
      {hint && <p className={hintClass}>{hint}</p>}
    </div>
  )
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[17px] md:text-[19px] font-extrabold pb-3 mb-6 border-b border-black/10">
      {children}
    </h2>
  )
}

function Inner() {
  const lang = useLanguage()
  const t = buyerContent[lang]

  const [buyerType, setBuyerType] = useState("wholesale")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    try {
      const res = await fetch("/api/buyer", {
        method: "POST",
        body: new FormData(e.currentTarget),
      })
      const data = (await res.json()) as { ok: boolean; error?: string }
      if (!res.ok || !data.ok) {
        setError(data.error ?? `${t.errorPrefix}.`)
        return
      }
      setDone(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch {
      setError(`${t.errorPrefix}. (network)`)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="bg-white text-[#1a1a1a]">
        <PageHeader2026 title={t.title} subtitle={t.subtitle} watermark="BUYER" />
        <div className="max-w-[700px] mx-auto px-5 md:px-10 py-24 md:py-32 text-center">
          <h2 className="text-[clamp(22px,3.5vw,28px)] font-extrabold">{t.successTitle}</h2>
          <p className="text-[#666] text-[15px] mt-5 leading-relaxed">{t.successBody}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={t.title} subtitle={t.subtitle} watermark="BUYER" />

      <div className="max-w-[820px] mx-auto px-5 md:px-10 py-12 md:py-16">
        <p className="text-[15px] text-[#555] leading-relaxed">{t.intro}</p>
        <p className="mt-4 text-[13px] text-[#7d0b1c] font-semibold">{t.reviewNotice}</p>

        <form onSubmit={handleSubmit} className="mt-12 flex flex-col gap-14">
          {/* 봇 트랩 — 사람에게는 보이지 않음 */}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden
            className="absolute w-px h-px -left-[9999px] opacity-0"
          />

          {/* 참가 유형 */}
          <fieldset>
            <SectionTitle>{t.typeLegend}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {t.types.map((opt) => (
                <label
                  key={opt.value}
                  className={`border rounded px-4 py-3.5 cursor-pointer transition-colors ${
                    buyerType === opt.value
                      ? "border-[#7d0b1c] bg-[#7d0b1c]/[0.04]"
                      : "border-black/15 hover:border-black/30"
                  }`}
                >
                  <input
                    type="radio"
                    name="buyer_type"
                    value={opt.value}
                    checked={buyerType === opt.value}
                    onChange={() => setBuyerType(opt.value)}
                    className="sr-only"
                  />
                  <span className="block text-[15px] font-semibold">{opt.label}</span>
                  <span className="block text-[12px] text-[#888] mt-1">{opt.desc}</span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* 신청자 정보 */}
          <fieldset>
            <SectionTitle>{t.sectionBasic}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t.labels.name} required requiredMark={t.requiredMark}>
                <input name="name" required autoComplete="name" className={inputClass} />
              </Field>
              <Field label={t.labels.job_title} required requiredMark={t.requiredMark}>
                <input
                  name="job_title"
                  required
                  autoComplete="organization-title"
                  className={inputClass}
                />
              </Field>
              <Field label={t.labels.phone} required requiredMark={t.requiredMark}>
                <input name="phone" required autoComplete="tel" className={inputClass} />
              </Field>
              <Field
                label={t.labels.email}
                required
                hint={t.hints.email}
                requiredMark={t.requiredMark}
              >
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>
            </div>
          </fieldset>

          {/* 회사 정보 */}
          <fieldset>
            <SectionTitle>{t.sectionCompany}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t.labels.company} required requiredMark={t.requiredMark}>
                <input name="company" required autoComplete="organization" className={inputClass} />
              </Field>
              <Field label={t.labels.department} requiredMark={t.requiredMark}>
                <input name="department" className={inputClass} />
              </Field>
              <Field
                label={t.labels.country}
                required
                hint={t.hints.country}
                requiredMark={t.requiredMark}
              >
                <input name="country" required className={inputClass} />
              </Field>
              <Field label={t.labels.company_address} required requiredMark={t.requiredMark}>
                <input name="company_address" required className={inputClass} />
              </Field>

              {isBusiness(buyerType) && (
                <>
                  <Field label={t.labels.business_number} required requiredMark={t.requiredMark}>
                    <input name="business_number" required className={inputClass} />
                  </Field>
                  <Field
                    label={t.labels.categories}
                    hint={t.hints.categories}
                    requiredMark={t.requiredMark}
                  >
                    <input name="categories" className={inputClass} />
                  </Field>
                  <Field
                    label={t.labels.outlets}
                    hint={t.hints.outlets}
                    requiredMark={t.requiredMark}
                  >
                    <input name="outlets" className={inputClass} />
                  </Field>
                </>
              )}

              {isPress(buyerType) && (
                <>
                  <Field label={t.labels.media_name} required requiredMark={t.requiredMark}>
                    <input name="media_name" required className={inputClass} />
                  </Field>
                  <Field label={t.labels.media_url} requiredMark={t.requiredMark}>
                    <input name="media_url" type="url" className={inputClass} />
                  </Field>
                  <div className="sm:col-span-2">
                    <Field
                      label={t.labels.press_purpose}
                      hint={t.hints.press_purpose}
                      requiredMark={t.requiredMark}
                    >
                      <textarea name="press_purpose" rows={3} className={inputClass} />
                    </Field>
                  </div>
                </>
              )}
            </div>
          </fieldset>

          {/* 참관 정보 */}
          <fieldset>
            <SectionTitle>{t.sectionVisit}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t.labels.visit_day} required requiredMark={t.requiredMark}>
                <div className="flex flex-col gap-2.5 pt-1">
                  {t.days.map((d, i) => (
                    <label key={d.value} className="flex items-center gap-2.5 text-[15px]">
                      <input
                        type="radio"
                        name="visit_day"
                        value={d.value}
                        defaultChecked={i === 0}
                        required
                        className="accent-[#7d0b1c] w-4 h-4"
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </Field>
              <Field
                label={t.labels.companions}
                hint={t.hints.companions}
                requiredMark={t.requiredMark}
              >
                <input
                  name="companions"
                  type="number"
                  min={0}
                  max={20}
                  defaultValue={0}
                  className={inputClass}
                />
              </Field>
            </div>
          </fieldset>

          {/* 서류 */}
          <fieldset>
            <SectionTitle>{t.sectionUpload}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field
                label={t.labels.business_card}
                required
                hint={t.hints.business_card}
                requiredMark={t.requiredMark}
              >
                <input
                  name="business_card"
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                  className="w-full text-[14px] file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-[13px] file:font-semibold file:bg-[#7d0b1c] file:text-white file:cursor-pointer"
                />
              </Field>
              <Field
                label={t.labels.document}
                hint={t.hints.document}
                requiredMark={t.requiredMark}
              >
                <input
                  name="document"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                  className="w-full text-[14px] file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-[13px] file:font-semibold file:bg-black/70 file:text-white file:cursor-pointer"
                />
              </Field>
            </div>
          </fieldset>

          {/* 동의 */}
          <fieldset>
            <SectionTitle>{t.sectionConsent}</SectionTitle>
            <div className="border border-black/10 rounded p-5 bg-[#faf9f9]">
              <h3 className="text-[14px] font-bold">{t.privacyTitle}</h3>
              <p className="text-[13px] text-[#666] mt-3 leading-relaxed whitespace-pre-line">
                {t.privacyBody}
              </p>
            </div>
            <label className="flex items-start gap-2.5 mt-4 text-[14px]">
              <input
                type="checkbox"
                name="privacy_consent"
                required
                className="accent-[#7d0b1c] w-4 h-4 mt-0.5"
              />
              <span>
                {t.privacyAgree} <span className="text-[#7d0b1c]">*</span>
              </span>
            </label>
            <label className="flex items-start gap-2.5 mt-2.5 text-[14px] text-[#666]">
              <input
                type="checkbox"
                name="marketing_opt_in"
                className="accent-[#7d0b1c] w-4 h-4 mt-0.5"
              />
              <span>{t.marketingAgree}</span>
            </label>
          </fieldset>

          {error && (
            <p className="text-[14px] text-[#7d0b1c] font-semibold border border-[#7d0b1c]/30 bg-[#7d0b1c]/[0.04] rounded px-4 py-3">
              {error}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto sm:min-w-[240px] bg-[#7d0b1c] text-white rounded px-8 py-4 font-bold text-[16px] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {submitting ? t.submitting : t.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function BuyerContent() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
