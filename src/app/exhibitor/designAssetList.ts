// 참가업체 디자인 에셋. 파일은 public/exhibitor-assets/ (원본: 프로젝트 루트 design assets/)
// 파일을 바꾸면 ZIP도 다시 만들 것: python3 scripts/build-exhibitor-assets.py

export const ASSET_BASE = "/exhibitor-assets"
export const ASSET_ZIP = { file: "cask-carnival-2026-design-assets.zip", size: "46.8MB" }

export type DesignAsset = {
  label: string
  file: string
  size: string
  /** 흰색 에셋 — 썸네일을 어두운 배경에 표시 */
  dark?: boolean
}

export const ASSET_GROUPS: {
  title: string
  kind: "logo" | "poster"
  /** 섹션 라벨 영문 */
  en: string
  zip: { file: string; size: string }
  zipLabel: string
  items: DesignAsset[]
  /** 같은 묶음의 AI 원본 */
  source: DesignAsset
}[] = [
  {
    title: "로고",
    en: "Logotype",
    kind: "logo",
    zip: { file: "cask-carnival-2026-logos.zip", size: "19.3MB" },
    zipLabel: "로고 전체 다운로드",
    items: [
      { label: "원형 로고 · 적", file: "logo-circle-red.png", size: "132KB" },
      { label: "원형 로고 · 흑", file: "logo-circle-black.png", size: "132KB" },
      { label: "원형 로고 · 백", file: "logo-circle-white.png", size: "151KB", dark: true },
      { label: "텍스트 로고 · 적", file: "logo-text-red-v2.png", size: "96KB" },
      { label: "텍스트 로고 · 흑", file: "logo-text-black-v2.png", size: "95KB" },
      { label: "텍스트 로고 · 백", file: "logo-text-white-v2.png", size: "111KB", dark: true },
    ],
    source: { label: "캐스크 카니발 2026 로고 (AI)", file: "cc2026-logo.ai", size: "19.4MB" },
  },
  {
    title: "포스터 · 포맷 아웃라인",
    en: "Poster & Format",
    kind: "poster",
    zip: { file: "cask-carnival-2026-posters.zip", size: "27.5MB" },
    zipLabel: "포스터·포맷 전체 다운로드",
    items: [
      { label: "Official Poster", file: "official-poster.png", size: "1.8MB" },
      { label: "Format Outline Red", file: "format-outline-red.png", size: "5.2MB" },
      { label: "Format Outline White", file: "format-outline-white.png", size: "2.3MB" },
    ],
    source: { label: "포스터 · 포맷 아웃라인 (AI)", file: "cc2026-assets.ai", size: "19.2MB" },
  },
]
