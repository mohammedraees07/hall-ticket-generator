import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const { data } = await supabase.auth.admin.listUsers();
for (const u of data.users) {
  console.log(u.email, "user_metadata:", u.user_metadata, "app_metadata:", u.app_metadata);
}
