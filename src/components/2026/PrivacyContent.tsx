"use client"

import { Suspense } from "react"
import { privacyContent } from "@/content/privacy"
import { useLanguage } from "@/i18n"
import PageHeader2026 from "./PageHeader2026"
import Reveal from "./Reveal"

function Inner() {
  const lang = useLanguage()
  const c = privacyContent[lang]

  return (
    <div className="bg-[var(--c-bg)] text-[var(--c-text)]">
      <PageHeader2026 title={c.title} watermark="PRIVACY" />

      <div className="max-w-[860px] mx-auto px-5 md:px-10 py-12 md:py-16">
        <p className="text-[14px] md:text-[15px] text-[var(--c-text2)] leading-relaxed">
          {c.intro}
        </p>

        <div className="mt-12 flex flex-col gap-12">
          {c.sections.map((section) => (
            <Reveal key={section.heading}>
              <section>
                <h2 className="text-[16px] md:text-[18px] font-extrabold pb-3 border-b border-[var(--c-line)]">
                  {section.heading}
                </h2>

                {section.paragraphs?.map((p) => (
                  <p key={p} className="text-[14px] text-[var(--c-text2)] leading-relaxed mt-4">
                    {p}
                  </p>
                ))}

                {section.items && (
                  <ul className="mt-4 flex flex-col gap-2">
                    {section.items.map((item) => (
                      <li
                        key={item}
                        className="text-[14px] text-[var(--c-text2)] leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-[var(--c-accent)] before:font-bold"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.table && (
                  <div className="mt-5 overflow-x-auto">
                    <table className="w-full min-w-[520px] border-collapse text-[13px]">
                      <thead>
                        <tr className="bg-[var(--c-soft)]">
                          {section.table.head.map((h) => (
                            <th
                              key={h}
                              className="border border-[var(--c-line)] px-3 py-2.5 text-left font-bold whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {section.table.rows.map((row) => (
                          <tr key={row.join("|")}>
                            {row.map((cell) => (
                              <td
                                key={cell}
                                className="border border-[var(--c-line)] px-3 py-2.5 text-[var(--c-text2)] leading-relaxed align-top"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </Reveal>
          ))}
        </div>

        <p className="mt-14 pt-6 border-t border-[var(--c-line)] text-[13px] text-[var(--c-muted2)]">
          {c.footer}
        </p>
      </div>
    </div>
  )
}

export default function PrivacyContent() {
  return (
    <Suspense fallback={null}>
      <Inner />
    </Suspense>
  )
}
