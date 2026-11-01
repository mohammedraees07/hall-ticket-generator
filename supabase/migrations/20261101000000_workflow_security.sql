-- Durable examination-application workflow and baseline data protection.
-- Apply with the Supabase CLI or SQL Editor after reviewing against the live schema.

create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('ADMIN', 'STAFF', 'ACCOUNTS', 'PRINCIPAL', 'STUDENT')),
  student_id integer unique references public.students(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint student_role_requires_student check ((role = 'STUDENT') = (student_id is not null))
);

create table if not exists public.exam_application_windows (
  id bigint generated always as identity primary key,
  examination_id integer not null references public.examinations(id) on delete cascade,
  course_id integer references public.courses(id) on delete restrict,
  semester integer not null check (semester between 1 and 10),
  academic_year varchar(20) not null,
  title varchar(255) not null,
  description text not null default '',
  opens_at timestamptz not null default now(),
  closes_at timestamptz not null,
  is_open boolean not null default false,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint application_window_dates check (closes_at > opens_at)
);

create unique index if not exists one_open_window_per_exam_cohort
  on public.exam_application_windows (examination_id, course_id, semester, academic_year)
  where is_open;
create index if not exists exam_application_windows_cohort_lookup
  on public.exam_application_windows (course_id, semester, academic_year, is_open);

create table if not exists public.exam_applications (
  id bigint generated always as identity primary key,
  examination_id integer not null references public.examinations(id) on delete restrict,
  student_id integer not null references public.students(id) on delete restrict,
  application_number varchar(64) not null unique,
  photo_url text,
  fee_receipt_url text,
  subjects_confirmed boolean not null,
  subject_issue_note text,
  arrears jsonb not null default '[]'::jsonb,
  stage text not null default 'UNDER_ACCOUNTS_REVIEW'
    check (stage in ('APPLIED', 'UNDER_ACCOUNTS_REVIEW', 'ACCOUNTS_CLEARED', 'PRINCIPAL_APPROVED', 'HALL_TICKET_ISSUED', 'REJECTED')),
  hall_ticket_id integer unique references public.hall_tickets(id) on delete set null,
  submitted_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  submitted_by uuid references auth.users(id) on delete set null,
  unique (examination_id, student_id),
  constraint application_subject_note check (subjects_confirmed or length(trim(coalesce(subject_issue_note, ''))) > 0)
);
create index if not exists exam_applications_exam_stage_idx on public.exam_applications (examination_id, stage);
create index if not exists exam_applications_student_idx on public.exam_applications (student_id, updated_at desc);

create table if not exists public.exam_application_decisions (
  id bigint generated always as identity primary key,
  application_id bigint not null references public.exam_applications(id) on delete cascade,
  decision_type text not null check (decision_type in ('ACCOUNTS_CLEARANCE', 'PRINCIPAL_EXCEPTION')),
  decision text not null check (decision in ('PENDING', 'CLEARED', 'APPROVED', 'REJECTED')),
  college_fees text check (college_fees in ('Pending', 'No Due')),
  hostel_fees text check (hostel_fees in ('Pending', 'No Due', 'N/A')),
  bus_fees text check (bus_fees in ('Pending', 'No Due', 'N/A')),
  fine text check (fine in ('Pending', 'Paid', 'N/A')),
  reason text,
  decided_by uuid not null references auth.users(id) on delete restrict,
  decided_at timestamptz not null default now()
);
create index if not exists exam_application_decisions_application_idx
  on public.exam_application_decisions (application_id, decided_at desc);

create table if not exists public.exam_application_events (
  id bigint generated always as identity primary key,
  application_id bigint not null references public.exam_applications(id) on delete cascade,
  event_type text not null,
  from_stage text,
  to_stage text,
  actor_id uuid references auth.users(id) on delete set null,
  details jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.college_settings
  add column if not exists principal_signature_mode text default 'scribble',
  add column if not exists principal_typed_signature text,
  add column if not exists registrar_name varchar(255),
  add column if not exists registrar_signature_url text,
  add column if not exists registrar_signature_mode text default 'typed',
  add column if not exists registrar_typed_signature text;

-- All client access is denied by default. The application uses a server-side
-- service-role client after API authorization; policies below support safe direct reads.
alter table public.user_profiles enable row level security;
alter table public.exam_application_windows enable row level security;
alter table public.exam_applications enable row level security;
alter table public.exam_application_decisions enable row level security;
alter table public.exam_application_events enable row level security;

revoke all on public.user_profiles, public.exam_application_windows, public.exam_applications,
  public.exam_application_decisions, public.exam_application_events from anon, authenticated;

grant select on public.user_profiles to authenticated;
grant select on public.exam_application_windows to authenticated;

create policy "users read own profile" on public.user_profiles for select to authenticated
  using ((select auth.uid()) = id);
create policy "authenticated users read application windows" on public.exam_application_windows for select to authenticated
  using (true);

-- Private storage. Server uploads use the service key after checking the API caller.
insert into storage.buckets (id, name, public)
values ('candidate-documents', 'candidate-documents', false)
on conflict (id) do update set public = false;

drop policy if exists "Public Read Access" on storage.objects;
drop policy if exists "Allow Public Uploads" on storage.objects;
drop policy if exists "Allow Public Updates" on storage.objects;
revoke all on storage.objects from anon, authenticated;
