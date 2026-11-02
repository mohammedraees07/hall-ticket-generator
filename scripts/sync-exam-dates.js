const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env if needed
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sxxblqdvwebhloavmufh.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SERVICE_KEY) {
  console.error('No SUPABASE_SERVICE_ROLE_KEY found');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const TARGET_SUBJECTS = [
  {
    subjectCode: "CS401",
    subjectName: "Design & Analysis of Algorithms",
    examDate: "2026-11-02", // TODAY
    startTime: "09:30",
    endTime: "12:30",
    room: "Hall C-201"
  },
  {
    subjectCode: "CS402",
    subjectName: "Operating Systems & Concurrency",
    examDate: "2026-11-05",
    startTime: "09:30",
    endTime: "12:30",
    room: "Hall C-201"
  },
  {
    subjectCode: "CS403",
    subjectName: "Database Management Systems",
    examDate: "2026-11-08",
    startTime: "09:30",
    endTime: "12:30",
    room: "Hall C-201"
  },
  {
    subjectCode: "CS404",
    subjectName: "Theory of Computation",
    examDate: "2026-11-11",
    startTime: "09:30",
    endTime: "12:30",
    room: "Hall C-201"
  }
];

async function main() {
  console.log('--- CONNECTING TO SUPABASE ---');

  // 1. Fetch Examination 1
  const { data: exam, error: examErr } = await supabase
    .from('examinations')
    .select('*')
    .eq('id', 1)
    .single();

  console.log('Current Exam 1:', examErr ? examErr.message : exam);

  // 2. Fetch Student 1
  const { data: student, error: stuErr } = await supabase
    .from('students')
    .select('*')
    .eq('id', 1)
    .single();
  console.log('Current Student 1:', stuErr ? stuErr.message : student);

  // 3. Fetch Hall Tickets for student 1
  const { data: tickets, error: ticketErr } = await supabase
    .from('hall_tickets')
    .select('*')
    .eq('student_id', 1);
  console.log('Current Hall Tickets for student 1:', ticketErr ? ticketErr.message : tickets);

  // 4. Update Examination 1 with synchronized subjects
  const { data: updatedExam, error: updateExamErr } = await supabase
    .from('examinations')
    .update({
      start_date: '2026-11-02',
      end_date: '2026-11-20',
      academic_year: '2026-27',
      subjects: TARGET_SUBJECTS,
      status: 'Published'
    })
    .eq('id', 1)
    .select();

  console.log('Updated Exam 1:', updateExamErr ? updateExamErr.message : updatedExam);

  // 5. Update or Upsert Hall Ticket for Student 1 (Mohammed Thahaseen)
  const { data: updatedTicket, error: updateTicketErr } = await supabase
    .from('hall_tickets')
    .update({
      student_name: 'Mohammed Thahaseen',
      usn: '1RV22CS001',
      examination_id: 1,
      examination_name: 'IV Semester End Semester Regular Examinations',
      academic_year: '2026-27',
      center: 'Block C · Examination Complex',
      verify_code: 'PACE-26-1RV22CS001',
      status: 'Valid',
      subjects: TARGET_SUBJECTS
    })
    .eq('student_id', 1)
    .select();

  console.log('Updated Ticket for Student 1:', updateTicketErr ? updateTicketErr.message : updatedTicket);

  // 6. Check Seating Plans table if exists
  const { data: seatingData, error: seatingErr } = await supabase
    .from('seating_plans')
    .select('*');
  console.log('Seating Plans table check:', seatingErr ? seatingErr.message : seatingData);

  console.log('--- SYNC FINISHED ---');
}

main().catch(console.error);

