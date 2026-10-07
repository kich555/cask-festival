-- 참가업체 부스 정보 확인 · 부대시설 추가 신청 (/exhibitor). 업체(브랜드)당 1행.
-- 계정은 scripts/create-exhibitor-accounts.mjs 로 일괄 생성한다.
create table if not exists public.exhibitor_accounts (
  brand_slug text primary key references public.brands(slug) on delete cascade,
  login_id text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

alter table public.exhibitor_accounts
  -- 부스 표기 정보: approved(그대로 승인) | revised(수정 요청)
  add column if not exists booth_status text check (booth_status in ('approved','revised')),
  add column if not exists booth_name_ko text,
  add column if not exists booth_name_en text,
  add column if not exists booth_note text,
  add column if not exists booth_confirmed_at timestamptz,
  -- 부대시설 추가 신청 { item_key: qty }
  add column if not exists extra_items jsonb not null default '{}'::jsonb,
  add column if not exists water_location text,
  add column if not exists extra_note text,
  add column if not exists extra_submitted_at timestamptz,
  drop column if exists confirmed_at,
  drop column if exists booth_country;

alter table public.exhibitor_accounts enable row level security;

-- 2026-10-07: 이전 초안 정리
drop table if exists public.exhibitor_files;
drop table if exists public.brand_change_log;

-- 신청·수정 내역 (저장할 때마다 1행)
-- kind: booth_approve | booth_revise | extra
create table if not exists public.exhibitor_log (
  id uuid primary key default gen_random_uuid(),
  brand_slug text not null references public.brands(slug) on delete cascade,
  kind text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
create index if not exists exhibitor_log_created_idx on public.exhibitor_log (created_at desc);
alter table public.exhibitor_log enable row level security;

-- 2026-10-07: 관리자 처리 상태
alter table public.exhibitor_accounts
  -- 부스 수정 요청을 관리자가 확인한 시각 (업체가 다시 수정 요청하면 null)
  add column if not exists booth_ack_at timestamptz,
  -- 첫 신청 이후의 부대시설 변경 요청 { items, water_location, note, total } — 관리자 승인 전까지 보류
  add column if not exists extra_pending jsonb,
  add column if not exists extra_pending_at timestamptz,
  -- 마지막 변경 요청 처리 결과: approved | rejected
  add column if not exists extra_decision text check (extra_decision in ('approved','rejected')),
  add column if not exists extra_decided_at timestamptz;

-- 업체가 비밀번호를 직접 바꾼 시각 (null = 임시 비밀번호 사용 중)
alter table public.exhibitor_accounts add column if not exists password_changed_at timestamptz;
