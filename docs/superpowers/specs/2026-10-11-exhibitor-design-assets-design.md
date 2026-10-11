# 참가업체 디자인 에셋 다운로드

## 목표
`/exhibitor`에 로그인한 참가업체가 캐스크 카니발 2026 디자인 에셋(로고·포스터·포맷·AI 원본)을 받을 수 있게 한다.

## 결정
- 파일은 `public/exhibitor-assets/`에 정적으로 둔다. 다운로드 섹션은 로그인 후 화면에만 노출하되, URL 자체는 공개다(홍보용 자료라 허용).
- 원본 `design assets/` 폴더는 그대로 둔다(작업 원본). 일러스트레이터 임시파일·`.DS_Store`는 제외.

## 파일
| 원본 | 공개 경로 |
|---|---|
| 원형로고 백/적/흑.png | logo-circle-white/red/black.png |
| 텍스트로고 백/적/흑.png | logo-text-white/red/black.png |
| Poster.png | poster.png |
| Format_Outline_R/W.png | format-outline-red/white.png |
| cc_2026 logo.ai | cc2026-logo.ai |
| Assets.ai | cc2026-assets.ai |

ZIP: `cask-carnival-2026-design-assets.zip` — 위 11개 파일, 압축 안 파일명은 원본 한글명.

## UI
- `src/app/exhibitor/designAssetList.ts`: 그룹(로고 / 포스터·포맷 / 원본 AI)별 파일 목록(label, 파일명, 용량).
- `DesignAssets` 카드: 안내 박스 아래, 1번 섹션 위. 번호 없는 섹션. 상단에 "전체 다운로드 (ZIP)" 버튼.
  - 로고·포스터·포맷: `next/image` 썸네일 그리드, 흰색 버전은 어두운 배경. 클릭 시 `<a download>`.
  - AI 파일: 썸네일 없이 파일명·용량 행.
- 버튼 색은 기존 규칙대로 검정(빨강은 제출 버튼 전용).

## 확인
로컬 dev 서버에서 업체 로그인 → 섹션 노출과 다운로드 확인. 배포는 사용자 확인 후.
