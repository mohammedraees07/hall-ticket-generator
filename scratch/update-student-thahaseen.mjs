import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

const NEW_EMAIL = "thahaseen@pace.edu";
const NEW_NAME = "Mohammed Thahaseen";
const PASSWORD = "College@123";

async function main() {
  console.log("1. Updating student in database...");
  const { data: updatedStudent, error: studErr } = await supabase
    .from("students")
    .update({
      name: NEW_NAME,
      email: NEW_EMAIL,
      gender: "Male",
    })
    .eq("id", 1)
    .select()
    .single();

  if (studErr) {
    console.error("Error updating student table:", studErr);
  } else {
    console.log("Updated student row:", updatedStudent.name, updatedStudent.email);
  }

  console.log("2. Updating hall tickets for student 1 in database...");
  await supabase
    .from("hall_tickets")
    .update({ student_name: NEW_NAME })
    .eq("student_id", 1);

  console.log("3. Updating Supabase Auth account...");
  const { data: usersData } = await supabase.auth.admin.listUsers();
  const existingAnanya = usersData.users.find(
    (u) => u.email?.toLowerCase() === "ananya.rao@rvcollege.edu"
  );
  const existingThahaseen = usersData.users.find(
    (u) => u.email?.toLowerCase() === NEW_EMAIL.toLowerCase()
  );

  const metadata = {
    name: NEW_NAME,
    role: "STUDENT",
    studentId: 1,
    usn: "1RV22CS001",
    email_verified: true,
  };

  if (existingThahaseen) {
    console.log("Updating existing thahaseen user...");
    await supabase.auth.admin.updateUserById(existingThahaseen.id, {
      password: PASSWORD,
      app_metadata: metadata,
      user_metadata: metadata,
      email_confirm: true,
    });
    if (existingAnanya && existingAnanya.id !== existingThahaseen.id) {
      await supabase.auth.admin.deleteUser(existingAnanya.id);
      console.log("Deleted old ananya auth account.");
    }
  } else if (existingAnanya) {
    console.log("Updating ananya account email to thahaseen@pace.edu...");
    await supabase.auth.admin.updateUserById(existingAnanya.id, {
      email: NEW_EMAIL,
      password: PASSWORD,
      app_metadata: metadata,
      user_metadata: metadata,
      email_confirm: true,
    });
  } else {
    console.log("Creating thahaseen@pace.edu user...");
    await supabase.auth.admin.createUser({
      email: NEW_EMAIL,
      password: PASSWORD,
      email_confirm: true,
      app_metadata: metadata,
      user_metadata: metadata,
    });
  }

  console.log("\nSuccess! Student account updated to:", NEW_EMAIL);
}

main().catch(console.error);
