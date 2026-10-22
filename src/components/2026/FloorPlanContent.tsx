"use client"

// 부스 배치도 공개 페이지. 모바일 기준: 지도가 위에 고정되고 아래 목록이 스크롤된다.
// 선택한 부스는 하단 시트로 보여 준다. 색은 기기의 라이트/다크 모드를 따른다 (.fp-theme).
import Image from "next/image"
import { Suspense, useEffect, useMemo, useRef, useState } from "react"
import {
  actualRange,
  endTime,
  HALLS,
  hallName,
  type ProgramDay,
  type ProgramSession,
} from "@/content/program2026"
import { useContent2026 } from "@/i18n/useContent2026"
import { type FloorBrand, type Layout, type ResolvedItem, resolveItems } from "@/lib/floorPlan"
import FloorPlanMap, { type FocusTarget } from "./FloorPlanMap"
import PageHeader2026 from "./PageHeader2026"
import { KIND_DOT } from "./ProgramTimetable"

type Lang = "ko" | "en"
type Place = { id: string; name: string; sub: string; item: ResolvedItem; booth: boolean }

const norm = (s: string) => s.toLowerCase().replace(/[\s·.&'_-]/g, "")
const byNo = (a: Place, b: Place) =>
  a.item.no.localeCompare(b.item.no, undefined, { numeric: true })

function buildPlaces(items: ResolvedItem[], lang: Lang): Place[] {
  const booths: Place[] = []
  const facilities: Place[] = []
  for (const it of items) {
    const name = lang === "ko" ? it.nameKo : it.nameEn
    if (it.type === "booth") {
      if (!name) continue
      booths.push({
        id: it.id,
        name,
        sub: lang === "ko" ? it.nameEn : it.nameKo,
        item: it,
        booth: true,
      })
    } else if (name) {
      facilities.push({ id: it.id, name, sub: "", item: it, booth: false })
    }
  }
  return [...booths.sort(byNo), ...facilities]
}

function Logo({ brand, size = 40 }: { brand: FloorBrand | null; size?: number }) {
  if (!brand?.logo) {
    return (
      <span
        className="shrink-0 bg-[var(--fp-soft)] border border-[var(--fp-line)]"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <span
      className="relative shrink-0 border border-[var(--fp-line)] overflow-hidden"
      style={{ width: size, height: size, background: brand.logoBg ?? "#fff" }}
    >
      <Image src={brand.logo} alt="" fill sizes={`${size}px`} className="object-contain p-1" />
    </span>
  )
}

/** 룸 이름("ROOM A")에 해당하는 관 번호 */
function hallOf(item: ResolvedItem): number | null {
  const name = `${item.ko} ${item.en}`.toUpperCase().replace(/\s+/g, " ")
  return HALLS.find((n) => name.includes(hallName(n))) ?? null
}

/** 룸을 눌렀을 때: 그 룸의 이틀치 프로그램을 짧게 */
function RoomProgram({ hall, days, lang }: { hall: number; days: ProgramDay[]; lang: Lang }) {
  const { c } = useContent2026()
  const t = c.floorP
  const p = c.programP
  const label = (s: ProgramSession) =>
    s.kind === "lecture"
      ? (lang === "ko" ? s.titleKo || s.speakerKo : s.titleEn || s.speakerEn) || p.kinds.lecture
      : lang === "ko"
        ? s.nameKo
        : s.nameEn || s.nameKo
  const byDay = days.map((d) => ({
    id: d.id,
    sessions: d.sessions
      .filter((s) => s.hall === hall)
      .sort((a, b) => (a.actualStart ?? a.start).localeCompare(b.actualStart ?? b.start)),
  }))
  if (byDay.every((d) => !d.sessions.length)) {
    return <p className="mt-3 text-[13px] text-[var(--fp-muted)]">{t.noProgram}</p>
  }
  return (
    <div className="mt-3 space-y-3">
      {byDay
        .filter((d) => d.sessions.length)
        .map((d) => (
          <div key={d.id}>
            <div className="text-[12px] font-bold text-[var(--fp-muted)] mb-1">{p.days[d.id]}</div>
            <ul className="space-y-1">
              {d.sessions.map((s) => (
                <li key={`${s.start}-${s.nameKo}`} className="flex items-center gap-2 text-[13px]">
                  <span className="shrink-0 w-[86px] tabular-nums text-[var(--fp-muted)]">
                    {actualRange(s) ?? `${s.start} – ${endTime(s.start)}`}
                  </span>
                  <span
                    title={p.kinds[s.kind]}
                    className={`shrink-0 w-2 h-2 rounded-full ${KIND_DOT[s.kind]}`}
                  />
                  <span className="min-w-0 truncate font-bold">{label(s)}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
    </div>
  )
}

function Inner({
  layout,
  brands,
  days,
}: {
  layout: Layout
  brands: FloorBrand[]
  days: ProgramDay[]
}) {
  const { c, lang } = useContent2026()
  const t = c.floorP
  const items = useMemo(() => resolveItems(layout, brands), [layout, brands])
  const places = useMemo(() => buildPlaces(items, lang), [items, lang])
  const byId = useMemo(() => new Map(places.map((p) => [p.id, p])), [places])

  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string | null>(null)
  const [focus, setFocus] = useState<FocusTarget | null>(null)

  // PC 에선 목록 박스 높이를 지도 높이에 맞춘다
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapH, setMapH] = useState(0)
  useEffect(() => {
    const el = mapRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setMapH(el.offsetHeight))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const q = norm(query)
  const booths = places.filter(
    (p) =>
      p.booth &&
      (!q || norm(p.item.no).includes(q) || norm(p.name).includes(q) || norm(p.sub).includes(q)),
  )

  const select = (id: string, move = true) => {
    const p = byId.get(id)
    if (!p) return
    setSelected(id)
    if (move) setFocus({ rect: p.item, key: Date.now() })
  }

  const sel = selected ? byId.get(selected) : null
  const brandSlug = sel?.item.brand
  // 같은 브랜드가 여러 부스를 쓰면 함께 강조
  const highlight = brandSlug
    ? items.filter((i) => i.brand === brandSlug).map((i) => i.id)
    : selected
      ? [selected]
      : []
  const otherBooths = items
    .filter((i) => highlight.includes(i.id) && i.id !== selected)
    .map((i) => i.no)

  const hall = sel?.item.type === "room" ? hallOf(sel.item) : null

  const card = sel && (
    <>
      <div className="flex items-start gap-3">
        {sel.booth && <Logo brand={sel.item.brandInfo} size={64} />}
        <div className="min-w-0 flex-1">
          <div className="text-[12px] font-bold text-[var(--fp-accent)]">
            {sel.booth ? `${t.booth} ${sel.item.no}` : hall ? t.program : t.facility}
            {otherBooths.length > 0 && (
              <span className="text-[var(--fp-muted)] font-normal">
                {" "}
                · {t.alsoAt} {otherBooths.join(", ")}
              </span>
            )}
          </div>
          <div className="font-extrabold text-[17px] leading-tight truncate">{sel.name}</div>
          {sel.sub && sel.sub !== sel.name && (
            <div className="text-[13px] text-[var(--fp-muted)] truncate">{sel.sub}</div>
          )}
        </div>
        <button
          type="button"
          onClick={() => setSelected(null)}
          aria-label={t.close}
          className="shrink-0 -mr-1 -mt-1 w-9 h-9 flex items-center justify-center text-[var(--fp-muted)] text-[22px]"
        >
          ×
        </button>
      </div>
      {hall && <RoomProgram hall={hall} days={days} lang={lang} />}
    </>
  )

  const searchInput = (
    <input
      type="search"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder={t.searchPh}
      className="w-full h-12 border border-[var(--fp-line)] bg-[var(--fp-surface)] text-[var(--fp-text)] px-4 text-[16px] placeholder:text-[var(--fp-muted)] focus:outline-none focus:border-[var(--fp-accent)]"
    />
  )

  const rows = (
    <>
      {booths.map((p) => (
        <li key={p.id}>
          <button
            type="button"
            onClick={() => {
              select(p.id)
              if (window.matchMedia("(max-width: 1023px)").matches) {
                setQuery("")
                ;(document.activeElement as HTMLElement | null)?.blur()
              }
            }}
            className={`w-full flex items-center gap-3 py-2.5 px-2 -mx-2 text-left ${
              selected === p.id ? "bg-[var(--fp-accent-soft)]" : ""
            }`}
          >
            <span className="shrink-0 w-12 text-center text-[13px] font-extrabold text-[var(--fp-accent)] tabular-nums">
              {p.item.no}
            </span>
            <Logo brand={p.item.brandInfo} size={36} />
            <span className="min-w-0">
              <span className="block text-[15px] font-bold truncate">{p.name}</span>
              {p.sub && p.sub !== p.name && (
                <span className="block text-[12px] text-[var(--fp-muted)] truncate">{p.sub}</span>
              )}
            </span>
          </button>
        </li>
      ))}
      {booths.length === 0 && (
        <li className="py-10 text-center text-[14px] text-[var(--fp-muted)]">{t.noResult}</li>
      )}
    </>
  )

  return (
    <div className="fp-theme flex flex-col flex-1">
      <PageHeader2026 title={t.title} subtitle={t.subtitle} watermark="FLOOR PLAN" />
      <section className="w-full max-w-[1600px] mx-auto px-4 md:px-8 pb-3 lg:pb-8 lg:flex lg:justify-center lg:gap-6 lg:items-start lg:pt-6">
        {/* 모바일: 지도 위 검색창. 입력하면 결과가 아래로 펼쳐진다 */}
        <div className="lg:hidden relative z-30 pt-2.5">
          {searchInput}
          {q && (
            <ul className="absolute inset-x-0 top-full mt-1.5 max-h-[50svh] overflow-y-auto overscroll-contain border border-[var(--fp-line)] bg-[var(--fp-surface)] shadow-lg divide-y divide-[var(--fp-line)] px-3">
              {rows}
            </ul>
          )}
        </div>

        {/* 지도: PC 에선 스크롤해도 화면 위에 붙어 있다. 지도+목록 묶음을 가운데 두어 좌우 여백을 같게 */}
        <div
          className="pt-2 lg:pt-0 lg:sticky lg:top-[108px] lg:flex-1 lg:min-w-0"
          style={{
            // PC: 화면 높이 안에 지도 전체가 들어오는 만큼만 넓게
            maxWidth: `max(300px, calc((100svh - 140px) * ${layout.cols} / ${layout.rows}))`,
          }}
        >
          <div ref={mapRef}>
            <FloorPlanMap
              layout={layout}
              items={items}
              lang={lang}
              selected={highlight}
              fill="max-lg:pointer-coarse:h-[max(380px,62svh)]"
              focus={focus}
              onSelect={(id) => select(id, false)}
            />
          </div>
        </div>

        {/* PC: 검색·목록 (지도 높이에 맞춘 스크롤 박스) */}
        <div
          className="hidden lg:flex lg:flex-col lg:w-[320px] lg:shrink-0 lg:h-[var(--fp-list-h)]"
          style={{ "--fp-list-h": mapH ? `${mapH}px` : "auto" } as React.CSSProperties}
        >
          {sel && (
            <div className="mb-3 border border-[var(--fp-line)] bg-[var(--fp-surface)] p-4">
              {card}
            </div>
          )}
          {searchInput}

          <div className="mt-4 mb-1 text-[12px] font-bold text-[var(--fp-muted)]">
            {t.booths} {booths.length}
          </div>
          <ul className="divide-y divide-[var(--fp-line)] lg:flex-1 lg:min-h-0 lg:overflow-y-auto lg:overscroll-contain lg:border lg:border-[var(--fp-line)] lg:px-3 lg:divide-y">
            {rows}
          </ul>
        </div>
      </section>

      {/* 선택한 부스: 모바일은 하단 시트, PC 는 목록 위 카드 */}
      {sel && (
        <div className="lg:hidden fixed inset-x-0 bottom-0 z-40">
          <div className="mx-auto max-w-[560px] border border-[var(--fp-line)] bg-[var(--fp-surface)] text-[var(--fp-text)] shadow-[0_-6px_24px_rgba(0,0,0,0.18)] max-h-[55svh] overflow-y-auto px-4 pt-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
            {card}
          </div>
        </div>
      )}
    </div>
  )
}

/** 공개 전 안내 */
function SoonInner() {
  const { c } = useContent2026()
  return (
    <div className="flex flex-col flex-1">
      <PageHeader2026 title={c.floorP.title} subtitle={c.floorP.subtitle} watermark="FLOOR PLAN" />
      <p className="py-24 text-center text-[16px] md:text-[18px] font-bold text-[#555]">
        {c.floorP.soon}
      </p>
    </div>
  )
}

export function FloorPlanSoon() {
  return (
    <Suspense fallback={null}>
      <SoonInner />
    </Suspense>
  )
}

export default function FloorPlanContent(props: {
  layout: Layout
  brands: FloorBrand[]
  days: ProgramDay[]
}) {
  return (
    <Suspense fallback={null}>
      <Inner {...props} />
    </Suspense>
  )
}
