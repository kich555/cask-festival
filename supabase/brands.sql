-- 참가업체(브랜드). 관리자 API(service role)만 읽고 쓴다.
create table if not exists public.brands (
  slug text primary key,
  name_ko text not null,
  name_en text,
  country text not null,
  country_ko text not null,
  website text,
  instagram text,
  booths int not null default 1 check (booths >= 1),
  logo text,
  logo_bg text,
  visible boolean not null default false,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 정책을 두지 않아 anon 접근은 모두 막히고 service role 만 통과한다.
alter table public.brands enable row level security;
