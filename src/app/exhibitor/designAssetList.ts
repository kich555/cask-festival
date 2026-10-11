// 참가업체 디자인 에셋. 파일은 public/exhibitor-assets/ (원본: 프로젝트 루트 design assets/)
// 파일을 바꾸면 ZIP도 다시 만들어 함께 올릴 것.

export const ASSET_BASE = "/exhibitor-assets"
export const ASSET_ZIP = { file: "cask-carnival-2026-design-assets.zip", size: "10.5MB" }

export type DesignAsset = {
  label: string
  file: string
  size: string
  /** 흰색 에셋 — 썸네일을 어두운 배경에 표시 */
  dark?: boolean
}

export const ASSET_GROUPS: {
  title: string
  kind: "logo" | "poster" | "source"
  items: DesignAsset[]
}[] = [
  {
    title: "로고",
    kind: "logo",
    items: [
      { label: "원형 로고 · 적", file: "logo-circle-red.png", size: "132KB" },
      { label: "원형 로고 · 흑", file: "logo-circle-black.png", size: "132KB" },
      { label: "원형 로고 · 백", file: "logo-circle-white.png", size: "151KB", dark: true },
      { label: "텍스트 로고 · 적", file: "logo-text-red.png", size: "105KB" },
      { label: "텍스트 로고 · 흑", file: "logo-text-black.png", size: "104KB" },
      { label: "텍스트 로고 · 백", file: "logo-text-white.png", size: "116KB", dark: true },
    ],
  },
  {
    title: "포스터 · 포맷",
    kind: "poster",
    items: [
      { label: "포스터", file: "poster.png", size: "1.8MB" },
      { label: "Format Outline Red", file: "format-outline-red.png", size: "5.2MB" },
      { label: "Format Outline White", file: "format-outline-white.png", size: "2.3MB" },
    ],
  },
  {
    title: "원본 (Adobe Illustrator)",
    kind: "source",
    items: [
      { label: "캐스크 카니발 2026 로고", file: "cc2026-logo.ai", size: "582KB" },
      { label: "디자인 에셋 모음", file: "cc2026-assets.ai", size: "1.2MB" },
    ],
  },
]
