// 부스 배치도 데이터와 순수 로직. 서버·클라이언트가 함께 쓴다.
// 도면은 정사각형 격자이고, 부스 하나가 기본 BOOTH×BOOTH 칸(3×3)이다. 룸·구역은 칸 단위로
// 더 세밀하게 크기를 맞출 수 있다. 관리자가 격자 위에 배치하고, 공개 페이지는 그대로 그린다.
// 좌표·크기는 모두 칸 단위 정수.

/** 한 칸을 그릴 때의 SVG 단위 크기 */
export const CELL = 10
/** 부스 한 변의 칸 수 */
export const BOOTH = 3
/** 저장 형식의 격자 배율. 예전(부스 = 1칸) 파일은 grid 가 없어 읽을 때 BOOTH 배로 늘린다 */
const GRID = BOOTH

export type ItemType =
  | "booth"
  | "room"
  | "zone"
  | "toilet"
  | "info"
  | "entrance"
  | "exit"
  | "partition"

/** 파티션(벽) 한 장의 길이 (칸 = 1m 기준 1.2m) */
export const PARTITION = 1.2

export type FloorItem = {
  id: string
  type: ItemType
  /** 부스 번호 (부스만) */
  no: string
  x: number
  y: number
  w: number
  h: number
  /** 참가업체 slug (부스만). 있으면 브랜드 정보의 이름·로고를 쓴다 */
  brand: string | null
  ko: string
  en: string
}

export type Layout = { grid: number; cols: number; rows: number; items: FloorItem[] }

export type Rect = { x: number; y: number; w: number; h: number }

export const ITEM_TYPES: Record<
  ItemType,
  { label: string; ko: string; en: string; walkable: boolean }
> = {
  booth: { label: "부스", ko: "", en: "", walkable: false },
  room: { label: "룸", ko: "ROOM", en: "ROOM", walkable: false },
  zone: { label: "구역(라운지 등)", ko: "구역", en: "ZONE", walkable: true },
  toilet: { label: "화장실", ko: "화장실", en: "RESTROOM", walkable: false },
  info: { label: "인포메이션", ko: "인포", en: "INFO", walkable: false },
  entrance: { label: "입구", ko: "입구", en: "ENTRANCE", walkable: true },
  exit: { label: "출구", ko: "출구", en: "EXIT", walkable: true },
  partition: { label: "파티션(벽)", ko: "", en: "", walkable: true },
}

/**
 * 파티션은 칸이 아니라 격자 선 위에 놓는 선이다. (x, y) = 시작 꼭짓점,
 * 가로면 w = 장 수·h = 0, 세로면 h = 장 수·w = 0. 다른 항목과 겹쳐도 된다.
 */
export const isPartition = (i: { type: ItemType }) => i.type === "partition"

/** 파티션이 차지하는 범위(칸 단위, 소수 가능). 다른 항목은 그대로 */
export function extentOf(i: FloorItem | Omit<FloorItem, "id">): Rect {
  if (!isPartition(i)) return i
  return { x: i.x, y: i.y, w: i.w * PARTITION, h: i.h * PARTITION }
}

export const LIMITS = { minCols: 18, maxCols: 180, minRows: 18, maxRows: 180 }

/** 처음 도면(CC2026_floor_plan)을 격자에 옮긴 배치 */
export const DEFAULT_LAYOUT: Layout = {
  grid: GRID,
  cols: 66,
  rows: 51,
  items: [
    {
      id: "room-a",
      type: "room",
      no: "",
      x: 6,
      y: 0,
      w: 6,
      h: 9,
      brand: null,
      ko: "ROOM A",
      en: "ROOM A",
    },
    {
      id: "room-b",
      type: "room",
      no: "",
      x: 12,
      y: 0,
      w: 9,
      h: 9,
      brand: null,
      ko: "ROOM B",
      en: "ROOM B",
    },
    {
      id: "room-c",
      type: "room",
      no: "",
      x: 24,
      y: 0,
      w: 6,
      h: 9,
      brand: null,
      ko: "ROOM C",
      en: "ROOM C",
    },
    {
      id: "room-d",
      type: "room",
      no: "",
      x: 30,
      y: 0,
      w: 6,
      h: 9,
      brand: null,
      ko: "ROOM D",
      en: "ROOM D",
    },
    {
      id: "room-e",
      type: "room",
      no: "",
      x: 36,
      y: 0,
      w: 9,
      h: 9,
      brand: null,
      ko: "ROOM E",
      en: "ROOM E",
    },
    {
      id: "room-f",
      type: "room",
      no: "",
      x: 45,
      y: 0,
      w: 6,
      h: 9,
      brand: null,
      ko: "ROOM F",
      en: "ROOM F",
    },
    {
      id: "b101",
      type: "booth",
      no: "C13",
      x: 6,
      y: 12,
      w: 3,
      h: 3,
      brand: null,
      ko: "CRAFT BROS",
      en: "CRAFT BROS",
    },
    {
      id: "b102",
      type: "booth",
      no: "C12",
      x: 9,
      y: 12,
      w: 3,
      h: 3,
      brand: "chusa",
      ko: "",
      en: "",
    },
    {
      id: "b103",
      type: "booth",
      no: "C11",
      x: 12,
      y: 12,
      w: 3,
      h: 3,
      brand: "wonseok-whisky-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b104",
      type: "booth",
      no: "C10",
      x: 15,
      y: 12,
      w: 3,
      h: 3,
      brand: "jinmac-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b105",
      type: "booth",
      no: "C07",
      x: 18,
      y: 12,
      w: 3,
      h: 3,
      brand: "kimchangsoo-whisky-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b106",
      type: "booth",
      no: "B07",
      x: 24,
      y: 12,
      w: 3,
      h: 3,
      brand: "waoak-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b107",
      type: "booth",
      no: "B06",
      x: 27,
      y: 12,
      w: 3,
      h: 3,
      brand: "hwasimjujo",
      ko: "",
      en: "",
    },
    {
      id: "b108",
      type: "booth",
      no: "B05",
      x: 30,
      y: 12,
      w: 3,
      h: 3,
      brand: "corevest",
      ko: "",
      en: "",
    },
    {
      id: "b109",
      type: "booth",
      no: "B04",
      x: 33,
      y: 12,
      w: 3,
      h: 3,
      brand: "taepyung-brewing",
      ko: "",
      en: "",
    },
    {
      id: "b110",
      type: "booth",
      no: "B03",
      x: 36,
      y: 12,
      w: 3,
      h: 3,
      brand: "seoul-fermentary",
      ko: "",
      en: "",
    },
    {
      id: "b111",
      type: "booth",
      no: "B02",
      x: 39,
      y: 12,
      w: 3,
      h: 3,
      brand: "danong-bio",
      ko: "",
      en: "",
    },
    {
      id: "b112",
      type: "booth",
      no: "B01",
      x: 42,
      y: 12,
      w: 3,
      h: 3,
      brand: "willowwood",
      ko: "",
      en: "",
    },
    {
      id: "b113",
      type: "booth",
      no: "A07",
      x: 54,
      y: 12,
      w: 3,
      h: 3,
      brand: "bomnae-fermentation-technology",
      ko: "",
      en: "",
    },
    {
      id: "b114",
      type: "booth",
      no: "A06",
      x: 57,
      y: 12,
      w: 3,
      h: 3,
      brand: "brewkorea",
      ko: "",
      en: "",
    },
    {
      id: "b201",
      type: "booth",
      no: "C09",
      x: 9,
      y: 21,
      w: 3,
      h: 3,
      brand: "t-t-toyama",
      ko: "",
      en: "",
    },
    {
      id: "b202",
      type: "booth",
      no: "C06",
      x: 12,
      y: 21,
      w: 3,
      h: 3,
      brand: "saburomaru-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b203",
      type: "booth",
      no: "C04",
      x: 15,
      y: 21,
      w: 3,
      h: 3,
      brand: "dram-mars-whisky",
      ko: "",
      en: "",
    },
    {
      id: "b204",
      type: "booth",
      no: "C02",
      x: 18,
      y: 21,
      w: 3,
      h: 3,
      brand: "kameda-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b205",
      type: "booth",
      no: "C08",
      x: 9,
      y: 24,
      w: 3,
      h: 3,
      brand: "the-whiskyfind",
      ko: "",
      en: "",
    },
    {
      id: "b206",
      type: "booth",
      no: "C05",
      x: 12,
      y: 24,
      w: 3,
      h: 3,
      brand: "whiskyage",
      ko: "",
      en: "",
    },
    {
      id: "b207",
      type: "booth",
      no: "C03",
      x: 15,
      y: 24,
      w: 3,
      h: 3,
      brand: "a-p-a-asiapalate",
      ko: "",
      en: "",
    },
    {
      id: "b208",
      type: "booth",
      no: "C01",
      x: 18,
      y: 24,
      w: 3,
      h: 3,
      brand: "omywhisky",
      ko: "",
      en: "",
    },
    {
      id: "b301",
      type: "booth",
      no: "D16",
      x: 27,
      y: 21,
      w: 3,
      h: 3,
      brand: "gakkogawa-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b302",
      type: "booth",
      no: "D14",
      x: 30,
      y: 21,
      w: 3,
      h: 3,
      brand: "sakurao-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b303",
      type: "booth",
      no: "D12",
      x: 33,
      y: 21,
      w: 3,
      h: 3,
      brand: "kuju-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b304",
      type: "booth",
      no: "D11",
      x: 36,
      y: 21,
      w: 3,
      h: 3,
      brand: "kameda-distillery",
      ko: "",
      en: "",
    },
    {
      id: "b305",
      type: "booth",
      no: "D15",
      x: 27,
      y: 24,
      w: 3,
      h: 3,
      brand: "bar-parkmore-bar-caol-ila",
      ko: "",
      en: "",
    },
    {
      id: "b306",
      type: "booth",
      no: "D13",
      x: 30,
      y: 24,
      w: 3,
      h: 3,
      brand: "chief-whisky",
      ko: "",
      en: "",
    },
    {
      id: "b307",
      type: "booth",
      no: "D10",
      x: 33,
      y: 24,
      w: 3,
      h: 3,
      brand: "korea-brandy-society",
      ko: "",
      en: "",
    },
    {
      id: "b308",
      type: "booth",
      no: "D07",
      x: 36,
      y: 24,
      w: 3,
      h: 3,
      brand: "whiskylabel-kr",
      ko: "",
      en: "",
    },
    {
      id: "b401",
      type: "booth",
      no: "E16",
      x: 45,
      y: 21,
      w: 3,
      h: 3,
      brand: "jizake-cy-korea-jck",
      ko: "",
      en: "",
    },
    {
      id: "b402",
      type: "booth",
      no: "E15",
      x: 48,
      y: 21,
      w: 3,
      h: 3,
      brand: "masiju",
      ko: "",
      en: "",
    },
    {
      id: "b403",
      type: "booth",
      no: "E14",
      x: 51,
      y: 21,
      w: 3,
      h: 3,
      brand: "bwi-korea",
      ko: "",
      en: "",
    },
    {
      id: "b404",
      type: "booth",
      no: "E12",
      x: 54,
      y: 21,
      w: 3,
      h: 3,
      brand: "isle-of-harris",
      ko: "",
      en: "",
    },
    {
      id: "b405",
      type: "booth",
      no: "E13",
      x: 45,
      y: 24,
      w: 3,
      h: 3,
      brand: "rudder-ltd",
      ko: "",
      en: "",
    },
    {
      id: "b406",
      type: "booth",
      no: "E11",
      x: 48,
      y: 24,
      w: 3,
      h: 3,
      brand: "scout-drinks",
      ko: "",
      en: "",
    },
    { id: "b407", type: "booth", no: "E10", x: 51, y: 24, w: 3, h: 3, brand: null, ko: "", en: "" },
    {
      id: "b408",
      type: "booth",
      no: "E09",
      x: 54,
      y: 24,
      w: 3,
      h: 3,
      brand: "kanpaikai",
      ko: "",
      en: "",
    },
    {
      id: "b501",
      type: "booth",
      no: "D09",
      x: 27,
      y: 33,
      w: 3,
      h: 3,
      brand: "komaspi-bar-campbelltoun-loch",
      ko: "",
      en: "",
    },
    {
      id: "b502",
      type: "booth",
      no: "D06",
      x: 30,
      y: 33,
      w: 3,
      h: 3,
      brand: "the-single-cask",
      ko: "",
      en: "",
    },
    {
      id: "b503",
      type: "booth",
      no: "D04",
      x: 33,
      y: 33,
      w: 3,
      h: 3,
      brand: "cask-trade",
      ko: "",
      en: "",
    },
    {
      id: "b504",
      type: "booth",
      no: "D02",
      x: 36,
      y: 33,
      w: 3,
      h: 3,
      brand: "whiskybase",
      ko: "",
      en: "",
    },
    {
      id: "b505",
      type: "booth",
      no: "D08",
      x: 27,
      y: 36,
      w: 3,
      h: 3,
      brand: "natterjack",
      ko: "",
      en: "",
    },
    {
      id: "b506",
      type: "booth",
      no: "D05",
      x: 30,
      y: 36,
      w: 3,
      h: 3,
      brand: "innobev",
      ko: "",
      en: "",
    },
    {
      id: "b507",
      type: "booth",
      no: "D03",
      x: 33,
      y: 36,
      w: 3,
      h: 3,
      brand: "distillers-select",
      ko: "",
      en: "",
    },
    {
      id: "b508",
      type: "booth",
      no: "D01",
      x: 36,
      y: 36,
      w: 3,
      h: 3,
      brand: "ant-international",
      ko: "",
      en: "",
    },
    {
      id: "b601",
      type: "booth",
      no: "E08",
      x: 45,
      y: 33,
      w: 3,
      h: 3,
      brand: "ayoung-fbc",
      ko: "",
      en: "",
    },
    {
      id: "b602",
      type: "booth",
      no: "E07",
      x: 48,
      y: 33,
      w: 3,
      h: 3,
      brand: "we-oak",
      ko: "",
      en: "",
    },
    {
      id: "b603",
      type: "booth",
      no: "E05",
      x: 51,
      y: 33,
      w: 3,
      h: 3,
      brand: "brown-bottle",
      ko: "",
      en: "",
    },
    {
      id: "b604",
      type: "booth",
      no: "E03",
      x: 54,
      y: 33,
      w: 3,
      h: 3,
      brand: null,
      ko: "공식 MD",
      en: "OFFICIAL MD",
    },
    {
      id: "b605",
      type: "booth",
      no: "E06",
      x: 45,
      y: 36,
      w: 3,
      h: 3,
      brand: "natterjack",
      ko: "",
      en: "",
    },
    {
      id: "b606",
      type: "booth",
      no: "E04",
      x: 48,
      y: 36,
      w: 3,
      h: 3,
      brand: "innobev",
      ko: "",
      en: "",
    },
    {
      id: "b607",
      type: "booth",
      no: "E02",
      x: 51,
      y: 36,
      w: 3,
      h: 3,
      brand: "agavespirits",
      ko: "",
      en: "",
    },
    {
      id: "b608",
      type: "booth",
      no: "E01",
      x: 54,
      y: 36,
      w: 3,
      h: 3,
      brand: "whiskylabel-kr",
      ko: "",
      en: "",
    },
    {
      id: "b701",
      type: "booth",
      no: "F04",
      x: 6,
      y: 45,
      w: 6,
      h: 3,
      brand: "brand-2",
      ko: "",
      en: "",
    },
    {
      id: "b702",
      type: "booth",
      no: "F03",
      x: 12,
      y: 45,
      w: 3,
      h: 3,
      brand: null,
      ko: "THE DUTCH CHEESE",
      en: "THE DUTCH CHEESE",
    },
    {
      id: "b703",
      type: "booth",
      no: "F02",
      x: 15,
      y: 45,
      w: 3,
      h: 3,
      brand: "seolhapae",
      ko: "설하패",
      en: "SEOLHAPAE",
    },
    {
      id: "b704",
      type: "booth",
      no: "F01",
      x: 18,
      y: 45,
      w: 3,
      h: 3,
      brand: null,
      ko: "DOYAKGWA",
      en: "DOYAKGWA",
    },
    {
      id: "b705",
      type: "booth",
      no: "G07",
      x: 24,
      y: 45,
      w: 3,
      h: 3,
      brand: "whiskylabel-kr",
      ko: "",
      en: "",
    },
    {
      id: "b706",
      type: "booth",
      no: "G06",
      x: 27,
      y: 45,
      w: 3,
      h: 3,
      brand: "plus-bottle",
      ko: "",
      en: "",
    },
    {
      id: "b707",
      type: "booth",
      no: "G05",
      x: 30,
      y: 45,
      w: 3,
      h: 3,
      brand: "korea-bourbon-whisk-e-y-club",
      ko: "",
      en: "",
    },
    {
      id: "b708",
      type: "booth",
      no: "G04",
      x: 33,
      y: 45,
      w: 3,
      h: 3,
      brand: "gst",
      ko: "",
      en: "",
    },
    {
      id: "b709",
      type: "booth",
      no: "G03",
      x: 36,
      y: 45,
      w: 3,
      h: 3,
      brand: "gin-dive",
      ko: "",
      en: "",
    },
    {
      id: "b710",
      type: "booth",
      no: "G02",
      x: 39,
      y: 45,
      w: 3,
      h: 3,
      brand: "pnswine",
      ko: "",
      en: "",
    },
    {
      id: "b711",
      type: "booth",
      no: "G01",
      x: 42,
      y: 45,
      w: 3,
      h: 3,
      brand: "monstercave",
      ko: "",
      en: "",
    },
    {
      id: "b801",
      type: "booth",
      no: "A05",
      x: 60,
      y: 15,
      w: 3,
      h: 3,
      brand: "brand",
      ko: "",
      en: "",
    },
    {
      id: "b802",
      type: "booth",
      no: "A04",
      x: 60,
      y: 18,
      w: 3,
      h: 3,
      brand: "the-whiskytales",
      ko: "",
      en: "",
    },
    {
      id: "b803",
      type: "booth",
      no: "A03",
      x: 60,
      y: 21,
      w: 3,
      h: 6,
      brand: "whiskynavi",
      ko: "",
      en: "",
    },
    {
      id: "b804",
      type: "booth",
      no: "A02",
      x: 60,
      y: 33,
      w: 3,
      h: 3,
      brand: null,
      ko: "익스클루시브 판매",
      en: "EXCLUSIVE SALES",
    },
    {
      id: "b805",
      type: "booth",
      no: "A01",
      x: 60,
      y: 36,
      w: 3,
      h: 6,
      brand: null,
      ko: "캐스크 카니발",
      en: "CASK CARNIVAL",
    },
    {
      id: "toilet",
      type: "toilet",
      no: "",
      x: 0,
      y: 21,
      w: 3,
      h: 6,
      brand: null,
      ko: "화장실",
      en: "RESTROOM",
    },
    {
      id: "chill",
      type: "zone",
      no: "",
      x: 6,
      y: 30,
      w: 15,
      h: 15,
      brand: null,
      ko: "칠링 존",
      en: "CHILLING ZONE",
    },
    {
      id: "info",
      type: "booth",
      no: "I",
      x: 48,
      y: 45,
      w: 3,
      h: 3,
      brand: null,
      ko: "인포메이션",
      en: "INFORMATION",
    },
    {
      id: "exit",
      type: "exit",
      no: "",
      x: 51,
      y: 48,
      w: 6,
      h: 3,
      brand: null,
      ko: "출구",
      en: "EXIT",
    },
    {
      id: "entrance",
      type: "entrance",
      no: "",
      x: 57,
      y: 48,
      w: 6,
      h: 3,
      brand: null,
      ko: "입구",
      en: "ENTRANCE",
    },
  ],
}

const SLUG = /^[a-z0-9-]+$/
const TYPES = new Set(Object.keys(ITEM_TYPES))
const clip = (v: unknown, n = 60) => (typeof v === "string" ? v.trim().slice(0, n) : "")
const int = (v: unknown, min: number, max: number) =>
  Math.min(max, Math.max(min, Math.round(Number(v) || 0)))

/** 저장·전송된 배치를 검증한다. 격자를 벗어나거나 겹치는 항목은 버린다. */
export function parseLayout(raw: unknown): Layout | null {
  if (!raw || typeof raw !== "object") return null
  const src = raw as Record<string, unknown>
  if (!Array.isArray(src.items)) return null
  // 예전 형식(부스 = 1칸)은 칸 수를 BOOTH 배로 늘려 읽는다
  const k = Number(src.grid) === GRID ? 1 : BOOTH
  const cols = int(Number(src.cols) * k, LIMITS.minCols, LIMITS.maxCols)
  const rows = int(Number(src.rows) * k, LIMITS.minRows, LIMITS.maxRows)
  const taken = new Set<string>()
  const ids = new Set<string>()
  const items: FloorItem[] = []
  for (const r of src.items as Record<string, unknown>[]) {
    if (!r || typeof r !== "object" || !TYPES.has(String(r.type))) continue
    const type = r.type as ItemType
    if (type === "partition") {
      // 꼭짓점 좌표, 한 방향으로만 장 수
      const x = int(Number(r.x) * k, 0, cols)
      const y = int(Number(r.y) * k, 0, rows)
      const horiz = Number(r.w) > 0
      const max = Math.floor(((horiz ? cols - x : rows - y) + 1e-9) / PARTITION)
      const n = int(horiz ? r.w : r.h, 1, Math.max(1, max))
      if (max < 1) continue
      let id = clip(r.id, 40) || `i${items.length}`
      while (ids.has(id)) id = `${id}_`
      ids.add(id)
      items.push({
        id,
        type,
        no: "",
        x,
        y,
        w: horiz ? n : 0,
        h: horiz ? 0 : n,
        brand: null,
        ko: "",
        en: "",
      })
      continue
    }
    const x = int(Number(r.x) * k, 0, cols - 1)
    const y = int(Number(r.y) * k, 0, rows - 1)
    const w = int(Number(r.w) * k, 1, cols - x)
    const h = int(Number(r.h) * k, 1, rows - y)
    const cells: string[] = []
    for (let i = x; i < x + w; i++) for (let j = y; j < y + h; j++) cells.push(`${i},${j}`)
    if (cells.some((c) => taken.has(c))) continue
    let id = clip(r.id, 40) || `i${items.length}`
    while (ids.has(id)) id = `${id}_`
    ids.add(id)
    for (const c of cells) taken.add(c)
    const brand =
      type === "booth" && typeof r.brand === "string" && SLUG.test(r.brand) ? r.brand : null
    items.push({
      id,
      type,
      no: type === "booth" ? clip(r.no, 10) : "",
      x,
      y,
      w,
      h,
      brand,
      ko: clip(r.ko),
      en: clip(r.en),
    })
  }
  return { grid: GRID, cols, rows, items }
}

/** 배치도에 필요한 브랜드 정보만 */
export type FloorBrand = {
  slug: string
  nameKo: string
  nameEn: string
  logo: string | null
  logoBg: string | null
  visible: boolean
}

export type ResolvedItem = FloorItem & {
  brandInfo: FloorBrand | null
  /** 화면에 쓸 이름 */
  nameKo: string
  nameEn: string
}

/** 업체 없이 사무국이 운영하는 부스 (캐스크 카니발·익스클루시브 판매·공식 MD): 행사 로고를 붙인다 */
const ORGANIZER_BOOTH =
  /캐스크\s*카니발|익스클루시브|공식\s*MD|CASK\s*CARNIVAL|EXCLUSIVE|OFFICIAL\s*MD/i
const ORGANIZER_LOGO = "/brands/cask-carnival-cc.png"

export function resolveItems(layout: Layout, brands: FloorBrand[]): ResolvedItem[] {
  const bySlug = new Map(brands.map((b) => [b.slug, b]))
  return layout.items.map((it) => {
    const organizer = it.type === "booth" && !it.brand && ORGANIZER_BOOTH.test(`${it.ko} ${it.en}`)
    const brandInfo = it.brand
      ? (bySlug.get(it.brand) ?? null)
      : organizer
        ? {
            slug: "",
            nameKo: it.ko || it.en,
            nameEn: it.en || it.ko,
            logo: ORGANIZER_LOGO,
            logoBg: null,
            visible: false,
          }
        : null
    const meta = ITEM_TYPES[it.type]
    const nameEn = brandInfo ? brandInfo.nameEn || brandInfo.nameKo : it.en || it.ko || meta.en
    const nameKo = brandInfo ? brandInfo.nameKo || brandInfo.nameEn : it.ko || it.en || meta.ko
    return { ...it, brandInfo, nameKo, nameEn }
  })
}

/** 칸 단위 → SVG 단위 */
export const toPx = (it: Rect): Rect => ({
  x: it.x * CELL,
  y: it.y * CELL,
  w: it.w * CELL,
  h: it.h * CELL,
})

/** 끌어서 칠한 범위를 BOOTH×BOOTH 부스 자리로 나눈다 (한 칸만 눌러도 부스 하나) */
export function boothSlots(x: number, y: number, w: number, h: number): Rect[] {
  const nx = Math.max(1, Math.floor(w / BOOTH))
  const ny = Math.max(1, Math.floor(h / BOOTH))
  const out: Rect[] = []
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++)
      out.push({ x: x + i * BOOTH, y: y + j * BOOTH, w: BOOTH, h: BOOTH })
  return out
}

/** 부스 번호 섹션 (A01, B03 …) */
export const SECTIONS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("")

/** 섹션의 다음 부스 번호 (그 섹션에서 가장 큰 번호 + 1, 두 자리) */
export function nextBoothNo(items: FloorItem[], section = "A"): string {
  const re = new RegExp(`^${section}(\\d+)$`, "i")
  const nums = items
    .filter((i) => i.type === "booth")
    .map((i) => re.exec(i.no))
    .filter((m): m is RegExpExecArray => !!m)
    .map((m) => Number(m[1]))
  return `${section}${String(Math.max(0, ...nums) + 1).padStart(2, "0")}`
}

/**
 * 섹션 구역 (칸 단위). 부스 가운데가 들어 있는 구역의 글자가 그 부스의 섹션이 된다.
 * A: 오른쪽 위 2개 + 오른쪽 세로줄 · B: 위쪽 가운데 줄 · C: 왼쪽 위 + 왼쪽 블록
 * D: 가운데 위·아래 블록 · E: 오른쪽 위·아래 블록 · F: 왼쪽 아래 푸드 · G: 아래 가운데 줄
 * 홀 구조가 바뀌면 여기 숫자를 고친다. 어느 구역에도 안 들어가는 부스는 원래 글자를 쓴다.
 */
export const SECTION_AREAS: { id: string; x: number; y: number; w: number; h: number }[] = [
  { id: "A", x: 47, y: 9, w: 15, h: 6 },
  { id: "A", x: 56, y: 15, w: 6, h: 29 },
  { id: "B", x: 20, y: 9, w: 27, h: 9 },
  { id: "C", x: 0, y: 9, w: 20, h: 21 },
  { id: "D", x: 20, y: 18, w: 18, h: 24 },
  { id: "E", x: 38, y: 18, w: 18, h: 24 },
  { id: "F", x: 0, y: 42, w: 20, h: 8 },
  { id: "G", x: 20, y: 42, w: 24, h: 8 },
]

/** 부스 위치로 정한 섹션 글자. 구역 밖이면 null */
export function sectionAt(i: Rect): string | null {
  const cx = i.x + i.w / 2
  const cy = i.y + i.h / 2
  const a = SECTION_AREAS.find((r) => cx >= r.x && cx < r.x + r.w && cy >= r.y && cy < r.y + r.h)
  return a?.id ?? null
}

/** 변이 맞닿은 부스끼리 묶은 블록들 */
function blocksOf(list: FloorItem[]): FloorItem[][] {
  const touch = (a: FloorItem, b: FloorItem) =>
    a.x <= b.x + b.w &&
    b.x <= a.x + a.w &&
    a.y <= b.y + b.h &&
    b.y <= a.y + a.h &&
    // 꼭짓점만 닿는 건 제외
    (Math.min(a.x + a.w, b.x + b.w) > Math.max(a.x, b.x) ||
      Math.min(a.y + a.h, b.y + b.h) > Math.max(a.y, b.y))
  const seen = new Set<string>()
  const out: FloorItem[][] = []
  for (const start of list) {
    if (seen.has(start.id)) continue
    seen.add(start.id)
    const block = [start]
    for (let k = 0; k < block.length; k++) {
      for (const o of list) {
        if (!seen.has(o.id) && touch(block[k], o)) {
          seen.add(o.id)
          block.push(o)
        }
      }
    }
    out.push(block)
  }
  return out
}

function bounds(list: Rect[]): Rect {
  const x = Math.min(...list.map((i) => i.x))
  const y = Math.min(...list.map((i) => i.y))
  return {
    x,
    y,
    w: Math.max(...list.map((i) => i.x + i.w)) - x,
    h: Math.max(...list.map((i) => i.y + i.h)) - y,
  }
}

/**
 * 부스 번호를 위치에 맞춰 다시 매긴다. 섹션은 부스 위치의 구역(SECTION_AREAS)으로 정한다.
 * 섹션 안에서는 블록(서로 붙어 있는 부스 묶음) 단위로, 입구에서 가까운 블록부터 번호를 이어 간다.
 * 블록 안에서는 입구에 가까운 줄부터, 줄 안에서는 입구에 가까운 칸부터 01, 02 …
 * 인포처럼 숫자 없는 번호(I)와 입구가 없는 배치는 그대로 둔다. 바뀐 부스 수를 함께 돌려준다.
 */
export function renumberBooths(layout: Layout): { layout: Layout; changed: number } {
  const ent = layout.items.find((i) => i.type === "entrance")
  if (!ent) return { layout, changed: 0 }
  const ex = ent.x + ent.w / 2
  const ey = ent.y + ent.h / 2
  const bySection = new Map<string, FloorItem[]>()
  for (const i of layout.items) {
    const m = i.type === "booth" ? /^([A-Za-z]*)\d*$/.exec(i.no) : null
    // 숫자 없는 글자만의 번호(인포 I)는 손대지 않는다
    if (!m || (m[1] && !/\d/.test(i.no))) continue
    const sec = sectionAt(i) ?? (m[1].toUpperCase() || "A")
    bySection.set(sec, [...(bySection.get(sec) ?? []), i])
  }
  const next = new Map<string, string>()
  for (const [sec, list] of bySection) {
    const ordered = blocksOf(list)
      .map((block) => {
        const b = bounds(block)
        return { block, d: Math.hypot(b.x + b.w / 2 - ex, b.y + b.h / 2 - ey) }
      })
      .sort((a, b) => a.d - b.d)
      .flatMap(({ block }) =>
        [...block].sort((a, b) => {
          const dy = Math.abs(a.y + a.h / 2 - ey) - Math.abs(b.y + b.h / 2 - ey)
          return dy || Math.abs(a.x + a.w / 2 - ex) - Math.abs(b.x + b.w / 2 - ex)
        }),
      )
    ordered.forEach((i, k) => {
      next.set(i.id, `${sec}${String(k + 1).padStart(2, "0")}`)
    })
  }
  let changed = 0
  const items = layout.items.map((i) => {
    const no = next.get(i.id)
    if (!no || no === i.no) return i
    changed++
    return { ...i, no }
  })
  return { layout: { ...layout, items }, changed }
}

// ── 부스 칸 안에 이름 맞춰 넣기 ──
const isWide = (ch: string) => /[\u1100-\u11ff\u3130-\u318f\uac00-\ud7af\u4e00-\u9fff]/.test(ch)
const charW = (ch: string) => (isWide(ch) ? 1 : /[A-Z0-9&@#%]/.test(ch) ? 0.7 : 0.55)
const textW = (s: string, fs: number) => [...s].reduce((n, ch) => n + charW(ch), 0) * fs

/** 줄을 바꿀 수 있는 조각. 띄어쓰기 자리와 여는 괄호 앞에서 나눈다 (sp: 앞에 띄어쓰기가 있었는지) */
type Token = { t: string; sp: boolean }
function tokens(text: string): Token[] {
  const out: Token[] = []
  for (const word of text.split(/\s+/).filter(Boolean)) {
    word.split(/(?=\()/).forEach((t, i) => {
      out.push({ t, sp: i === 0 && out.length > 0 })
    })
  }
  return out
}

/** 한글·한자가 든 조각은 아무 글자 사이에서나 줄을 바꿔도 자연스럽다 */
const breakable = (t: string) => [...t].some(isWide)

function wrap(text: string, fs: number, maxW: number): string[] {
  const lines: string[] = []
  let cur = ""
  const addChars = (t: string, sp: boolean) => {
    let first = true
    for (const ch of t) {
      const piece = first && sp && cur ? ` ${ch}` : ch
      first = false
      if (cur && textW(cur + piece, fs) > maxW) {
        lines.push(cur)
        cur = ch
      } else cur += piece
    }
  }
  for (const tok of tokens(text)) {
    const next = cur ? `${cur}${tok.sp ? " " : ""}${tok.t}` : tok.t
    if (textW(next, fs) <= maxW) {
      cur = next
      continue
    }
    if (breakable(tok.t)) {
      // 한글은 지금 줄에 이어서 글자 단위로 채운다
      addChars(tok.t, tok.sp)
      continue
    }
    // 영문 단어는 통째로 다음 줄로. 칸보다 길 때만 글자 단위로 자른다
    if (cur) lines.push(cur)
    cur = ""
    if (textW(tok.t, fs) <= maxW) cur = tok.t
    else addChars(tok.t, false)
  }
  if (cur) lines.push(cur)
  return lines
}

/** 같은 줄 수를 유지하는 가장 좁은 폭으로 다시 나눠 줄 길이를 고르게 한다
 *  (끝에 한두 글자만 넘어가는 줄을 막는다). 한 줄에 들어가던 조각은 쪼개지 않는다 */
function balance(text: string, fs: number, maxW: number): string[] {
  const base = wrap(text, fs, maxW)
  if (base.length < 2) return base
  // 통째로 두어야 하는 영문 단어보다 좁게는 줄이지 않는다
  const fitting = tokens(text)
    .filter((t) => !breakable(t.t))
    .map((t) => textW(t.t, fs))
    .filter((w) => w <= maxW)
  const minW = Math.max(0, ...fitting)
  let lo = minW
  let hi = maxW
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2
    if (wrap(text, fs, mid).length <= base.length) hi = mid
    else lo = mid
  }
  return wrap(text, fs, Math.max(hi, minW))
}

/** 칸 크기에 맞는 글자 크기와 줄바꿈 */
/** 보기 싫은 줄바꿈: 한두 글자만 남은 줄, 또는 영문 단어가 중간에서 끊긴 줄 */
function awkward(text: string, lines: string[]): boolean {
  if (lines.length < 2) return false
  if (lines.some((l) => [...l.replace(/\s/g, "")].length <= 2)) return true
  for (let i = 1; i < lines.length; i++) {
    const tail = /[A-Za-z]+$/.exec(lines[i - 1])?.[0]
    const head = /^[A-Za-z]+/.exec(lines[i])?.[0]
    // 원문에서 붙어 있던 영문 글자가 두 줄로 갈렸으면 단어 중간에서 끊긴 것
    if (tail && head && text.includes(tail + head)) return true
  }
  return false
}

export function fitLabel(
  text: string,
  w: number,
  h: number,
  max = 4.4,
  /** 위쪽에 비워 둘 높이 (부스 번호 자리) */
  reserve = 9,
): { lines: string[]; size: number } {
  const maxW = w - 3
  const maxH = h - reserve
  const fits = (lines: string[], fs: number) =>
    lines.length * fs * 1.18 <= maxH && lines.every((l) => textW(l, fs) <= maxW)
  // 들어가는 가장 큰 크기를 찾되, 줄바꿈이 어색하면 조금(최대 40%) 더 줄여서 깔끔한 크기를 찾는다
  let first: { lines: string[]; size: number } | null = null
  for (let fs = max; fs >= 2; fs -= 0.2) {
    const lines = balance(text, fs, maxW)
    if (!fits(lines, fs)) continue
    if (!awkward(text, lines)) return { lines, size: fs }
    first ??= { lines, size: fs }
    if (fs < max * 0.6) break
  }
  return first ?? { lines: balance(text, 2, maxW), size: 2 }
}
