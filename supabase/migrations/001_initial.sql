-- Enable crypto for UUID generation
create extension if not exists "pgcrypto";

-- Utility function to maintain updated_at timestamps
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Core tables
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique,
  address jsonb,
  timezone text not null default 'America/New_York',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.app_users (
  id uuid primary key,
  email text not null unique,
  full_name text,
  phone text,
  organization_id uuid references public.organizations(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.roles (
  code text primary key,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid references public.app_users(id) on delete cascade,
  role_code text references public.roles(code) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid,
  primary key (user_id, role_code)
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  summary text,
  status text not null default 'planning',
  start_date date,
  end_date date,
  budget numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assets (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  asset_type text not null default 'parking_area',
  surface_area_sq_ft numeric,
  pavement_condition_index integer,
  location jsonb,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.project_assets (
  project_id uuid not null references public.projects(id) on delete cascade,
  asset_id uuid not null references public.assets(id) on delete cascade,
  primary key (project_id, asset_id)
);

create table if not exists public.inspections (
  id uuid primary key default gen_random_uuid(),
  asset_id uuid not null references public.assets(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  inspection_date date not null default current_date,
  inspector_id uuid references public.app_users(id) on delete set null,
  overall_score numeric,
  weather jsonb,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.inspection_observations (
  id uuid primary key default gen_random_uuid(),
  inspection_id uuid not null references public.inspections(id) on delete cascade,
  distress_type text not null,
  severity text,
  area_sq_ft numeric,
  photos jsonb,
  recommendation text,
  created_at timestamptz not null default now()
);

-- Updated at triggers
create trigger organizations_set_updated_at
before update on public.organizations
for each row execute function public.set_updated_at();

create trigger app_users_set_updated_at
before update on public.app_users
for each row execute function public.set_updated_at();

create trigger projects_set_updated_at
before update on public.projects
for each row execute function public.set_updated_at();

create trigger assets_set_updated_at
before update on public.assets
for each row execute function public.set_updated_at();

create trigger inspections_set_updated_at
before update on public.inspections
for each row execute function public.set_updated_at();

-- Helper functions for RLS
create or replace function public.has_role(role_code text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.user_roles ur
    where ur.user_id = auth.uid()
      and ur.role_code = has_role.role_code
  );
$$;

create or replace function public.is_org_member(org_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.app_users au
    where au.id = auth.uid()
      and au.organization_id = org_id
  ) or public.has_role('super_admin');
$$;

-- RLS configuration
alter table public.organizations enable row level security;
create policy "Organizations readable by members"
  on public.organizations for select
  using (public.is_org_member(id));
create policy "Organizations manageable by super admins"
  on public.organizations for all
  using (public.has_role('super_admin'));

alter table public.app_users enable row level security;
create policy "Self profile access"
  on public.app_users for select
  using (id = auth.uid() or public.has_role('super_admin'));
create policy "Self profile update"
  on public.app_users for update
  using (id = auth.uid() or public.has_role('super_admin'))
  with check (id = auth.uid() or public.has_role('super_admin'));
create policy "Admins manage users"
  on public.app_users for insert
  with check (public.has_role('super_admin'));
create policy "Admins delete users"
  on public.app_users for delete
  using (public.has_role('super_admin'));

alter table public.projects enable row level security;
create policy "Project read by org members"
  on public.projects for select
  using (public.is_org_member(organization_id));
create policy "Project write by org admins"
  on public.projects for all
  using (public.is_org_member(organization_id) and public.has_role('project_manager'))
  with check (public.is_org_member(organization_id));

alter table public.assets enable row level security;
create policy "Assets read by org members"
  on public.assets for select
  using (public.is_org_member(organization_id));
create policy "Assets write by org admins"
  on public.assets for all
  using (public.is_org_member(organization_id) and public.has_role('estimator'))
  with check (public.is_org_member(organization_id));

alter table public.project_assets enable row level security;
create policy "Project assets managed by org members"
  on public.project_assets for all
  using (
    public.is_org_member(
      (select organization_id from public.projects p where p.id = project_id)
    )
  )
  with check (
    public.is_org_member(
      (select organization_id from public.projects p where p.id = project_id)
    )
  );

alter table public.inspections enable row level security;
create policy "Inspections read by org members"
  on public.inspections for select
  using (
    public.is_org_member(
      (select organization_id from public.assets a where a.id = asset_id)
    )
  );
create policy "Inspections write by project managers"
  on public.inspections for all
  using (
    public.is_org_member(
      (select organization_id from public.assets a where a.id = asset_id)
    ) and public.has_role('project_manager')
  )
  with check (
    public.is_org_member(
      (select organization_id from public.assets a where a.id = asset_id)
    )
  );

alter table public.inspection_observations enable row level security;
create policy "Observation read/write by inspection members"
  on public.inspection_observations for all
  using (
    public.is_org_member(
      (select organization_id from public.assets a
         join public.inspections i on i.asset_id = a.id
       where i.id = inspection_id)
    )
  )
  with check (
    public.is_org_member(
      (select organization_id from public.assets a
         join public.inspections i on i.asset_id = a.id
       where i.id = inspection_id)
    )
  );

alter table public.user_roles enable row level security;
create policy "Roles managed by super admins"
  on public.user_roles for all
  using (public.has_role('super_admin'))
  with check (public.has_role('super_admin'));

-- Seed static role values
insert into public.roles (code, label, description)
values
  ('super_admin', 'Super Administrator', 'Full access across all organizations'),
  ('estimator', 'Estimator', 'Create estimates, manage assets'),
  ('project_manager', 'Project Manager', 'Plan and manage active projects'),
  ('crew_lead', 'Crew Lead', 'Execute field tasks and update progress'),
  ('accountant', 'Accountant', 'Manage invoicing and financial reporting')
on conflict (code) do update set
  label = excluded.label,
  description = excluded.description;

