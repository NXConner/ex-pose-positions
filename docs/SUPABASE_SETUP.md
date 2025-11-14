## Supabase Setup Guide

### 1. Provision the `qvbjdxlatawfkqfvpfsd` Supabase Project

1. Create a new project at [supabase.com](https://supabase.com/).
2. Name the project slug `qvbjdxlatawfkqfvpfsd` (or update `.env.example` if you pick a different slug).
3. Note the **Project URL**, **Anon Key**, and **Service Role Key**.
4. Under *Authentication → Providers*, enable Email/Password. Optional: enable Magic Link for quick pairing.

### 2. Configure Local Environment

Update `.env` (or `.env.local`) with:

```
VITE_SUPABASE_URL=https://qvbjdxlatawfkqfvpfsd.supabase.co     # required by the web app
VITE_SUPABASE_ANON_KEY=<anon key>                               # required by the web app
SUPABASE_URL=https://qvbjdxlatawfkqfvpfsd.supabase.co           # used by CLI/scripts
SUPABASE_SERVICE_ROLE_KEY=<service role key>                    # server-side only!
SUPABASE_DB_PASSWORD=<database password>
SUPER_ADMIN_EMAIL=<primary admin email>
SUPER_ADMIN_PASSWORD=<temp password for seeding>
SEED_PARTNER_EMAIL=partner@intimacy.local
```

> `SUPER_ADMIN_PASSWORD` is only used during seeding to bootstrap auth users. Remove it afterwards or rotate the password.

### 3. Run Database Migrations

Ensure the Supabase database URL is exported before running migrations:

```bash
export DATABASE_URL="postgresql://postgres:<password>@localhost:54322/intimacy"
pnpm migrate:up
```

> Replace the connection string with your project’s connection details. The example assumes docker-compose with the database named `intimacy`.

### 4. Seed Reference Data

```bash
pnpm db:seed
```

The script performs:

- Ensures auth users for `SUPER_ADMIN_EMAIL` and `SEED_PARTNER_EMAIL` (creates if missing and password supplied).
- Upserts profile records linked to those auth users.
- Grants `super_admin` and `curator` roles to the primary administrator.
- Creates an active connection with consent charter, scheduled experience, curated list, and seed journal entry.
- Updates feature flags (`ai.assistant`, `voice.control`) with example payloads.
- Logs baseline activity entries for observability.

If the seed script reports missing auth users, set `SUPER_ADMIN_PASSWORD` and rerun or create the accounts manually through Supabase Studio.

### 5. RLS & Roles Overview

- `has_role(role_code)` checks membership in `user_roles` (e.g., `super_admin`, `curator`, `support`).
- `is_connection_member(connection_id)` validates access to partner-specific data.
- `profiles` are only visible/updateable by their owners or super admins.
- Shared entities (`connections`, `experiences`, `lists`, `vault_media`, etc.) enforce membership-based access.
- Feature flags are publicly readable but only super admins can modify them.

### 6. Running Locally via Docker Compose

```bash
docker compose up --build
```

- App: <http://localhost:5173>
- Postgres (`intimacy` database): `localhost:54322`
- Supabase Studio: <http://localhost:54323>

While the stack is running you can execute migrations and the seed script using the forwarded `DATABASE_URL` referenced above.

### 7. Post-Seed Hardening

- Remove `SUPER_ADMIN_PASSWORD` from local `.env` after seeding; rotate credentials.
- Configure multi-factor authentication for administrators inside Supabase.
- Configure object storage buckets and edge functions as needed for media pipelines.

