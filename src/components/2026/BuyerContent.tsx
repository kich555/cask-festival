"use client"

import { Suspense, useState } from "react"
import { useLanguage } from "@/i18n"
import { buyerContent, type Choice } from "@/i18n/buyerContent"
import PageHeader2026 from "./PageHeader2026"

const inputClass =
  "w-full border border-black/15 rounded px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[#7d0b1c] bg-white"
const labelClass = "block text-[13px] font-semibold mb-1.5"

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[17px] md:text-[19px] font-extrabold pb-3 mb-6 border-b border-black/10">
      {children}
    </h2>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <span className={labelClass}>
        {label}
        {required && <span className="text-[#7d0b1c] ml-1">*</span>}
      </span>
      {children}
    </div>
  )
}

/** 라디오 목록 + '기타' 선택 시 직접 입력칸 */
function ChoiceGroup({
  name,
  choices,
  value,
  onChange,
  otherPlaceholder,
  columns = 2,
}: {
  name: string
  choices: Choice[]
  value: string
  onChange: (v: string) => void
  otherPlaceholder: string
  columns?: 1 | 2
}) {
  return (
    <>
      <div className={`grid gap-2.5 ${columns === 2 ? "sm:grid-cols-2" : ""}`}>
        {choices.map((c) => (
          <label key={c.value} className="flex items-center gap-2.5 text-[15px] cursor-pointer">
            <input
              type="radio"
              name={name}
              value={c.value}
              checked={value === c.value}
              onChange={() => onChange(c.value)}
              className="accent-[#7d0b1c] w-4 h-4 shrink-0"
            />
            <span className="break-keep">{c.label}</span>
          </label>
        ))}
      </div>
      {value === "other" && (
        <input
          name={`${name}_other`}
          required
          maxLength={200}
          placeholder={otherPlaceholder}
          className={`${inputClass} mt-3 sm:max-w-[400px]`}
        />
      )}
    </>
  )
}

function Inner() {
  const lang = useLanguage()
  const t = buyerContent[lang]

  const [buyerType, setBuyerType] = useState("")
  const [referral, setReferral] = useState("")
  const [purpose, setPurpose] = useState("")
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
        {t.intro.map((line) => (
          <p key={line} className="text-[15px] text-[#555] leading-relaxed">
            {line}
          </p>
        ))}
        <p className="mt-5 text-[14px] md:text-[15px] text-[#7d0b1c] font-bold leading-relaxed">
          {t.pressNote}
        </p>

        <div className="mt-8 border border-[#7d0b1c]/25 bg-[#7d0b1c]/[0.04] rounded p-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
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

          <p className="mt-4 pt-4 border-t border-[#7d0b1c]/20 text-[13px] font-bold text-[#7d0b1c] leading-relaxed">
            {t.ticketWarning}
          </p>
        </div>

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

          {/* 1. 신청자 정보 */}
          <fieldset>
            <SectionTitle>{t.sectionApplicant}</SectionTitle>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <Field label={t.labels.name} required>
                <input name="name" required autoComplete="name" className={inputClass} />
              </Field>
              <Field label={t.labels.company} required>
                <input name="company" required autoComplete="organization" className={inputClass} />
              </Field>
              <Field label={t.labels.job_title} required>
                <input
                  name="job_title"
                  required
                  autoComplete="organization-title"
                  className={inputClass}
                />
              </Field>
              <Field label={t.labels.phone} required>
                <input name="phone" required autoComplete="tel" className={inputClass} />
              </Field>
              <Field label={t.labels.email} required>
                <input
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className={inputClass}
                />
              </Field>
              <Field label={t.labels.business_card} required>
                <input
                  name="business_card"
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                  className="w-full text-[14px] file:mr-3 file:py-2 file:px-4 file:rounded file:border-0 file:text-[13px] file:font-semibold file:bg-[#7d0b1c] file:text-white file:cursor-pointer"
                />
              </Field>
            </div>
          </fieldset>

          {/* 2. 참관 희망일 */}
          <fieldset>
            <SectionTitle>{t.sectionVisitDay}</SectionTitle>
            <div className="flex flex-wrap items-center gap-x-8 gap-y-2.5">
              {t.days.map((d) => (
                <label
                  key={d.value}
                  className="flex items-center gap-2 text-[15px] whitespace-nowrap cursor-pointer"
                >
                  <input
                    type="radio"
                    name="visit_day"
                    value={d.value}
                    required
                    className="accent-[#7d0b1c] w-4 h-4"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* 3. 바이어 구분 */}
          <fieldset>
            <SectionTitle>{t.sectionBuyerType}</SectionTitle>
            <ChoiceGroup
              name="buyer_type"
              choices={t.buyerTypes}
              value={buyerType}
              onChange={setBuyerType}
              otherPlaceholder={t.otherPlaceholder}
            />
          </fieldset>

          {/* 4. 인지 경로 */}
          <fieldset>
            <SectionTitle>{t.sectionReferral}</SectionTitle>
            <ChoiceGroup
              name="referral"
              choices={t.referrals}
              value={referral}
              onChange={setReferral}
              otherPlaceholder={t.otherPlaceholder}
            />
          </fieldset>

          {/* 5. 참관 목적 */}
          <fieldset>
            <SectionTitle>{t.sectionPurpose}</SectionTitle>
            <ChoiceGroup
              name="purpose"
              choices={t.purposes}
              value={purpose}
              onChange={setPurpose}
              otherPlaceholder={t.otherPlaceholder}
            />
          </fieldset>

          {/* 6. 확인 및 동의 */}
          <fieldset>
            <SectionTitle>{t.sectionConsent}</SectionTitle>

            <label className="flex items-start gap-2.5 text-[15px] font-semibold">
              <input
                type="checkbox"
                name="age_confirmed"
                required
                className="accent-[#7d0b1c] w-4 h-4 mt-1"
              />
              <span>
                {t.ageConfirm} <span className="text-[#7d0b1c]">*</span>
              </span>
            </label>

            <div className="border border-black/10 rounded p-5 bg-[#faf9f9] mt-6">
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
              <span>
                {t.marketingAgree} ({t.optional})
              </span>
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
