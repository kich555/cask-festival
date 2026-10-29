"use client"

// 부스 배치도 편집기. 격자 위에 부스(기본 3×3칸)·룸·시설을 놓고, 부스마다 참가업체를 고른다.
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { FloorShape } from "@/components/2026/FloorPlanMap"
import {
  BOOTH,
  boothSlots,
  CELL,
  DEFAULT_LAYOUT,
  extentOf,
  type FloorBrand,
  type FloorItem,
  ITEM_TYPES,
  type ItemType,
  isPartition,
  type Layout,
  LIMITS,
  layerOf,
  nextBoothNo,
  occupies,
  PANELS,
  PARTITION,
  panelOf,
  resolveItems,
  SECTIONS,
} from "@/lib/floorPlan"

/** partition1 = 1m 파티션 (저장할 땐 type partition, no "1") */
type Tool = "select" | ItemType | "partition1"
const isWallTool = (t: Tool): t is "partition" | "partition1" =>
  t === "partition" || t === "partition1"
type Cell = { x: number; y: number }
type Drag =
  | { kind: "draw"; start: Cell; end: Cell }
  | { kind: "move"; id: string; grab: Cell; dx: number; dy: number }
  | { kind: "resize"; id: string; w: number; h: number }

const TOOLS: { key: Tool; label: string; hint: string }[] = [
  {
    key: "select",
    label: "선택·이동",
    hint: "항목을 눌러 선택하고 끌어서 옮깁니다. 오른쪽 아래 모서리를 끌면 크기 조절.",
  },
  {
    key: "booth",
    label: "부스",
    hint: "칸을 누르면 3×3 부스 하나, 끌어서 범위를 칠하면 3칸 단위로 부스가 여러 개 생깁니다.",
  },
  { key: "room", label: "룸", hint: "끌어서 룸 크기만큼 사각형을 그립니다." },
  {
    key: "zone",
    label: "구역",
    hint: "라운지·칠링 존처럼 사람이 지나다닐 수 있는 구역을 그립니다.",
  },
  { key: "toilet", label: "화장실", hint: "끌어서 화장실 위치를 그립니다." },
  { key: "info", label: "인포", hint: "끌어서 인포메이션 위치를 그립니다." },
  { key: "entrance", label: "입구", hint: "길찾기 기본 출발점이 됩니다." },
  { key: "exit", label: "출구", hint: "끌어서 출구 위치를 그립니다." },
  {
    key: "partition",
    label: "파티션 1.2m",
    hint: "끌면 1.2칸(1.2m) 단위로 벽이 그려집니다. 시작점은 다른 파티션의 끝·선 위나 격자 교차점에 붙으니, 모서리를 맞출 땐 기존 파티션 끝에서 시작해 끌어 주세요. Option(Alt)을 누른 채 끌면 시작점이 가운데가 됩니다(H자). 부스와 겹쳐도 됩니다.",
  },
  {
    key: "partition1",
    label: "파티션 1m",
    hint: "끌면 1칸(1m) 단위로 벽이 그려집니다. 붙는 방식·Option(Alt) 가운데 그리기는 1.2m 파티션과 같습니다.",
  },
]

/** 파티션을 옮기는 가장 작은 단위 (0.1칸 = 10cm) */
const FINE = 0.1
const r2 = (v: number) => Math.round(v * 100) / 100
const snapFine = (v: number) => r2(Math.round(v / FINE) * FINE)

/** 캔버스 최대 확대 배율 */
const ZOOM_MAX = 5

const input =
  "w-full border border-black/15 rounded px-2 py-1.5 text-[13px] bg-white disabled:bg-[#f3f1f1] disabled:text-[#999]"

const range = (n: number) => [...Array(n).keys()]
const uid = () => `i${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const cellsOf = (r: { x: number; y: number; w: number; h: number }) => {
  const out: string[] = []
  for (let i = r.x; i < r.x + r.w; i++) for (let j = r.y; j < r.y + r.h; j++) out.push(`${i},${j}`)
  return out
}

/** 다른 항목과 겹치지 않고 격자 안에 들어가는지. 파티션은 격자 안이기만 하면 된다 */
function fits(layout: Layout, r: FloorItem | Omit<FloorItem, "id">, ignore?: string) {
  if (isPartition(r)) {
    const e = extentOf(r)
    return (
      r.x >= 0 &&
      r.y >= 0 &&
      Math.max(r.w, r.h) >= 1 &&
      Math.min(r.w, r.h) === 0 &&
      e.x + e.w <= layout.cols + 1e-6 &&
      e.y + e.h <= layout.rows + 1e-6
    )
  }
  if (r.x < 0 || r.y < 0 || r.w < 1 || r.h < 1) return false
  if (r.x + r.w > layout.cols || r.y + r.h > layout.rows) return false
  // 구역은 바닥 공간이라 무엇과도 겹쳐도 된다
  if (!occupies(r)) return true
  const taken = new Set(layout.items.filter((i) => i.id !== ignore && occupies(i)).flatMap(cellsOf))
  return cellsOf(r).every((c) => !taken.has(c))
}

type Target = "site" | "exhibitor"
type Visibility = Record<Target, boolean>

export default function FloorPlanAdmin({
  initial,
  brands,
  initialVisibility,
}: {
  initial: Layout
  brands: FloorBrand[]
  /** 홈페이지·참가사 페이지에 각각 공개 중인지 */
  initialVisibility: Visibility
}) {
  const [layout, setLayoutRaw] = useState(initial)
  const [saved, setSaved] = useState(initial)
  const [history, setHistory] = useState<Layout[]>([])
  const [tool, setTool] = useState<Tool>("select")
  /** 새 부스에 붙일 번호 섹션 (A01, B01 …) */
  const [section, setSection] = useState("A")
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [lang, setLang] = useState<"ko" | "en">("ko")
  /** 캔버스 확대 배율. 확대하면 캔버스 상자 안에서 스크롤한다 */
  const [zoom, setZoom] = useState(1)
  const scrollRef = useRef<HTMLDivElement>(null)
  const zoomRef = useRef(zoom)
  zoomRef.current = zoom
  /** 배율을 바꾸되 at(상자 안 좌표, 기본은 가운데)이 가리키던 자리를 그대로 둔다 */
  const zoomTo = useCallback((next: number, at?: { x: number; y: number }) => {
    const box = scrollRef.current
    const z = Math.min(ZOOM_MAX, Math.max(1, Math.round(next * 100) / 100))
    const prev = zoomRef.current
    if (!box || z === prev) return
    const px = at?.x ?? box.clientWidth / 2
    const py = at?.y ?? box.clientHeight / 2
    const fx = (box.scrollLeft + px) / prev
    const fy = (box.scrollTop + py) / prev
    zoomRef.current = z
    setZoom(z)
    requestAnimationFrame(() => {
      box.scrollLeft = fx * z - px
      box.scrollTop = fy * z - py
    })
  }, [])
  // Ctrl/⌘ + 휠(트랙패드 오므리기)로 포인터 위치를 기준으로 확대·축소
  useEffect(() => {
    const box = scrollRef.current
    if (!box) return
    const onWheel = (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      const r = box.getBoundingClientRect()
      zoomTo(zoomRef.current * Math.exp(-e.deltaY * 0.01), {
        x: e.clientX - r.left,
        y: e.clientY - r.top,
      })
    }
    box.addEventListener("wheel", onWheel, { passive: false })
    return () => box.removeEventListener("wheel", onWheel)
  }, [zoomTo])
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null)
  const [saving, setSaving] = useState(false)
  const [visibility, setVisibility] = useState(initialVisibility)
  const [toggling, setToggling] = useState<Target | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  /** Option(Alt)을 누른 채 파티션을 그리면 시작점을 가운데로 */
  const altRef = useRef(false)

  const dirty = JSON.stringify(layout) !== JSON.stringify(saved)
  // 파티션(벽)은 부스 위에 보이도록 마지막에 그린다
  const items = useMemo(
    () => resolveItems(layout, brands).sort((a, b) => layerOf(a) - layerOf(b)),
    [layout, brands],
  )
  const selected = layout.items.find((i) => i.id === selectedId) ?? null
  const brandBySlug = useMemo(() => new Map(brands.map((b) => [b.slug, b])), [brands])
  const usedBy = useMemo(() => {
    const m = new Map<string, string[]>()
    for (const i of layout.items) if (i.brand) m.set(i.brand, [...(m.get(i.brand) ?? []), i.no])
    return m
  }, [layout])

  /** 변경 + 되돌리기 기록 */
  const layoutRef = useRef(layout)
  layoutRef.current = layout
  const commit = useCallback((next: Layout) => {
    const prev = layoutRef.current
    setHistory((h) => [...h.slice(-49), prev])
    setLayoutRaw(next)
  }, [])
  const undo = useCallback(() => {
    if (!history.length) return
    setLayoutRaw(history[history.length - 1])
    setHistory(history.slice(0, -1))
  }, [history])

  const updateItem = (id: string, patch: Partial<FloorItem>) => {
    const cur = layout.items.find((i) => i.id === id)
    if (!cur) return false
    const next = { ...cur, ...patch }
    if (!fits(layout, next, id)) {
      setNotice({ kind: "error", text: "격자를 벗어나거나 다른 항목과 겹쳐서 바꿀 수 없습니다." })
      return false
    }
    commit({ ...layout, items: layout.items.map((i) => (i.id === id ? next : i)) })
    return true
  }

  const removeItem = useCallback(
    (id: string) => {
      commit({ ...layout, items: layout.items.filter((i) => i.id !== id) })
      setSelectedId(null)
    },
    [layout, commit],
  )

  // 키보드: Delete 삭제, 방향키 이동, Ctrl/Cmd+Z 되돌리기
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "z") {
        e.preventDefault()
        undo()
        return
      }
      if (!selected) return
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault()
        removeItem(selected.id)
      }
      const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[
        e.key
      ]
      if (d) {
        e.preventDefault()
        // Shift 를 누르면 부스 한 개(3칸)씩. 파티션은 10cm(0.1칸)씩, Shift 면 한 칸
        const wall = isPartition(selected)
        const step = wall ? (e.shiftKey ? 1 : FINE) : e.shiftKey ? BOOTH : 1
        const next = {
          ...selected,
          x: r2(selected.x + d[0] * step),
          y: r2(selected.y + d[1] * step),
        }
        if (fits(layout, next, selected.id))
          commit({ ...layout, items: layout.items.map((i) => (i.id === selected.id ? next : i)) })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, layout, commit, undo, removeItem])

  // ── 캔버스 조작 ──
  const cellAt = (e: React.PointerEvent): Cell => {
    const r = svgRef.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    const x = Math.floor(((e.clientX - r.left) / r.width) * layout.cols)
    const y = Math.floor(((e.clientY - r.top) / r.height) * layout.rows)
    return {
      x: Math.min(layout.cols - 1, Math.max(0, x)),
      y: Math.min(layout.rows - 1, Math.max(0, y)),
    }
  }
  /** 포인터 위치 (칸 단위, 소수) */
  const posAt = (e: React.PointerEvent) => {
    const r = svgRef.current?.getBoundingClientRect()
    if (!r) return { x: 0, y: 0 }
    return {
      x: ((e.clientX - r.left) / r.width) * layout.cols,
      y: ((e.clientY - r.top) / r.height) * layout.rows,
    }
  }
  /**
   * 파티션을 놓을 점: 기존 파티션 끝점 → 기존 파티션 선 위 → 격자 교차점 순으로 붙는다.
   * 가로·세로 파티션이 만나는 모서리를 맞추기 위함
   */
  const vertexAt = (e: React.PointerEvent): Cell => {
    const p = posAt(e)
    const walls = layout.items.filter(isPartition).map(extentOf)
    let best: Cell | null = null
    let bestD = 0.6
    for (const r of walls)
      for (const q of [
        { x: r.x, y: r.y },
        { x: r.x + r.w, y: r.y + r.h },
      ]) {
        const d = Math.hypot(q.x - p.x, q.y - p.y)
        if (d < bestD) {
          bestD = d
          best = q
        }
      }
    if (best) return best
    for (const r of walls) {
      // 선 위로 수직 투영
      const q = r.w
        ? { x: Math.min(r.x + r.w, Math.max(r.x, p.x)), y: r.y }
        : { x: r.x, y: Math.min(r.y + r.h, Math.max(r.y, p.y)) }
      if (Math.hypot(q.x - p.x, q.y - p.y) < 0.4) {
        // 선 위에서는 다른 축을 격자에 맞춰 둔다
        return r.w ? { x: Math.round(q.x), y: q.y } : { x: q.x, y: Math.round(q.y) }
      }
    }
    return {
      x: Math.min(layout.cols, Math.max(0, Math.round(p.x))),
      y: Math.min(layout.rows, Math.max(0, Math.round(p.y))),
    }
  }
  /** 파티션 선 가까이(반 칸 안)를 눌렀는지 */
  const partitionAt = (p: { x: number; y: number }) =>
    layout.items.find((i) => {
      if (!isPartition(i)) return false
      const r = extentOf(i)
      return (
        p.x >= r.x - 0.4 && p.x <= r.x + r.w + 0.4 && p.y >= r.y - 0.4 && p.y <= r.y + r.h + 0.4
      )
    })
  /** 누른 칸의 항목. 구역 위에 부스가 있으면 부스를 고른다 */
  const itemAt = (c: Cell) => {
    const hits = layout.items.filter(
      (i) => c.x >= i.x && c.x < i.x + i.w && c.y >= i.y && c.y < i.y + i.h,
    )
    return hits.find(occupies) ?? hits[0]
  }

  const onDown = (e: React.PointerEvent) => {
    altRef.current = e.altKey
    if (e.button !== 0) return
    svgRef.current?.setPointerCapture(e.pointerId)
    const c = cellAt(e)
    setNotice(null)
    if (tool === "select") {
      const hit = partitionAt(posAt(e)) ?? itemAt(c)
      setSelectedId(hit?.id ?? null)
      // 파티션은 소수 위치를 그대로 잡아 10cm 단위로 옮긴다
      if (hit)
        setDrag({
          kind: "move",
          id: hit.id,
          grab: isPartition(hit) ? posAt(e) : c,
          dx: 0,
          dy: 0,
        })
    } else {
      const v = isWallTool(tool) ? vertexAt(e) : c
      setDrag({ kind: "draw", start: v, end: v })
    }
  }

  const onResizeDown = (e: React.PointerEvent, it: FloorItem) => {
    e.stopPropagation()
    svgRef.current?.setPointerCapture(e.pointerId)
    setDrag({ kind: "resize", id: it.id, w: it.w, h: it.h })
  }

  const onMove = (e: React.PointerEvent) => {
    altRef.current = e.altKey
    if (!drag) return
    const c = cellAt(e)
    if (drag.kind === "draw") setDrag({ ...drag, end: isWallTool(tool) ? vertexAt(e) : c })
    else if (drag.kind === "move") {
      const it = layout.items.find((i) => i.id === drag.id)
      if (it && isPartition(it)) {
        const p = posAt(e)
        setDrag({ ...drag, dx: snapFine(p.x - drag.grab.x), dy: snapFine(p.y - drag.grab.y) })
      } else setDrag({ ...drag, dx: c.x - drag.grab.x, dy: c.y - drag.grab.y })
    } else {
      const it = layout.items.find((i) => i.id === drag.id)
      if (it && isPartition(it)) {
        // 파티션: 놓인 방향으로만 1.2칸(1장)씩 늘이고 줄인다
        const p = posAt(e)
        const n = Math.max(1, Math.round((it.w ? p.x - it.x : p.y - it.y) / panelOf(it)))
        setDrag({ ...drag, w: it.w ? n : 0, h: it.w ? 0 : n })
      } else if (it)
        setDrag({ ...drag, w: Math.max(1, c.x - it.x + 1), h: Math.max(1, c.y - it.y + 1) })
    }
  }

  const onUp = () => {
    const d = drag
    setDrag(null)
    if (!d) return
    if (d.kind === "move") {
      if (d.dx || d.dy) {
        const it = layout.items.find((i) => i.id === d.id)
        if (it) updateItem(it.id, { x: r2(it.x + d.dx), y: r2(it.y + d.dy) })
      }
      return
    }
    if (d.kind === "resize") {
      updateItem(d.id, { w: d.w, h: d.h })
      return
    }
    // 그리기
    const x = Math.min(d.start.x, d.end.x)
    const y = Math.min(d.start.y, d.end.y)
    const w = Math.abs(d.start.x - d.end.x) + 1
    const h = Math.abs(d.start.y - d.end.y) + 1
    if (tool === "select") return
    if (isWallTool(tool)) {
      const wall = partitionOf(
        d.start,
        d.end,
        altRef.current,
        tool === "partition1" ? 1 : PARTITION,
      )
      if (!fits(layout, wall)) {
        setNotice({ kind: "error", text: "격자 밖으로 나가서 파티션을 놓을 수 없습니다." })
        return
      }
      const item = { ...wall, id: uid() }
      commit({ ...layout, items: [...layout.items, item] })
      setSelectedId(item.id)
      return
    }
    if (tool === "booth") {
      // 칠한 범위를 3×3 자리로 나눠 빈 자리마다 부스 하나 (왼→오, 위→아래 순으로 번호)
      const added: FloorItem[] = []
      let no = Number.parseInt(nextBoothNo(layout.items, section).slice(section.length), 10)
      for (const slot of boothSlots(x, y, w, h)) {
        const booth: FloorItem = {
          id: uid(),
          type: "booth",
          no: "",
          ...slot,
          brand: null,
          ko: "",
          en: "",
        }
        if (!fits({ ...layout, items: [...layout.items, ...added] }, booth)) continue
        added.push({ ...booth, no: `${section}${String(no++).padStart(2, "0")}` })
      }
      if (!added.length) {
        setNotice({ kind: "error", text: "부스를 놓을 빈 자리가 없습니다." })
        return
      }
      commit({ ...layout, items: [...layout.items, ...added] })
      setSelectedId(added[added.length - 1].id)
      return
    }
    const meta = ITEM_TYPES[tool]
    const item: FloorItem = {
      id: uid(),
      type: tool,
      no: "",
      x,
      y,
      w,
      h,
      brand: null,
      ko: tool === "room" ? "" : meta.ko,
      en: tool === "room" ? "" : meta.en,
    }
    if (!fits(layout, item)) {
      setNotice({ kind: "error", text: "다른 항목과 겹치는 자리에는 놓을 수 없습니다." })
      return
    }
    commit({ ...layout, items: [...layout.items, item] })
    setSelectedId(item.id)
    setTool("select")
  }

  // 끌고 있는 동안 보여 줄 미리보기
  let preview: { x: number; y: number; w: number; h: number; ok: boolean; line?: boolean } | null =
    null
  if (drag?.kind === "draw" && isWallTool(tool)) {
    const wall = partitionOf(
      drag.start,
      drag.end,
      altRef.current,
      tool === "partition1" ? 1 : PARTITION,
    )
    preview = { ...extentOf(wall), ok: fits(layout, wall), line: true }
  } else if (drag?.kind === "draw") {
    const x = Math.min(drag.start.x, drag.end.x)
    const y = Math.min(drag.start.y, drag.end.y)
    const w = Math.abs(drag.start.x - drag.end.x) + 1
    const h = Math.abs(drag.start.y - drag.end.y) + 1
    if (tool === "booth") {
      const slots = boothSlots(x, y, w, h)
      const last = slots[slots.length - 1]
      preview = {
        x,
        y,
        w: last.x + BOOTH - x,
        h: last.y + BOOTH - y,
        ok: slots.some((r) => fits(layout, { ...EMPTY, ...r })),
      }
    } else preview = { x, y, w, h, ok: fits(layout, { ...EMPTY, x, y, w, h }) }
  } else if (drag?.kind === "move" || drag?.kind === "resize") {
    const it = layout.items.find((i) => i.id === drag.id)
    if (it) {
      const r =
        drag.kind === "move"
          ? { ...it, x: it.x + drag.dx, y: it.y + drag.dy }
          : { ...it, w: drag.w, h: drag.h }
      if (drag.kind === "resize" || drag.dx || drag.dy)
        preview = { ...extentOf(r), ok: fits(layout, r, it.id), line: isPartition(it) }
    }
  }

  const resize = (cols: number, rows: number) => {
    const c = Math.min(LIMITS.maxCols, Math.max(LIMITS.minCols, cols || 0))
    const r = Math.min(LIMITS.maxRows, Math.max(LIMITS.minRows, rows || 0))
    if (layout.items.map(extentOf).some((i) => i.x + i.w > c + 1e-6 || i.y + i.h > r + 1e-6)) {
      setNotice({
        kind: "error",
        text: "격자 밖으로 나가는 항목이 있어 줄일 수 없습니다. 먼저 옮기거나 지워 주세요.",
      })
      return
    }
    commit({ ...layout, cols: c, rows: r })
  }

  /** 모든 항목을 한 칸씩 밀기 (가장자리에 줄을 넣거나 뺄 때) */
  const shiftAll = (dx: number, dy: number) => {
    const moved = layout.items.map((i) => ({ ...i, x: i.x + dx, y: i.y + dy }))
    const cols = layout.cols + Math.max(0, dx)
    const rows = layout.rows + Math.max(0, dy)
    if (moved.some((i) => i.x < 0 || i.y < 0)) {
      setNotice({ kind: "error", text: "가장자리 줄이 비어 있지 않아 뺄 수 없습니다." })
      return
    }
    commit({
      ...layout,
      cols: dx < 0 ? cols + dx : cols,
      rows: dy < 0 ? rows + dy : rows,
      items: moved,
    })
  }

  async function togglePublic(target: Target) {
    const next = !visibility[target]
    const where = target === "site" ? "홈페이지" : "참가사 페이지"
    const ok = window.confirm(
      target === "site"
        ? next
          ? "부스 배치도를 홈페이지에 게시할까요?\n상단 메뉴의 부스 배치도 탭에서 바로 볼 수 있게 됩니다."
          : "홈페이지에서 부스 배치도를 다시 숨길까요?\n탭을 누르면 '추후 공개 예정입니다.' 안내가 뜹니다."
        : next
          ? "부스 배치도를 참가사 페이지에 게시할까요?\n로그인한 참가사가 부스 배치도 탭에서 볼 수 있게 됩니다."
          : "참가사 페이지에서 부스 배치도를 다시 숨길까요?\n'추후 업데이트 예정' 안내로 돌아갑니다.",
    )
    if (!ok) return
    setToggling(target)
    setNotice(null)
    try {
      const res = await fetch("/api/admin/floorplan/visibility", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target, public: next }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error ?? "변경 실패")
      setVisibility((v) => ({ ...v, [target]: next }))
      setNotice({
        kind: "ok",
        text: next ? `${where}에 게시했습니다.` : `${where}에서 숨겼습니다.`,
      })
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : "변경 실패" })
    } finally {
      setToggling(null)
    }
  }

  async function save() {
    setSaving(true)
    setNotice(null)
    try {
      const res = await fetch("/api/admin/floorplan", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) throw new Error(data.error ?? "저장 실패")
      setLayoutRaw(data.layout)
      setSaved(data.layout)
      setNotice({
        kind: "ok",
        text: data.renumbered
          ? `저장했습니다. 위치에 맞춰 부스 번호 ${data.renumbered}개를 다시 매겼습니다.`
          : "저장했습니다. 부스 배치도 페이지에 바로 반영됩니다.",
      })
    } catch (e) {
      setNotice({ kind: "error", text: e instanceof Error ? e.message : "저장 실패" })
    } finally {
      setSaving(false)
    }
  }

  const VW = layout.cols * CELL
  const VH = layout.rows * CELL
  const booths = layout.items
    .filter((i) => i.type === "booth")
    .sort((a, b) => a.no.localeCompare(b.no, undefined, { numeric: true }))
  const dupNos = new Set(booths.map((b) => b.no).filter((n, i, arr) => n && arr.indexOf(n) !== i))
  const activeHint = TOOLS.find((t) => t.key === tool)?.hint
  /** 파티션 장 수 합계 (한 장 길이별) */
  const panelCount = new Map<number, number>(PANELS.map((m) => [m, 0]))
  for (const i of layout.items)
    if (isPartition(i))
      panelCount.set(panelOf(i), (panelCount.get(panelOf(i)) ?? 0) + Math.max(i.w, i.h))

  return (
    <div className="min-h-screen bg-[#f6f5f5] text-[#1a1a1a]">
      <header className="bg-[#1a1a1a] text-white sticky top-0 z-20">
        <div className="max-w-[1600px] mx-auto px-5 md:px-8 py-4 flex flex-wrap items-center gap-3">
          <div className="flex-1 min-w-[260px]">
            <h1 className="text-[17px] font-extrabold tracking-tight">부스 배치도</h1>
            <p className="text-white/50 text-[12px] mt-0.5">
              부스 한 개 = 3×3칸 (진한 선) · 룸·구역은 한 칸 단위로 조절 · 부스를 고르면 브랜드
              관리의 업체명·로고가 그대로 쓰입니다
            </p>
          </div>
          {notice && (
            <span
              className={`text-[13px] ${notice.kind === "ok" ? "text-[#8fe3a8]" : "text-[#ff9b9b]"}`}
            >
              {notice.text}
            </span>
          )}
          {/* 공개 전환: 홈페이지·참가사 페이지 따로 (되돌리기는 Ctrl/⌘+Z) */}
          {(["site", "exhibitor"] as const).map((target) => {
            const on = visibility[target]
            const where = target === "site" ? "홈페이지" : "참가사 페이지"
            return (
              <button
                key={target}
                type="button"
                onClick={() => togglePublic(target)}
                disabled={toggling !== null}
                className={`rounded px-3 py-2 text-[13px] font-bold disabled:opacity-40 ${
                  on ? "border border-white/30" : "bg-white text-[#1a1a1a] border border-white"
                }`}
              >
                {toggling === target
                  ? "변경 중…"
                  : on
                    ? `${where} 게시 중 · 숨기기`
                    : `${where} 게시`}
              </button>
            )
          })}
          <button
            type="button"
            onClick={save}
            disabled={!dirty || saving}
            className="bg-[#7d0b1c] text-white rounded px-5 py-2 text-[13px] font-bold disabled:opacity-40"
          >
            {saving ? "저장 중…" : dirty ? "저장" : "저장됨"}
          </button>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-5 md:px-8 py-5 grid xl:grid-cols-[minmax(0,1fr)_380px] gap-5 items-start">
        {/* 편집 캔버스 */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {TOOLS.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => setTool(t.key)}
                className={`px-3 py-1.5 rounded text-[13px] font-bold border transition-colors ${
                  tool === t.key
                    ? "bg-[#7d0b1c] text-white border-[#7d0b1c]"
                    : "bg-white border-black/15 hover:border-[#7d0b1c]"
                }`}
              >
                {t.key !== "select" && "+ "}
                {t.label}
              </button>
            ))}
            {tool === "booth" && (
              <label className="flex items-center gap-1.5 text-[13px] font-bold ml-1">
                섹션
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="border border-black/15 rounded px-2 py-1.5 bg-white"
                >
                  {SECTIONS.map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
                <span className="font-normal text-[#666]">
                  다음 번호 {nextBoothNo(layout.items, section)}
                </span>
              </label>
            )}
            <span className="flex-1" />
            {(["ko", "en"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2.5 py-1 rounded text-[12px] font-bold border ${
                  lang === l
                    ? "bg-[#1a1a1a] text-white border-[#1a1a1a]"
                    : "bg-white border-black/15"
                }`}
              >
                {l === "ko" ? "국문" : "영문"}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <p className="flex-1 text-[12px] text-[#666]">{activeHint}</p>
            <div className="flex items-center gap-1 text-[12px] font-bold">
              <button
                type="button"
                onClick={() => zoomTo(zoom / 1.5)}
                disabled={zoom <= 1}
                className="w-7 h-7 rounded border border-black/15 bg-white disabled:opacity-40"
                aria-label="축소"
              >
                −
              </button>
              <button
                type="button"
                onClick={() => zoomTo(1)}
                className="min-w-[52px] h-7 px-2 rounded border border-black/15 bg-white"
                title="전체 보기"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={() => zoomTo(zoom * 1.5)}
                disabled={zoom >= ZOOM_MAX}
                className="w-7 h-7 rounded border border-black/15 bg-white disabled:opacity-40"
                aria-label="확대"
              >
                +
              </button>
            </div>
          </div>

          <div
            ref={scrollRef}
            className={`border border-[var(--fp-line)] ${zoom > 1 ? "overflow-auto max-h-[78vh]" : "overflow-hidden"}`}
          >
            <svg
              ref={svgRef}
              viewBox={`0 0 ${VW} ${VH}`}
              className={`fp-theme block touch-none select-none ${tool === "select" ? "cursor-default" : "cursor-crosshair"}`}
              style={{ aspectRatio: `${VW} / ${VH}`, width: `${zoom * 100}%`, maxWidth: "none" }}
              onPointerDown={onDown}
              onPointerMove={onMove}
              onPointerUp={onUp}
              onPointerCancel={() => setDrag(null)}
              role="application"
              aria-label="부스 배치 편집"
            >
              <rect width={VW} height={VH} style={{ fill: "var(--fp-map)" }} />
              {/* 격자 */}
              {/* 격자: 얇은 선 = 한 칸, 진한 선 = 부스 한 개(3칸) */}
              <g style={{ stroke: "var(--fp-grid)" }} pointerEvents="none">
                {range(layout.cols + 1).map((i) => (
                  <line
                    key={`c${i}`}
                    x1={i * CELL}
                    y1={0}
                    x2={i * CELL}
                    y2={VH}
                    strokeWidth={i % BOOTH ? 0.15 : 0.45}
                  />
                ))}
                {range(layout.rows + 1).map((j) => (
                  <line
                    key={`r${j}`}
                    x1={0}
                    y1={j * CELL}
                    x2={VW}
                    y2={j * CELL}
                    strokeWidth={j % BOOTH ? 0.15 : 0.45}
                  />
                ))}
              </g>
              <g style={{ fill: "var(--fp-muted)" }} fontSize={2.6} pointerEvents="none">
                {range(Math.ceil(layout.cols / BOOTH)).map((i) => (
                  <text key={`cx${i}`} x={(i * BOOTH + BOOTH / 2) * CELL} y={3} textAnchor="middle">
                    {i + 1}
                  </text>
                ))}
                {range(Math.ceil(layout.rows / BOOTH)).map((j) => (
                  <text
                    key={`ry${j}`}
                    x={1.2}
                    y={(j * BOOTH + BOOTH / 2) * CELL}
                    dominantBaseline="central"
                  >
                    {j + 1}
                  </text>
                ))}
              </g>

              {items.map((it) => (
                <g
                  key={it.id}
                  opacity={drag && "id" in drag && drag.id === it.id && preview ? 0.35 : 1}
                >
                  <FloorShape item={it} lang={lang} selected={it.id === selectedId} />
                  {it.type === "booth" && dupNos.has(it.no) && (
                    <rect
                      x={it.x * CELL + 1}
                      y={it.y * CELL + 1}
                      width={it.w * CELL - 2}
                      height={it.h * CELL - 2}
                      fill="none"
                      stroke="#ffb020"
                      strokeWidth={1.2}
                      strokeDasharray="2 1.5"
                      pointerEvents="none"
                    />
                  )}
                </g>
              ))}

              {selected && !drag && (
                <rect
                  x={(selected.x + extentOf(selected).w) * CELL - (isPartition(selected) ? 2 : 4)}
                  y={(selected.y + extentOf(selected).h) * CELL - (isPartition(selected) ? 2 : 4)}
                  width={4}
                  height={4}
                  fill="#fff"
                  stroke="#7d0b1c"
                  strokeWidth={0.8}
                  className="cursor-nwse-resize"
                  onPointerDown={(e) => onResizeDown(e, selected)}
                />
              )}

              {preview?.line && (
                <line
                  x1={preview.x * CELL}
                  y1={preview.y * CELL}
                  x2={(preview.x + preview.w) * CELL}
                  y2={(preview.y + preview.h) * CELL}
                  style={{ stroke: preview.ok ? "var(--fp-accent)" : "#ff5a5a" }}
                  strokeWidth={2}
                  strokeDasharray="3 2"
                  pointerEvents="none"
                />
              )}
              {preview && !preview.line && (
                <rect
                  x={preview.x * CELL}
                  y={preview.y * CELL}
                  width={preview.w * CELL}
                  height={preview.h * CELL}
                  style={{
                    fill: preview.ok ? "var(--fp-accent-soft)" : "rgba(255,60,60,0.3)",
                    stroke: preview.ok ? "var(--fp-accent)" : "#ff5a5a",
                  }}
                  strokeWidth={1}
                  strokeDasharray="3 2"
                  pointerEvents="none"
                />
              )}
            </svg>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
            <label className="flex items-center gap-2">
              가로
              <input
                type="number"
                min={LIMITS.minCols}
                max={LIMITS.maxCols}
                value={layout.cols}
                onChange={(e) => resize(Number(e.target.value), layout.rows)}
                className="w-16 border border-black/15 rounded px-2 py-1"
              />
              칸
            </label>
            <label className="flex items-center gap-2">
              세로
              <input
                type="number"
                min={LIMITS.minRows}
                max={LIMITS.maxRows}
                value={layout.rows}
                onChange={(e) => resize(layout.cols, Number(e.target.value))}
                className="w-16 border border-black/15 rounded px-2 py-1"
              />
              칸
            </label>
            <span className="text-[#888]">
              왼쪽·위쪽 줄:
              <button type="button" onClick={() => shiftAll(1, 0)} className="ml-2 underline">
                왼쪽에 줄 추가
              </button>
              <button type="button" onClick={() => shiftAll(-1, 0)} className="ml-2 underline">
                왼쪽 줄 빼기
              </button>
              <button type="button" onClick={() => shiftAll(0, 1)} className="ml-2 underline">
                위쪽에 줄 추가
              </button>
              <button type="button" onClick={() => shiftAll(0, -1)} className="ml-2 underline">
                위쪽 줄 빼기
              </button>
            </span>
            <span className="flex-1" />
            <button
              type="button"
              onClick={() => {
                if (
                  window.confirm("처음 도면 기준 배치로 되돌릴까요? (저장 전까지는 되돌리기 가능)")
                ) {
                  commit(DEFAULT_LAYOUT)
                  setSelectedId(null)
                }
              }}
              className="text-[#888] underline"
            >
              처음 배치로 초기화
            </button>
          </div>
          <p className="mt-2 text-[12px] text-[#888]">
            확대: 오른쪽 위 +/− 또는 Ctrl/⌘+휠(트랙패드 오므리기) · 단축키: Delete 삭제 · 방향키 한
            칸 이동 (Shift+방향키 3칸, 파티션은 10cm·Shift 한 칸) · Ctrl/⌘+Z 되돌리기 · 주황 점선 =
            부스 번호 중복
          </p>
        </div>

        {/* 오른쪽: 선택 항목 + 부스 목록 */}
        <div className="space-y-4 xl:sticky xl:top-[88px]">
          <section className="bg-white border border-black/10 rounded-lg p-4">
            {selected ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="text-[14px] font-extrabold">
                    {ITEM_TYPES[selected.type].label}
                    {selected.type === "booth" && ` ${selected.no}`}
                  </h2>
                  <button
                    type="button"
                    onClick={() => removeItem(selected.id)}
                    className="text-[12px] font-bold text-[#c0392b] hover:underline"
                  >
                    삭제
                  </button>
                </div>
                {isPartition(selected) ? (
                  <div className="grid grid-cols-2 gap-2">
                    <label className="block text-[12px] font-bold text-[#666]">
                      방향
                      <select
                        className={`${input} mt-1`}
                        value={selected.w ? "h" : "v"}
                        onChange={(e) => {
                          const n = Math.max(selected.w, selected.h)
                          updateItem(
                            selected.id,
                            e.target.value === "h" ? { w: n, h: 0 } : { w: 0, h: n },
                          )
                        }}
                      >
                        <option value="h">가로</option>
                        <option value="v">세로</option>
                      </select>
                    </label>
                    <label className="col-span-2 block text-[12px] font-bold text-[#666]">
                      파티션 한 장 길이
                      <select
                        className={`${input} mt-1`}
                        value={panelOf(selected)}
                        onChange={(e) =>
                          updateItem(selected.id, { no: Number(e.target.value) === 1 ? "1" : "" })
                        }
                      >
                        {PANELS.map((m) => (
                          <option key={m} value={m}>
                            {m}m
                          </option>
                        ))}
                      </select>
                    </label>
                    <label className="block text-[12px] font-bold text-[#666]">
                      파티션 장 수
                      <input
                        type="number"
                        min={1}
                        className={`${input} mt-1`}
                        value={Math.max(selected.w, selected.h)}
                        onChange={(e) => {
                          const n = Math.max(1, Math.round(Number(e.target.value) || 1))
                          updateItem(selected.id, selected.w ? { w: n } : { h: n })
                        }}
                      />
                      <span className="block mt-1 font-normal text-[#999]">
                        길이 {(Math.max(selected.w, selected.h) * panelOf(selected)).toFixed(1)}m
                      </span>
                    </label>
                    {(["x", "y"] as const).map((k) => (
                      <label key={k} className="block text-[12px] font-bold text-[#666]">
                        시작 위치 {k === "x" ? "가로" : "세로"} (칸)
                        <input
                          type="number"
                          step={FINE}
                          min={0}
                          className={`${input} mt-1`}
                          value={selected[k]}
                          onChange={(e) =>
                            updateItem(selected.id, { [k]: r2(Number(e.target.value) || 0) })
                          }
                        />
                      </label>
                    ))}
                    <button
                      type="button"
                      onClick={() => {
                        const pos = centerOnCross(layout, selected)
                        if (pos) updateItem(selected.id, pos)
                        else
                          setNotice({
                            kind: "error",
                            text: "이 파티션과 교차하거나 맞닿은 다른 방향 파티션이 없습니다.",
                          })
                      }}
                      className="col-span-2 rounded border border-black/15 bg-white py-1.5 text-[12px] font-bold hover:border-[#7d0b1c]"
                    >
                      교차하는 파티션 기준 가운데 맞추기 (H자 반반)
                    </button>
                    <p className="col-span-2 font-normal text-[12px] text-[#999]">
                      끌거나 방향키로 10cm(0.1칸)씩, Shift+방향키로 한 칸씩 옮깁니다. 위치는 왼쪽 위
                      끝 기준이고 한 칸 = 1m입니다.
                    </p>
                  </div>
                ) : (
                  <>
                    <label className="block text-[12px] font-bold text-[#666]">
                      종류
                      <select
                        className={`${input} mt-1`}
                        value={selected.type}
                        onChange={(e) => {
                          const type = e.target.value as ItemType
                          updateItem(selected.id, {
                            type,
                            no:
                              type === "booth"
                                ? selected.no || nextBoothNo(layout.items, section)
                                : "",
                            brand: type === "booth" ? selected.brand : null,
                          })
                        }}
                      >
                        {Object.entries(ITEM_TYPES)
                          .filter(([k]) => k !== "partition")
                          .map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                      </select>
                    </label>
                    {selected.type === "booth" && (
                      <>
                        <label className="block text-[12px] font-bold text-[#666]">
                          부스 번호
                          <input
                            className={`${input} mt-1`}
                            value={selected.no}
                            onChange={(e) =>
                              updateItem(selected.id, { no: e.target.value.slice(0, 10) })
                            }
                          />
                          <span className="block mt-1 font-normal text-[#999]">
                            저장하면 위치에 맞춰 섹션 글자와 번호(입구에서 가까운 순)가 자동으로
                            바뀝니다.
                          </span>
                        </label>
                        <div className="block text-[12px] font-bold text-[#666]">
                          참가업체
                          <BrandSelect
                            value={selected.brand}
                            brands={brands}
                            usedBy={usedBy}
                            onChange={(brand) => updateItem(selected.id, { brand })}
                          />
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block text-[12px] font-bold text-[#666]">
                        국문 이름
                        <input
                          className={`${input} mt-1`}
                          disabled={Boolean(selected.brand)}
                          placeholder={
                            selected.brand
                              ? brandBySlug.get(selected.brand)?.nameKo
                              : ITEM_TYPES[selected.type].ko || "이름"
                          }
                          value={selected.brand ? "" : selected.ko}
                          onChange={(e) => updateItem(selected.id, { ko: e.target.value })}
                        />
                      </label>
                      <label className="block text-[12px] font-bold text-[#666]">
                        영문 이름
                        <input
                          className={`${input} mt-1`}
                          disabled={Boolean(selected.brand)}
                          placeholder={
                            selected.brand
                              ? brandBySlug.get(selected.brand)?.nameEn
                              : ITEM_TYPES[selected.type].en || "Name"
                          }
                          value={selected.brand ? "" : selected.en}
                          onChange={(e) => updateItem(selected.id, { en: e.target.value })}
                        />
                      </label>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <label className="block text-[12px] font-bold text-[#666]">
                        가로 칸
                        <input
                          type="number"
                          min={1}
                          className={`${input} mt-1`}
                          value={selected.w}
                          onChange={(e) =>
                            updateItem(selected.id, { w: Math.max(1, Number(e.target.value) || 1) })
                          }
                        />
                      </label>
                      <label className="block text-[12px] font-bold text-[#666]">
                        세로 칸
                        <input
                          type="number"
                          min={1}
                          className={`${input} mt-1`}
                          value={selected.h}
                          onChange={(e) =>
                            updateItem(selected.id, { h: Math.max(1, Number(e.target.value) || 1) })
                          }
                        />
                      </label>
                    </div>
                  </>
                )}
                {selected.brand && !brandBySlug.has(selected.brand) && (
                  <p className="text-[12px] text-[#b46a00]">
                    브랜드 관리에서 지워진 업체입니다. 다시 골라 주세요.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[13px] text-[#888] leading-relaxed">
                위 도구로 부스·룸·시설·파티션을 격자에 놓고, 항목을 누르면 여기에서
                번호·업체·이름·크기를 바꿀 수 있습니다.
              </p>
            )}
          </section>

          <section className="bg-white border border-black/10 rounded-lg px-4 py-3">
            <h2 className="text-[13px] font-extrabold mb-2">
              파티션 합계{" "}
              <span className="text-[#888] font-normal">
                {[...panelCount.values()].reduce((a, b) => a + b, 0)}장
              </span>
            </h2>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              {PANELS.map((m) => {
                const n = panelCount.get(m) ?? 0
                return (
                  <div key={m} className="rounded bg-[#f6f5f5] px-3 py-2">
                    <div className="text-[12px] font-bold text-[#666]">{m}m 파티션</div>
                    <div className="mt-0.5">
                      <b className="text-[16px]">{n}</b>장{" "}
                      <span className="text-[#888]">· 총 {(n * m).toFixed(1)}m</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="bg-white border border-black/10 rounded-lg">
            <h2 className="px-4 py-2.5 border-b border-black/10 text-[13px] font-extrabold">
              부스 목록 <span className="text-[#888] font-normal">{booths.length}개</span>
            </h2>
            <div className="max-h-[52vh] overflow-y-auto divide-y divide-black/5">
              {booths.map((b) => (
                <div
                  key={b.id}
                  className={`px-3 py-1.5 flex items-center gap-2 ${b.id === selectedId ? "bg-[#7d0b1c]/[0.07]" : ""}`}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedId(b.id)
                      setTool("select")
                    }}
                    className={`shrink-0 w-11 text-[12px] font-extrabold rounded py-1 ${
                      dupNos.has(b.no)
                        ? "bg-[#ffb020]/25 text-[#8a5a00]"
                        : "bg-[#7d0b1c]/[0.08] text-[#7d0b1c]"
                    }`}
                  >
                    {b.no || "?"}
                  </button>
                  <BrandSelect
                    value={b.brand}
                    brands={brands}
                    usedBy={usedBy}
                    custom={b.brand ? "" : b.ko || b.en}
                    onChange={(brand) => updateItem(b.id, { brand })}
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

/**
 * 끈 두 점으로 파티션을 만든다: 더 많이 끈 방향으로, 1.2칸 단위 반올림 (최소 1장).
 * 시작점 a 는 늘 그대로 두어, 왼쪽·위로 끌어도 a 에서 끝나게 한다 (모서리 맞춤).
 * centered 면 a 가 파티션의 가운데가 되도록 양쪽으로 뻗는다 (H자·十자)
 */
function partitionOf(a: Cell, b: Cell, centered = false, panel = PARTITION): Omit<FloorItem, "id"> {
  const horiz = Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)
  const d = horiz ? b.x - a.x : b.y - a.y
  const n = Math.max(1, Math.round(Math.abs(d) / (centered ? panel / 2 : panel)))
  const L = n * panel
  const from = (v: number) => (centered ? v - L / 2 : d < 0 ? v - L : v)
  const x = r2(horiz ? from(a.x) : a.x)
  const y = r2(horiz ? a.y : from(a.y))
  return {
    ...EMPTY,
    type: "partition",
    no: panel === 1 ? "1" : "",
    x,
    y,
    w: horiz ? n : 0,
    h: horiz ? 0 : n,
  }
}

/**
 * 파티션과 교차하거나 맞닿은 다른 방향 파티션을 찾아, 그 지점이 이 파티션의 한가운데가
 * 되는 위치를 돌려준다 (여럿이면 지금 가운데에서 가장 가까운 것)
 */
function centerOnCross(layout: Layout, it: FloorItem): { x: number; y: number } | null {
  const me = extentOf(it)
  const horiz = it.w > 0
  const L = horiz ? me.w : me.h
  const mid = horiz ? me.x + L / 2 : me.y + L / 2
  const tol = 0.05
  let best: number | null = null
  for (const o of layout.items) {
    if (o.id === it.id || !isPartition(o) || o.w > 0 === horiz) continue
    const r = extentOf(o)
    // 이 파티션 선(가로면 y, 세로면 x)이 상대 범위 안에 있어야 만난다
    const across = horiz ? me.y : me.x
    const lo = horiz ? r.y : r.x
    const hi = horiz ? r.y + r.h : r.x + r.w
    if (across < lo - tol || across > hi + tol) continue
    const at = horiz ? r.x : r.y // 상대가 지나는 내 축 위의 지점
    const start = horiz ? me.x : me.y
    if (at < start - tol || at > start + L + tol) continue
    if (best === null || Math.abs(at - mid) < Math.abs(best - mid)) best = at
  }
  if (best === null) return null
  const start = r2(best - L / 2)
  return horiz ? { x: start, y: it.y } : { x: it.x, y: start }
}

const EMPTY: Omit<FloorItem, "id"> = {
  type: "zone",
  no: "",
  x: 0,
  y: 0,
  w: 1,
  h: 1,
  brand: null,
  ko: "",
  en: "",
}

function BrandSelect({
  value,
  brands,
  usedBy,
  custom,
  onChange,
}: {
  value: string | null
  brands: FloorBrand[]
  usedBy: Map<string, string[]>
  /** 업체가 아닌 부스에 직접 입력한 이름 */
  custom?: string
  onChange: (brand: string | null) => void
}) {
  return (
    <select
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value || null)}
      className={`${input} mt-1`}
    >
      <option value="">
        {custom ? `직접 입력: ${custom}` : "— 참가업체 아님 (이름 직접 입력) —"}
      </option>
      {brands.map((b) => {
        const nos = usedBy.get(b.slug)
        return (
          <option key={b.slug} value={b.slug}>
            {b.nameKo}
            {b.nameEn ? ` · ${b.nameEn}` : ""}
            {b.visible ? "" : " (숨김)"}
            {nos && value !== b.slug ? ` — ${nos.join(", ")}번 배정됨` : ""}
          </option>
        )
      })}
    </select>
  )
}
