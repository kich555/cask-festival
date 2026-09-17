# 관리자 브랜드 관리 탭 설계

## 목표
참가업체(브랜드)를 코드 수정·배포 없이 관리자 페이지에서 관리한다: 노출 여부 전환, 로고 등록, 신규 추가, 정보 수정, 순서 변경.

## 라우팅
- `/admin` — 관리자 허브. 로그인 후 **[브랜드 관리] [바이어 관리]** 탭 링크를 보여준다.
- `/admin/brands` — 브랜드 관리 (신규)
- `/admin/buyer` — 바이어 관리 (기존 `/admin/buyers`에서 이름 변경, 공개 사이트 `/buyer`와 통일)
- `/admin/buyers` → `/admin/buyer` 영구 리다이렉트 (`next.config.ts` redirects)
- 세 페이지 상단에 공통 탭 바(`AdminTabs`)를 두어 서로 이동한다. 로그인은 기존 `isAdminRequest`/`AdminLogin` 재사용.

## 데이터 (Supabase)
### 테이블 `brands`
| 컬럼 | 타입 | 비고 |
|---|---|---|
| slug | text PK | kebab-case, 영문명(없으면 한글명 로마자 불가 시 `brand-<timestamp>`)에서 자동 생성, 수정 가능 |
| name_ko | text not null | |
| name_en | text null | 비어 있으면 이니셜은 한글명 앞 2자 |
| country | text not null | ISO alpha-2 / `GB-SCT` |
| country_ko | text not null | |
| website | text null | |
| instagram | text null | |
| booths | int not null default 1 | |
| logo | text null | Storage public URL |
| logo_bg | text null | |
| visible | bool not null default false | |
| sort_order | int not null | 오름차순 표시 |
| created_at / updated_at | timestamptz | |

### Storage 버킷 `brand-logos`
public read. 업로드/삭제는 service role(서버 API)만. 파일명 `<slug>-<timestamp>.<ext>`.

### 초기 가져오기 `scripts/import-brands.mjs` (1회)
- 엑셀 `캐스크카니발_참가업체_목록.xlsx` 시트 `참가업체`에서 한글명이 있는 행만 → **57개** (1 위오크 ~ 57 낫개오뎅).
- `brands2026.json`에 있는 **33개**: 로고 파일을 버킷에 업로드, JSON 값 우선, `visible=true`, JSON 순서대로 sort_order.
- 나머지 **24개**: `visible=false`, 엑셀 번호 순으로 뒤에 배치. 국가 한글명 → 코드 매핑.
- 매칭 기준: 공백 제거한 한글명 또는 영문명(대소문자·NBSP 무시). upsert라 재실행 안전.

## 관리자 화면 `/admin/brands`
- 목록: 로고 썸네일 · 한글/영문명 · 국가 · 부스 · **노출중/숨김 토글** · ▲▼ 순서 버튼.
- 상단: 필터(전체/노출중/숨김/로고 없음), 검색, 개수 표시, **[+ 브랜드 추가]**.
- 행 클릭 → 편집 모달: 전체 필드 수정, 로고 드래그·선택 업로드/삭제, 브랜드 삭제(확인 필요).
- 로고 없는 브랜드를 노출로 전환 시 "로고 없이 노출할까요?" 확인.
- 기존 AdminDashboard 스타일(색·폰트) 그대로 따른다.

## API (`/api/admin/brands/*`, 모두 isAdminRequest 검사)
- `GET /api/admin/brands` 목록
- `POST /api/admin/brands` 생성
- `PATCH /api/admin/brands/[slug]` 수정(토글 포함)
- `DELETE /api/admin/brands/[slug]` 삭제(로고 파일도 제거)
- `POST /api/admin/brands/reorder` `{ slugs: string[] }`
- `POST /api/admin/brands/[slug]/logo` multipart 업로드 (png/jpg/webp/svg, ≤5MB), `DELETE` 로 제거
- 변경 후 `revalidatePath("/brands")`, `revalidatePath("/")`.

## 공개 사이트
- `getBrands()`를 async로: Supabase에서 `visible=true` order by sort_order, `revalidate = 60`. snake_case → 기존 `Brand` 타입으로 매핑.
- 조회 실패 시 `brands2026.json` 폴백.
- `/brands`, 홈 호출부만 await로 수정. `BrandsContent` 렌더링 로직 변경 없음 (`nameEn` null 대응만 추가).

## 에러 처리
API는 `{ error }` + 적절한 status. 화면은 실패 시 토스트/인라인 메시지 후 이전 상태로 되돌림(낙관적 토글 롤백).

## 검증
- 가져오기 후 총 57 / 노출 33 확인.
- 로컬에서 추가·로고 업로드·토글·순서 변경 → `/brands` 반영 확인, `/admin/buyers` 리다이렉트 확인.
- `pnpm build`, `biome check` 통과. 의존성 추가 시 pnpm-lock 갱신.

## 범위 제외
드래그 정렬, 엑셀 재동기화, 변경 이력.
