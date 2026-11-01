import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const DEFAULT_PASS = "College@123";

const desiredUsers = [
  {
    email: "admin@pace.ac.in",
    role: "ADMIN",
    name: "Mr. Hameed (Examination Cell)",
  },
  {
    email: "staff@pace.ac.in",
    role: "STAFF",
    name: "Dr. K. Suresh (Examination Staff)",
  },
  {
    email: "accounts@pace.ac.in",
    role: "ACCOUNTS",
    name: "Accounts Section Officer",
  },
  {
    email: "principal@pace.ac.in",
    role: "PRINCIPAL",
    name: "Dr. Ramis M.K (Principal)",
  },
  {
    email: "ananya.rao@rvcollege.edu",
    role: "STUDENT",
    name: "Ananya Rao",
    studentId: 1,
    usn: "1RV22CS001",
  },
];

const { data: existing } = await supabase.auth.admin.listUsers();
const existingMap = new Map(existing.users.map((u) => [u.email?.toLowerCase(), u]));

for (const target of desiredUsers) {
  const user = existingMap.get(target.email.toLowerCase());
  const app_metadata = {
    role: target.role,
    name: target.name,
    studentId: target.studentId,
    usn: target.usn,
  };

  if (user) {
    console.log(`Updating existing user ${target.email} with role ${target.role}...`);
    await supabase.auth.admin.updateUserById(user.id, {
      password: DEFAULT_PASS,
      app_metadata,
      user_metadata: {
        name: target.name,
        role: target.role,
        studentId: target.studentId,
        usn: target.usn,
        email_verified: true,
      },
      email_confirm: true,
    });
  } else {
    console.log(`Creating user ${target.email} with role ${target.role}...`);
    await supabase.auth.admin.createUser({
      email: target.email,
      password: DEFAULT_PASS,
      email_confirm: true,
      app_metadata,
      user_metadata: {
        name: target.name,
        role: target.role,
        studentId: target.studentId,
        usn: target.usn,
      },
    });
  }
}

console.log("\nAll users synchronized successfully with password:", DEFAULT_PASS);
