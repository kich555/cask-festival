# 참가 업체 페이지 + 인스타그램 자동 동기화 설계

작성일: 2026-09-13

## 배경

`www.caskcarnival.com`의 `/register`("참가 업체 모집")는 모집이 마감되어 역할이 끝났다.
이 자리를 대신해 실제 참가 업체를 노출하는 페이지가 필요하다.

업체 정보는 인스타그램 `@caskcarnival` 계정에 이미 게시물로 올라가고 있고, 앞으로도 계속
올라간다. 따라서 사이트가 인스타그램을 단일 출처(source of truth)로 삼고, 캡션이
`[BRAND BOOTH]`로 시작하는 게시물을 참가 업체로 인식해 자동으로 목록에 추가한다.

로고 이미지는 인스타그램 게시물 이미지를 쓰지 않는다. 별도로 전달받아 레포에 직접 넣으며,
전달 전까지는 플레이스홀더를 표시한다.

## 목표

- 인스타그램에 `[BRAND BOOTH]` 게시물을 올리면 별도 작업 없이 사이트에 반영된다.
- 이미 올라간 과거 게시물도 전부 수집한다.
- 로고는 나중에 수동으로 붙일 수 있고, 자동 동기화가 그 수동 작업을 덮어쓰지 않는다.
- `/register`는 삭제하지 않고 숨겨서 나중에 재활용할 수 있게 남긴다.

## 비목표

- 카테고리 필터, 검색, 정렬 UI (요구되지 않음)
- 업체 상세 페이지 (카드 클릭 시 인스타그램 게시물로 이동)
- 인스타그램 게시물 이미지를 사이트에 표시하는 것
- 실시간(분 단위) 반영 — 하루 1회로 충분하다

## 캡션 규약

게시물 캡션의 **첫 줄**만 파싱한다.

```
[BRAND BOOTH] 사쿠라오 증류소 | SAKURAO DISTILLERY | JP
```

- `[BRAND BOOTH]` 로 시작 (대소문자 무시, 앞뒤 공백 허용)
- 그 뒤를 `|` 로 3등분: `한글명 | 영문명 | 국가코드`
- 국가코드는 ISO 3166-1 alpha-2 2글자 (`JP`, `KR`, `TW`, `SC`은 스코틀랜드가 아니므로 스코틀랜드는 `GB-SCT` 대신 `GB` 사용)
- 둘째 줄 이후는 파싱하지 않는다. 자유롭게 작성해도 사이트에 영향이 없다.

형식이 맞지 않는 `[BRAND BOOTH]` 게시물은 **건너뛰고** 경고를 로그에 남긴다.
정상 게시물 처리는 계속된다.

## 아키텍처

```
인스타그램 @caskcarnival 게시물
  ↓  매일 09:00 UTC (= 18:00 KST) GitHub Actions 크론 / 수동 실행도 가능
scripts/sync-brands.mjs
  · Instagram Graph API /{IG_USER_ID}/media 를 끝까지 페이징
  · 캡션 첫 줄이 [BRAND BOOTH] 인 것만 필터 + 파싱
  · 기존 JSON과 id 기준 병합 (신규만 추가)
  ↓  변경이 있을 때만 git commit + push
src/content/brands2026.json
  ↓  push → Vercel 자동 배포
/brands 페이지 (정적 렌더링)
```

런타임에 인스타그램 API를 호출하지 않는다. 페이지는 레포의 JSON만 읽는 정적 페이지이므로
API 장애나 토큰 만료가 사이트 표시에 전혀 영향을 주지 않는다.

## 데이터

`src/content/brands2026.json` — 배열, 게시 시각 오름차순(먼저 올린 업체가 먼저).

```json
[
  {
    "id": "17912345678901234",
    "slug": "sakurao-distillery",
    "nameKo": "사쿠라오 증류소",
    "nameEn": "SAKURAO DISTILLERY",
    "country": "JP",
    "permalink": "https://www.instagram.com/p/XXXXXXXXXXX/",
    "timestamp": "2026-08-14T09:12:33+0000",
    "logo": null
  }
]
```

- `id` — 인스타그램 미디어 ID. 중복 판별의 유일한 키.
- `slug` — `nameEn`을 kebab-case로 변환. 로고 파일명 규약으로 쓴다.
- `logo` — `null`이면 플레이스홀더. 로고를 받으면 `public/brands/<slug>.png`에 넣고
  이 필드를 `"/brands/<slug>.png"`로 직접 수정한다.

### 병합 규칙

- 신규 `id`만 추가한다.
- 이미 존재하는 `id`의 필드는 **어떤 것도 덮어쓰지 않는다.** 손으로 고친 이름과 `logo`가
  보존된다.
- 인스타그램에서 게시물이 삭제되어도 JSON에서 자동 삭제하지 않는다. 의도치 않은 데이터
  손실을 막기 위해서다. 목록에서 빼려면 JSON에서 직접 지운다.
- 인스타그램 캡션을 고쳐서 반영하고 싶으면 해당 항목을 JSON에서 지우고 워크플로우를
  수동 실행한다.

## `/brands` 페이지

- 라우트: `src/app/brands/page.tsx` (서버 컴포넌트, 정적)
- 표시 컴포넌트: `src/components/2026/BrandsContent.tsx` (클라이언트 — 언어 토글 사용)
- 기존 `PageHeader2026` 패턴을 재사용해 다른 2026 페이지와 통일감을 유지한다.
- 타이틀: 한국어 "참가 업체" / 영어 "EXHIBITORS"
- 카드 그리드: 모바일 2열 / `sm` 3열 / `lg` 4열
- 카드 구성 (위 → 아래):
  1. 정사각 로고 영역 — `logo`가 있으면 `next/image`로 표시(`object-contain`, 여백 포함),
     없으면 플레이스홀더: 어두운 타일 위에 `nameEn` 이니셜 모노그램(최대 2자)
  2. 국기 이모지 + 브랜드명 — 한국어 모드는 `nameKo`, 영어 모드는 `nameEn`
- 국기: 국가코드를 regional indicator symbol로 변환하는 순수 함수
  (`src/lib/countryFlag.ts`). 라이브러리 의존성 없음.
- 카드 전체가 링크. `permalink`를 `target="_blank" rel="noopener noreferrer"`로 연다.
- 목록이 비었을 때: "참가 업체는 곧 공개됩니다." / "Exhibitors will be announced soon."
- SEO: `metadata`에 title/description/openGraph 지정.

### 네비게이션 변경

- `src/components/2026/Nav2026.tsx` — `{ href: "/register", key: "register" }` →
  `{ href: "/brands", key: "brands" }`
- `src/components/2026/Footer2026.tsx` — 동일하게 교체
- `src/components/2026/Home2026.tsx:221` — `/register` CTA 링크를 `/brands`로 교체
- `src/i18n/content2026.ts` — `nav.register` → `nav.brands`("참가 업체" / "EXHIBITORS"),
  `brandsP` 콘텐츠 블록 추가(타이틀, 서브타이틀, 빈 목록 문구). 한/영 양쪽.

## `/register` 숨김 처리

삭제하지 않는다. 나중에 다음 회차 모집 페이지로 재활용한다.

- `src/app/register/page.tsx` 유지 → URL 직접 입력 시 여전히 동작
- `metadata`에 `robots: { index: false, follow: false }` 추가
- 네비게이션·푸터·홈 CTA에서 링크 제거 (위 항목에서 이미 처리)
- 파일 상단에 재활용 대기 상태임을 알리는 주석
- `sitemap.ts`에는 원래 없으므로 변경 불필요

## 동기화 스크립트

`scripts/sync-brands.mjs` — 의존성 없는 Node ESM 스크립트(Node 20+ 내장 `fetch` 사용).

파싱·병합·slug·국기 로직은 순수 함수로 분리해 `scripts/lib/` 에 두고, API 호출과
파일 쓰기만 최상위에서 수행한다. 순수 함수는 API 토큰 없이 단독 테스트할 수 있다.

동작:
1. `IG_ACCESS_TOKEN`, `IG_USER_ID` 환경변수 확인. 없으면 명확한 메시지와 함께 종료(코드 1).
2. `GET /{IG_USER_ID}/media?fields=id,caption,permalink,timestamp&limit=100`
   — `paging.next`를 따라 **전체 이력**을 수집.
3. 캡션 첫 줄 필터 + 파싱. 형식 불일치는 경고 후 건너뜀.
4. 기존 `brands2026.json`을 읽어 id 기준 병합.
5. 변경이 없으면 아무것도 쓰지 않고 "변경 없음" 로그 후 정상 종료.
6. 변경이 있으면 JSON을 쓰고, 추가된 업체 목록을 로그에 출력.
7. 토큰 만료일을 확인(`GET /access_token?grant_type=ig_refresh_token`)해 갱신을 시도하고,
   남은 기간이 14일 미만이면 로그에 경고를 남긴다.

### 토큰 갱신

인스타그램 장기 토큰은 60일 만료이며, 유효한 상태에서 갱신 호출을 하면 다시 60일로 연장된다.
크론이 매일 도는 한 자동으로 계속 살아 있다. 다만 갱신된 토큰을 GitHub Secret에 다시 쓰려면
추가 권한이 필요하므로, **1차 구현에서는 갱신 호출만 하고 결과를 Secret에 자동 반영하지는
않는다.** 만료 임박 시 Actions 실패로 알림이 오면 수동으로 Secret을 교체한다.
(자동 반영은 필요해지면 별도 작업으로 다룬다.)

## GitHub Actions 워크플로우

`.github/workflows/sync-brands.yml`

- 트리거: `schedule` (`0 9 * * *` = 18:00 KST) + `workflow_dispatch` (수동 실행 버튼)
- 권한: `contents: write`
- 단계: checkout → Node 20 setup → `node scripts/sync-brands.mjs` →
  `brands2026.json`에 변경이 있으면 커밋 & push
- 커밋 메시지: `chore(brands): 인스타그램에서 참가 업체 N곳 동기화`
- 커밋 작성자: `github-actions[bot]`
- 실패 시: 워크플로우가 실패로 표시되어 GitHub 기본 알림이 발송된다. JSON은 변경되지
  않으므로 사이트는 영향 없음.

주의: Actions가 push한 커밋이 다시 워크플로우를 트리거하지 않도록, 이 워크플로우는
`push` 트리거를 쓰지 않는다.

## 설정 안내 문서

`docs/instagram-brand-sync-setup.md` — 진하님이 직접 수행해야 하는 설정 절차를
클릭 경로 수준까지 적는다.

1. 인스타그램 계정을 비즈니스/크리에이터로 전환
2. 페이스북 페이지 생성 및 인스타그램 계정 연동
3. Meta 개발자 앱 생성, `instagram_basic` · `pages_show_list` 권한 추가
4. 단기 토큰 → 60일 장기 토큰 교환 (복사해 쓸 수 있는 URL 형태로 제시)
5. `IG_USER_ID` 조회
6. GitHub 레포 Settings → Secrets and variables → Actions 에
   `IG_ACCESS_TOKEN`, `IG_USER_ID` 등록
7. 설정이 됐는지 확인하는 검증 요청 1개 + 워크플로우 수동 실행으로 최종 확인

토큰은 계정 접근 권한이므로 Secrets에 직접 입력한다.

## 에러 처리

| 상황 | 동작 |
|---|---|
| 환경변수 누락 | 스크립트가 메시지 출력 후 코드 1로 종료 |
| API 오류 / 토큰 만료 | 코드 1로 종료, JSON 미변경, Actions 실패 알림, 사이트 영향 없음 |
| 캡션 형식 불일치 | 해당 게시물만 건너뛰고 경고 로그, 나머지는 정상 처리 |
| 국가코드가 2글자가 아님 | 형식 불일치로 처리(건너뜀) |
| 로고 파일 없음 | `logo: null` → 플레이스홀더 표시 (정상 상태) |
| 목록이 빈 상태로 배포 | 페이지가 "곧 공개됩니다" 문구 표시 |

## 테스트

- `scripts/lib/` 순수 함수 단위 테스트 (Node 내장 `node:test`, 추가 의존성 없음)
  - 캡션 파싱: 정상 / 접두어 없음 / 파이프 개수 부족 / 공백 과다 / 대소문자 혼용 /
    국가코드 길이 오류
  - 병합: 신규 추가 / 기존 보존(`logo` 유지) / 삭제된 게시물 보존 / 순서 정렬
  - slug 생성: 공백·특수문자·대문자 처리
  - 국기 변환: 정상 코드 / 잘못된 코드
- `/brands` 페이지: 항목 있는 JSON과 빈 JSON 양쪽으로 로컬 렌더링 확인
- `npm run lint:check` 통과
- 실제 API 연동은 토큰 확보 후 워크플로우 수동 실행으로 검증

## 작업 순서

1. 설정 안내 문서(`docs/instagram-brand-sync-setup.md`) 작성 → 진하님이 설정 시작
2. 동시에 순수 함수 + 테스트 구현
3. 동기화 스크립트 구현
4. `/brands` 페이지 + i18n + 네비게이션 교체
5. `/register` 숨김 처리
6. GitHub Actions 워크플로우 추가
7. Secrets 등록 후 워크플로우 수동 실행으로 전체 검증
