"use client"

import { Globe, Instagram } from "lucide-react"
import Image from "next/image"
import { Suspense, useMemo } from "react"
import { useContent2026 } from "@/i18n/useContent2026"
import { type Brand, brandInitials, countryFlag, countryName } from "@/lib/brands"
import PageHeader2026 from "./PageHeader2026"

function IconLink({
  href,
  label,
  children,
}: {
  href: string
  label: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      title={label}
      className="w-8 h-8 rounded-full border border-black/12 flex items-center justify-center text-[#666] transition-colors hover:border-[#7d0b1c] hover:text-[#7d0b1c]"
    >
      {children}
    </a>
  )
}

function Inner({ brands }: { brands: Brand[] }) {
  const { c, lang } = useContent2026()
  const b = c.brandsP

  // 한글명 기준 가나다순으로 고정한다. 한글이 먼저 오고 영문 이름은 그 뒤에 알파벳순으로 놓인다.
  // 영어 화면에서도 같은 순서를 써서 업체 위치가 달라지지 않게 한다.
  const sorted = useMemo(() => {
    const collator = new Intl.Collator("ko-KR", { sensitivity: "base", numeric: true })
    return [...brands].sort((x, y) => collator.compare(x.nameKo || x.nameEn, y.nameKo || y.nameEn))
  }, [brands])

  if (sorted.length === 0) {
    return (
      <div className="bg-white text-[#1a1a1a]">
        <PageHeader2026 title={b.title} subtitle={b.subtitle} watermark="BRANDS" />
        <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-20 md:py-28 text-center">
          <p className="text-[clamp(18px,3vw,24px)] font-extrabold">{b.empty}</p>
          <p className="text-[#888] text-[15px] mt-4">{b.emptyDesc}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={b.title} subtitle={b.subtitle} watermark="BRANDS" />

      <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-12 md:py-16">
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {sorted.map((brand) => {
            const primary =
              lang === "ko" ? brand.nameKo || brand.nameEn : brand.nameEn || brand.nameKo
            const flag = countryFlag(brand.country)

            return (
              <li
                key={brand.slug}
                className="border border-black/10 rounded bg-white p-4 flex flex-col items-center text-center transition-colors hover:border-[#7d0b1c]/40"
              >
                <div
                  className="relative w-full aspect-square rounded flex items-center justify-center overflow-hidden"
                  // 로고 자체 배경색을 카드에도 적용해 흰 사각형이 떠 보이지 않게 한다.
                  // 투명 로고이거나 판별이 안 되면 흰 배경을 쓴다.
                  style={{ backgroundColor: brand.logoBg ?? "#ffffff" }}
                >
                  {brand.logo ? (
                    <Image
                      src={brand.logo}
                      alt={primary}
                      fill
                      sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                      className="object-contain p-3"
                    />
                  ) : (
                    <span
                      aria-hidden
                      className="text-[clamp(22px,5vw,30px)] font-extrabold tracking-tight text-[#c4bcbf] select-none"
                    >
                      {brandInitials(brand.nameEn)}
                    </span>
                  )}
                </div>

                <h2 className="text-[14px] md:text-[15px] font-extrabold leading-snug break-keep mt-3.5">
                  {primary}
                </h2>

                <p className="text-[12px] text-[#888] mt-1.5 inline-flex items-center gap-1.5">
                  {flag && <span aria-hidden>{flag}</span>}
                  {countryName(brand, lang)}
                </p>

                {(brand.website || brand.instagram) && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    {brand.website && (
                      <IconLink href={brand.website} label={`${primary} 홈페이지`}>
                        <Globe size={15} strokeWidth={1.8} />
                      </IconLink>
                    )}
                    {brand.instagram && (
                      <IconLink href={brand.instagram} label={`${primary} 인스타그램`}>
                        <Instagram size={15} strokeWidth={1.8} />
                      </IconLink>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <p className="text-center text-[#b3aaad] text-[14px] md:text-[15px] font-semibold tracking-[0.12em] mt-10 md:mt-12">
          {b.andMore}
        </p>
      </div>
    </div>
  )
}

export default function BrandsContent({ brands }: { brands: Brand[] }) {
  return (
    <Suspense fallback={null}>
      <Inner brands={brands} />
    </Suspense>
  )
}
