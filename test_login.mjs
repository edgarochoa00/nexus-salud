import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing keys");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function test() {
  console.log("Fetching users...");
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (error) {
    console.error("Error:", error);
    return;
  }

  console.log(`Found ${data.users.length} users in auth.users`);
  for (const u of data.users.slice(0, 5)) {
    console.log(`User: ${u.email}, metadata curp:`, u.user_metadata?.curp);
  }
}

test();
