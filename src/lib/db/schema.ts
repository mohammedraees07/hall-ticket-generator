import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const departmentsTable = pgTable("departments", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  studentCount: integer("student_count").default(0),
  courseCount: integer("course_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const coursesTable = pgTable("courses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  departmentId: integer("department_id").notNull(),
  duration: integer("duration").default(4),
  description: text("description").default(""),
});

export const subjectsTable = pgTable("subjects", {
  id: serial("id").primaryKey(),
  code: text("code").notNull(),
  name: text("name").notNull(),
  courseId: integer("course_id").notNull(),
  departmentId: integer("department_id").notNull(),
  semester: integer("semester").notNull(),
  credits: integer("credits").default(3),
});

export const studentsTable = pgTable("students", {
  id: serial("id").primaryKey(),
  studentId: text("student_id").notNull().unique(),
  usn: text("usn").notNull().unique(),
  name: text("name").notNull(),
  dob: text("dob").default(""),
  gender: text("gender").default("Not specified"),
  email: text("email").default(""),
  phone: text("phone").default(""),
  address: text("address").default(""),
  departmentId: integer("department_id").notNull(),
  courseId: integer("course_id").notNull(),
  semester: integer("semester").notNull(),
  section: text("section").default("A"),
  academicYear: text("academic_year").default("2024-25"),
  photoUrl: text("photo_url"),
  attendancePercentage: integer("attendance_percentage").default(85), // Default attendance %
  feeStatus: text("fee_status").default("Cleared"), // 'Cleared' | 'Pending'
  createdAt: timestamp("created_at").defaultNow(),
});

export const examinationsTable = pgTable("examinations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  examType: text("exam_type").default("End Semester"),
  semester: integer("semester").notNull(),
  academicYear: text("academic_year").default("2024-25"),
  startDate: text("start_date").notNull(),
  endDate: text("end_date").notNull(),
  center: text("center").notNull(),
  session: text("session").default("09:30 AM – 12:30 PM"),
  description: text("description").default(""),
  status: text("status").default("Draft"), // 'Draft' | 'Published'
  createdAt: timestamp("created_at").defaultNow(),
});

export const examSubjectsTable = pgTable("exam_subjects", {
  id: serial("id").primaryKey(),
  examinationId: integer("examination_id").notNull(),
  subjectCode: text("subject_code").notNull(),
  subjectName: text("subject_name").notNull(),
  examDate: text("exam_date").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  room: text("room").notNull(),
});

export const hallTicketsTable = pgTable("hall_tickets", {
  id: serial("id").primaryKey(),
  number: text("number").notNull().unique(),
  studentId: integer("student_id").notNull(),
  studentName: text("student_name").notNull(),
  usn: text("usn").notNull(),
  course: text("course").notNull(),
  department: text("department").notNull(),
  semester: integer("semester").notNull(),
  section: text("section").default("A"),
  examinationId: integer("examination_id").notNull(),
  examinationName: text("examination_name").notNull(),
  academicYear: text("academic_year").notNull(),
  center: text("center").notNull(),
  verifyCode: text("verify_code").notNull().unique(),
  generatedAt: timestamp("generated_at").defaultNow(),
  status: text("status").default("Valid"),
  subjectsJson: text("subjects_json").notNull(), // JSON string of ExamSubject[]
});

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  collegeName: text("college_name").default("Maharaja Institute of Technology"),
  collegeCode: text("college_code").default("MIT / EXAMINATION CELL"),
  email: text("email").default("examinations@mit.edu"),
  phone: text("phone").default("+91 80 4012 8800"),
  controllerName: text("controller_name").default("Dr. S. R. Rao, Controller of Examinations"),
  minAttendance: integer("min_attendance").default(75),
});
