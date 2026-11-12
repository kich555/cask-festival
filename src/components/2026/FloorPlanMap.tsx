"use client"

// 부스 배치도 지도: 격자 배치를 SVG 로 그린다. 휠·드래그·핀치·두 번 탭으로 확대/이동, 부스 탭.
// 확대는 viewBox 를 바꿔 벡터를 다시 그리므로 글자가 깨지지 않는다.
// 부스 칸엔 업체명을 그리고, 충분히 확대하면 번호도 함께 보인다.
// 색은 .fp-theme 의 CSS 변수를 따라 기기의 라이트/다크 모드에 맞춰진다.
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import {
  BOOTH,
  CELL,
  extentOf,
  type FloorItem,
  fitLabel,
  type ItemType,
  type Layout,
  layerOf,
  panelOf,
  type Rect,
  type ResolvedItem,
  toPx,
} from "@/lib/floorPlan"

type View = { s: number; x: number; y: number }
const MAX = 8
/** 부스 한 칸이 화면에서 이 픽셀 이상이면 업체명까지 그린다 */
const DETAIL_PX = 64
/** 부스명 최대 글자 크기 (화장실 등 시설 이름도 같은 크기로) */
const BOOTH_NAME_MAX = 5.4
/** 확대해서 번호가 보일 때 부스 위쪽에 비워 둘 높이 */
const NO_RESERVE = 8
/** 마우스 화면(데스크톱)은 칸이 작아도 번호를 함께 보여 준다 */
const DETAIL_PX_DESKTOP = 24
/** 부스를 고르면 한 칸이 이 크기가 되도록 확대 */
const FOCUS_PX = 72

function Lines({
  lines,
  x,
  y,
  size,
  fill,
  weight = 700,
}: {
  lines: string[]
  x: number
  y: number
  size: number
  fill: string
  weight?: number
}) {
  // dominant-baseline 은 iOS Safari 가 tspan 에 적용하지 않아 글자가 위로 뜬다.
  // 대신 기준선을 글자 높이의 0.35 만큼 내려 가운데를 맞춘다
  const top = y - ((lines.length - 1) * size * 1.18) / 2 + size * 0.35
  return (
    <text
      x={x}
      y={top}
      fontSize={size}
      fontWeight={weight}
      style={{ fill }}
      textAnchor="middle"
      textRendering="geometricPrecision"
      pointerEvents="none"
    >
      {lines.map((line, i) => (
        <tspan key={`${i}-${line}`} x={x} dy={i === 0 ? 0 : size * 1.18}>
          {line}
        </tspan>
      ))}
    </text>
  )
}

const v = (name: string) => `var(--fp-${name})`

/** 누를 수 없는 표시용 항목 */
const GATES = new Set(["entrance", "exit", "partition"])

function ToiletIcon({ x, y, k, fill }: { x: number; y: number; k: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${k})`} style={{ fill }} pointerEvents="none">
      {/* 여자(왼쪽 치마) · 남자(오른쪽) 를 가깝게 붙인다 */}
      <circle cx={-3.2} cy={-6} r={1.6} />
      <path d="M -3.2 -4 L -5.9 2.2 L -4.3 2.2 L -4.3 6.5 L -2.1 6.5 L -2.1 2.2 L -0.5 2.2 Z" />
      <circle cx={3.2} cy={-6} r={1.6} />
      <rect x={1.3} y={-4} width={3.8} height={6} rx={0.6} />
      <rect x={1.6} y={1.5} width={1.4} height={5} />
      <rect x={3.4} y={1.5} width={1.4} height={5} />
    </g>
  )
}

/** 입구·출구: 테두리 없이 삼각형(입구 ▲, 출구 ▼)과 글자만. 누를 수 없다 */
function Gate({ item, name }: { item: ResolvedItem; name: string }) {
  const r = toPx(item)
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2
  const t = 6 // 삼각형 반 폭
  // '프로그램 입구'처럼 긴 이름은 단어마다 줄을 나눠 입구·출구 글자와 비슷한 크기로 (조금 작게)
  const lines = name.length > 4 && name.includes(" ") ? name.split(" ") : [name]
  const longest = Math.max(...lines.map((l) => l.length))
  const size =
    lines.length > 1
      ? Math.min(7, Math.max(r.w, 30) / (longest * 0.75))
      : Math.min(8, r.w / (name.length * 0.75))
  const top = cy - 12
  const bottom = cy - 2
  const d =
    item.type === "entrance"
      ? `M ${cx} ${top} L ${cx + t} ${bottom} L ${cx - t} ${bottom} Z`
      : `M ${cx - t} ${top} L ${cx + t} ${top} L ${cx} ${bottom} Z`
  return (
    <g pointerEvents="none">
      <path d={d} style={{ fill: v("accent") }} strokeLinejoin="round" />
      <Lines
        lines={lines}
        x={cx}
        // 여러 줄이면 첫 줄이 삼각형 바로 아래에 오도록 내린다
        y={cy + 7 + ((lines.length - 1) * size * 1.18) / 2}
        size={size}
        fill={v("accent")}
        weight={800}
      />
    </g>
  )
}

/** 파티션(벽): 격자 선 위의 굵은 선. 장 사이 이음매를 옅게 표시 */
function Partition({ item, selected }: { item: FloorItem; selected?: boolean }) {
  const r = toPx(extentOf(item))
  const n = Math.max(item.w, item.h)
  const horiz = item.w > 0
  const step = panelOf(item) * CELL
  const color = v(selected ? "sel" : "wall")
  return (
    <g pointerEvents="none">
      <line
        x1={r.x}
        y1={r.y}
        x2={r.x + r.w}
        y2={r.y + r.h}
        style={{ stroke: color }}
        strokeWidth={1.6}
        strokeLinecap="square"
      />
      {Array.from({ length: n - 1 }, (_, i) => {
        const d = (i + 1) * step
        const x = horiz ? r.x + d : r.x
        const y = horiz ? r.y : r.y + d
        return (
          <line
            key={d}
            x1={horiz ? x : x - 0.8}
            y1={horiz ? y - 0.8 : y}
            x2={horiz ? x : x + 0.8}
            y2={horiz ? y + 0.8 : y}
            style={{ stroke: v("map") }}
            strokeWidth={0.35}
          />
        )
      })}
    </g>
  )
}

/** 항목 하나 (부스·룸·시설). detail 이 참이면 부스 번호도 함께 */
type Flush = { l: boolean; r: boolean; t: boolean; b: boolean }

export function FloorShape({
  item,
  lang,
  selected,
  detail = true,
  flush,
  nameMax,
  numberOnly = false,
}: {
  item: ResolvedItem
  lang: "ko" | "en"
  selected?: boolean
  detail?: boolean
  /** 바깥 테두리에 닿은 변. 그 변은 안쪽으로 들이지 않고 테두리 선과 겹쳐 그린다 */
  flush?: Flush
  /** 부스명 최대 글자 크기. 지도에서 모든 부스가 같은 크기로 보이도록 맞춘 값 */
  nameMax?: number
  /** 부스명 대신 번호만 크게 (모바일: 누르면 아래 시트에 업체 정보) */
  numberOnly?: boolean
}) {
  if (item.type === "partition") return <Partition item={item} selected={selected} />
  const r = toPx(item)
  const cx = r.x + r.w / 2
  const cy = r.y + r.h / 2
  const name = lang === "ko" ? item.nameKo : item.nameEn

  if (item.type === "booth") {
    const reserve = detail ? NO_RESERVE : 3
    const { lines, size } = fitLabel(
      name,
      r.w,
      r.h,
      nameMax ?? (detail ? BOOTH_NAME_MAX : 6.5),
      reserve,
    )
    // 업체명은 부스 한가운데. 다만 왼쪽 위 번호와 겹치면 그만큼만 내린다
    const half = (lines.length * size * 1.18) / 2
    const nameY = detail ? Math.max(cy, r.y + NO_RESERVE - 1 + half) : cy
    const textFill = v(selected ? "sel-text" : "text")
    return (
      <g>
        <rect
          x={r.x + (flush?.l ? 0 : 0.6)}
          y={r.y + (flush?.t ? 0 : 0.6)}
          width={r.w - (flush?.l ? 0 : 0.6) - (flush?.r ? 0 : 0.6)}
          height={r.h - (flush?.t ? 0 : 0.6) - (flush?.b ? 0 : 0.6)}
          style={{
            fill: v(selected ? "sel" : "booth"),
            stroke: v(selected ? "sel" : "booth-line"),
          }}
          strokeWidth={0.7}
        />
        {/* 업체명이 기본. 충분히 확대하면 왼쪽 위에 번호도 작게 */}
        {detail && name && !numberOnly && (
          <text
            x={r.x + 2.2}
            y={r.y + 4.8}
            fontSize={3.8}
            fontWeight={800}
            textRendering="geometricPrecision"
            style={{ fill: v(selected ? "sel-text" : "booth-no") }}
            pointerEvents="none"
          >
            {item.no}
          </text>
        )}
        {name && !numberOnly ? (
          <Lines lines={lines} x={cx} y={nameY} size={size} fill={textFill} />
        ) : (
          <Lines
            lines={[item.no]}
            x={cx}
            y={cy}
            size={Math.min(9, (r.w - 4) / (item.no.length * 0.72))}
            fill={v(selected ? "sel-text" : numberOnly ? "text" : "booth-no")}
            weight={800}
          />
        )}
      </g>
    )
  }

  if (item.type === "entrance" || item.type === "exit") {
    return <Gate item={item} name={name} />
  }

  const strong = item.type === "room"
  const big = Math.min(9, Math.max(5, Math.min(r.w, r.h) / 4))
  const { lines, size } = fitLabel(name, r.w, r.h, big, 4)
  const fill = selected
    ? v("sel")
    : item.type === "zone"
      ? v("zone")
      : item.type === "table"
        ? v("table")
        : v("room")
  const text = selected ? v("sel-text") : strong ? v("text") : v("fac-text")
  // 테이블은 실제 크기(1m = 한 칸)가 보이도록 거의 여백 없이 그린다
  const inset = item.type === "table" ? 0.2 : 0.8
  return (
    <g>
      <rect
        x={r.x + (flush?.l ? 0 : inset)}
        y={r.y + (flush?.t ? 0 : inset)}
        width={r.w - (flush?.l ? 0 : inset) - (flush?.r ? 0 : inset)}
        height={r.h - (flush?.t ? 0 : inset) - (flush?.b ? 0 : inset)}
        style={{
          fill,
          stroke: v(selected ? "sel" : item.type === "table" ? "table-line" : "fac-line"),
        }}
        strokeWidth={0.7}
        strokeDasharray={item.type === "zone" ? "3 2" : undefined}
      />
      {item.type === "toilet" ? (
        <>
          {/* 마크는 칸 폭의 절반 정도, 글자는 부스명과 같은 크기 */}
          <ToiletIcon x={cx} y={cy - 4} k={Math.min(1.1, (r.w - 8) / 12)} fill={text} />
          <Lines lines={[name]} x={cx} y={cy + 9} size={BOOTH_NAME_MAX + 1} fill={text} />
        </>
      ) : (
        <Lines lines={lines} x={cx} y={cy} size={size} fill={text} />
      )}
    </g>
  )
}

export type FocusTarget = { rect: Rect; key: number }

export default function FloorPlanMap({
  layout,
  items,
  lang,
  selected,
  focus,
  fill,
  onSelect,
  outline = false,
}: {
  layout: Layout
  items: ResolvedItem[]
  lang: "ko" | "en"
  /** 강조할 항목 id */
  selected: string[]
  /** 바뀔 때마다 그 영역(칸 단위)으로 확대·이동 */
  focus?: FocusTarget | null
  /** 지도 상자 높이를 CSS 로 정한다 (예: "h-[60svh]"). 처음엔 세로를 꽉 채워 크게 보여 준다 */
  fill?: string
  onSelect?: (id: string) => void
  /**
   * 파티션 대신 부스(·룸)가 놓인 곳을 큰 사각형 테두리로 두른다 (홈페이지).
   * 파티션은 그리지 않고, 입구·출구 옆에서 선을 어디까지 끊을지 정하는 데만 쓴다
   */
  outline?: boolean
}) {
  const VW = layout.cols * CELL
  const VH = layout.rows * CELL
  const boxRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  const [desktop, setDesktop] = useState(false)
  /** 화면 맞추기로 돌아가는 중 (미니맵 숨김) */
  const [homing, setHoming] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)")
    const on = () => setDesktop(mq.matches)
    on()
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  const [view, setView] = useState<View>({ s: 1, x: 0, y: 0 })
  const viewRef = useRef(view)
  // 모바일 미니맵은 지도를 가리므로, 1초간 움직임이 없으면 숨기고 움직이면 다시 보인다
  const [miniIdle, setMiniIdle] = useState(false)
  useEffect(() => {
    setMiniIdle(false)
    const id = setTimeout(() => setMiniIdle(true), 1000)
    return () => clearTimeout(id)
  }, [view.s, view.x, view.y])
  viewRef.current = view
  const moved = useRef(false)

  // s = 1 은 도면 가로가 상자 가로에 꼭 맞는 배율
  const width = size.w
  const unit = width / VW
  const planH = VH * unit
  const height = fill ? size.h : planH
  /** 상자를 빈틈없이 채우는 배율. fill(모바일)에선 이보다 작게 줄이지 않아 위아래 여백이 생기지 않는다 */
  const coverS = height && planH ? Math.max(1, height / planH) : 1
  /** 가장 작게 줄일 수 있는 배율 (PC: 도면 전체가 보이는 배율) */
  const minS = fill ? coverS : height && planH ? Math.min(1, height / planH) : 1

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const measure = () => setSize({ w: el.clientWidth, h: el.clientHeight })
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    measure()
    return () => ro.disconnect()
  }, [])

  const clamp = useCallback(
    (v: View): View => {
      const s = Math.min(MAX, Math.max(minS, v.s))
      // 상자보다 작은 쪽은 가운데, 큰 쪽은 가장자리를 넘지 않게
      const fit = (pos: number, box: number, content: number) =>
        content <= box ? (box - content) / 2 : Math.min(0, Math.max(box - content, pos))
      return { s, x: fit(v.x, width, width * s), y: fit(v.y, height, planH * s) }
    },
    [width, height, planH, minS],
  )

  // 부스가 놓인 범위 (칸 단위). 모바일 기본 화면을 여기에 맞춘다
  const boothArea = useMemo(() => {
    const b = items.filter((i) => i.type === "booth")
    if (!b.length) return null
    const x = Math.min(...b.map((i) => i.x))
    const y = Math.min(...b.map((i) => i.y))
    return {
      x,
      y,
      w: Math.max(...b.map((i) => i.x + i.w)) - x,
      h: Math.max(...b.map((i) => i.y + i.h)) - y,
    }
  }, [items])

  /**
   * 기본 화면. PC 는 가장 작게 줄인 전체(가운데 정렬),
   * 모바일은 룸을 뺀 부스 범위가 세로로 꽉 차게
   */
  const home = useCallback((): View => {
    if (!desktop && boothArea && unit) {
      const pad = 0.4
      const s = Math.min(MAX, Math.max(minS, height / ((boothArea.h + pad * 2) * CELL * unit)))
      const cx = (boothArea.x + boothArea.w / 2) * CELL * unit
      return clamp({ s, x: width / 2 - cx * s, y: -(boothArea.y - pad) * CELL * unit * s })
    }
    return clamp({ s: minS, x: (width - width * minS) / 2, y: (height - planH * minS) / 2 })
  }, [clamp, minS, width, height, planH, desktop, boothArea, unit])

  // 상자 크기가 정해지거나 바뀌면: 아직 만지지 않았으면 기본 화면, 만졌으면 범위만 다시 맞춘다
  // 만졌으면 보던 위치·배율을 새 크기에 비례해 그대로 유지
  const touched = useRef(false)
  const prevW = useRef(0)
  useEffect(() => {
    if (!width || !height) return
    const k = prevW.current ? width / prevW.current : 1
    prevW.current = width
    setView((v) => (touched.current ? clamp({ s: v.s, x: v.x * k, y: v.y * k }) : home()))
  }, [width, height, clamp, home])

  // 부드럽게 이동 (viewBox 를 프레임마다 바꾼다)
  const anim = useRef(0)
  const stop = useCallback(() => cancelAnimationFrame(anim.current), [])
  const fly = useCallback((to: View) => {
    cancelAnimationFrame(anim.current)
    const from = viewRef.current
    const t0 = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / 380)
      const e = 1 - (1 - t) ** 3
      setView({
        s: from.s + (to.s - from.s) * e,
        x: from.x + (to.x - from.x) * e,
        y: from.y + (to.y - from.y) * e,
      })
      if (t < 1) anim.current = requestAnimationFrame(step)
    }
    anim.current = requestAnimationFrame(step)
  }, [])
  useEffect(() => stop, [stop])

  // 휠 확대 (페이지 스크롤·확대를 막아야 해서 passive: false 로 직접 등록)
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const onWheel = (e: WheelEvent) => {
      // 데스크톱은 지도 위 휠이 곧 확대/축소(지도 밖에서는 페이지 스크롤). 터치 기기는 핀치(ctrlKey)일 때만
      const fine = matchMedia("(hover: hover) and (pointer: fine)").matches
      if (!fine && !e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      touched.current = true
      setHoming(false)
      stop()
      const r = el.getBoundingClientRect()
      const at = { x: e.clientX - r.left, y: e.clientY - r.top }
      setView(
        clamp(
          zoomView(
            viewRef.current,
            at,
            Math.exp(-e.deltaY * (e.deltaMode === 1 ? 40 : 1) * 0.0018),
            minS,
          ),
        ),
      )
    }
    el.addEventListener("wheel", onWheel, { passive: false })
    return () => el.removeEventListener("wheel", onWheel)
  }, [clamp, stop, minS])

  // 드래그 이동 + 두 손가락 핀치
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ dist: number; view: View; mid: { x: number; y: number } } | null>(null)
  const dragStart = useRef<{ x: number; y: number; view: View } | null>(null)

  const local = (e: React.PointerEvent) => {
    const r = boxRef.current?.getBoundingClientRect()
    return r ? { x: e.clientX - r.left, y: e.clientY - r.top } : null
  }

  const onPointerDown = (e: React.PointerEvent) => {
    const p = local(e)
    if (!p) return
    pointers.current.set(e.pointerId, p)
    moved.current = false
    touched.current = true
    setHoming(false)
    stop()
    const pts = [...pointers.current.values()]
    if (pts.length === 1) {
      dragStart.current = { ...pts[0], view: viewRef.current }
    } else if (pts.length === 2) {
      gesture.current = {
        dist: Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y),
        view: viewRef.current,
        mid: { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 },
      }
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    const p = local(e)
    if (!p) return
    pointers.current.set(e.pointerId, p)
    const pts = [...pointers.current.values()]
    if (pts.length >= 2 && gesture.current) {
      const g = gesture.current
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
      const mid = { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
      const s = Math.min(MAX, Math.max(minS, (g.view.s * dist) / g.dist))
      const k = s / g.view.s
      moved.current = true
      setView(
        clamp({ s, x: mid.x - (g.mid.x - g.view.x) * k, y: mid.y - (g.mid.y - g.view.y) * k }),
      )
    } else if (dragStart.current) {
      const d = dragStart.current
      const dx = pts[0].x - d.x
      const dy = pts[0].y - d.y
      if (!moved.current && Math.hypot(dx, dy) < 5) return
      if (!moved.current) boxRef.current?.setPointerCapture(e.pointerId)
      moved.current = true
      setView(clamp({ s: d.view.s, x: d.view.x + dx, y: d.view.y + dy }))
    }
  }

  // 두 번 탭하면 그 자리를 확대
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null)

  const onPointerUp = (e: React.PointerEvent) => {
    if (pointers.current.size === 1 && !moved.current) {
      const p = local(e)
      const prev = lastTap.current
      const now = Date.now()
      if (p && prev && now - prev.t < 320 && Math.hypot(p.x - prev.x, p.y - prev.y) < 30) {
        fly(clamp(zoomView(viewRef.current, p, 2, minS)))
        lastTap.current = null
      } else if (p) lastTap.current = { t: now, ...p }
    }
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) gesture.current = null
    if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()]
      dragStart.current = { ...p, view: viewRef.current }
    } else if (pointers.current.size === 0) dragStart.current = null
  }

  // 선택 대상으로 확대·이동
  // biome-ignore lint/correctness/useExhaustiveDependencies: focus.key 가 바뀔 때만 움직인다
  useEffect(() => {
    if (!focus || !width) return
    touched.current = true
    setHoming(false)
    const rect = toPx(focus.rect)
    const s = Math.max(viewRef.current.s, FOCUS_PX / (BOOTH * CELL * unit))
    const cx = (rect.x + rect.w / 2) * unit
    const cy = (rect.y + rect.h / 2) * unit
    fly(clamp({ s, x: width / 2 - cx * s, y: height / 2 - cy * s }))
  }, [focus?.key, width, height])

  const pick = (id: string) => {
    if (moved.current) return
    onSelect?.(id)
  }

  const sel = new Set(selected)
  // 부스명 크기를 부스마다 따로 맞추면 들쭉날쭉해 보이므로, 대부분(75%)의 이름이 들어가는 크기 하나로
  // 맞춘다. 그보다 긴 이름만 각자 더 줄어든다
  const nameSize = useMemo(() => {
    const common = (max: number, reserve: number) => {
      const sizes = items
        .filter((i) => i.type === "booth")
        .map((i) => {
          const r = toPx(i)
          const name = lang === "ko" ? i.nameKo : i.nameEn
          return name ? fitLabel(name, r.w, r.h, max, reserve).size : max
        })
        .sort((a, b) => a - b)
      return sizes.length ? sizes[Math.floor(sizes.length * 0.25)] : max
    }
    return { detail: common(BOOTH_NAME_MAX, NO_RESERVE), overview: common(6.5, 3) }
  }, [items, lang])
  const btn =
    "w-8 h-8 bg-[var(--fp-surface)]/85 backdrop-blur text-[var(--fp-text)] border border-[var(--fp-line)] shadow-sm text-[17px] font-bold flex items-center justify-center active:scale-95"
  const center = () => ({ x: width / 2, y: height / 2 })
  const detail = BOOTH * CELL * unit * view.s >= (desktop ? DETAIL_PX_DESKTOP : DETAIL_PX)
  const nameMax = detail ? nameSize.detail : nameSize.overview
  // viewBox: 화면 좌표(view)를 도면 좌표로 바꾼 보이는 범위
  const k = unit * view.s || 1
  const viewBox = `${-view.x / k} ${-view.y / k} ${width / k || VW} ${height / k || VH}`
  // 선택된 항목을 맨 위에 그려 테두리가 이웃 칸에 가리지 않게
  // 구역(바닥)은 맨 아래, 파티션(벽)은 부스 테두리 위에 보이도록 가장 위에
  const shown = outline ? items.filter((i) => i.type !== "partition") : items
  const ordered = [...shown].sort(
    (a, b) => layerOf(a) - layerOf(b) || Number(sel.has(a.id)) - Number(sel.has(b.id)),
  )
  // 홈페이지: 부스가 놓인 곳 전체를 큰 사각형 테두리로 두른다. 입구·출구가 걸치는 곳은 선을 끊는다
  const hall = outline ? hallOutline(items) : null
  // 바깥에 룸까지 감싸는 선을 한 번 더 (겹치는 변은 같은 선이라 하나로 보인다)
  const outer = outline ? hallOutline(items, ["booth", "room"]) : null
  // 테두리에 닿은 부스·룸은 그 변을 테두리 선에 붙여 선이 이중으로 보이지 않게 한다
  const touch = (i: ResolvedItem, b: Rect | undefined) => ({
    l: i.x === b?.x,
    r: i.x + i.w === (b ? b.x + b.w : null),
    t: i.y === b?.y,
    b: i.y + i.h === (b ? b.y + b.h : null),
  })
  const flushOf = (i: ResolvedItem): Flush | undefined => {
    if (!hall) return undefined
    if (outer?.attached.has(i.id)) return { l: true, r: true, t: true, b: true }
    if (i.type !== "booth" && i.type !== "room") return undefined
    const a = touch(i, outer?.box)
    const c = i.type === "booth" ? touch(i, hall.box) : a
    // 룸 사이 구분선에 닿은 변도 붙인다
    const j = outer?.joins ?? []
    return {
      l: a.l || c.l || j.includes(i.x),
      r: a.r || c.r || j.includes(i.x + i.w),
      t: a.t || c.t,
      b: a.b || c.b,
    }
  }

  return (
    <div>
      <div
        ref={boxRef}
        className={`relative w-full overflow-hidden ${fill ?? ""} border border-[var(--fp-line)] bg-[var(--fp-map)] select-none cursor-grab active:cursor-grabbing`}
        style={{
          height: fill ? undefined : height || undefined,
          // fill 이면 CSS 높이가 없을 때(PC) 도면 비율을 쓴다
          aspectRatio: fill || !height ? `${VW} / ${VH}` : undefined,
          // 확대 전엔 지도 위에서도 페이지를 위아래로 스크롤할 수 있게
          touchAction: width * view.s > width + 1 || planH * view.s > height + 1 ? "none" : "pan-y",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <svg
          viewBox={viewBox}
          className="absolute inset-0 w-full h-full"
          role="img"
          aria-label={lang === "ko" ? "부스 배치도" : "Floor plan"}
        >
          <rect width={VW} height={VH} style={{ fill: v("map") }} />
          {ordered.map((it) => (
            // biome-ignore lint/a11y/noStaticElementInteractions: 지도 클릭은 보조 수단, 같은 기능을 목록에서 제공한다
            <g
              key={it.id}
              onClick={GATES.has(it.type) || it.type === "zone" ? undefined : () => pick(it.id)}
              className={GATES.has(it.type) || it.type === "zone" ? undefined : "cursor-pointer"}
            >
              <FloorShape
                item={outer?.attached.has(it.id) ? { ...it, ...outer.attached.get(it.id) } : it}
                lang={lang}
                selected={sel.has(it.id)}
                detail={detail}
                flush={flushOf(it)}
                nameMax={nameMax}
              />
            </g>
          ))}
          {/* 테두리는 부스·룸 위에 그려 붙은 변까지 한 가지 색으로 보이게 한다 */}
          {hall && (
            <path
              d={hall.d + (outer?.d ?? "")}
              fill="none"
              style={{ stroke: v("fac-line") }}
              strokeWidth={0.7}
              strokeLinecap="square"
              pointerEvents="none"
            />
          )}
        </svg>
        {/* 미니맵(보고 있는 범위·선택한 부스). 왼쪽 위 */}
        <div
          className={`absolute left-2 top-2 transition-opacity duration-300 ${
            desktop ? "" : miniIdle ? "opacity-0 pointer-events-none" : "opacity-60"
          }`}
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          {(!desktop || (view.s > minS + 0.01 && !homing)) && width > 0 && (
            <MiniMap
              label={lang === "ko" ? "전체 도면" : "OVERVIEW"}
              items={shown}
              selected={sel}
              VW={VW}
              VH={VH}
              view={{ x: -view.x / k, y: -view.y / k, w: width / k, h: height / k }}
              onJump={(px, py) =>
                fly(clamp({ s: view.s, x: width / 2 - px * k, y: height / 2 - py * k }))
              }
            />
          )}
        </div>

        {/* 오른쪽 위: 확대 버튼. 모바일은 손가락으로 확대하므로 화면 맞추기만 */}
        <div
          className="absolute right-2 top-2"
          onPointerDown={(e) => e.stopPropagation()}
          onPointerUp={(e) => e.stopPropagation()}
        >
          <div className="flex gap-1">
            <button
              type="button"
              className={`${btn} max-lg:hidden`}
              aria-label="확대"
              onClick={() => {
                setHoming(false)
                fly(clamp(zoomView(viewRef.current, center(), 1.5, minS)))
              }}
            >
              +
            </button>
            <button
              type="button"
              className={`${btn} max-lg:hidden`}
              aria-label="축소"
              onClick={() => fly(clamp(zoomView(viewRef.current, center(), 1 / 1.5, minS)))}
            >
              −
            </button>
            <button
              type="button"
              className={btn}
              aria-label="전체 보기"
              onClick={() => {
                // 데스크톱: 줄어드는 동안 미니맵이 따라 줄지 않게 바로 숨긴다
                setHoming(true)
                fly(home())
              }}
            >
              <svg
                viewBox="0 0 20 20"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M3 8V3h5M17 8V3h-5M3 12v5h5M17 12v5h-5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/** 전체 도면 축소판 위에 지금 보이는 범위를 사각형으로 표시. 누르면 그 자리로 이동 */
function MiniMap({
  label,
  items,
  selected,
  VW,
  VH,
  view,
  onJump,
}: {
  label: string
  items: ResolvedItem[]
  selected: Set<string>
  VW: number
  VH: number
  view: Rect
  onJump: (x: number, y: number) => void
}) {
  // 보이는 범위를 도면 안으로 자른다
  const x0 = Math.max(0, view.x)
  const y0 = Math.max(0, view.y)
  const x1 = Math.min(VW, view.x + view.w)
  const y1 = Math.min(VH, view.y + view.h)
  const jump = (e: React.PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    onJump(((e.clientX - r.left) / r.width) * VW, ((e.clientY - r.top) / r.height) * VH)
  }
  return (
    // 지도와 구분되는 카드: 진한 테두리·그림자·불투명 배경
    <div className="w-[136px] lg:w-[240px] bg-[var(--fp-surface)] border border-[var(--fp-mini-line)] shadow-[0_4px_14px_rgba(0,0,0,0.18)]">
      <svg
        viewBox={`0 0 ${VW} ${VH}`}
        className="block w-full bg-[var(--fp-map)] cursor-pointer"
        style={{ aspectRatio: `${VW} / ${VH}` }}
        onPointerDown={jump}
        role="img"
        aria-label={label}
      >
        {items
          .filter((it) => !GATES.has(it.type))
          .sort((a, b) => layerOf(a) - layerOf(b))
          .map((it) => {
            const r = toPx(it)
            return (
              <rect
                key={it.id}
                x={r.x + 1}
                y={r.y + 1}
                width={r.w - 2}
                height={r.h - 2}
                style={{
                  fill: v(
                    selected.has(it.id) ? "sel" : it.type === "booth" ? "booth-line" : "room",
                  ),
                }}
              />
            )
          })}
        {/* 지금 보이는 범위: 옅게 채우고 진하게 두른다 */}
        <rect
          x={x0}
          y={y0}
          width={Math.max(0, x1 - x0)}
          height={Math.max(0, y1 - y0)}
          style={{ fill: v("sel"), fillOpacity: 0.12, stroke: v("sel") }}
          strokeWidth={VW / 90}
        />
      </svg>
    </div>
  )
}

type Outline = { d: string; box: Rect; joins: number[]; attached: Map<string, Rect> }

/**
 * kinds(기본: 부스) 전체를 두르는 사각형 테두리(px 경로). 입구·출구가 걸친 변은
 * 그 양옆에서 가장 가까운 부스(예: 인포·택배 부스)나 같은 선 위 파티션 끝까지 선을 비운다
 */
function hallOutline(items: ResolvedItem[], kinds: ItemType[] = ["booth"]): Outline | null {
  const booths = items.filter((i) => kinds.includes(i.type))
  if (!booths.length) return null
  const x0 = Math.min(...booths.map((i) => i.x))
  const y0 = Math.min(...booths.map((i) => i.y))
  const x1 = Math.max(...booths.map((i) => i.x + i.w))
  const y1 = Math.max(...booths.map((i) => i.y + i.h))
  const gates = items.filter((i) => i.type === "entrance" || i.type === "exit")
  const walls = items.filter((i) => i.type === "partition")
  // 룸까지 두를 때는 오른쪽 위 빈 곳을 감싸지 않는다: 윗변은 가장 오른쪽 룸에서, 오른쪽 변은
  // 그 변에 닿은 첫 항목부터 (그 사이는 안쪽 부스 테두리가 마감한다)
  const rooms = kinds.includes("room")
  const topTo = rooms ? Math.max(...booths.filter((i) => i.y === y0).map((i) => i.x + i.w)) : x1
  const rightFrom = rooms ? Math.min(...booths.filter((i) => i.x + i.w === x1).map((i) => i.y)) : y0
  const sides = [
    { horiz: true, at: y0, from: x0, to: topTo },
    { horiz: true, at: y1, from: x0, to: x1 },
    { horiz: false, at: x0, from: y0, to: y1 },
    { horiz: false, at: x1, from: rightFrom, to: y1 },
  ]
  let d = ""
  for (const s of sides) {
    const on = (i: ResolvedItem) =>
      s.horiz ? i.y <= s.at && i.y + i.h >= s.at : i.x <= s.at && i.x + i.w >= s.at
    const span = (i: Rect) => (s.horiz ? [i.x, i.x + i.w] : [i.y, i.y + i.h])
    // 이 변에 닿은 부스 구간과, 이 변 위에 놓인 파티션 구간
    const edge = [
      ...booths.filter(on),
      ...walls.map(extentOf).filter((e) => (s.horiz ? !e.h && e.y === s.at : !e.w && e.x === s.at)),
    ].map(span)
    // 입구·출구 구간을 양옆 부스 끝까지 넓힌다
    const cuts = gates
      .filter(on)
      .map(span)
      .map(([a, b]) => [
        Math.max(s.from, ...edge.filter((e) => e[1] <= a).map((e) => e[1])),
        Math.min(s.to, ...edge.filter((e) => e[0] >= b).map((e) => e[0])),
      ])
      .sort((a, b) => a[0] - b[0])
    let p = s.from
    for (const [a, b] of [...cuts, [s.to, s.to]]) {
      const end = Math.min(a, s.to)
      if (end > p) {
        const [ax, ay, bx, by] = s.horiz ? [p, s.at, end, s.at] : [s.at, p, s.at, end]
        d += `M${ax * CELL} ${ay * CELL}L${bx * CELL} ${by * CELL}`
      }
      p = Math.max(p, b)
    }
  }
  const joins: number[] = []
  const attached = new Map<string, Rect>()
  if (kinds.includes("room")) {
    // 룸 옆 세로 파티션이 부스 테두리(윗변)까지 내려오면 그 선을 그대로 이어 그린다 (룸 사이 구분선)
    const hallTop = Math.min(...items.filter((i) => i.type === "booth").map((i) => i.y))
    for (const w of walls.map(extentOf)) {
      if (w.w || w.x <= x0 || w.x >= x1 || w.y >= hallTop || w.y + w.h < hallTop) continue
      joins.push(w.x)
      d += `M${w.x * CELL} ${w.y * CELL}L${w.x * CELL} ${hallTop * CELL}`
    }
    // 테두리 왼쪽 바깥의 화장실은 테두리에 붙여 그리고, 둘레를 같은 선으로 잇는다
    for (const t of items) {
      if (t.type !== "toilet" || t.x + t.w > x0 || t.y < y0 || t.y + t.h > y1) continue
      attached.set(t.id, { x: t.x, y: t.y, w: x0 - t.x, h: t.h })
      const [l, r, top, bot] = [t.x * CELL, x0 * CELL, t.y * CELL, (t.y + t.h) * CELL]
      d += `M${r} ${top}L${l} ${top}L${l} ${bot}L${r} ${bot}`
    }
  }
  return { d, box: { x: x0, y: y0, w: x1 - x0, h: y1 - y0 }, joins, attached }
}

function zoomView(v: View, at: { x: number; y: number }, factor: number, min: number): View {
  const s = Math.min(MAX, Math.max(min, v.s * factor))
  const k = s / v.s
  return { s, x: at.x - (at.x - v.x) * k, y: at.y - (at.y - v.y) * k }
}
