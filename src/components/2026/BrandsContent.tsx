"use client"

import Image from "next/image"
import { Suspense } from "react"
import { useContent2026 } from "@/i18n/useContent2026"
import { type Brand, brandInitials, countryFlag } from "@/lib/brands"
import PageHeader2026 from "./PageHeader2026"

function BrandCardInner({ brand, name }: { brand: Brand; name: string }) {
  return (
    <>
      <div className="relative aspect-square bg-[#f4f2f3] flex items-center justify-center overflow-hidden">
        {brand.logo ? (
          <Image
            src={brand.logo}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-5"
          />
        ) : (
          <span
            aria-hidden
            className="text-[clamp(28px,6vw,40px)] font-extrabold tracking-tight text-[#c9c2c5] select-none"
          >
            {brandInitials(brand.nameEn)}
          </span>
        )}
      </div>

      <div className="px-4 py-4 flex items-start gap-2">
        {countryFlag(brand.country) && (
          <span aria-hidden className="text-[16px] leading-[1.4] shrink-0">
            {countryFlag(brand.country)}
          </span>
        )}
        <span className="text-[14px] md:text-[15px] font-semibold leading-[1.4] break-keep">
          {name}
        </span>
      </div>
    </>
  )
}

function Inner({ brands }: { brands: Brand[] }) {
  const { c, lang } = useContent2026()
  const b = c.brandsP

  return (
    <div className="bg-white text-[#1a1a1a]">
      <PageHeader2026 title={b.title} subtitle={b.subtitle} watermark="BRANDS" />

      <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-14 md:py-20">
        {brands.length === 0 ? (
          <div className="text-center py-20 md:py-28">
            <p className="text-[clamp(18px,3vw,24px)] font-extrabold">{b.empty}</p>
            <p className="text-[#888] text-[15px] mt-4">{b.emptyDesc}</p>
          </div>
        ) : (
          <>
            <p className="text-[#888] text-[14px] mb-6">
              {b.count.replace("{n}", String(brands.length))}
            </p>
            <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {brands.map((brand) => {
                const name =
                  lang === "ko" ? brand.nameKo || brand.nameEn : brand.nameEn || brand.nameKo
                return (
                  <li
                    key={brand.slug}
                    className="border border-black/10 rounded overflow-hidden bg-white transition-colors hover:border-[#7d0b1c]/40"
                  >
                    {brand.link ? (
                      <a
                        href={brand.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full"
                      >
                        <BrandCardInner brand={brand} name={name} />
                      </a>
                    ) : (
                      <BrandCardInner brand={brand} name={name} />
                    )}
                  </li>
                )
              })}
            </ul>
          </>
        )}
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
