import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "n8ter8@gmail.com";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing SUPABASE credentials. Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureOrganization() {
  const { data, error } = await supabase
    .from("organizations")
    .upsert(
      {
        slug: "default-church",
        name: "Default Church Campus",
        address: {
          street: "123 Hope Ave",
          city: "Richmond",
          state: "VA",
          postal_code: "23230",
        },
        timezone: "America/New_York",
      },
      { onConflict: "slug" }
    )
    .select("id")
    .single();

  if (error) throw error;
  return data.id as string;
}

async function ensureAppUser(email: string, organizationId: string) {
  const { data: existing, error: selectError } = await supabase
    .from("app_users")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (selectError) throw selectError;

  if (existing) {
    const { data, error } = await supabase
      .from("app_users")
      .update({ organization_id: organizationId })
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw error;
    return data.id as string;
  }

  throw new Error(
    `User with email ${email} not found in app_users. Create the account via Supabase Auth, then rerun the seed.`
  );
}

async function assignRole(userId: string, roleCode: string) {
  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role_code: roleCode })
    .eq("user_id", userId)
    .eq("role_code", roleCode);
  if (error) throw error;
}

async function seedSampleProjects(organizationId: string) {
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .upsert(
      {
        organization_id: organizationId,
        title: "Spring Sealcoat 2025",
        status: "planning",
        summary: "Sealcoat and restripe the main sanctuary parking lot",
        budget: 185000,
      },
      { onConflict: "title" }
    )
    .select("id")
    .single();

  if (projectError) throw projectError;

  const { data: asset, error: assetError } = await supabase
    .from("assets")
    .upsert(
      {
        organization_id: organizationId,
        name: "Sanctuary Lot A",
        asset_type: "parking_area",
        surface_area_sq_ft: 51200,
        pavement_condition_index: 68,
        metadata: { surface: "asphalt", stripes: "faded" },
      },
      { onConflict: "name" }
    )
    .select("id")
    .single();

  if (assetError) throw assetError;

  await supabase
    .from("project_assets")
    .upsert({ project_id: project.id, asset_id: asset.id });
}

async function main() {
  try {
    const organizationId = await ensureOrganization();
    const userId = await ensureAppUser(ADMIN_EMAIL, organizationId);
    await assignRole(userId, "super_admin");
    await assignRole(userId, "project_manager");
    await seedSampleProjects(organizationId);
    console.log("✅ Seed complete. Super admin assigned and sample data created.");
  } catch (error) {
    console.error("❌ Seed failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();

