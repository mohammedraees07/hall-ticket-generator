-- Persist seating plans instead of process memory. Benches are stored as one
-- validated document because the UI edits a complete room layout at once.
create table if not exists public.seating_plans (
  id bigint generated always as identity primary key,
  examination_id integer not null references public.examinations(id) on delete cascade,
  room_name varchar(255) not null,
  exam_date date not null,
  session varchar(100) not null,
  total_benches integer not null check (total_benches > 0),
  benches_per_row integer not null check (benches_per_row > 0),
  benches jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (examination_id, room_name, exam_date, session)
);
create index if not exists seating_plans_exam_date_idx
  on public.seating_plans (examination_id, exam_date);

alter table public.seating_plans enable row level security;
revoke all on public.seating_plans from anon, authenticated;
