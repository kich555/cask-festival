-- 프로그램 시간표(마스터클래스·테이스팅 세션·강연). 관리자 API(service role)만 읽고 쓴다.
-- 세션은 기본 90분이라 종료 시각은 저장하지 않는다.
-- 예외로 시간이 다른 세션만 actual_start/actual_end 에 실제 시간을 적는다(줄은 start_time).
create table if not exists public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  day text not null check (day in ('sat', 'sun')),
  hall int not null check (hall between 1 and 6),
  start_time text not null check (start_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  actual_start text check (actual_start ~ '^[0-2][0-9]:[0-5][0-9]$'),
  actual_end text check (actual_end ~ '^[0-2][0-9]:[0-5][0-9]$'),
  kind text not null check (kind in ('masterclass', 'tasting', 'lecture')),
  name_ko text not null default '',
  name_en text not null default '',
  logo text,
  logo_bg text,
  logo_wide boolean not null default false,
  speaker_ko text,
  speaker_en text,
  title_ko text,
  title_en text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (day, hall, start_time)
);

-- 정책을 두지 않아 anon 접근은 모두 막히고 service role 만 통과한다.
alter table public.program_sessions enable row level security;

-- 기존 테이블에 예외 시간 열 추가 (2026-10-13)
alter table public.program_sessions add column if not exists actual_start text;
alter table public.program_sessions add column if not exists actual_end text;
