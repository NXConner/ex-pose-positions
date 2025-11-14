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

-- Core identity
create table if not exists public.profiles (
  id uuid primary key,
  email text not null unique,
  display_name text,
  avatar_url text,
  preferences jsonb not null default '{}'::jsonb,
  timezone text not null default 'UTC',
  locale text not null default 'en-US',
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.connections (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'pending',
  created_by uuid references public.profiles(id) on delete set null,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.connection_members (
  connection_id uuid not null references public.connections(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role text not null default 'partner',
  preferences jsonb not null default '{}'::jsonb,
  joined_at timestamptz not null default now(),
  primary key (connection_id, profile_id)
);

-- Consent & agreements
create table if not exists public.consent_agreements (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  scope text not null default 'session',
  summary text,
  body jsonb,
  effective_at timestamptz,
  expires_at timestamptz,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Shared experiences and sequences
create table if not exists public.experiences (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  title text not null,
  status text not null default 'draft',
  scheduled_for timestamptz,
  duration_minutes integer,
  mood_focus text,
  tags text[],
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.experience_segments (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references public.experiences(id) on delete cascade,
  order_index integer not null default 0,
  label text,
  position_reference text,
  prompt text,
  duration_minutes integer,
  metadata jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Journaling & reflections
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  connection_id uuid not null references public.connections(id) on delete cascade,
  experience_id uuid references public.experiences(id) on delete set null,
  author_profile_id uuid references public.profiles(id) on delete set null,
  entry_type text not null default 'reflection',
  mood text,
  title text,
  content jsonb,
  visibility text not null default 'shared',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Lists & shared collections
create table if not exists public.lists (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid references public.profiles(id) on delete cascade,
  connection_id uuid references public.connections(id) on delete cascade,
  title text not null,
  list_type text not null default 'custom',
  visibility text not null default 'private',
  is_pinned boolean not null default false,
  sort_order integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint lists_owner_scope check ((owner_profile_id is not null) or (connection_id is not null))
);

create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.lists(id) on delete cascade,
  item_type text not null default 'position',
  item_reference text,
  payload jsonb,
  note text,
  created_at timestamptz not null default now()
);

-- Private gallery / vault
create table if not exists public.vault_media (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles(id) on delete cascade,
  connection_id uuid references public.connections(id) on delete set null,
  storage_path text not null,
  media_type text not null,
  checksum text,
  encryption_type text,
  encrypted_key text,
  metadata jsonb,
  captured_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_profile_id, storage_path)
);

-- Feature flag configuration
create table if not exists public.feature_flags (
  key text not null,
  environment text not null default 'production',
  description text,
  enabled boolean not null default false,
  payload jsonb,
  updated_by uuid references public.profiles(id) on delete set null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  primary key (key, environment)
);

-- Activity log for observability
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles(id) on delete set null,
  connection_id uuid references public.connections(id) on delete set null,
  event_type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

-- Roles for privileged operations
create table if not exists public.roles (
  code text primary key,
  label text not null,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.user_roles (
  user_id uuid not null references public.profiles(id) on delete cascade,
  role_code text not null references public.roles(code) on delete cascade,
  granted_at timestamptz not null default now(),
  granted_by uuid,
  primary key (user_id, role_code)
);

-- Updated at triggers
create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger connections_set_updated_at
before update on public.connections
for each row execute function public.set_updated_at();

create trigger consent_agreements_set_updated_at
before update on public.consent_agreements
for each row execute function public.set_updated_at();

create trigger experiences_set_updated_at
before update on public.experiences
for each row execute function public.set_updated_at();

create trigger experience_segments_set_updated_at
before update on public.experience_segments
for each row execute function public.set_updated_at();

create trigger journal_entries_set_updated_at
before update on public.journal_entries
for each row execute function public.set_updated_at();

create trigger lists_set_updated_at
before update on public.lists
for each row execute function public.set_updated_at();

create trigger vault_media_set_updated_at
before update on public.vault_media
for each row execute function public.set_updated_at();

create trigger feature_flags_set_updated_at
before update on public.feature_flags
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

create or replace function public.is_connection_member(target_connection_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.connection_members cm
    where cm.connection_id = target_connection_id
      and cm.profile_id = auth.uid()
  ) or public.has_role('super_admin');
$$;

create or replace function public.is_profile_self(target_profile_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select target_profile_id = auth.uid() or public.has_role('super_admin');
$$;

-- RLS configuration
alter table public.profiles enable row level security;
create policy "Profiles readable by owner" on public.profiles
  for select using (public.is_profile_self(id));
create policy "Profiles updatable by owner" on public.profiles
  for update using (public.is_profile_self(id))
  with check (public.is_profile_self(id));
create policy "Profiles insertable by super admin" on public.profiles
  for insert with check (public.has_role('super_admin'));
create policy "Profiles deletable by super admin" on public.profiles
  for delete using (public.has_role('super_admin'));

alter table public.connections enable row level security;
create policy "Connections accessible to members" on public.connections
  for select using (public.is_connection_member(id));
create policy "Connections manageable by members" on public.connections
  for all using (public.is_connection_member(id))
  with check (public.is_connection_member(id));

alter table public.connection_members enable row level security;
create policy "Connection membership visible to members" on public.connection_members
  for select using (public.is_connection_member(connection_id));
create policy "Connection membership manageable" on public.connection_members
  for all using (public.is_connection_member(connection_id))
  with check (public.is_connection_member(connection_id));

alter table public.consent_agreements enable row level security;
create policy "Consent readable by members" on public.consent_agreements
  for select using (public.is_connection_member(connection_id));
create policy "Consent managed by members" on public.consent_agreements
  for all using (public.is_connection_member(connection_id))
  with check (public.is_connection_member(connection_id));

alter table public.experiences enable row level security;
create policy "Experiences readable by members" on public.experiences
  for select using (public.is_connection_member(connection_id));
create policy "Experiences manageable by members" on public.experiences
  for all using (public.is_connection_member(connection_id))
  with check (public.is_connection_member(connection_id));

alter table public.experience_segments enable row level security;
create policy "Segments readable by members" on public.experience_segments
  for select using (
    public.is_connection_member((select connection_id from public.experiences e where e.id = experience_id))
  );
create policy "Segments manageable by members" on public.experience_segments
  for all using (
    public.is_connection_member((select connection_id from public.experiences e where e.id = experience_id))
  ) with check (
    public.is_connection_member((select connection_id from public.experiences e where e.id = experience_id))
  );

alter table public.journal_entries enable row level security;
create policy "Journal readable by members" on public.journal_entries
  for select using (public.is_connection_member(connection_id));
create policy "Journal manageable by members" on public.journal_entries
  for all using (public.is_connection_member(connection_id))
  with check (public.is_connection_member(connection_id));

alter table public.lists enable row level security;
create policy "Lists readable by owner or members" on public.lists
  for select using (
    public.has_role('super_admin')
    or owner_profile_id = auth.uid()
    or (connection_id is not null and public.is_connection_member(connection_id))
  );
create policy "Lists manageable by owner or members" on public.lists
  for all using (
    public.has_role('super_admin')
    or owner_profile_id = auth.uid()
    or (connection_id is not null and public.is_connection_member(connection_id))
  ) with check (
    public.has_role('super_admin')
    or owner_profile_id = auth.uid()
    or (connection_id is not null and public.is_connection_member(connection_id))
  );

alter table public.list_items enable row level security;
create policy "List items follow parent access" on public.list_items
  for all using (
    public.has_role('super_admin')
    or exists (
      select 1 from public.lists l
      where l.id = list_id
        and (
          l.owner_profile_id = auth.uid()
          or (l.connection_id is not null and public.is_connection_member(l.connection_id))
          or public.has_role('super_admin')
        )
    )
  ) with check (
    public.has_role('super_admin')
    or exists (
      select 1 from public.lists l
      where l.id = list_id
        and (
          l.owner_profile_id = auth.uid()
          or (l.connection_id is not null and public.is_connection_member(l.connection_id))
          or public.has_role('super_admin')
        )
    )
  );

alter table public.vault_media enable row level security;
create policy "Vault media accessible to owner or members" on public.vault_media
  for select using (
    public.has_role('super_admin')
    or owner_profile_id = auth.uid()
    or (connection_id is not null and public.is_connection_member(connection_id))
  );
create policy "Vault media manageable by owner or members" on public.vault_media
  for all using (
    public.has_role('super_admin')
    or owner_profile_id = auth.uid()
    or (connection_id is not null and public.is_connection_member(connection_id))
  ) with check (
    public.has_role('super_admin')
    or owner_profile_id = auth.uid()
    or (connection_id is not null and public.is_connection_member(connection_id))
  );

alter table public.feature_flags enable row level security;
create policy "Feature flags readable by clients" on public.feature_flags
  for select using (true);
create policy "Feature flags managed by super admin" on public.feature_flags
  for all using (public.has_role('super_admin'))
  with check (public.has_role('super_admin'));

alter table public.activity_log enable row level security;
create policy "Activity log readable by participants" on public.activity_log
  for select using (
    public.has_role('super_admin')
    or profile_id = auth.uid()
    or (connection_id is not null and public.is_connection_member(connection_id))
  );
create policy "Activity log insert by system" on public.activity_log
  for insert with check (true);

alter table public.user_roles enable row level security;
create policy "User roles managed by super admins" on public.user_roles
  for all using (public.has_role('super_admin'))
  with check (public.has_role('super_admin'));

-- Seed core roles
insert into public.roles (code, label, description)
values
  ('super_admin', 'Super Administrator', 'Full access across all profiles and connections'),
  ('curator', 'Content Curator', 'Manage global content libraries, prompts, and feature flags'),
  ('support', 'Support Specialist', 'Assist members with troubleshooting and account recovery')
on conflict (code) do update set
  label = excluded.label,
  description = excluded.description;

-- Seed default feature flags (disabled by default)
insert into public.feature_flags (key, environment, description, enabled, payload)
values
  ('ai.assistant', 'staging', 'Enable the AI concierge assistant', false, '{"beta":true}'),
  ('voice.control', 'staging', 'Hands-free voice control pilot', false, null),
  ('journaling.prompts', 'production', 'Release contextual journaling prompts', true, null)
on conflict (key, environment) do update set
  description = excluded.description,
  enabled = excluded.enabled,
  payload = excluded.payload,
  updated_at = now();
