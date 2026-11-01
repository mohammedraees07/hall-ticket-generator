const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://sxxblqdvwebhloavmufh.supabase.co';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4eGJscWR2d2ViaGxvYXZtdWZoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjU0Mzc3MywiZXhwIjoyMTA4MTE5NzczfQ.P3292cXiVGyhGZRnOdmhqUO-E2u7my0HtmNOTXaOHZk';

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function seed() {
  console.log('--- SEEDING SUPABASE DATABASE ---');

  // 1. College Settings
  const { error: setErr } = await supabase.from('college_settings').upsert({
    id: 1,
    college_name: 'P A College of Engineering',
    college_code: 'PACE / AUTONOMOUS EXAM CELL',
    email: 'coe@mit.ac.in',
    phone: '+91 80 4012 8800',
    controller_name: 'Mr. Hameed, Controller of Examinations',
    principal_name: 'Dr. Ramis M.K, Principal',
    min_attendance: 75
  });
  console.log('college_settings:', setErr ? setErr.message : 'OK');

  // 2. Departments
  const departments = [
    { id: 1, name: 'Computer Science & Engineering', code: 'CSE', student_count: 142, course_count: 2 },
    { id: 2, name: 'Information Science & Engineering', code: 'ISE', student_count: 98, course_count: 1 },
    { id: 3, name: 'Electronics & Communication', code: 'ECE', student_count: 88, course_count: 1 },
    { id: 4, name: 'Mechanical Engineering', code: 'MECH', student_count: 65, course_count: 1 },
    { id: 5, name: 'Management & Commerce', code: 'MBA', student_count: 110, course_count: 2 }
  ];
  const { error: deptErr } = await supabase.from('departments').upsert(departments);
  console.log('departments:', deptErr ? deptErr.message : 'OK');

  // 3. Courses
  const courses = [
    { id: 1, name: 'B.Tech Computer Science & Engineering', code: 'BT-CSE', department_id: 1, department: 'Computer Science & Engineering', duration: 4, description: 'Four-year undergraduate degree in computer systems and software engineering.' },
    { id: 2, name: 'B.Tech Information Science', code: 'BT-ISE', department_id: 2, department: 'Information Science & Engineering', duration: 4, description: 'Undergraduate degree in information architecture, cloud, and security.' },
    { id: 3, name: 'B.Tech Electronics & Communication', code: 'BT-ECE', department_id: 3, department: 'Electronics & Communication', duration: 4, description: 'Undergraduate degree in VLSI, embedded systems, and signals.' },
    { id: 4, name: 'Master of Business Administration', code: 'MBA-GEN', department_id: 5, department: 'Management & Commerce', duration: 2, description: 'Postgraduate degree in business analytics and operations.' }
  ];
  const { error: courseErr } = await supabase.from('courses').upsert(courses);
  console.log('courses:', courseErr ? courseErr.message : 'OK');

  // 4. Subjects
  const subjects = [
    { id: 1, code: 'CS401', name: 'Design & Analysis of Algorithms', course: 'B.Tech Computer Science & Engineering', department: 'Computer Science & Engineering', semester: 4, credits: 4, course_id: 1, department_id: 1 },
    { id: 2, code: 'CS402', name: 'Operating Systems & Concurrency', course: 'B.Tech Computer Science & Engineering', department: 'Computer Science & Engineering', semester: 4, credits: 4, course_id: 1, department_id: 1 },
    { id: 3, code: 'CS403', name: 'Database Management Systems', course: 'B.Tech Computer Science & Engineering', department: 'Computer Science & Engineering', semester: 4, credits: 4, course_id: 1, department_id: 1 },
    { id: 4, code: 'CS404', name: 'Theory of Computation', course: 'B.Tech Computer Science & Engineering', department: 'Computer Science & Engineering', semester: 4, credits: 3, course_id: 1, department_id: 1 },
    { id: 5, code: 'IS401', name: 'Computer Networks & Security', course: 'B.Tech Information Science', department: 'Information Science & Engineering', semester: 4, credits: 4, course_id: 2, department_id: 2 },
    { id: 6, code: 'EC401', name: 'Digital Signal Processing', course: 'B.Tech Electronics & Communication', department: 'Electronics & Communication', semester: 4, credits: 4, course_id: 3, department_id: 3 }
  ];
  const { error: subErr } = await supabase.from('subjects').upsert(subjects);
  console.log('subjects:', subErr ? subErr.message : 'OK');

  // 5. Students
  const students = [
    {
      id: 1,
      student_id: 'STU-2022-001',
      usn: '1RV22CS001',
      name: 'Ananya Rao',
      dob: '2004-02-18',
      gender: 'Female',
      email: 'ananya.rao@rvcollege.edu',
      phone: '+91 98765 40120',
      address: '12, 5th Cross, Bengaluru',
      course: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science & Engineering',
      department_id: 1,
      course_id: 1,
      semester: 4,
      section: 'A',
      academic_year: '2024-25',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      attendance_percentage: 88,
      fee_status: 'Cleared'
    },
    {
      id: 2,
      student_id: 'STU-2022-014',
      usn: '1RV22CS014',
      name: 'Rohan Mehta',
      dob: '2003-11-06',
      gender: 'Male',
      email: 'rohan.mehta@rvcollege.edu',
      phone: '+91 98452 16804',
      address: '44, 2nd Main, Bengaluru',
      course: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science & Engineering',
      department_id: 1,
      course_id: 1,
      semester: 4,
      section: 'A',
      academic_year: '2024-25',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      attendance_percentage: 79,
      fee_status: 'Cleared'
    },
    {
      id: 3,
      student_id: 'STU-2022-031',
      usn: '1RV22CS031',
      name: 'Ishita Nair',
      dob: '2004-05-24',
      gender: 'Female',
      email: 'ishita.nair@rvcollege.edu',
      phone: '+91 99008 71244',
      address: '8, Lake View Road, Bengaluru',
      course: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science & Engineering',
      department_id: 1,
      course_id: 1,
      semester: 4,
      section: 'B',
      academic_year: '2024-25',
      photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
      attendance_percentage: 68,
      fee_status: 'Cleared'
    },
    {
      id: 4,
      student_id: 'STU-2022-006',
      usn: '1RV22IS006',
      name: 'Arjun Kulkarni',
      dob: '2004-01-13',
      gender: 'Male',
      email: 'arjun.kulkarni@rvcollege.edu',
      phone: '+91 98201 44661',
      address: '19, HSR Layout, Bengaluru',
      course: 'B.Tech Information Science',
      department: 'Information Science & Engineering',
      department_id: 2,
      course_id: 2,
      semester: 4,
      section: 'A',
      academic_year: '2024-25',
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      attendance_percentage: 92,
      fee_status: 'Pending'
    },
    {
      id: 5,
      student_id: 'STU-2022-019',
      usn: '1RV22EC019',
      name: 'Meera Iyer',
      dob: '2003-08-30',
      gender: 'Female',
      email: 'meera.iyer@rvcollege.edu',
      phone: '+91 98867 03120',
      address: '3, Indiranagar, Bengaluru',
      course: 'B.Tech Electronics & Communication',
      department: 'Electronics & Communication',
      department_id: 3,
      course_id: 3,
      semester: 4,
      section: 'A',
      academic_year: '2024-25',
      photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
      attendance_percentage: 84,
      fee_status: 'Cleared'
    }
  ];
  const { error: stuErr } = await supabase.from('students').upsert(students);
  console.log('students:', stuErr ? stuErr.message : 'OK');

  // 6. Examinations
  const examinations = [
    {
      id: 1,
      name: 'IV Semester End Semester Regular Examinations',
      exam_type: 'End Semester',
      semester: 4,
      academic_year: '2024-25',
      start_date: '2025-05-12',
      end_date: '2025-05-24',
      center: 'Block C · Examination Complex',
      session: '09:30 AM – 12:30 PM',
      description: 'Main theory examinations for Fourth Semester Engineering candidates.',
      subject_count: 4,
      status: 'Published',
      subjects: [
        { subjectCode: 'CS401', subjectName: 'Design & Analysis of Algorithms', examDate: '2025-05-12', startTime: '09:30', endTime: '12:30', room: 'Hall C-201' },
        { subjectCode: 'CS402', subjectName: 'Operating Systems & Concurrency', examDate: '2025-05-15', startTime: '09:30', endTime: '12:30', room: 'Hall C-201' },
        { subjectCode: 'CS403', subjectName: 'Database Management Systems', examDate: '2025-05-19', startTime: '09:30', endTime: '12:30', room: 'Hall C-201' },
        { subjectCode: 'CS404', subjectName: 'Theory of Computation', examDate: '2025-05-22', startTime: '09:30', endTime: '12:30', room: 'Hall C-201' }
      ]
    },
    {
      id: 2,
      name: 'III Semester Supplementary Examinations',
      exam_type: 'Supplementary',
      semester: 3,
      academic_year: '2024-25',
      start_date: '2025-06-03',
      end_date: '2025-06-10',
      center: 'West Wing Complex',
      session: '02:00 PM – 05:00 PM',
      description: 'Supplementary exam session for eligible back-paper candidates.',
      subject_count: 2,
      status: 'Draft',
      subjects: [
        { subjectCode: 'CS301', subjectName: 'Data Structures & Applications', examDate: '2025-06-03', startTime: '14:00', endTime: '17:00', room: 'Hall W-102' },
        { subjectCode: 'CS302', subjectName: 'Computer Organization & Architecture', examDate: '2025-06-08', startTime: '14:00', endTime: '17:00', room: 'Hall W-102' }
      ]
    }
  ];
  const { error: examErr } = await supabase.from('examinations').upsert(examinations);
  console.log('examinations:', examErr ? examErr.message : 'OK');

  // 7. Hall Tickets
  const hallTickets = [
    {
      id: 1,
      number: 'HT-25-0001',
      student_id: 1,
      student_name: 'Ananya Rao',
      usn: '1RV22CS001',
      course: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science & Engineering',
      semester: 4,
      section: 'A',
      photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      examination_id: 1,
      examination_name: 'IV Semester End Semester Regular Examinations',
      academic_year: '2024-25',
      center: 'Block C · Examination Complex',
      verify_code: 'RVHT-25-1RV22CS001',
      status: 'Valid',
      subjects: examinations[0].subjects
    },
    {
      id: 2,
      number: 'HT-25-0002',
      student_id: 2,
      student_name: 'Rohan Mehta',
      usn: '1RV22CS014',
      course: 'B.Tech Computer Science & Engineering',
      department: 'Computer Science & Engineering',
      semester: 4,
      section: 'A',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      examination_id: 1,
      examination_name: 'IV Semester End Semester Regular Examinations',
      academic_year: '2024-25',
      center: 'Block C · Examination Complex',
      verify_code: 'RVHT-25-1RV22CS014',
      status: 'Valid',
      subjects: examinations[0].subjects
    }
  ];
  const { error: htErr } = await supabase.from('hall_tickets').upsert(hallTickets);
  console.log('hall_tickets:', htErr ? htErr.message : 'OK');

  console.log('--- SEEDING COMPLETED ---');
}

seed().catch(console.error);
