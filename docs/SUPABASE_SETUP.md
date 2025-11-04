## Supabase Setup Guide

### 1. Provision Supabase Project

1. Create a new project at [supabase.com](https://supabase.com/).
2. Note the **Project URL** and **Service Role Key**.
3. Under *Authentication → Providers*, enable Email/Password.

### 2. Configure Local Environment

Update `.env` (or `.env.local`) with:

```
VITE_SUPABASE_URL=<your project url>
SUPABASE_SERVICE_ROLE_KEY=<service role key>
SUPABASE_DB_PASSWORD=<database password>
SUPER_ADMIN_EMAIL=n8ter8@gmail.com
```

`SUPER_ADMIN_EMAIL` is used by the seed script to grant elevated permissions after the user exists in Auth.

### 3. Run Database Migrations

Ensure the Supabase database URL is exported before running migrations:

```bash
export DATABASE_URL="postgresql://postgres:<password>@localhost:54322/postgres"
pnpm migrate:up
```

> Replace the connection string with your project’s connection details (the example assumes docker-compose). All migrations live in `supabase/migrations` and are idempotent.

### 4. Create the Administrative User

1. In Supabase Studio, open **Authentication → Users**.
2. Add a new user with the email `n8ter8@gmail.com` (password of your choice).
3. (Optional) Confirm the email if you have SMTP configured.

### 5. Seed Reference Data

```bash
pnpm db:seed
```

The script performs:

- Upserts baseline roles (`super_admin`, `estimator`, `project_manager`, `crew_lead`, `accountant`).
- Creates “Default Church Campus” organization.
- Links the administrative user to the organization and grants `super_admin` + `project_manager` roles.
- Seeds a sample project, asset, and relationship.

If the seed script reports "User not found", re-run after verifying the Auth user exists.

### 6. RLS & Roles Overview

- `has_role(role_code)` and `is_org_member(org_id)` functions power row-level policies.
- Organization data is visible to members and super admins only.
- Project and asset mutations require role-based access (`project_manager` or `estimator`).

### 7. Running Locally via Docker Compose

```bash
docker compose up --build
```

- App: <http://localhost:5173>
- Postgres: `localhost:54322`
- Supabase Studio: <http://localhost:54323>

While the stack is running you can execute migrations using the forwarded `DATABASE_URL` referenced above.

