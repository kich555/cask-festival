-- 프로그램 시간표(마스터클래스·테이스팅 세션·강연). 관리자 API(service role)만 읽고 쓴다.
-- 세션은 모두 90분이라 종료 시각은 저장하지 않는다.
create table if not exists public.program_sessions (
  id uuid primary key default gen_random_uuid(),
  day text not null check (day in ('sat', 'sun')),
  hall int not null check (hall between 1 and 6),
  start_time text not null check (start_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
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
