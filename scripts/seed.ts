import "dotenv/config";

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "admin@intimacy.local";
const SUPER_ADMIN_PASSWORD = process.env.SUPER_ADMIN_PASSWORD;
const PARTNER_EMAIL = process.env.SEED_PARTNER_EMAIL || "partner@intimacy.local";

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error("❌ Missing Supabase credentials. Set VITE_SUPABASE_URL/SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const DEFAULT_CONNECTION_ID = "11111111-2222-4333-9444-555555555555";
const DEFAULT_LIST_ID = "66666666-7777-4888-8999-aaaaaaaaaaaa";
const DEFAULT_EXPERIENCE_ID = "bbbbbbbb-cccc-4ddd-8eee-ffffffffffff";
const DEFAULT_SEGMENT_IDS = [
  "99999999-aaaa-4bbb-8ccc-dddddddddddd",
  "eeeeeeee-ffff-4000-8111-222222222222",
];
const DEFAULT_CONSENT_ID = "33333333-4444-4555-8666-777777777777";
const DEFAULT_JOURNAL_ID = "88888888-9999-4aaa-bbbb-cccccccccccc";

async function ensureAuthUser(email: string, password?: string) {
  const { data: existing, error: listError } = await supabase.auth.admin.listUsers({
    page: 1,
    perPage: 200,
  });

  if (listError) throw listError;
  const found = existing.users.find(user => user.email?.toLowerCase() === email.toLowerCase());
  if (found) return found;

  if (!password) {
    throw new Error(`Auth user ${email} not found. Provide SUPER_ADMIN_PASSWORD or create the account manually.`);
  }

  const { data: created, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (createError || !created.user) {
    throw createError ?? new Error(`Unable to create auth user for ${email}.`);
  }
  return created.user;
}

async function ensureProfile(userId: string, email: string, displayName: string) {
  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        email,
        display_name: displayName,
        preferences: { onboarding_complete: true },
      },
      { onConflict: "id" }
    );
  if (error) throw error;
}

async function assignRole(userId: string, roleCode: string) {
  const { error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role_code: roleCode }, { onConflict: "user_id,role_code" });
  if (error) throw error;
}

async function seedConnection(adminId: string, partnerId: string) {
  const { error: connectionError } = await supabase
    .from("connections")
    .upsert(
      {
        id: DEFAULT_CONNECTION_ID,
        status: "active",
        created_by: adminId,
        last_synced_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );
  if (connectionError) throw connectionError;

  const members = [
    { connection_id: DEFAULT_CONNECTION_ID, profile_id: adminId, role: "partner" },
    { connection_id: DEFAULT_CONNECTION_ID, profile_id: partnerId, role: "partner" },
  ];
  for (const member of members) {
    const { error } = await supabase
      .from("connection_members")
      .upsert(member, { onConflict: "connection_id,profile_id" });
    if (error) throw error;
  }
}

async function seedConsent(adminId: string) {
  const { error } = await supabase
    .from("consent_agreements")
    .upsert(
      {
        id: DEFAULT_CONSENT_ID,
        connection_id: DEFAULT_CONNECTION_ID,
        title: "Shared Boundaries Charter",
        status: "active",
        scope: "connection",
        summary: "Defines shared boundaries, safe words, and aftercare expectations.",
        body: {
          safe_words: ["amber", "crimson"],
          check_ins: "Every 10 minutes or upon request",
          aftercare: ["Water", "Affirmations", "Quiet cuddle"],
        },
        effective_at: new Date().toISOString(),
        created_by: adminId,
      },
      { onConflict: "id" }
    );
  if (error) throw error;
}

async function seedExperience(adminId: string) {
  const { error: experienceError } = await supabase
    .from("experiences")
    .upsert(
      {
        id: DEFAULT_EXPERIENCE_ID,
        connection_id: DEFAULT_CONNECTION_ID,
        title: "Evening Connection Ritual",
        status: "scheduled",
        scheduled_for: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        duration_minutes: 90,
        mood_focus: "playful",
        tags: ["ritual", "slow", "sensory"],
        created_by: adminId,
      },
      { onConflict: "id" }
    );
  if (experienceError) throw experienceError;

  const segments = [
    {
      id: DEFAULT_SEGMENT_IDS[0],
      experience_id: DEFAULT_EXPERIENCE_ID,
      order_index: 0,
      label: "Warm-Up",
      position_reference: "breathwork",
      prompt: "3-minute synchronized breathing + gratitude exchange",
      duration_minutes: 10,
    },
    {
      id: DEFAULT_SEGMENT_IDS[1],
      experience_id: DEFAULT_EXPERIENCE_ID,
      order_index: 1,
      label: "Discovery",
      position_reference: "randomizer",
      prompt: "Pull a surprise card from the curated list and explore together",
      duration_minutes: 35,
    },
  ];

  for (const segment of segments) {
    const { error } = await supabase
      .from("experience_segments")
      .upsert(segment, { onConflict: "id" });
    if (error) throw error;
  }
}

async function seedLists(adminId: string) {
  const { error: listError } = await supabase
    .from("lists")
    .upsert(
      {
        id: DEFAULT_LIST_ID,
        connection_id: DEFAULT_CONNECTION_ID,
        title: "Shared Favorites",
        list_type: "favorites",
        visibility: "shared",
        is_pinned: true,
        sort_order: 1,
        metadata: { origin: "seed" },
      },
      { onConflict: "id" }
    );
  if (listError) throw listError;

  const seedItems = [
    {
      id: "dddddddd-eeee-4444-9999-aaaaaaaa0000",
      list_id: DEFAULT_LIST_ID,
      item_type: "position",
      item_reference: "curated:slow-rise",
      payload: { intensity: "gentle", tags: ["slow", "connected"] },
      note: "Great for slow evenings",
    },
    {
      id: "bbbbbbbb-aaaa-4ccc-8888-ffffffff0000",
      list_id: DEFAULT_LIST_ID,
      item_type: "prompt",
      item_reference: "prompt:aftercare",
      payload: { question: "How can I support you after tonight?" },
      note: "Add to reflection ritual",
    },
  ];

  for (const item of seedItems) {
    const { error } = await supabase.from("list_items").upsert(item, { onConflict: "id" });
    if (error) throw error;
  }
}

async function seedJournal(adminId: string) {
  const { error } = await supabase
    .from("journal_entries")
    .upsert(
      {
        id: DEFAULT_JOURNAL_ID,
        connection_id: DEFAULT_CONNECTION_ID,
        experience_id: DEFAULT_EXPERIENCE_ID,
        author_profile_id: adminId,
        entry_type: "reflection",
        mood: "energised",
        title: "Seed Reflection",
        content: {
          wins: ["Shared intentional breathing"],
          gratitude: "Felt connected and seen",
          ideas: ["Try the glow theme tomorrow"],
        },
        visibility: "shared",
      },
      { onConflict: "id" }
    );
  if (error) throw error;
}

async function refreshFeatureFlags(adminId: string) {
  const { error } = await supabase
    .from("feature_flags")
    .upsert(
      [
        {
          key: "ai.assistant",
          environment: "staging",
          enabled: true,
          payload: { rollout: "beta", prompts: 25 },
          updated_by: adminId,
        },
        {
          key: "voice.control",
          environment: "staging",
          enabled: false,
          payload: { locales: ["en-US"] },
          updated_by: adminId,
        },
      ],
      { onConflict: "key,environment" }
    );
  if (error) throw error;
}

async function seedActivityLog(adminId: string, partnerId: string) {
  const { error } = await supabase.from("activity_log").insert([
    {
      profile_id: adminId,
      connection_id: DEFAULT_CONNECTION_ID,
      event_type: "seed.connection.created",
      payload: { partner_email: PARTNER_EMAIL },
    },
    {
      profile_id: partnerId,
      connection_id: DEFAULT_CONNECTION_ID,
      event_type: "seed.list.curated",
      payload: { list_id: DEFAULT_LIST_ID },
    },
  ]);
  if (error) throw error;
}

async function main() {
  try {
    const adminUser = await ensureAuthUser(SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD);
    const partnerUser = await ensureAuthUser(PARTNER_EMAIL, SUPER_ADMIN_PASSWORD);

    await ensureProfile(adminUser.id, SUPER_ADMIN_EMAIL, "Lead Partner");
    await ensureProfile(partnerUser.id, PARTNER_EMAIL, "Partner Two");

    await assignRole(adminUser.id, "super_admin");
    await assignRole(adminUser.id, "curator");

    await seedConnection(adminUser.id, partnerUser.id);
    await seedConsent(adminUser.id);
    await seedExperience(adminUser.id);
    await seedLists(adminUser.id);
    await seedJournal(adminUser.id);
    await refreshFeatureFlags(adminUser.id);
    await seedActivityLog(adminUser.id, partnerUser.id);

    console.log("✅ Seed complete. Profiles, connection, consent, experiences, lists, journal, and feature flags configured.");
  } catch (error) {
    console.error("❌ Seed failed:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

void main();
