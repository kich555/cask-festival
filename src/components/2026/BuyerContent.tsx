"use client"

import { Suspense, useState } from "react"
import { useLanguage } from "@/i18n"
import { buyerContent } from "@/i18n/buyerContent"
import { isBusiness, isPress } from "@/lib/buyer"
import PageHeader2026 from "./PageHeader2026"

const inputClass =
  "w-full border border-black/15 rounded px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[#7d0b1c] bg-white"
const labelClass = "block text-[13px] font-semibold mb-1.5"

function Field({
  label,
  required,
  children,
  requiredMark,
}: {
  label: string
  required?: boolean
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
            <div className="grid grid-cols-5 gap-2">
              {t.types.map((opt) => (
                <label
                  key={opt.value}
                  className={`border rounded px-2 py-2.5 cursor-pointer transition-colors text-center ${
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
                  <span className="block text-[12px] md:text-[14px] font-semibold break-keep leading-tight">
                    {opt.label}
                  </span>
                </label>
              ))}
            </div>

            {/* 선택한 유형에 따른 입장 안내 */}
            {isPress(buyerType) ? (
              <div className="mt-4 border border-[#7d0b1c]/25 bg-[#7d0b1c]/[0.04] rounded p-5">
                <h3 className="text-[15px] font-extrabold text-[#7d0b1c]">{t.pressFreeTitle}</h3>
                <p className="text-[13px] md:text-[14px] text-[#555] mt-2 leading-relaxed">
                  {t.pressFreeNote}
                </p>
              </div>
            ) : (
              <div className="mt-4 border border-[#7d0b1c]/25 bg-[#7d0b1c]/[0.04] rounded p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div className="sm:flex-1">
                  <h3 className="text-[15px] font-extrabold text-[#7d0b1c]">{t.ticketTitle}</h3>
                  <p className="text-[13px] md:text-[14px] text-[#555] mt-2 leading-relaxed">
                    {t.ticketNote}
                  </p>
                </div>
                <dl className="flex flex-wrap items-baseline gap-x-8 gap-y-2 sm:justify-end shrink-0">
                  {t.ticketRows.map((row) => (
                    <div key={row.label} className="flex items-baseline gap-2.5">
                      <dt className="text-[14px] font-semibold">{row.label}</dt>
                      <dd className="flex items-baseline gap-2">
                        <span className="text-[13px] text-[#999] line-through">{row.was}</span>
                        <span className="text-[20px] font-extrabold text-[#7d0b1c]">{row.now}</span>
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
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
              <Field label={t.labels.email} required requiredMark={t.requiredMark}>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>
              <div className="sm:col-span-2">
                <Field label={t.labels.business_card} required requiredMark={t.requiredMark}>
                  <input
                    name="business_card"
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                    className="w-full text-[14px] file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-[13px] file:font-semibold file:bg-[#7d0b1c] file:text-white file:cursor-pointer"
                  />
                </Field>
              </div>
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
              <Field label={t.labels.country} required requiredMark={t.requiredMark}>
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
                </>
              )}
            </div>
          </fieldset>

          {/* 참관 정보 */}
          <fieldset>
            <SectionTitle>{t.sectionVisit}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t.labels.visit_day} required requiredMark={t.requiredMark}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2.5 pt-1">
                  {t.days.map((d, i) => (
                    <label
                      key={d.value}
                      className="flex items-center gap-2 text-[15px] whitespace-nowrap"
                    >
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
              <div className="sm:col-span-2">
                <Field label={t.labels.visit_purpose} requiredMark={t.requiredMark}>
                  <textarea name="visit_purpose" rows={4} maxLength={1000} className={inputClass} />
                </Field>
              </div>
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
              <p className="text-[13px] text-[#666] mt-3 leading-relaxed">{t.privacyProcessor}</p>
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 text-[13px] font-semibold text-[#7d0b1c] underline underline-offset-2"
              >
                {t.privacyLink}
              </a>
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

          <div className="flex justify-center">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto sm:min-w-[280px] bg-[#7d0b1c] text-white rounded px-8 py-4 font-bold text-[16px] transition-opacity hover:opacity-90 disabled:opacity-50"
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
