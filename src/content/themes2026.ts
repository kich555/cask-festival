// 테마 아카이브 데이터. 새 테마 추가 시 이 배열에 객체 하나만 추가하세요.
export interface ThemeNote {
  icon: string
  en: string
  ko: string
}

export interface ThemeYear {
  year: number
  name: string
  descKo: string[]
  descEn: string[]
  notes: ThemeNote[]
}

export const THEMES_2026: ThemeYear[] = [
  {
    year: 2026,
    name: "Oloroso Sherry Cask",
    descKo: [
      "올로로소 셰리는 스페인 안달루시아 헤레스(Jerez) 지방에서 생산되는 대표적인 드라이 셰리 와인입니다.",
      "플로르(효모막) 없이 공기에 직접 노출되는 산화 숙성 과정을 거치며, 호두와 건포도, 다크 초콜릿, 시나몬 등이 어우러진 복합적이고 깊은 풍미를 완성합니다.",
      "스페인어로 '향기로운'이라는 뜻을 가진 이름처럼 진하고 풍성한 아로마가 특징입니다.",
    ],
    descEn: [
      "Oloroso Sherry is a classic dry sherry from the Jerez region of Andalusia, Spain.",
      "It undergoes oxidative aging in direct contact with air, without a protective layer of flor, developing a deep, complex character of walnut, raisin, dark chocolate, and cinnamon.",
      "True to its name — Spanish for 'fragrant' — it offers a rich, full-bodied aroma.",
    ],
    notes: [
      { icon: "🍇", en: "Dried Fruits", ko: "건과일" },
      { icon: "🌰", en: "Walnut", ko: "호두" },
      { icon: "🍫", en: "Dark Chocolate", ko: "다크 초콜릿" },
      { icon: "🍃", en: "Leather & Tobacco", ko: "가죽 & 담뱃잎" },
      { icon: "🍊", en: "Orange Peel", ko: "오렌지 필" },
    ],
  },
]

export function getThemeByYear(year: number | null): ThemeYear {
  const sorted = [...THEMES_2026].sort((a, b) => b.year - a.year)
  if (year) {
    const found = sorted.find((t) => t.year === year)
    if (found) return found
  }
  return sorted[0]
}

export function getThemesDesc(): ThemeYear[] {
  return [...THEMES_2026].sort((a, b) => b.year - a.year)
}
