-- Users are managed by Supabase Auth (auth.users)
-- We store display names in a profiles table

create table public.profiles (
  id uuid references auth.users primary key,
  display_name text not null,
  created_at timestamptz default now()
);

create type project_type as enum (
  'projekt_std', 'projekt_cnc', 'pomiar_projekt', 'pomiar_projekt_montaz'
);
create type project_status as enum ('nowy', 'w_toku', 'gotowy', 'zarchiwizowany');
create type task_status as enum ('todo', 'w_toku', 'done');
create type transaction_type as enum ('przychod', 'wydatek');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  type project_type not null,
  status project_status not null default 'nowy',
  meters decimal(6,2),
  rate_per_mb decimal(8,2),
  notes text,
  deadline_doc date,
  deadline_install date,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table public.payment_phases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade,
  phase_key text not null,
  label text not null,
  amount decimal(10,2) not null default 0,
  paid boolean not null default false,
  paid_at date,
  paid_notes text,
  sort_order int not null default 0
);

create table public.material_costs (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete cascade,
  client_price decimal(10,2) not null,
  supplier_cost decimal(10,2) not null,
  date date not null,
  notes text
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete set null,
  title text not null,
  description text,
  assigned_to uuid references auth.users,
  status task_status not null default 'todo',
  due_date date,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects on delete set null,
  type transaction_type not null,
  amount decimal(10,2) not null,
  description text not null,
  category text default 'inne',
  date date not null,
  created_by uuid references auth.users,
  created_at timestamptz default now()
);

-- RLS: all authenticated users see all rows (shared company)
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.payment_phases enable row level security;
alter table public.material_costs enable row level security;
alter table public.tasks enable row level security;
alter table public.transactions enable row level security;

create policy "auth users see all" on public.profiles for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.projects for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.payment_phases for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.material_costs for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.tasks for all using (auth.role() = 'authenticated');
create policy "auth users see all" on public.transactions for all using (auth.role() = 'authenticated');
