"use client"

import { Suspense } from "react"
import { privacyContent } from "@/content/privacy"
import { useLanguage } from "@/i18n"
import PageHeader2026 from "./PageHeader2026"

function Inner() {
  const lang = useLanguage()
  const c = privacyContent[lang]

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={c.title} watermark="PRIVACY" />

      <div className="max-w-[860px] mx-auto px-5 md:px-10 py-12 md:py-16">
        <p className="text-[14px] md:text-[15px] text-[#555] leading-relaxed">{c.intro}</p>

        <div className="mt-12 flex flex-col gap-12">
          {c.sections.map((section) => (
            <section key={section.heading}>
              <h2 className="text-[16px] md:text-[18px] font-extrabold pb-3 border-b border-black/10">
                {section.heading}
              </h2>

              {section.paragraphs?.map((p) => (
                <p key={p} className="text-[14px] text-[#555] leading-relaxed mt-4">
                  {p}
                </p>
              ))}

              {section.items && (
                <ul className="mt-4 flex flex-col gap-2">
                  {section.items.map((item) => (
                    <li
                      key={item}
                      className="text-[14px] text-[#555] leading-relaxed pl-4 relative before:content-['·'] before:absolute before:left-0 before:text-[#7d0b1c] before:font-bold"
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
                      <tr className="bg-black/[0.04]">
                        {section.table.head.map((h) => (
                          <th
                            key={h}
                            className="border border-black/10 px-3 py-2.5 text-left font-bold whitespace-nowrap"
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
                              className="border border-black/10 px-3 py-2.5 text-[#555] leading-relaxed align-top"
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
          ))}
        </div>

        <p className="mt-14 pt-6 border-t border-black/10 text-[13px] text-[#999]">{c.footer}</p>
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
