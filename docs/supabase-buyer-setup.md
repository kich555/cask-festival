# 바이어 신청 — Supabase 설정 안내

바이어 신청 데이터와 명함 이미지를 저장할 곳을 만드는 절차입니다.
무료 플랜으로 충분하며, 카드 등록은 필요하지 않습니다. 15분 정도 걸립니다.

끝나면 환경변수 4개가 준비되고, 로컬에서 신청 → 관리자 확인 → 엑셀 다운로드까지 동작합니다.

---

## 1. 프로젝트 만들기

1. <https://supabase.com> → **Start your project** → GitHub 또는 이메일로 가입
2. **New project**
   - **Name**: `cask-carnival`
   - **Database Password**: 아무거나 강한 것으로 생성해서 **어딘가에 저장** (나중에 DB 직접 접속할 때만 씀)
   - **Region**: `Northeast Asia (Seoul)` 또는 `(Tokyo)`
3. 생성까지 1~2분 기다립니다.

---

## 2. 테이블 만들기

왼쪽 메뉴 **SQL Editor** → **New query** → 아래를 통째로 붙여넣고 **Run**.

```sql
create table if not exists public.buyer_applications (
  id uuid primary key,
  created_at timestamptz not null default now(),
  status text not null default 'pending'
    check (status in ('pending','approved','rejected')),
  buyer_type text not null
    check (buyer_type in ('wholesale','retail','bar','importer','press')),

  name text not null,
  job_title text not null,
  company text not null,
  department text,
  phone text not null,
  email text not null,
  company_address text not null,
  country text not null,

  visit_day text not null check (visit_day in ('day1','day2','both')),
  companions integer not null default 0,

  business_number text,
  categories text,
  outlets text,

  media_name text,
  media_url text,
  press_purpose text,

  business_card_path text not null,
  document_path text,

  marketing_opt_in boolean not null default false,
  admin_note text
);

create index if not exists buyer_applications_created_at_idx
  on public.buyer_applications (created_at desc);

-- 개인정보 테이블이므로 RLS를 켠다.
-- 정책을 하나도 만들지 않으면 일반 키로는 아무것도 읽거나 쓸 수 없다.
-- 사이트는 service role 키로 서버에서만 접근하므로 RLS를 우회한다.
alter table public.buyer_applications enable row level security;
```

성공하면 `Success. No rows returned` 이 뜹니다.

---

## 3. 파일 저장소(버킷) 만들기

1. 왼쪽 메뉴 **Storage** → **New bucket**
2. **Name**: `buyer-uploads` (철자 정확히)
3. **Public bucket**: **반드시 꺼진 상태로** 둡니다.
   명함은 개인정보라 공개 URL로 열리면 안 됩니다.
   관리자 화면에서는 5분짜리 임시 링크를 발급해서 봅니다.
4. **Create bucket**

---

## 4. 키 두 개 확인하기

왼쪽 아래 **Project Settings** → **API**

| 화면의 이름 | 환경변수 |
|---|---|
| **Project URL** | `SUPABASE_URL` |
| **service_role** (Project API keys 아래, `Reveal` 눌러야 보임) | `SUPABASE_SERVICE_ROLE_KEY` |

> `service_role` 키는 데이터베이스 전체 권한을 가집니다.
> 서버에서만 쓰이고 브라우저로 나가지 않도록 코드가 짜여 있습니다.
> 채팅·메모·공개 저장소에 올리지 마세요.

---

## 5. 로컬 환경변수 파일 만들기

프로젝트 폴더(`cask-festival`)에 **`.env.local`** 파일을 만들고 아래를 채웁니다.
(`.env.local.example` 을 복사해서 쓰셔도 됩니다. 이 파일은 git에 올라가지 않습니다.)

```
SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
ADMIN_PASSWORD=여기에_길고_어려운_비밀번호
ADMIN_SESSION_SECRET=여기에_무작위_문자열
```

`ADMIN_SESSION_SECRET` 은 터미널에서 아래로 만들어 붙여넣으면 됩니다.

```
openssl rand -hex 32
```

---

## 6. 로컬에서 확인

```
npm run dev
```

- 신청 폼: <http://localhost:3000/buyer>
- 관리자: <http://localhost:3000/admin/buyers> (`ADMIN_PASSWORD` 로 로그인)

폼을 한 번 제출해 보고, 관리자 화면에 뜨는지 · 명함이 열리는지 · 엑셀이 받아지는지 확인합니다.

---

## 7. 배포할 때 (준비되면)

Vercel 프로젝트 → **Settings** → **Environment Variables** 에
위 4개를 **Production / Preview / Development** 모두 체크해서 등록하고 재배포합니다.

---

## 개인정보 관리 메모

- 명함·서류는 비공개 버킷에 있고, 관리자 로그인 없이는 링크조차 만들어지지 않습니다.
- 신청 폼에 **행사 종료 후 6개월 내 파기**로 고지했습니다. 그 시점에 Supabase에서
  테이블 행과 Storage 파일을 삭제해야 합니다. 시기가 되면 요청해 주세요.
- 관리자 비밀번호가 유출되면 전체 신청자 개인정보가 노출됩니다.
  공유는 최소한으로, 유출이 의심되면 환경변수만 바꾸면 즉시 차단됩니다.
