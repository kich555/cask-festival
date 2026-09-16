"use client"

import { Suspense, useEffect, useState } from "react"
import { useLanguage } from "@/i18n"
import { buyerContent, type Choice } from "@/i18n/buyerContent"
import PageHeader2026 from "./PageHeader2026"

const inputClass =
  "w-full border border-black/15 rounded px-3.5 py-2.5 text-[15px] outline-none transition-colors focus:border-[#7d0b1c] bg-white"
/** 미입력으로 표시된 입력칸 */
const inputErrorClass =
  "w-full border-2 border-[#7d0b1c] rounded px-3.5 py-2.5 text-[15px] outline-none bg-[#7d0b1c]/[0.03]"
const labelClass = "block text-[13px] font-semibold mb-1.5"

/**
 * 섹션 제목. 필수 항목만으로 이루어진 섹션은 제목 옆에 별표를 둔다.
 * 선택 항목이 섞인 섹션은 required={false} 로 별표를 뺀다.
 * 선택형 섹션은 오류 문구도 제목 옆에 붙여야 눈에 들어온다.
 */
function SectionTitle({
  children,
  error,
  required = true,
}: {
  children: React.ReactNode
  error?: string
  required?: boolean
}) {
  return (
    <h2 className="text-[17px] md:text-[19px] font-extrabold pb-3 mb-6 border-b border-black/10 flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <span>
        {children}
        {required && <span className="text-[#7d0b1c] ml-1">*</span>}
      </span>
      {error && (
        <span className="cc-alert-bounce text-[13px] md:text-[14px] font-bold text-[#7d0b1c]">
          {error}
        </span>
      )}
    </h2>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="cc-alert-bounce text-[13px] font-bold text-[#7d0b1c] mt-1.5">{message}</p>
}

function Field({
  name,
  label,
  error,
  children,
}: {
  name: string
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div data-field={name} data-invalid={error ? "true" : undefined} className="scroll-mt-32">
      <span className={`${labelClass} ${error ? "text-[#7d0b1c]" : ""}`}>{label}</span>
      {children}
      <FieldError message={error} />
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
  error,
  columns = 2,
}: {
  name: string
  choices: Choice[]
  value: string
  onChange: (v: string) => void
  otherPlaceholder: string
  error?: string
  columns?: 1 | 2
}) {
  return (
    <div data-field={name} data-invalid={error ? "true" : undefined} className="scroll-mt-32">
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
          maxLength={200}
          placeholder={otherPlaceholder}
          className={`${inputClass} mt-3 sm:max-w-[400px]`}
        />
      )}
    </div>
  )
}

/**
 * 파일 선택. 기본 <input type="file"> 의 버튼 문구는 브라우저 언어를 따르므로
 * 실제 입력은 숨기고 화면에 보이는 부분은 직접 그린다.
 */
function FileField({
  name,
  accept,
  chooseLabel,
  emptyLabel,
  hint,
}: {
  name: string
  accept: string
  chooseLabel: string
  emptyLabel: string
  hint: string
}) {
  const [fileName, setFileName] = useState<string | null>(null)

  return (
    <>
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="file"
          name={name}
          accept={accept}
          onChange={(e) => setFileName(e.currentTarget.files?.[0]?.name ?? null)}
          className="sr-only"
        />
        <span className="shrink-0 bg-[#7d0b1c] text-white rounded px-4 py-2 text-[13px] font-semibold">
          {chooseLabel}
        </span>
        <span className="text-[14px] text-[#666] truncate">{fileName ?? emptyLabel}</span>
      </label>
      <p className="text-[12px] text-[#999] mt-1.5">{hint}</p>
    </>
  )
}

/** 요약에 쓰는 항목 순서 — 폼에 나오는 순서와 같게 유지한다. */
const FIELD_ORDER = [
  "name",
  "company",
  "job_title",
  "phone",
  "email",
  "business_card",
  "visit_day",
  "buyer_type",
  "referral",
  "purpose",
  "age_confirmed",
  "privacy_consent",
]

function Inner() {
  const lang = useLanguage()
  const t = buyerContent[lang]

  const [buyerType, setBuyerType] = useState("")
  const [referral, setReferral] = useState("")
  const [purpose, setPurpose] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(false)

  /** 항목별 오류 메시지를 돌려준다. 키는 폼 필드 이름. */
  function validate(form: FormData): Record<string, string> {
    const text = (k: string) => String(form.get(k) ?? "").trim()
    const found: Record<string, string> = {}

    // 입력란은 '기재', 선택지는 '선택', 파일은 '첨부' 로 문구를 나눈다
    for (const key of ["name", "company", "job_title", "phone", "email"]) {
      if (!text(key)) found[key] = t.requiredText
    }
    if (!found.email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text("email"))) {
      found.email = t.emailInvalid
    }

    const card = form.get("business_card")
    if (!(card instanceof File) || card.size === 0) found.business_card = t.requiredFile

    if (!text("visit_day")) found.visit_day = t.requiredChoice

    for (const key of ["buyer_type", "referral", "purpose"]) {
      const value = text(key)
      if (!value || (value === "other" && !text(`${key}_other`))) found[key] = t.requiredChoice
    }

    if (form.get("age_confirmed") !== "on") found.age_confirmed = t.requiredChoice
    if (form.get("privacy_consent") !== "on") found.privacy_consent = t.requiredChoice

    return found
  }

  // 오류 표시가 그려진 뒤 첫 번째 미입력 항목으로 데려간다.
  useEffect(() => {
    if (Object.keys(errors).length === 0) return
    const first = document.querySelector<HTMLElement>('[data-invalid="true"]')
    if (!first) return
    first.scrollIntoView({ behavior: "smooth", block: "center" })
    first.querySelector<HTMLElement>("input, textarea, select")?.focus({ preventScroll: true })
  }, [errors])

  const missingLabels = FIELD_ORDER.filter((key) => errors[key]).map((key) => t.labels[key])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)

    const formData = new FormData(e.currentTarget)
    const found = validate(formData)
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setSubmitting(true)
    try {
      const res = await fetch("/api/buyer", { method: "POST", body: formData })
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

          <p className="mt-4 pt-4 border-t border-[#7d0b1c]/20 text-[14px] md:text-[15px] font-bold text-[#1a1a1a] leading-relaxed break-keep">
            {t.ticketWarning}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-12 flex flex-col gap-14">
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
              <Field name="name" label={t.labels.name} error={errors.name}>
                <input
                  name="name"
                  autoComplete="name"
                  className={errors.name ? inputErrorClass : inputClass}
                />
              </Field>
              <Field name="company" label={t.labels.company} error={errors.company}>
                <input
                  name="company"
                  autoComplete="organization"
                  className={errors.company ? inputErrorClass : inputClass}
                />
              </Field>
              <Field name="job_title" label={t.labels.job_title} error={errors.job_title}>
                <input
                  name="job_title"
                  autoComplete="organization-title"
                  className={errors.job_title ? inputErrorClass : inputClass}
                />
              </Field>
              <Field name="phone" label={t.labels.phone} error={errors.phone}>
                <input
                  name="phone"
                  autoComplete="tel"
                  className={errors.phone ? inputErrorClass : inputClass}
                />
              </Field>
              <Field name="email" label={t.labels.email} error={errors.email}>
                <input
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={errors.email ? inputErrorClass : inputClass}
                />
              </Field>
              <Field
                name="business_card"
                label={t.labels.business_card}
                error={errors.business_card}
              >
                <FileField
                  name="business_card"
                  accept="image/jpeg,image/png,image/webp,image/heic,application/pdf"
                  chooseLabel={t.fileChoose}
                  emptyLabel={t.fileNone}
                  hint={t.fileHint}
                />
              </Field>
            </div>
          </fieldset>

          {/* 2. 방문 희망일 */}
          <fieldset>
            <SectionTitle error={errors.visit_day}>{t.sectionVisitDay}</SectionTitle>
            <div
              data-field="visit_day"
              data-invalid={errors.visit_day ? "true" : undefined}
              className="scroll-mt-32 flex flex-wrap items-center gap-x-8 gap-y-2.5"
            >
              {t.days.map((d) => (
                <label
                  key={d.value}
                  className="flex items-center gap-2 text-[15px] whitespace-nowrap cursor-pointer"
                >
                  <input
                    type="radio"
                    name="visit_day"
                    value={d.value}
                    className="accent-[#7d0b1c] w-4 h-4"
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </fieldset>

          {/* 3. 바이어 구분 */}
          <fieldset>
            <SectionTitle error={errors.buyer_type}>{t.sectionBuyerType}</SectionTitle>
            <ChoiceGroup
              name="buyer_type"
              error={errors.buyer_type}
              choices={t.buyerTypes}
              value={buyerType}
              onChange={setBuyerType}
              otherPlaceholder={t.otherPlaceholder}
            />
          </fieldset>

          {/* 4. 인지 경로 */}
          <fieldset>
            <SectionTitle error={errors.referral}>{t.sectionReferral}</SectionTitle>
            <ChoiceGroup
              name="referral"
              error={errors.referral}
              choices={t.referrals}
              value={referral}
              onChange={setReferral}
              otherPlaceholder={t.otherPlaceholder}
            />
          </fieldset>

          {/* 5. 방문 목적 */}
          <fieldset>
            <SectionTitle error={errors.purpose}>{t.sectionPurpose}</SectionTitle>
            <ChoiceGroup
              name="purpose"
              error={errors.purpose}
              choices={t.purposes}
              value={purpose}
              onChange={setPurpose}
              otherPlaceholder={t.otherPlaceholder}
            />
          </fieldset>

          {/* 6. 확인 및 동의 */}
          <fieldset>
            <SectionTitle required={false} error={errors.age_confirmed ?? errors.privacy_consent}>
              {t.sectionConsent}
            </SectionTitle>

            <div
              data-field="age_confirmed"
              data-invalid={errors.age_confirmed ? "true" : undefined}
              className="scroll-mt-32"
            >
              <label className="flex items-start gap-2.5 text-[15px] font-semibold">
                <input
                  type="checkbox"
                  name="age_confirmed"
                  className="accent-[#7d0b1c] w-4 h-4 mt-1"
                />
                <span className={errors.age_confirmed ? "text-[#7d0b1c]" : ""}>
                  {t.ageConfirm} <span className="text-[#7d0b1c]">*</span>
                </span>
              </label>
            </div>

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

            <div
              data-field="privacy_consent"
              data-invalid={errors.privacy_consent ? "true" : undefined}
              className="scroll-mt-32 mt-4"
            >
              <label className="flex items-start gap-2.5 text-[14px]">
                <input
                  type="checkbox"
                  name="privacy_consent"
                  className="accent-[#7d0b1c] w-4 h-4 mt-0.5"
                />
                <span className={errors.privacy_consent ? "text-[#7d0b1c] font-semibold" : ""}>
                  {t.privacyAgree} <span className="text-[#7d0b1c]">*</span>
                </span>
              </label>
            </div>

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

          {missingLabels.length > 0 && (
            <div className="text-[14px] text-[#7d0b1c] leading-relaxed">
              <p className="font-bold">{t.missingSummary}</p>
              <ul className="mt-1.5 flex flex-col gap-0.5">
                {missingLabels.map((label) => (
                  <li key={label} className="font-semibold">
                    - {label}
                  </li>
                ))}
              </ul>
            </div>
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
