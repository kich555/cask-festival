"use client"

import { Facebook, Globe, Instagram } from "lucide-react"
import Image from "next/image"
import { Suspense, useMemo, useState } from "react"
import { useContent2026 } from "@/i18n/useContent2026"
import { type Brand, brandInitials, countryFlag, countryName } from "@/lib/brands"
import PageHeader2026 from "./PageHeader2026"
import Reveal from "./Reveal"

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
      className="w-7 h-7 rounded-full border border-[var(--c-line)] flex items-center justify-center text-[var(--c-muted)] transition-colors hover:border-[var(--c-accent)] hover:text-[var(--c-accent)]"
    >
      {children}
    </a>
  )
}

/** 검색용: 대소문자·띄어쓰기·기호 차이를 무시한다 */
const norm = (s: string) => s.toLowerCase().replace(/[\s·.&'_\-×()]/g, "")

function Inner({ brands }: { brands: Brand[] }) {
  const { c, lang } = useContent2026()
  const b = c.brandsP

  // 한글명 기준 가나다순으로 고정한다. 한글이 먼저 오고 영문 이름은 그 뒤에 알파벳순으로 놓인다.
  // 영어 화면에서도 같은 순서를 써서 업체 위치가 달라지지 않게 한다.
  const sorted = useMemo(() => {
    const collator = new Intl.Collator("ko-KR", { sensitivity: "base", numeric: true })
    return [...brands].sort((x, y) => collator.compare(x.nameKo || x.nameEn, y.nameKo || y.nameEn))
  }, [brands])

  const [input, setInput] = useState("")
  const [query, setQuery] = useState("")
  const q = norm(query)
  const shown = q
    ? sorted.filter((x) => [x.nameKo, x.nameEn].some((v) => norm(v ?? "").includes(q)))
    : sorted

  if (sorted.length === 0) {
    return (
      <div className="bg-[var(--c-bg)] text-[var(--c-text)]">
        <PageHeader2026 title={b.title} subtitle={b.subtitle} watermark="BRANDS" />
        <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-20 md:py-28 text-center">
          <p className="text-[clamp(18px,3vw,24px)] font-extrabold">{b.empty}</p>
          <p className="text-[var(--c-muted2)] text-[15px] mt-4">{b.emptyDesc}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-[var(--c-bg)] text-[var(--c-text)]">
      <PageHeader2026 title={b.title} subtitle={b.subtitle} watermark="BRANDS" />

      <div className="max-w-[1100px] mx-auto px-5 md:px-10 py-8 md:py-12">
        {/* 검색: 업체명(국문·영문). 버튼·엔터로 검색, 비우면 바로 전체 */}
        <Reveal immediate>
          <form
            className="mb-5 md:mb-6 flex"
            onSubmit={(e) => {
              e.preventDefault()
              setQuery(input)
            }}
          >
            <input
              type="search"
              value={input}
              onChange={(e) => {
                setInput(e.target.value)
                if (!e.target.value) setQuery("")
              }}
              placeholder={b.searchPh}
              className="flex-1 min-w-0 h-12 border border-[var(--c-line-strong)] bg-[var(--c-surface)] text-[var(--c-text)] px-4 text-[16px] placeholder:text-[var(--c-muted2)] focus:outline-none focus:border-[var(--c-accent)]"
            />
            <button
              type="submit"
              className="shrink-0 h-12 px-5 md:px-7 -ml-px bg-[#7d0b1c] text-white text-[15px] font-bold hover:bg-[#5e0816] transition-colors"
            >
              {b.search}
            </button>
          </form>
        </Reveal>
        {shown.length === 0 && (
          <p className="py-16 text-center text-[15px] text-[var(--c-muted)]">{b.noResult}</p>
        )}
        {/* 표 형태: 칸마다 테두리를 두르고 -1px 겹쳐 선이 한 줄로 보이게 한다. 브랜드가 있는 칸까지만 선이 그려진다. */}
        <Reveal immediate delay={0.1}>
          <ul className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 pt-px pl-px">
            {shown.map((brand) => {
              const primary =
                lang === "ko" ? brand.nameKo || brand.nameEn : brand.nameEn || brand.nameKo
              const flag = countryFlag(brand.country)

              return (
                <li
                  key={brand.slug}
                  // 카드 안쪽은 다크 모드에서도 흰 바탕 (흰 배경 로고가 자연스럽게 묻히도록)
                  className="force-light -mt-px -ml-px border border-[var(--c-line)] bg-[var(--c-surface)] p-2.5 md:p-3 flex flex-col items-center text-center"
                >
                  <div
                    className="logo-box relative w-full aspect-square rounded flex items-center justify-center overflow-hidden"
                    // 로고 자체 배경색을 카드에도 적용해 흰 사각형이 떠 보이지 않게 한다.
                    // 투명 로고이거나 판별이 안 되면 흰 배경을 쓴다.
                    style={{ backgroundColor: brand.logoBg ?? "#ffffff" }}
                  >
                    {brand.logo ? (
                      <Image
                        src={brand.logo}
                        alt={primary}
                        fill
                        sizes="(max-width: 640px) 30vw, (max-width: 1024px) 22vw, 160px"
                        className="object-contain p-2"
                      />
                    ) : (
                      <span
                        aria-hidden
                        className="text-[clamp(16px,4vw,22px)] font-extrabold tracking-tight text-[var(--c-faint)] select-none"
                      >
                        {brandInitials(brand.nameEn, brand.nameKo)}
                      </span>
                    )}
                  </div>

                  {/* 긴 이름이 두 줄이 돼도 칸마다 배치가 같도록 이름 영역을 항상 두 줄 높이로 잡는다. */}
                  <h2 className="text-[12px] md:text-[13px] font-extrabold leading-snug break-keep mt-2.5 min-h-[2.75em] flex items-center justify-center">
                    {primary}
                  </h2>

                  <p className="text-[11px] text-[var(--c-muted2)] mt-1 inline-flex items-center gap-1.5">
                    {flag && <span aria-hidden>{flag}</span>}
                    {countryName(brand, lang)}
                  </p>

                  {(brand.website || brand.instagram || brand.facebook) && (
                    <div className="flex items-center justify-center gap-1.5 mt-2">
                      {brand.website && (
                        <IconLink href={brand.website} label={`${primary} 홈페이지`}>
                          <Globe size={13} strokeWidth={1.8} />
                        </IconLink>
                      )}
                      {brand.instagram && (
                        <IconLink href={brand.instagram} label={`${primary} 인스타그램`}>
                          <Instagram size={13} strokeWidth={1.8} />
                        </IconLink>
                      )}
                      {brand.facebook && (
                        <IconLink href={brand.facebook} label={`${primary} 페이스북`}>
                          <Facebook size={13} strokeWidth={1.8} />
                        </IconLink>
                      )}
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        </Reveal>

        {!q && (
          <p className="text-center text-[var(--c-faint)] text-[14px] md:text-[15px] font-semibold tracking-[0.12em] mt-10 md:mt-12">
            {b.andMore}
          </p>
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
