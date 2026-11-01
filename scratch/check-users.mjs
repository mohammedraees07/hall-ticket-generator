import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log("No Supabase URL or key found");
  process.exit(0);
}

const supabase = createClient(url, key);
try {
  const { data, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.log("Error listing users:", error.message);
  } else {
    console.log("Found", data.users.length, "users:");
    for (const u of data.users) {
      console.log(`- ${u.email} (id: ${u.id}, role: ${u.app_metadata?.role || "none"})`);
    }
  }
} catch (e) {
  console.log("Error:", e.message);
}
