import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.log("No Supabase URL or key found");
  process.exit(0);
}

const supabase = createClient(url, key);

async function createAyaan() {
  const email = "ayaan.student@pace.ac.in";
  const password = "password123";

  // Check if exists
  const { data: list } = await supabase.auth.admin.listUsers();
  const existing = list?.users?.find((u) => u.email === email);
  if (existing) {
    console.log("User already exists:", existing.id);
    const { data: updated, error: updateErr } = await supabase.auth.admin.updateUserById(existing.id, {
      password,
      email_confirm: true,
      app_metadata: {
        role: "STUDENT",
        studentId: 6,
        usn: "1RV22CS099",
        name: "Ayaan Ahmed",
      },
      user_metadata: {
        role: "STUDENT",
        studentId: 6,
        usn: "1RV22CS099",
        name: "Ayaan Ahmed",
      },
    });
    if (updateErr) console.error("Update error:", updateErr);
    else console.log("User updated successfully:", updated.user.id);
    return;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    app_metadata: {
      role: "STUDENT",
      studentId: 6,
      usn: "1RV22CS099",
      name: "Ayaan Ahmed",
    },
    user_metadata: {
      role: "STUDENT",
      studentId: 6,
      usn: "1RV22CS099",
      name: "Ayaan Ahmed",
    },
  });

  if (error) {
    console.error("Error creating user:", error.message);
  } else {
    console.log("Created user successfully:", data.user.id, data.user.email);
  }
}

createAyaan();

