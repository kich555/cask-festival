# Cask Carnival 2026 — Next.js 이식 설계

- 작성일: 2026-06-23
- 대상 저장소: `kich555/cask-festival` (Next.js 15 / React 19 / TS / Tailwind v4)
- 작업 브랜치: `feat/2026-redesign` (main 직접 작업 금지)
- 소스 디자인: 별도 정적 사이트 `cask-carnival-2026`(LUVENHOV) — 순수 HTML/CSS/JS로 완성된 2026 멀티페이지 사이트

---

## 1. 배경 / 목표

2026 사이트는 현재 정적 HTML/CSS/JS(`cask-carnival-2026` 저장소)로 완성돼 있으나, 운영/배포 일원화를 위해 **2025 사이트(`cask-festival`)의 구조·기술스택에 맞춰 Next.js로 이식**한다.

- **디자인·콘텐츠**: 2026 정적 사이트의 것을 그대로 가져온다(버건디 톤, D-DIN Condensed 워터마크, Oloroso 테마, 멀티페이지 구성).
- **구조·형식**: 2025 저장소의 컨벤션(App Router 라우트, 컴포넌트, `?lang=` i18n, Tailwind v4, Pretendard)에 맞춘다.
- **`/2025`는 절대 변경하지 않는다.** 기존 디자인·동작 그대로 유지.

### 성공 기준
- `/`(2026 메인) + `/about` `/theme` `/program` `/register`가 2026 디자인으로 동작.
- 한/영 전환이 `?lang=` 방식으로 동작(기존 미들웨어 그대로).
- `/2025`의 화면·동작이 이식 전과 100% 동일.
- `npm run build` / `biome check` 통과.

---

## 2. 비목표 (Out of Scope)

- 실제 배포·도메인(caskcarnival.com) 연결 및 기존 `/2025` 운영 인스턴스 보존 작업.
- Hero 3D 애니메이션의 React 네이티브 재구현(초기엔 기존 `hero-scene.html`을 `<iframe>`으로 임베드).
- 2025 콘텐츠/디자인 개선.
- 새로운 기능(실시간 프로그램표, 참가사 DB 등).

---

## 3. 아키텍처

### 3.1 라우트 (App Router)
| 경로 | 파일 | 비고 |
|------|------|------|
| `/` | `src/app/page.tsx` (교체) | 2026 메인 랜딩 |
| `/about` | `src/app/about/page.tsx` (신규) | 행사 소개 |
| `/theme` | `src/app/theme/page.tsx` (신규) | 테마 소개(연도 파라미터 지원: `?year=`) |
| `/program` | `src/app/program/page.tsx` (신규) | 프로그램(마스터클래스 시간표 placeholder) |
| `/register` | `src/app/register/page.tsx` (신규) | 참가 업체 모집 |
| `/2025` | `src/app/2025/**` | **동결** |

- 각 신규 라우트는 `/2025` 라우트 패턴(필요 시 route-level `layout.tsx`로 페이지별 메타데이터)을 따른다.
- 루트 `layout.tsx`의 메타데이터는 이미 "CASK CARNIVAL 2026" 기준 → 메인 메타데이터는 그대로 사용하거나 보강.

### 3.2 컴포넌트 (격리 원칙)
- 2026 전용 컴포넌트는 `src/components/2026/`에 신규 작성한다. 예시:
  - `Nav2026`, `Hero2026`, `AboutTeaser`, `ThemeBand`, `TastingNotes`, `MasterClassPlaceholder`, `ExhibitorIntro`, `CategoryGrid`, `BoothPackage`, `Forecast`, `ProcessSteps`, `ContactBlock`, `Footer2026`, `LangToggle2026`(또는 기존 LanguageToggle 재사용 검토), `PageHeader`(워터마크 포함), `ThemeArchive`.
- `/2025`가 의존하는 기존 컴포넌트는 **수정 금지**: `NavigationBar`, `LineupSection`, `MasterClassSection`, `FooterSection`, `ImageList`, `NavLinks`, `MobileMenu` 등.
- 단, i18n 엔진·훅(`useTranslation`, `useBodyScrollLock` 등 부수효과 없는 공용 유틸)은 재사용 가능.

### 3.3 i18n
- 엔진: 기존 `src/i18n`(`useTranslation()` → `?lang` 읽어 `translations[lang]` 반환) + `middleware.ts`(`?lang` 자동 부여) 그대로 사용.
- `src/i18n/translations.ts`의 `ko`/`en` 객체에 **2026 네임스페이스만 추가**한다. 추가 키(예): `home`, `aboutPage`, `themePage`, `programPage`, `registerPage`, `nav2026`, `footer2026`.
  - **기존 키(`nav`, `hero`, `lineup`, `page2025`, `masterClass` 등)는 추가/수정/삭제하지 않는다.** (`/2025` 및 타입 안정성 보존)
- 정적 사이트의 `data-en`/`data-en-href` 콘텐츠는 모두 번역 키로 이관:
  - 텍스트 → `t.<namespace>.<key>`
  - 언어별 링크(부스 구글폼, 브로슈어 PDF)는 `lang` 값에 따라 분기.
    - 부스 신청 폼: ko `forms.gle/GmCXkarDNGzquj9a7`, en `forms.gle/cagUWjWVubs1VndY8`
    - 브로슈어 PDF: ko/en 각 파일

### 3.4 스타일 / 폰트
- **Pretendard**: `globals.css`에서 이미 글로벌 적용 → 그대로 재사용.
- **D-DIN Condensed**: `globals.css`(또는 2026 스코프 css)에 `@font-face`를 **추가만** 한다(제거·변경 없음). 폰트 파일은 `public/2026/fonts/`에 배치. 사용처는 페이지 헤더 배경 워터마크 한정.
- 2026 비주얼(버건디 `#7d0b1c` 등, 워터마크, Oloroso 테마 밴드, 반응형)은 Tailwind v4 유틸 + 필요한 경우 컴포넌트 스코프 스타일로 구현.
- **다크모드 차단**: `globals.css`는 `prefers-color-scheme: dark`에서 body 배경을 어둡게 한다. 2026 페이지는 최상위 래퍼에 **명시적 배경색**(예: 흰색)을 지정해 영향받지 않게 한다(`/2025`가 `bg-[#121212]`로 자기 배경을 지정하는 것과 동일 패턴).
- `globals.css`·루트 `layout.tsx`는 **추가만 허용**(2026 @font-face 등), 기존 규칙 제거/변경 금지.

### 3.5 에셋
- 2026 정적 사이트의 에셋을 `public/2026/`에 복사한다(기존 `public/` 자산과 경로 충돌 방지):
  - 이미지: `about-keyvisual.png`, `booth-render.png`, `logo_background.png`, 로고 SVG 등
  - 브로슈어 PDF(ko/en)
  - 폰트(D-DIN Condensed) → `public/2026/fonts/`
  - `hero-scene.html` → `public/2026/hero-scene.html` (iframe src)
- 참조 경로는 루트 절대경로(`/2026/...`)로 통일.

---

## 4. 콘텐츠 매핑 (정적 → Next)

| 정적 사이트 | 이식 위치 |
|-------------|-----------|
| `index.html` (hero, about teaser, Oloroso 밴드, masterclass, exhibitor 요약, footer) | `/` `app/page.tsx` + `components/2026/*` |
| `about/index.html` (RECAP, 개요 표, 키비주얼) | `/about` |
| `theme/index.html` + `js/themes.js`(THEMES 데이터) | `/theme` (테마 데이터는 TS 상수/모듈로 이관, `?year=` 지원) |
| `program/index.html` (블러 시간표 + 안내 카드) | `/program` |
| `register/index.html` (절차/전망/부스/카테고리/연락처) | `/register` |
| `js/i18n.js` (`data-en`) | `src/i18n` 번역 키로 흡수 |
| `js/main.js` (네비 스크롤/햄버거) | Nav2026 컴포넌트 + 기존 훅 패턴 |

- 테마 아카이브(`themes.js`의 `THEMES` 배열)는 `src/constants` 또는 `src/app/theme` 인접 모듈에 **타입 있는 데이터**로 옮기고, `/theme?year=YYYY`로 연도 선택. 새 테마 추가 = 배열에 항목 추가.

---

## 5. 동결 대상 (변경 금지)

- `src/app/2025/**`
- `/2025`가 import 하는 공유 컴포넌트: `NavigationBar`, `LineupSection`, `MasterClassSection`, `FooterSection`, `ImageList`(및 이들이 의존하는 하위 컴포넌트/상수/번역 키)
- 기존 `translations.ts` 키
- 기존 `public/` 자산
- `globals.css` / 루트 `layout.tsx`의 기존 규칙(추가만 허용)
- `middleware.ts`

### 회귀 검증
- 이식 전 `/2025?lang=ko`, `/2025?lang=en` 스크린샷/동작과 이식 후가 동일한지 확인.

---

## 6. 작업 순서(개략) — 상세는 구현 계획에서

1. 브랜치 `feat/2026-redesign` 생성 (완료).
2. 에셋 `public/2026/` 이관 + D-DIN `@font-face` 추가.
3. `translations.ts`에 2026 네임스페이스 추가(ko/en).
4. 2026 공용 컴포넌트(Nav2026, PageHeader, Footer2026) 작성.
5. `/`(메인) 구현.
6. `/about` `/theme` `/program` `/register` 순차 구현.
7. 테마 데이터 모듈 + `?year=` 처리.
8. 반응형·언어전환·링크(폼/PDF) 검증, `/2025` 회귀 확인, `build`/`biome` 통과.

---

## 7. 리스크 / 주의

- **공유 자원 오염**: 기존 컴포넌트/번역/글로벌을 건드리면 `/2025`가 깨진다 → 신규 파일·추가 전용 원칙 엄수.
- **다크모드 플래시**: 2026 페이지 배경 미지정 시 글로벌 다크 배경이 비친다 → 래퍼 배경 명시.
- **i18n 기본값 en**: 미들웨어 기본 언어가 `en`(2025 설정). 2026도 동일 정책 유지(필요 시 별도 논의).
- **폰트 용량**: Pretendard(@fontsource, 기존) + D-DIN 추가. D-DIN은 워터마크 전용이라 영향 적음.
- **Hero iframe**: 초기엔 정적 html 임베드. SSR/이미지 최적화 이점은 포기(차후 컴포넌트화 별도 과제).
</content>
