import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(url, key);

// Clean male passport-style student portrait
const MALE_STUDENT_PHOTO =
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80";

async function updatePhoto() {
  console.log("Updating student 1 photo in students table...");
  const { data: s, error: sErr } = await supabase
    .from("students")
    .update({ photo_url: MALE_STUDENT_PHOTO })
    .eq("id", 1)
    .select();
  console.log("Students updated:", s, sErr || "");

  console.log("Updating hall tickets photo for student 1...");
  const { data: ht, error: htErr } = await supabase
    .from("hall_tickets")
    .update({ photo_url: MALE_STUDENT_PHOTO })
    .eq("student_id", 1)
    .select();
  console.log("Hall tickets updated:", ht, htErr || "");

  console.log("Updating exam applications photo for student 1...");
  const { data: ea, error: eaErr } = await supabase
    .from("exam_applications")
    .update({ photo_url: MALE_STUDENT_PHOTO })
    .eq("student_id", 1)
    .select();
  console.log("Exam applications updated:", ea, eaErr || "");
}

updatePhoto().catch(console.error);
