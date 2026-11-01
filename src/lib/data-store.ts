import fs from "fs";
import path from "path";
import { generateQrDataUrl } from "./qr";
import { supabaseStore } from "./db/supabase-store";

const SETTINGS_FILE_PATH = path.join(process.cwd(), "college-settings.json");

function loadDiskSettings(): Partial<CollegeSettings> {
  try {
    if (typeof window === "undefined" && fs.existsSync(SETTINGS_FILE_PATH)) {
      const raw = fs.readFileSync(SETTINGS_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read college-settings.json:", err);
  }
  return {};
}

function saveDiskSettings(data: CollegeSettings) {
  try {
    if (typeof window === "undefined") {
      fs.writeFileSync(SETTINGS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write college-settings.json:", err);
  }
}

const BROADCASTS_FILE_PATH = path.join(process.cwd(), "exam-broadcasts.json");
const APPLICATIONS_FILE_PATH = path.join(process.cwd(), "exam-applications.json");
const HALL_TICKETS_FILE_PATH = path.join(process.cwd(), "exam-hall-tickets.json");

function loadDiskBroadcasts(): BroadcastNotice[] {
  try {
    if (typeof window === "undefined" && fs.existsSync(BROADCASTS_FILE_PATH)) {
      const raw = fs.readFileSync(BROADCASTS_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read exam-broadcasts.json:", err);
  }
  return [];
}

function saveDiskBroadcasts(data: BroadcastNotice[]) {
  try {
    if (typeof window === "undefined") {
      fs.writeFileSync(BROADCASTS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write exam-broadcasts.json:", err);
  }
}

function loadDiskApplications(): ExamApplication[] {
  try {
    if (typeof window === "undefined" && fs.existsSync(APPLICATIONS_FILE_PATH)) {
      const raw = fs.readFileSync(APPLICATIONS_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read exam-applications.json:", err);
  }
  return [];
}

function saveDiskApplications(data: ExamApplication[]) {
  try {
    if (typeof window === "undefined") {
      fs.writeFileSync(APPLICATIONS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write exam-applications.json:", err);
  }
}

function loadDiskHallTickets(): HallTicket[] {
  try {
    if (typeof window === "undefined" && fs.existsSync(HALL_TICKETS_FILE_PATH)) {
      const raw = fs.readFileSync(HALL_TICKETS_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read exam-hall-tickets.json:", err);
  }
  return [];
}

function saveDiskHallTickets(data: HallTicket[]) {
  try {
    if (typeof window === "undefined") {
      fs.writeFileSync(HALL_TICKETS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write exam-hall-tickets.json:", err);
  }
}

export function getAppUrl(): string {
  let url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (url.endsWith("/")) url = url.slice(0, -1);
  return url;
}

export type Department = {
  id: number;
  name: string;
  code: string;
  studentCount: number;
  courseCount: number;
};

export type Course = {
  id: number;
  name: string;
  code: string;
  department: string;
  departmentId: number;
  duration: number;
  description: string;
};

export type Subject = {
  id: number;
  code: string;
  name: string;
  course: string;
  department: string;
  semester: number;
  credits: number;
  courseId: number;
  departmentId: number;
};

export type Student = {
  id: number;
  studentId: string;
  usn: string;
  name: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
  address: string;
  course: string;
  department: string;
  departmentId: number;
  courseId: number;
  semester: number;
  section: string;
  academicYear: string;
  photoUrl: string | null;
  attendancePercentage: number; // e.g. 88
  feeStatus: "Cleared" | "Pending";
};

export type ExamSubject = {
  subjectCode: string;
  subjectName: string;
  examDate: string;
  startTime: string;
  endTime: string;
  room: string;
};

export type Examination = {
  id: number;
  name: string;
  examType: string;
  semester: number;
  academicYear: string;
  startDate: string;
  endDate: string;
  center: string;
  session: string;
  description: string;
  subjectCount: number;
  status: "Draft" | "Published";
  subjects: ExamSubject[];
};

export type HallTicket = {
  id: number;
  number: string;
  studentId: number;
  studentName: string;
  usn: string;
  course: string;
  department: string;
  semester: number;
  section: string;
  photoUrl: string | null;
  examinationId: number;
  examinationName: string;
  academicYear: string;
  center: string;
  verifyCode: string;
  qrDataUrl?: string;
  generatedAt: string;
  status: "Valid" | "Revoked";
  subjects: ExamSubject[];
};

export type ArrearSubject = {
  subjectCode: string;
  subjectName: string;
};

export type AccountsFeeStatus = {
  collegeFees: "Pending" | "No Due";
  hostelFees: "Pending" | "No Due" | "N/A";
  busFees: "Pending" | "No Due" | "N/A";
  fine: "Pending" | "Paid" | "N/A";
  updatedAt?: string;
};

export type PrincipalApprovalStatus = {
  status: "Pending" | "Approved" | "Rejected";
  fineWaived?: boolean;
  fineWaiverNote?: string;
  rejectionReason?: string;
  reviewedAt?: string;
};

export type ExamApplicationStage =
  | "APPLIED"
  | "UNDER_ACCOUNTS_REVIEW"
  | "ACCOUNTS_CLEARED"
  | "PRINCIPAL_APPROVED"
  | "HALL_TICKET_ISSUED"
  | "REJECTED";

export type ExamApplication = {
  id: number;
  applicationNumber: string;
  examinationId: number;
  examinationName: string;
  studentId: number;
  studentName: string;
  usn: string;
  course: string;
  department: string;
  branch: string; // e.g. "CSE", "ISE", "ECE", "MECH", "MBA"
  semester: number;
  section: string;
  academicYear: string;
  photoUrl: string | null;
  feeReceiptUrl: string | null;
  subjectsConfirmed: boolean;
  subjectIssueNote?: string;
  arrears: ArrearSubject[];
  accountsStatus: AccountsFeeStatus;
  principalStatus: PrincipalApprovalStatus;
  stage: ExamApplicationStage;
  hallTicketId?: number;
  hallTicketNumber?: string;
  appliedAt: string;
  updatedAt: string;
};

export type BroadcastNotice = {
  id: number;
  examinationId: number;
  examinationName: string;
  semester: number;
  title: string;
  description: string;
  deadline: string;
  isOpen: boolean;
  announcedAt: string;
};

export type CollegeSettings = {
  collegeName: string;
  collegeCode: string;
  email: string;
  phone: string;
  controllerName: string;
  principalName?: string;
  principalSignatureUrl?: string;
  principalSignatureMode?: "scribble" | "upload" | "typed";
  principalTypedSignature?: string;
  sealCollegeName?: string;
  sealCenterText?: string;
  sealSubText?: string;
  sealYear?: string;
  registrarName?: string;
  registrarSignatureUrl?: string;
  registrarSignatureMode?: "scribble" | "upload" | "typed";
  registrarTypedSignature?: string;
  minAttendance: number;
};

export type Seat = {
  seatId: string;
  benchNumber: number;
  position: "L" | "R";
  studentId?: number;
  studentName?: string;
  usn?: string;
  branch?: string;
  subjectCode?: string;
};

export type Bench = {
  benchNumber: number;
  benchCode: string;
  leftSeat: Seat;
  rightSeat: Seat;
};

export type SeatingPlan = {
  id: number;
  roomName: string;
  examinationId: number;
  examinationName: string;
  examDate: string;
  session: string;
  totalBenches: number;
  benchesPerRow: number;
  benches: Bench[];
  createdAt: string;
  updatedAt: string;
};

// Default seed data
let departments: Department[] = [
  { id: 1, name: "Computer Science & Engineering", code: "CSE", studentCount: 142, courseCount: 2 },
  { id: 2, name: "Information Science & Engineering", code: "ISE", studentCount: 98, courseCount: 1 },
  { id: 3, name: "Electronics & Communication", code: "ECE", studentCount: 88, courseCount: 1 },
  { id: 4, name: "Mechanical Engineering", code: "MECH", studentCount: 65, courseCount: 1 },
  { id: 5, name: "Management & Commerce", code: "MBA", studentCount: 110, courseCount: 2 },
];

let courses: Course[] = [
  { id: 1, name: "B.Tech Computer Science & Engineering", code: "BT-CSE", department: "Computer Science & Engineering", departmentId: 1, duration: 4, description: "Four-year undergraduate degree in computer systems and software engineering." },
  { id: 2, name: "B.Tech Information Science", code: "BT-ISE", department: "Information Science & Engineering", departmentId: 2, duration: 4, description: "Undergraduate degree in information architecture, cloud, and security." },
  { id: 3, name: "B.Tech Electronics & Communication", code: "BT-ECE", department: "Electronics & Communication", departmentId: 3, duration: 4, description: "Undergraduate degree in VLSI, embedded systems, and signals." },
  { id: 4, name: "Master of Business Administration", code: "MBA-GEN", department: "Management & Commerce", departmentId: 5, duration: 2, description: "Postgraduate degree in business analytics and operations." },
];

let subjects: Subject[] = [
  { id: 1, code: "CS401", name: "Design & Analysis of Algorithms", course: "B.Tech Computer Science & Engineering", department: "Computer Science & Engineering", semester: 4, credits: 4, courseId: 1, departmentId: 1 },
  { id: 2, code: "CS402", name: "Operating Systems & Concurrency", course: "B.Tech Computer Science & Engineering", department: "Computer Science & Engineering", semester: 4, credits: 4, courseId: 1, departmentId: 1 },
  { id: 3, code: "CS403", name: "Database Management Systems", course: "B.Tech Computer Science & Engineering", department: "Computer Science & Engineering", semester: 4, credits: 4, courseId: 1, departmentId: 1 },
  { id: 4, code: "CS404", name: "Theory of Computation", course: "B.Tech Computer Science & Engineering", department: "Computer Science & Engineering", semester: 4, credits: 3, courseId: 1, departmentId: 1 },
  { id: 5, code: "IS401", name: "Computer Networks & Security", course: "B.Tech Information Science", department: "Information Science & Engineering", semester: 4, credits: 4, courseId: 2, departmentId: 2 },
  { id: 6, code: "EC401", name: "Digital Signal Processing", course: "B.Tech Electronics & Communication", department: "Electronics & Communication", semester: 4, credits: 4, courseId: 3, departmentId: 3 },
];

let students: Student[] = [
  {
    id: 1,
    studentId: "STU-2022-001",
    usn: "1RV22CS001",
    name: "Mohammed Thahaseen",
    dob: "2004-02-18",
    gender: "Male",
    email: "thahaseen@pace.edu",
    phone: "+91 98765 40120",
    address: "12, 5th Cross, Mangaluru",
    course: "B.Tech Computer Science & Engineering",
    department: "Computer Science & Engineering",
    departmentId: 1,
    courseId: 1,
    semester: 4,
    section: "A",
    academicYear: "2024-25",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    attendancePercentage: 88,
    feeStatus: "Cleared",
  },
  {
    id: 2,
    studentId: "STU-2022-014",
    usn: "1RV22CS014",
    name: "Rohan Mehta",
    dob: "2003-11-06",
    gender: "Male",
    email: "rohan.mehta@rvcollege.edu",
    phone: "+91 98452 16804",
    address: "44, 2nd Main, Bengaluru",
    course: "B.Tech Computer Science & Engineering",
    department: "Computer Science & Engineering",
    departmentId: 1,
    courseId: 1,
    semester: 4,
    section: "A",
    academicYear: "2024-25",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    attendancePercentage: 79,
    feeStatus: "Cleared",
  },
  {
    id: 3,
    studentId: "STU-2022-031",
    usn: "1RV22CS031",
    name: "Ishita Nair",
    dob: "2004-05-24",
    gender: "Female",
    email: "ishita.nair@rvcollege.edu",
    phone: "+91 99008 71244",
    address: "8, Lake View Road, Bengaluru",
    course: "B.Tech Computer Science & Engineering",
    department: "Computer Science & Engineering",
    departmentId: 1,
    courseId: 1,
    semester: 4,
    section: "B",
    academicYear: "2024-25",
    photoUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80",
    attendancePercentage: 68, // Ineligible for attendance (< 75%)
    feeStatus: "Cleared",
  },
  {
    id: 4,
    studentId: "STU-2022-006",
    usn: "1RV22IS006",
    name: "Arjun Kulkarni",
    dob: "2004-01-13",
    gender: "Male",
    email: "arjun.kulkarni@rvcollege.edu",
    phone: "+91 98201 44661",
    address: "19, HSR Layout, Bengaluru",
    course: "B.Tech Information Science",
    department: "Information Science & Engineering",
    departmentId: 2,
    courseId: 2,
    semester: 4,
    section: "A",
    academicYear: "2024-25",
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    attendancePercentage: 92,
    feeStatus: "Pending", // Ineligible for fees
  },
  {
    id: 5,
    studentId: "STU-2022-019",
    usn: "1RV22EC019",
    name: "Meera Iyer",
    dob: "2003-08-30",
    gender: "Female",
    email: "meera.iyer@rvcollege.edu",
    phone: "+91 98867 03120",
    address: "3, Indiranagar, Bengaluru",
    course: "B.Tech Electronics & Communication",
    department: "Electronics & Communication",
    departmentId: 3,
    courseId: 3,
    semester: 4,
    section: "A",
    academicYear: "2024-25",
    photoUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80",
    attendancePercentage: 84,
    feeStatus: "Cleared",
  },
];

// Dynamic date helpers anchored to current real system date
const getOffsetDate = (daysOffset: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().split("T")[0];
};

const getOffsetIso = (daysOffset: number = 0, hoursOffset: number = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + daysOffset);
  d.setHours(d.getHours() + hoursOffset);
  return d.toISOString();
};

const currentYear = new Date().getFullYear();
const currentAcademicYear = `${currentYear}-${(currentYear + 1).toString().slice(-2)}`;

let examinations: Examination[] = [
  {
    id: 1,
    name: "IV Semester End Semester Regular Examinations",
    examType: "End Semester",
    semester: 4,
    academicYear: currentAcademicYear,
    startDate: getOffsetDate(0),
    endDate: getOffsetDate(12),
    center: "Block C · Examination Complex",
    session: "09:30 AM – 12:30 PM",
    description: "Main theory examinations for Fourth Semester Engineering candidates.",
    subjectCount: 4,
    status: "Published",
    subjects: [
      { subjectCode: "CS401", subjectName: "Design & Analysis of Algorithms", examDate: getOffsetDate(0), startTime: "09:30", endTime: "12:30", room: "Hall C-201" },
      { subjectCode: "CS402", subjectName: "Operating Systems & Concurrency", examDate: getOffsetDate(3), startTime: "09:30", endTime: "12:30", room: "Hall C-201" },
      { subjectCode: "CS403", subjectName: "Database Management Systems", examDate: getOffsetDate(7), startTime: "09:30", endTime: "12:30", room: "Hall C-201" },
      { subjectCode: "CS404", subjectName: "Theory of Computation", examDate: getOffsetDate(10), startTime: "09:30", endTime: "12:30", room: "Hall C-201" },
    ],
  },
  {
    id: 2,
    name: "III Semester Supplementary Examinations",
    examType: "Supplementary",
    semester: 3,
    academicYear: currentAcademicYear,
    startDate: getOffsetDate(15),
    endDate: getOffsetDate(22),
    center: "West Wing Complex",
    session: "02:00 PM – 05:00 PM",
    description: "Supplementary exam session for eligible back-paper candidates.",
    subjectCount: 2,
    status: "Draft",
    subjects: [
      { subjectCode: "CS301", subjectName: "Data Structures & Applications", examDate: getOffsetDate(15), startTime: "14:00", endTime: "17:00", room: "Hall W-102" },
      { subjectCode: "CS302", subjectName: "Computer Organization & Architecture", examDate: getOffsetDate(20), startTime: "14:00", endTime: "17:00", room: "Hall W-102" },
    ],
  },
];

let defaultHallTickets: HallTicket[] = [
  {
    id: 1,
    number: `HT-${currentYear.toString().slice(-2)}-0001`,
    studentId: 1,
    studentName: "Mohammed Thahaseen",
    usn: "1RV22CS001",
    course: "B.Tech Computer Science & Engineering",
    department: "Computer Science & Engineering",
    semester: 4,
    section: "A",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    examinationId: 1,
    examinationName: "IV Semester End Semester Regular Examinations",
    academicYear: currentAcademicYear,
    center: "Block C · Examination Complex",
    verifyCode: `PACE-${currentYear.toString().slice(-2)}-1RV22CS001`,
    generatedAt: getOffsetIso(-1),
    status: "Valid",
    subjects: examinations[0].subjects,
  },
  {
    id: 2,
    number: `HT-${currentYear.toString().slice(-2)}-0002`,
    studentId: 2,
    studentName: "Rohan Mehta",
    usn: "1RV22CS014",
    course: "B.Tech Computer Science & Engineering",
    department: "Computer Science & Engineering",
    semester: 4,
    section: "A",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    examinationId: 1,
    examinationName: "IV Semester End Semester Regular Examinations",
    academicYear: currentAcademicYear,
    center: "Block C · Examination Complex",
    verifyCode: `PACE-${currentYear.toString().slice(-2)}-1RV22CS014`,
    generatedAt: getOffsetIso(-1),
    status: "Valid",
    subjects: examinations[0].subjects,
  },
];

let hallTickets: HallTicket[] = (() => {
  const disk = loadDiskHallTickets();
  return disk.length > 0 ? disk : defaultHallTickets;
})();

let settings: CollegeSettings = {
  collegeName: "P A College of Engineering",
  collegeCode: "PACE / AUTONOMOUS EXAM CELL",
  email: "coe@pace.ac.in",
  phone: "+91 824 2284701",
  controllerName: "Prof. S. R. Venkataraman, Controller of Examinations",
  principalName: "Dr. Ramis M.K, Principal",
  principalSignatureUrl: "",
  principalSignatureMode: "scribble",
  principalTypedSignature: "Dr. Ramis M.K",
  registrarName: "Dr. B. E. Rangaswamy, Registrar (Evaluation)",
  registrarSignatureUrl: "",
  registrarSignatureMode: "typed",
  registrarTypedSignature: "B. E. Rangaswamy",
  minAttendance: 75,
  ...loadDiskSettings(),
};

const SEATING_PLANS_FILE_PATH = path.join(process.cwd(), "exam-seating-plans.json");

function loadDiskSeatingPlans(): SeatingPlan[] {
  try {
    if (typeof window === "undefined" && fs.existsSync(SEATING_PLANS_FILE_PATH)) {
      const raw = fs.readFileSync(SEATING_PLANS_FILE_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn("Could not read exam-seating-plans.json:", err);
  }
  return [];
}

function saveDiskSeatingPlans(data: SeatingPlan[]) {
  try {
    if (typeof window === "undefined") {
      fs.writeFileSync(SEATING_PLANS_FILE_PATH, JSON.stringify(data, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("Could not write exam-seating-plans.json:", err);
  }
}

let defaultSeatingPlans: SeatingPlan[] = [
  {
    id: 1,
    roomName: "Hall C-201",
    examinationId: 1,
    examinationName: "IV Semester End Semester Regular Examinations",
    examDate: getOffsetDate(0),
    session: "09:30 AM – 12:30 PM",
    totalBenches: 10,
    benchesPerRow: 2,
    createdAt: getOffsetIso(-2),
    updatedAt: getOffsetIso(0),
    benches: [
      // Row 1 (Benches 1 & 2)
      {
        benchNumber: 1,
        benchCode: "B-01",
        leftSeat: {
          seatId: "B1-L",
          benchNumber: 1,
          position: "L",
          studentId: 1,
          studentName: "Mohammed Thahaseen",
          usn: "1RV22CS001",
          branch: "CSE",
          subjectCode: "CS401",
        },
        rightSeat: {
          seatId: "B1-R",
          benchNumber: 1,
          position: "R",
          studentId: 3,
          studentName: "Priya Nair",
          usn: "1RV22AI005",
          branch: "AIML",
          subjectCode: "AI401",
        },
      },
      {
        benchNumber: 2,
        benchCode: "B-02",
        leftSeat: {
          seatId: "B2-L",
          benchNumber: 2,
          position: "L",
          studentId: 5,
          studentName: "Karthik Verma",
          usn: "1RV22EC018",
          branch: "ECE",
          subjectCode: "EC401",
        },
        rightSeat: {
          seatId: "B2-R",
          benchNumber: 2,
          position: "R",
          studentId: 2,
          studentName: "Rohan Mehta",
          usn: "1RV22CS014",
          branch: "CSE",
          subjectCode: "CS401",
        },
      },
      // Row 2 (Benches 3 & 4) - Diagonal from Row 1
      {
        benchNumber: 3,
        benchCode: "B-03",
        leftSeat: {
          seatId: "B3-L",
          benchNumber: 3,
          position: "L",
          studentId: 6,
          studentName: "Sneha Patil",
          usn: "1RV22AI022",
          branch: "AIML",
          subjectCode: "AI401",
        },
        rightSeat: {
          seatId: "B3-R",
          benchNumber: 3,
          position: "R",
          studentId: 7,
          studentName: "Rahul Sharma",
          usn: "1RV22CS029",
          branch: "CSE",
          subjectCode: "CS401",
        },
      },
      {
        benchNumber: 4,
        benchCode: "B-04",
        leftSeat: {
          seatId: "B4-L",
          benchNumber: 4,
          position: "L",
          studentId: 8,
          studentName: "Farhan Ali",
          usn: "1RV22AI034",
          branch: "AIML",
          subjectCode: "AI401",
        },
        rightSeat: {
          seatId: "B4-R",
          benchNumber: 4,
          position: "R",
          studentId: 9,
          studentName: "Divya Suresh",
          usn: "1RV22CS045",
          branch: "CSE",
          subjectCode: "CS401",
        },
      },
      // Row 3 (Benches 5 & 6)
      {
        benchNumber: 5,
        benchCode: "B-05",
        leftSeat: {
          seatId: "B5-L",
          benchNumber: 5,
          position: "L",
          studentId: 10,
          studentName: "Tanvi Hegde",
          usn: "1RV22CS052",
          branch: "CSE",
          subjectCode: "CS401",
        },
        rightSeat: {
          seatId: "B5-R",
          benchNumber: 5,
          position: "R",
          studentId: 11,
          studentName: "Adil Patel",
          usn: "1RV22AI061",
          branch: "AIML",
          subjectCode: "AI401",
        },
      },
      {
        benchNumber: 6,
        benchCode: "B-06",
        leftSeat: {
          seatId: "B6-L",
          benchNumber: 6,
          position: "L",
          studentId: 12,
          studentName: "Pooja Rao",
          usn: "1RV22EC033",
          branch: "ECE",
          subjectCode: "EC401",
        },
        rightSeat: {
          seatId: "B6-R",
          benchNumber: 6,
          position: "R",
          studentId: 13,
          studentName: "Manoj Kumar",
          usn: "1RV22CS070",
          branch: "CSE",
          subjectCode: "CS401",
        },
      },
      // Row 4 (Benches 7 & 8)
      {
        benchNumber: 7,
        benchCode: "B-07",
        leftSeat: {
          seatId: "B7-L",
          benchNumber: 7,
          position: "L",
          studentId: 14,
          studentName: "Zoya Akhtar",
          usn: "1RV22AI077",
          branch: "AIML",
          subjectCode: "AI401",
        },
        rightSeat: {
          seatId: "B7-R",
          benchNumber: 7,
          position: "R",
          studentId: 15,
          studentName: "Arjun Reddy",
          usn: "1RV22CS088",
          branch: "CSE",
          subjectCode: "CS401",
        },
      },
      {
        benchNumber: 8,
        benchCode: "B-08",
        leftSeat: {
          seatId: "B8-L",
          benchNumber: 8,
          position: "L",
          studentId: 16,
          studentName: "Deepak S",
          usn: "1RV22EC045",
          branch: "ECE",
          subjectCode: "EC401",
        },
        rightSeat: {
          seatId: "B8-R",
          benchNumber: 8,
          position: "R",
          studentId: 17,
          studentName: "Neha Kulkarni",
          usn: "1RV22CS095",
          branch: "CSE",
          subjectCode: "CS401",
        },
      },
      // Row 5 (Benches 9 & 10) - Available seats
      {
        benchNumber: 9,
        benchCode: "B-09",
        leftSeat: {
          seatId: "B9-L",
          benchNumber: 9,
          position: "L",
        },
        rightSeat: {
          seatId: "B9-R",
          benchNumber: 9,
          position: "R",
        },
      },
      {
        benchNumber: 10,
        benchCode: "B-10",
        leftSeat: {
          seatId: "B10-L",
          benchNumber: 10,
          position: "L",
        },
        rightSeat: {
          seatId: "B10-R",
          benchNumber: 10,
          position: "R",
        },
      },
    ],
  },
];

let seatingPlans: SeatingPlan[] = (() => {
  const disk = loadDiskSeatingPlans();
  return disk.length > 0 ? disk : defaultSeatingPlans;
})();

let defaultBroadcasts: BroadcastNotice[] = [
  {
    id: 1,
    examinationId: 1,
    examinationName: "IV Semester End Semester Regular Examinations",
    semester: 4,
    title: "IV Semester Examination Application Open",
    description: "Hall Ticket application window for 4th Semester Regular End-Semester Examinations is now open. Verify registered subjects, report arrears, and upload fee receipt.",
    deadline: getOffsetDate(7),
    isOpen: true,
    announcedAt: getOffsetIso(-2),
  },
];

let broadcasts: BroadcastNotice[] = (() => {
  const disk = loadDiskBroadcasts();
  return disk.length > 0 ? disk : defaultBroadcasts;
})();

let defaultApplications: ExamApplication[] = [
  {
    id: 1,
    applicationNumber: `APP-${currentYear.toString().slice(-2)}-001`,
    examinationId: 1,
    examinationName: "IV Semester End Semester Regular Examinations",
    studentId: 1,
    studentName: "Mohammed Thahaseen",
    usn: "1RV22CS001",
    course: "B.Tech Computer Science & Engineering",
    department: "Computer Science & Engineering",
    branch: "CSE",
    semester: 4,
    section: "A",
    academicYear: currentAcademicYear,
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
    feeReceiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    subjectsConfirmed: true,
    arrears: [],
    accountsStatus: {
      collegeFees: "No Due",
      hostelFees: "N/A",
      busFees: "No Due",
      fine: "Paid",
      updatedAt: getOffsetIso(-1),
    },
    principalStatus: {
      status: "Approved",
      reviewedAt: getOffsetIso(0, -2),
    },
    stage: "PRINCIPAL_APPROVED",
    hallTicketId: 1,
    hallTicketNumber: `HT-${currentYear.toString().slice(-2)}-0001`,
    appliedAt: getOffsetIso(-2),
    updatedAt: getOffsetIso(0, -2),
  },
  {
    id: 2,
    applicationNumber: `APP-${currentYear.toString().slice(-2)}-002`,
    examinationId: 1,
    examinationName: "IV Semester End Semester Regular Examinations",
    studentId: 2,
    studentName: "Rohan Mehta",
    usn: "1RV22CS014",
    course: "B.Tech Computer Science & Engineering",
    department: "Computer Science & Engineering",
    branch: "CSE",
    semester: 4,
    section: "A",
    academicYear: currentAcademicYear,
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80",
    feeReceiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    subjectsConfirmed: true,
    arrears: [
      { subjectCode: "CS301", subjectName: "Data Structures & Applications" },
    ],
    accountsStatus: {
      collegeFees: "Pending",
      hostelFees: "No Due",
      busFees: "N/A",
      fine: "Pending",
      updatedAt: getOffsetIso(-1),
    },
    principalStatus: {
      status: "Pending",
    },
    stage: "UNDER_ACCOUNTS_REVIEW",
    appliedAt: getOffsetIso(-1),
    updatedAt: getOffsetIso(-1),
  },
  {
    id: 3,
    applicationNumber: `APP-${currentYear.toString().slice(-2)}-003`,
    examinationId: 1,
    examinationName: "IV Semester End Semester Regular Examinations",
    studentId: 4,
    studentName: "Arjun Kulkarni",
    usn: "1RV22IS006",
    course: "B.Tech Information Science",
    department: "Information Science & Engineering",
    branch: "ISE",
    semester: 4,
    section: "A",
    academicYear: currentAcademicYear,
    photoUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80",
    feeReceiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
    subjectsConfirmed: false,
    subjectIssueNote: "Elective IS401 is shown instead of Advanced Web Tech",
    arrears: [],
    accountsStatus: {
      collegeFees: "Pending",
      hostelFees: "Pending",
      busFees: "Pending",
      fine: "N/A",
    },
    principalStatus: {
      status: "Pending",
    },
    stage: "APPLIED",
    appliedAt: getOffsetIso(-2),
    updatedAt: getOffsetIso(-2),
  },
];

let examApplications: ExamApplication[] = (() => {
  const disk = loadDiskApplications();
  return disk.length > 0 ? disk : defaultApplications;
})();

let nextIdTracker = {
  department: 6,
  course: 5,
  subject: 7,
  student: 6,
  examination: 3,
  hallTicket: 3,
  seatingPlan: 2,
  broadcast: 2,
  examApplication: 4,
};

function getNextId(key: keyof typeof nextIdTracker) {
  const id = nextIdTracker[key];
  nextIdTracker[key] += 1;
  return id;
}

// Data store API methods
export const dataStore = {
  // Settings
  async getSettings(): Promise<CollegeSettings> {
    const disk = loadDiskSettings();
    settings = { ...settings, ...disk };

    if (supabaseStore.isConfigured()) {
      try {
        const supa = await supabaseStore.getSettings();
        if (supa) {
          settings = {
            ...settings,
            collegeName: supa.collegeName || settings.collegeName,
            collegeCode: supa.collegeCode || settings.collegeCode,
            email: supa.email || settings.email,
            phone: supa.phone || settings.phone,
            controllerName: supa.controllerName || settings.controllerName,
            principalName: supa.principalName || settings.principalName,
            principalSignatureUrl: supa.principalSignatureUrl || settings.principalSignatureUrl || "",
            minAttendance: supa.minAttendance ?? settings.minAttendance,
            principalSignatureMode: settings.principalSignatureMode || "scribble",
            principalTypedSignature: settings.principalTypedSignature || "Dr. Ramis M.K",
            registrarName: settings.registrarName || "Dr. B. E. Rangaswamy, Registrar (Evaluation)",
            registrarSignatureUrl: settings.registrarSignatureUrl || "",
            registrarSignatureMode: settings.registrarSignatureMode || "typed",
            registrarTypedSignature: settings.registrarTypedSignature || "B. E. Rangaswamy",
          };
        }
      } catch (err) {
        console.warn("Supabase getSettings failed, using memory store:", err);
      }
    }
    return { ...settings };
  },
  async updateSettings(newSettings: Partial<CollegeSettings>): Promise<CollegeSettings> {
    settings = { ...settings, ...newSettings };
    saveDiskSettings(settings);

    if (supabaseStore.isConfigured()) {
      try {
        await supabaseStore.updateSettings(newSettings);
      } catch (err) {
        console.warn("Supabase updateSettings failed, updated local store:", err);
      }
    }
    return { ...settings };
  },

  // Dashboard
  async getDashboardSummary() {
    if (supabaseStore.isConfigured()) {
      const [studentsList, examsList, ticketsList, deptsList] = await Promise.all([
        supabaseStore.getStudents(),
        supabaseStore.getExaminations(),
        supabaseStore.getHallTickets(),
        supabaseStore.getDepartments(),
      ]);

      if (studentsList && examsList && ticketsList && deptsList) {
        const curSettings = (await supabaseStore.getSettings()) || settings;
        const eligibleCount = studentsList.filter(
          (s) => s.attendancePercentage >= curSettings.minAttendance && s.feeStatus === "Cleared"
        ).length;

        const liveDeptCounts = deptsList.map((d) => ({
          code: d.code,
          name: d.name,
          count: studentsList.filter(
            (s) =>
              s.departmentId === d.id ||
              s.department.toLowerCase().trim() === d.name.toLowerCase().trim() ||
              s.department.toLowerCase().trim() === d.code.toLowerCase().trim()
          ).length,
        }));

        return {
          totals: {
            students: studentsList.length,
            eligibleStudents: eligibleCount,
            ineligibleStudents: studentsList.length - eligibleCount,
            departments: deptsList.length,
            subjects: 6,
            examinations: examsList.length,
            hallTickets: ticketsList.length,
          },
          recentHallTickets: ticketsList.slice(-5).reverse(),
          upcomingExaminations: examsList,
          departmentCounts: liveDeptCounts,
        };
      }
    }

    const eligibleCount = students.filter(
      (s) => s.attendancePercentage >= settings.minAttendance && s.feeStatus === "Cleared"
    ).length;

    const liveDeptCounts = departments.map((d) => ({
      code: d.code,
      name: d.name,
      count: students.filter(
        (s) =>
          s.departmentId === d.id ||
          s.department.toLowerCase().trim() === d.name.toLowerCase().trim() ||
          s.department.toLowerCase().trim() === d.code.toLowerCase().trim()
      ).length,
    }));

    return {
      totals: {
        students: students.length,
        eligibleStudents: eligibleCount,
        ineligibleStudents: students.length - eligibleCount,
        departments: departments.length,
        subjects: subjects.length,
        examinations: examinations.length,
        hallTickets: hallTickets.length,
      },
      recentHallTickets: hallTickets.slice(-5).reverse(),
      upcomingExaminations: examinations,
      departmentCounts: liveDeptCounts,
    };
  },

  // Students
  async getStudents(filters?: { search?: string; semester?: number; department?: string }): Promise<Student[]> {
    if (supabaseStore.isConfigured()) {
      return (await supabaseStore.getStudents(filters)) || [];
    }
    return students.filter((s) => {
      const matchSearch =
        !filters?.search ||
        [s.name, s.usn, s.studentId]
          .some((val) => val.toLowerCase().includes(filters.search!.toLowerCase()));
      const matchSem = !filters?.semester || s.semester === filters.semester;
      const matchDept =
        !filters?.department ||
        s.department.toLowerCase().includes(filters.department!.toLowerCase());
      return matchSearch && matchSem && matchDept;
    });
  },

  async getStudentById(id: number): Promise<Student | null> {
    if (supabaseStore.isConfigured()) {
      return await supabaseStore.getStudentById(id);
    }
    return students.find((s) => s.id === id) || null;
  },

  async getStudentByUsn(usn: string): Promise<Student | null> {
    if (supabaseStore.isConfigured()) {
      const list = await supabaseStore.getStudents({ search: usn });
      if (list && list.length > 0) {
        const match = list.find(
          (s) => s.usn.toLowerCase() === usn.toLowerCase() || s.studentId.toLowerCase() === usn.toLowerCase()
        );
        return match || null;
      }
      return null;
    }
    return (
      students.find(
        (s) => s.usn.toLowerCase() === usn.toLowerCase() || s.studentId.toLowerCase() === usn.toLowerCase()
      ) || null
    );
  },

  async createStudent(
    input: Omit<Student, "id" | "department" | "course"> & {
      department?: string;
      course?: string;
    }
  ): Promise<Student> {
    if (supabaseStore.isConfigured()) {
      const supa = await supabaseStore.createStudent(input);
      if (!supa) throw new Error("Database insertion failure: could not create student in Supabase.");
      return supa;
    }
    const dept = departments.find((d) => d.id === input.departmentId) || departments[0];
    const crs = courses.find((c) => c.id === input.courseId) || courses[0];
    const newStudent: Student = {
      id: getNextId("student"),
      ...input,
      department: input.department || dept.name,
      course: input.course || crs.name,
    };
    students.push(newStudent);
    dept.studentCount += 1;
    return newStudent;
  },

  async updateStudent(id: number, input: Partial<Student>): Promise<Student | null> {
    if (supabaseStore.isConfigured()) {
      return await supabaseStore.updateStudent(id, input);
    }
    const student = students.find((s) => s.id === id);
    if (!student) return null;
    Object.assign(student, input);
    if (input.departmentId) {
      const dept = departments.find((d) => d.id === input.departmentId);
      if (dept) student.department = dept.name;
    }
    if (input.courseId) {
      const crs = courses.find((c) => c.id === input.courseId);
      if (crs) student.course = crs.name;
    }
    return student;
  },

  async deleteStudent(id: number): Promise<boolean> {
    if (supabaseStore.isConfigured()) {
      return await supabaseStore.deleteStudent(id);
    }
    const index = students.findIndex((s) => s.id === id);
    if (index === -1) return false;
    students.splice(index, 1);
    return true;
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    if (supabaseStore.isConfigured()) {
      const supa = await supabaseStore.getDepartments();
      const allStudents = (await supabaseStore.getStudents()) || [];
      return (supa || []).map((d) => ({
        ...d,
        studentCount: allStudents.filter(
          (s) =>
            s.departmentId === d.id ||
            s.department.toLowerCase().trim() === d.name.toLowerCase().trim() ||
            s.department.toLowerCase().trim() === d.code.toLowerCase().trim()
        ).length,
      }));
    }

    const allStudents = await this.getStudents();
    return departments.map((d) => ({
      ...d,
      studentCount: allStudents.filter(
        (s) =>
          s.departmentId === d.id ||
          s.department.toLowerCase().trim() === d.name.toLowerCase().trim() ||
          s.department.toLowerCase().trim() === d.code.toLowerCase().trim()
      ).length,
    }));
  },
  async createDepartment(input: { name: string; code: string }): Promise<Department> {
    if (supabaseStore.isConfigured()) {
      const created = await supabaseStore.createDepartment(input);
      if (!created) throw new Error("Unable to create department in Supabase.");
      return created;
    }
    const newDept: Department = {
      id: getNextId("department"),
      name: input.name,
      code: input.code.toUpperCase(),
      studentCount: 0,
      courseCount: 0,
    };
    departments.push(newDept);
    return newDept;
  },
  async updateDepartment(id: number, input: Partial<Department>): Promise<Department | null> {
    if (supabaseStore.isConfigured()) return await supabaseStore.updateDepartment(id, input);
    const dept = departments.find((d) => d.id === id);
    if (!dept) return null;
    Object.assign(dept, input);
    return dept;
  },
  async deleteDepartment(id: number): Promise<boolean> {
    if (supabaseStore.isConfigured()) return await supabaseStore.deleteDepartment(id);
    const index = departments.findIndex((d) => d.id === id);
    if (index === -1) return false;
    departments.splice(index, 1);
    return true;
  },

  // Courses
  async getCourses(): Promise<Course[]> {
    if (supabaseStore.isConfigured()) {
      return (await supabaseStore.getCourses()) || [];
    }
    return [...courses];
  },
  async createCourse(input: { name: string; code: string; departmentId: number; duration: number; description?: string }): Promise<Course> {
    if (supabaseStore.isConfigured()) {
      const created = await supabaseStore.createCourse(input);
      if (!created) throw new Error("Unable to create course in Supabase. Confirm its department exists.");
      return created;
    }
    const dept = departments.find((d) => d.id === input.departmentId) || departments[0];
    const newCourse: Course = {
      id: getNextId("course"),
      name: input.name,
      code: input.code.toUpperCase(),
      department: dept.name,
      departmentId: dept.id,
      duration: input.duration || 4,
      description: input.description || "",
    };
    courses.push(newCourse);
    dept.courseCount += 1;
    return newCourse;
  },
  async updateCourse(id: number, input: Partial<Course>): Promise<Course | null> {
    if (supabaseStore.isConfigured()) return await supabaseStore.updateCourse(id, input);
    const crs = courses.find((c) => c.id === id);
    if (!crs) return null;
    Object.assign(crs, input);
    if (input.departmentId) {
      const dept = departments.find((d) => d.id === input.departmentId);
      if (dept) crs.department = dept.name;
    }
    return crs;
  },
  async deleteCourse(id: number): Promise<boolean> {
    if (supabaseStore.isConfigured()) return await supabaseStore.deleteCourse(id);
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return false;
    courses.splice(index, 1);
    return true;
  },

  // Subjects
  async getSubjects(filters?: { search?: string; semester?: number }): Promise<Subject[]> {
    if (supabaseStore.isConfigured()) {
      return (await supabaseStore.getSubjects(filters)) || [];
    }
    return subjects.filter((s) => {
      const matchSearch =
        !filters?.search ||
        `${s.code} ${s.name}`.toLowerCase().includes(filters.search.toLowerCase());
      const matchSem = !filters?.semester || s.semester === filters.semester;
      return matchSearch && matchSem;
    });
  },
  async createSubject(input: { code: string; name: string; courseId: number; departmentId: number; semester: number; credits: number }): Promise<Subject> {
    if (supabaseStore.isConfigured()) {
      const created = await supabaseStore.createSubject(input);
      if (!created) throw new Error("Unable to create subject in Supabase. The course must belong to the selected department.");
      return created;
    }
    const dept = departments.find((d) => d.id === input.departmentId) || departments[0];
    const crs = courses.find((c) => c.id === input.courseId) || courses[0];
    const newSubj: Subject = {
      id: getNextId("subject"),
      code: input.code.toUpperCase(),
      name: input.name,
      course: crs.name,
      department: dept.name,
      courseId: crs.id,
      departmentId: dept.id,
      semester: input.semester,
      credits: input.credits,
    };
    subjects.push(newSubj);
    return newSubj;
  },
  async updateSubject(id: number, input: Partial<Subject>): Promise<Subject | null> {
    if (supabaseStore.isConfigured()) return await supabaseStore.updateSubject(id, input);
    const sub = subjects.find((s) => s.id === id);
    if (!sub) return null;
    Object.assign(sub, input);
    return sub;
  },
  async deleteSubject(id: number): Promise<boolean> {
    if (supabaseStore.isConfigured()) return await supabaseStore.deleteSubject(id);
    const index = subjects.findIndex((s) => s.id === id);
    if (index === -1) return false;
    subjects.splice(index, 1);
    return true;
  },

  // Examinations
  async getExaminations(): Promise<Examination[]> {
    if (supabaseStore.isConfigured()) {
      return (await supabaseStore.getExaminations()) || [];
    }
    return [...examinations];
  },
  async getExaminationById(id: number): Promise<Examination | null> {
    if (supabaseStore.isConfigured()) {
      return await supabaseStore.getExaminationById(id);
    }
    return examinations.find((e) => e.id === id) || null;
  },
  async createExamination(input: Omit<Examination, "id" | "subjectCount">): Promise<Examination> {
    if (supabaseStore.isConfigured()) {
      const supa = await supabaseStore.createExamination(input);
      if (!supa) throw new Error("Database insertion failure: could not create examination in Supabase.");
      return supa;
    }
    const newExam: Examination = {
      id: getNextId("examination"),
      ...input,
      subjectCount: input.subjects?.length || 0,
      status: input.status || "Draft",
    };
    examinations.push(newExam);
    return newExam;
  },
  async updateExamination(id: number, input: Partial<Examination>): Promise<Examination | null> {
    if (supabaseStore.isConfigured()) {
      return await supabaseStore.updateExamination(id, input);
    }
    const exam = examinations.find((e) => e.id === id);
    if (!exam) return null;
    Object.assign(exam, input);
    if (input.subjects) {
      exam.subjectCount = input.subjects.length;
    }
    return exam;
  },
  async deleteExamination(id: number): Promise<boolean> {
    if (supabaseStore.isConfigured()) {
      return await supabaseStore.deleteExamination(id);
    }
    const index = examinations.findIndex((e) => e.id === id);
    if (index === -1) return false;
    examinations.splice(index, 1);
    return true;
  },

  // Hall Tickets
  async getHallTickets(): Promise<HallTicket[]> {
    let list: HallTicket[] = [];
    if (supabaseStore.isConfigured()) {
      try {
        const supaList = await supabaseStore.getHallTickets();
        if (supaList && supaList.length > 0) list = supaList;
      } catch (err) {
        console.warn("Supabase getHallTickets error:", err);
      }
    }
    const disk = loadDiskHallTickets();
    if (disk.length > 0) hallTickets = disk;

    for (const loc of hallTickets) {
      if (!list.some((item) => item.studentId === loc.studentId && item.examinationId === loc.examinationId)) {
        list.push(loc);
      }
    }
    for (const ticket of list) {
      ticket.qrDataUrl = await generateQrDataUrl(
        `${getAppUrl()}/verify/${ticket.verifyCode}`
      );
    }
    return list;
  },

  async getHallTicketById(id: number): Promise<HallTicket | null> {
    if (supabaseStore.isConfigured()) {
      try {
        const ticket = await supabaseStore.getHallTicketById(id);
        if (ticket) {
          ticket.qrDataUrl = await generateQrDataUrl(
            `${getAppUrl()}/verify/${ticket.verifyCode}`
          );
          return ticket;
        }
      } catch (err) {
        console.warn("Supabase getHallTicketById error:", err);
      }
    }
    const disk = loadDiskHallTickets();
    if (disk.length > 0) hallTickets = disk;

    const ticket = hallTickets.find((t) => t.id === id);
    if (!ticket) return null;
    ticket.qrDataUrl = await generateQrDataUrl(
      `${getAppUrl()}/verify/${ticket.verifyCode}`
    );
    return ticket;
  },

  async getHallTicketsByStudentId(studentId: number): Promise<HallTicket[]> {
    let list: HallTicket[] = [];
    if (supabaseStore.isConfigured()) {
      try {
        const supaList = await supabaseStore.getHallTicketsByStudentId(studentId);
        if (supaList && supaList.length > 0) list = supaList;
      } catch (err) {
        console.warn("Supabase getHallTicketsByStudentId error:", err);
      }
    }
    const disk = loadDiskHallTickets();
    if (disk.length > 0) hallTickets = disk;

    const results = hallTickets.filter((t) => t.studentId === studentId);
    for (const loc of results) {
      if (!list.some((item) => item.studentId === loc.studentId && item.examinationId === loc.examinationId)) {
        list.push(loc);
      }
    }
    for (const ticket of list) {
      ticket.qrDataUrl = await generateQrDataUrl(
        `${getAppUrl()}/verify/${ticket.verifyCode}`
      );
    }
    return list;
  },

  async generateHallTickets(
    examinationId: number,
    studentIds: number[],
    overrideEligibility = false
  ): Promise<{ generated: HallTicket[]; skipped: { student: Student; reason: string }[] }> {
    const isSupa = supabaseStore.isConfigured();
    const curSettings = await this.getSettings();

    let exam: Examination | null = null;
    let allStudents: Student[] = [];
    let currentTickets: HallTicket[] = [];

    if (isSupa) {
      exam = await supabaseStore.getExaminationById(examinationId);
      allStudents = (await supabaseStore.getStudents()) || [];
      currentTickets = (await supabaseStore.getHallTickets()) || [];
    } else {
      exam = examinations.find((e) => e.id === examinationId) || null;
      allStudents = students;
      currentTickets = hallTickets;
    }

    if (!exam) {
      throw new Error(`Examination record ${examinationId} not found.`);
    }

    const generated: HallTicket[] = [];
    const skipped: { student: Student; reason: string }[] = [];

    for (const sId of studentIds) {
      const student = allStudents.find((s) => s.id === sId);
      if (!student) continue;

      // Eligibility checks
      const isAttendanceShort = student.attendancePercentage < curSettings.minAttendance;
      const isFeePending = student.feeStatus !== "Cleared";

      if (!overrideEligibility && (isAttendanceShort || isFeePending)) {
        skipped.push({
          student,
          reason: isAttendanceShort
            ? `Low Attendance (${student.attendancePercentage}% < ${curSettings.minAttendance}%)`
            : "Fee Dues Pending",
        });
        continue;
      }

      // Check if ticket already exists
      const existing = currentTickets.find(
        (t) => t.studentId === student.id && t.examinationId === exam!.id
      );
      if (existing) {
        generated.push(existing);
        continue;
      }

      const ticketNum = `HT-25-${String(currentTickets.length + generated.length + 1).padStart(4, "0")}`;
      const verifyCode = `RVHT-25-${student.usn}`;
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
      const qrDataUrl = await generateQrDataUrl(
        `${appUrl}/verify/${verifyCode}`
      );

      const ticketPayload: Omit<HallTicket, "id"> = {
        number: ticketNum,
        studentId: student.id,
        studentName: student.name,
        usn: student.usn,
        course: student.course,
        department: student.department,
        semester: student.semester,
        section: student.section,
        photoUrl: student.photoUrl,
        examinationId: exam.id,
        examinationName: exam.name,
        academicYear: exam.academicYear,
        center: exam.center,
        verifyCode,
        qrDataUrl,
        generatedAt: new Date().toISOString(),
        status: "Valid",
        subjects: exam.subjects,
      };

      if (isSupa) {
        const createdSupa = await supabaseStore.createHallTicket(ticketPayload);
        if (createdSupa) {
          generated.push(createdSupa);
          continue;
        } else {
          throw new Error(`Failed to issue hall ticket for USN ${student.usn} in database.`);
        }
      }

      const localTicket: HallTicket = {
        id: getNextId("hallTicket"),
        ...ticketPayload,
      };

      hallTickets.push(localTicket);
      generated.push(localTicket);
    }

    return { generated, skipped };
  },

  async verifyHallTicket(code: string): Promise<{
    valid: boolean;
    hallTicket: HallTicket | null;
    message: string;
  }> {
    if (!code) {
      return { valid: false, hallTicket: null, message: "Verification code required" };
    }

    if (supabaseStore.isConfigured()) {
      const ticket = await supabaseStore.getHallTicketByVerifyCode(code);
      if (!ticket) {
        return {
          valid: false,
          hallTicket: null,
          message: "No authentic examination document found matching this verification code.",
        };
      }

      if (!ticket.qrDataUrl) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        ticket.qrDataUrl = await generateQrDataUrl(
          `${appUrl}/verify/${ticket.verifyCode}`
        );
      }
      return {
        valid: ticket.status === "Valid",
        hallTicket: ticket,
        message:
          ticket.status === "Valid"
            ? "Official document verified. Issued by the Autonomous Examination Office."
            : "Document has been revoked or suspended by the Controller of Examinations.",
      };
    }

    const cleanCode = code.trim().toLowerCase();
    const ticket = hallTickets.find(
      (t) => t.verifyCode.toLowerCase() === cleanCode || t.number.toLowerCase() === cleanCode
    );

    if (!ticket) {
      return {
        valid: false,
        hallTicket: null,
        message: "No authentic examination document found matching this verification code.",
      };
    }

    ticket.qrDataUrl = await generateQrDataUrl(
      `${getAppUrl()}/verify/${ticket.verifyCode}`
    );

    return {
      valid: ticket.status === "Valid",
      hallTicket: ticket,
      message:
        ticket.status === "Valid"
          ? "Official document verified. Issued by the Autonomous Examination Office."
          : "Document has been revoked or suspended by the Controller of Examinations.",
    };
  },


  // =========================================================================
  // SEATING PLANS
  // =========================================================================
  async getSeatingPlans(filters?: { examinationId?: number; roomName?: string }): Promise<SeatingPlan[]> {
    let plans: SeatingPlan[] = [];

    if (supabaseStore.isConfigured()) {
      try {
        const supa = await supabaseStore.getSeatingPlans(filters);
        if (supa && supa.length > 0) {
          plans = supa;
        }
      } catch (err) {
        console.warn("Supabase getSeatingPlans error:", err);
      }
    }

    if (plans.length === 0) {
      const disk = loadDiskSeatingPlans();
      if (disk.length > 0) {
        seatingPlans = disk;
      }
      let result = [...seatingPlans];
      if (filters?.examinationId) {
        result = result.filter((p) => p.examinationId === Number(filters.examinationId));
      }
      if (filters?.roomName) {
        result = result.filter((p) => p.roomName.toLowerCase().includes(filters.roomName!.toLowerCase()));
      }
      plans = result;
    }

    return plans;
  },

  async getSeatingPlanById(id: number): Promise<SeatingPlan | null> {
    if (supabaseStore.isConfigured()) {
      try {
        const supa = await supabaseStore.getSeatingPlanById(id);
        if (supa) return supa;
      } catch (err) {
        console.warn("Supabase getSeatingPlanById error:", err);
      }
    }
    const disk = loadDiskSeatingPlans();
    if (disk.length > 0) seatingPlans = disk;
    const plan = seatingPlans.find((p) => p.id === id);
    return plan ? { ...plan } : null;
  },

  async saveSeatingPlan(input: Omit<SeatingPlan, "id" | "createdAt" | "updatedAt"> & { id?: number }): Promise<SeatingPlan> {
    let saved: SeatingPlan | null = null;
    if (supabaseStore.isConfigured()) {
      try {
        saved = await supabaseStore.saveSeatingPlan(input);
      } catch (err) {
        console.warn("Supabase saveSeatingPlan error:", err);
      }
    }

    const now = new Date().toISOString();
    const disk = loadDiskSeatingPlans();
    if (disk.length > 0) seatingPlans = disk;

    if (input.id) {
      const idx = seatingPlans.findIndex((p) => p.id === input.id);
      if (idx !== -1) {
        const updated: SeatingPlan = {
          ...seatingPlans[idx],
          ...input,
          id: input.id,
          updatedAt: now,
        };
        seatingPlans[idx] = updated;
        saveDiskSeatingPlans(seatingPlans);
        return saved || updated;
      }
    }

    const newPlan: SeatingPlan = {
      ...input,
      id: saved?.id || (input.id || (seatingPlans.length > 0 ? Math.max(...seatingPlans.map((p) => p.id)) + 1 : 1)),
      createdAt: now,
      updatedAt: now,
    };
    seatingPlans.unshift(newPlan);
    saveDiskSeatingPlans(seatingPlans);
    return saved || newPlan;
  },

  async deleteSeatingPlan(id: number): Promise<boolean> {
    if (supabaseStore.isConfigured()) {
      try {
        await supabaseStore.deleteSeatingPlan(id);
      } catch (err) {
        console.warn("Supabase deleteSeatingPlan error:", err);
      }
    }
    const disk = loadDiskSeatingPlans();
    if (disk.length > 0) seatingPlans = disk;
    const idx = seatingPlans.findIndex((p) => p.id === id);
    if (idx !== -1) {
      seatingPlans.splice(idx, 1);
      saveDiskSeatingPlans(seatingPlans);
      return true;
    }
    return false;
  },

  // =========================================================================
  // BROADCAST NOTICES
  // =========================================================================
  async getBroadcasts(semester?: number): Promise<BroadcastNotice[]> {
    let list: BroadcastNotice[] = [];
    if (supabaseStore.isConfigured()) {
      try {
        const supa = await supabaseStore.getBroadcasts(semester);
        if (supa !== null && supa.length > 0) list = supa;
      } catch (err) {
        console.warn("Supabase getBroadcasts error:", err);
      }
    }
    const disk = loadDiskBroadcasts();
    if (disk.length > 0) broadcasts = disk;

    for (const b of broadcasts) {
      if (!list.some((item) => item.id === b.id || (item.semester === b.semester && item.examinationId === b.examinationId))) {
        list.push(b);
      }
    }

    if (semester !== undefined) {
      return list.filter((b) => b.semester === Number(semester));
    }
    return [...list];
  },

  async createBroadcast(input: {
    examinationId: number;
    semester: number;
    title: string;
    description?: string;
    deadline: string;
    academicYear?: string;
    courseId?: number;
    actorId?: string;
  }): Promise<BroadcastNotice> {
    if (supabaseStore.isConfigured()) {
      try {
        const created = await supabaseStore.createBroadcast({
          examinationId: input.examinationId, semester: input.semester, title: input.title,
          description: input.description, deadline: input.deadline,
          academicYear: input.academicYear || "", courseId: input.courseId, actorId: input.actorId || "admin-system",
        });
        if (created) return created;
      } catch (err) {
        console.warn("Supabase createBroadcast error, saving to disk storage:", err);
      }
    }
    const exam = examinations.find((e) => e.id === Number(input.examinationId));
    const newNotice: BroadcastNotice = {
      id: getNextId("broadcast"),
      examinationId: Number(input.examinationId),
      examinationName: exam?.name || `${input.semester}th Semester Examination`,
      semester: Number(input.semester),
      title: input.title,
      description: input.description || `Hall Ticket Application for Semester ${input.semester} is open.`,
      deadline: input.deadline,
      isOpen: true,
      announcedAt: new Date().toISOString(),
    };

    broadcasts.unshift(newNotice);
    saveDiskBroadcasts(broadcasts);
    return newNotice;
  },

  async toggleBroadcast(id: number, isOpen: boolean): Promise<BroadcastNotice | null> {
    if (supabaseStore.isConfigured()) {
      try {
        const updated = await supabaseStore.toggleBroadcast(id, isOpen);
        if (updated) return updated;
      } catch (err) {
        console.warn("Supabase toggleBroadcast error:", err);
      }
    }
    const notice = broadcasts.find((b) => b.id === id);
    if (!notice) return null;
    notice.isOpen = isOpen;
    saveDiskBroadcasts(broadcasts);
    return { ...notice };
  },

  // =========================================================================
  // EXAM APPLICATIONS
  // =========================================================================
  async getApplications(filters?: {
    semester?: number;
    branch?: string;
    studentId?: number;
    usn?: string;
    stage?: string;
  }): Promise<ExamApplication[]> {
    let list: ExamApplication[] = [];
    if (supabaseStore.isConfigured()) {
      try {
        const supa = await supabaseStore.getApplications(filters);
        if (supa !== null && supa.length > 0) list = supa;
      } catch (err) {
        console.warn("Supabase getApplications error:", err);
      }
    }
    const disk = loadDiskApplications();
    if (disk.length > 0) examApplications = disk;

    for (const app of examApplications) {
      if (!list.some((item) => item.id === app.id || (item.studentId === app.studentId && item.examinationId === app.examinationId))) {
        list.push(app);
      }
    }

    let result = [...list];
    if (filters?.semester !== undefined && filters.semester !== null && !isNaN(Number(filters.semester))) {
      result = result.filter((a) => a.semester === Number(filters.semester));
    }
    if (filters?.branch && filters.branch !== "ALL") {
      result = result.filter(
        (a) =>
          a.branch.toLowerCase() === filters.branch!.toLowerCase() ||
          a.department.toLowerCase().includes(filters.branch!.toLowerCase())
      );
    }
    if (filters?.studentId) {
      result = result.filter((a) => a.studentId === Number(filters.studentId));
    }
    if (filters?.usn) {
      result = result.filter((a) => a.usn.toLowerCase() === filters.usn!.toLowerCase());
    }
    if (filters?.stage) {
      result = result.filter((a) => a.stage === filters.stage);
    }
    return result;
  },

  async getApplicationById(id: number): Promise<ExamApplication | null> {
    if (supabaseStore.isConfigured()) {
      try {
        const supa = await supabaseStore.getApplicationById(id);
        if (supa !== null) return supa;
      } catch (err) {
        console.warn("Supabase getApplicationById error:", err);
      }
    }
    const disk = loadDiskApplications();
    if (disk.length > 0) examApplications = disk;
    const app = examApplications.find((a) => a.id === id);
    return app ? { ...app } : null;
  },

  async getApplicationByStudentId(
    studentId: number,
    examinationId?: number
  ): Promise<ExamApplication | null> {
    const list = await this.getApplications({ studentId });
    return list.find((application) => !examinationId || application.examinationId === examinationId) || null;
  },

  async submitExamApplication(input: {
    studentId: number;
    examinationId: number;
    photoUrl?: string | null;
    feeReceiptUrl?: string | null;
    subjectsConfirmed: boolean;
    subjectIssueNote?: string;
    arrears: ArrearSubject[];
    actorId?: string;
  }): Promise<ExamApplication> {
    if (supabaseStore.isConfigured()) {
      try {
        const submitted = await supabaseStore.submitExamApplication({ ...input, actorId: input.actorId || "admin-system" });
        if (submitted) return submitted;
      } catch (err) {
        console.warn("Supabase submitExamApplication error, using disk fallback:", err);
      }
    }
    const student = students.find((s) => s.id === Number(input.studentId));
    if (!student) throw new Error("Student not found");

    const exam = examinations.find((e) => e.id === Number(input.examinationId)) || examinations[0];
    const now = new Date().toISOString();

    // Check if application already exists for this student & exam
    const existingIdx = examApplications.findIndex(
      (a) => a.studentId === student.id && a.examinationId === exam.id
    );

    // Derive branch abbreviation
    let branch = "CSE";
    if (student.course.includes("Information")) branch = "ISE";
    else if (student.course.includes("Electronics")) branch = "ECE";
    else if (student.course.includes("Mechanical")) branch = "MECH";
    else if (student.course.includes("Business")) branch = "MBA";

    if (existingIdx !== -1) {
      const updated: ExamApplication = {
        ...examApplications[existingIdx],
        photoUrl: input.photoUrl ?? examApplications[existingIdx].photoUrl,
        feeReceiptUrl: input.feeReceiptUrl ?? examApplications[existingIdx].feeReceiptUrl,
        subjectsConfirmed: input.subjectsConfirmed,
        subjectIssueNote: input.subjectIssueNote,
        arrears: input.arrears || [],
        stage: "UNDER_ACCOUNTS_REVIEW",
        updatedAt: now,
      };
      examApplications[existingIdx] = updated;
      saveDiskApplications(examApplications);
      return updated;
    }

    const newApp: ExamApplication = {
      id: getNextId("examApplication"),
      applicationNumber: `APP-25-${String(examApplications.length + 1).padStart(3, "0")}`,
      examinationId: exam.id,
      examinationName: exam.name,
      studentId: student.id,
      studentName: student.name,
      usn: student.usn,
      course: student.course,
      department: student.department,
      branch,
      semester: student.semester,
      section: student.section,
      academicYear: student.academicYear,
      photoUrl: input.photoUrl || student.photoUrl,
      feeReceiptUrl: input.feeReceiptUrl || null,
      subjectsConfirmed: input.subjectsConfirmed,
      subjectIssueNote: input.subjectIssueNote,
      arrears: input.arrears || [],
      accountsStatus: {
        collegeFees: "Pending",
        hostelFees: "Pending",
        busFees: "Pending",
        fine: "Pending",
        updatedAt: now,
      },
      principalStatus: {
        status: "Pending",
      },
      stage: "UNDER_ACCOUNTS_REVIEW",
      appliedAt: now,
      updatedAt: now,
    };

    examApplications.unshift(newApp);
    saveDiskApplications(examApplications);
    return newApp;
  },

  async updateAccountsFeeStatus(
    applicationId: number,
    statusUpdate: Partial<AccountsFeeStatus>,
    actorId?: string
  ): Promise<ExamApplication | null> {
    if (supabaseStore.isConfigured()) {
      try {
        const updated = await supabaseStore.updateAccountsFeeStatus(applicationId, statusUpdate, actorId || "accounts-system");
        if (updated) return updated;
      } catch (err) {
        console.warn("Supabase updateAccountsFeeStatus error, using disk fallback:", err);
      }
    }
    const idx = examApplications.findIndex((a) => a.id === applicationId);
    if (idx === -1) return null;

    const app = examApplications[idx];
    const now = new Date().toISOString();

    const mergedStatus: AccountsFeeStatus = {
      ...app.accountsStatus,
      ...statusUpdate,
      updatedAt: now,
    };

    // Determine if all dues are cleared
    const collegeCleared = mergedStatus.collegeFees === "No Due";
    const hostelCleared = mergedStatus.hostelFees === "No Due" || mergedStatus.hostelFees === "N/A";
    const busCleared = mergedStatus.busFees === "No Due" || mergedStatus.busFees === "N/A";
    const fineCleared = mergedStatus.fine === "Paid" || mergedStatus.fine === "N/A";

    const allCleared = collegeCleared && hostelCleared && busCleared && fineCleared;

    let nextStage: ExamApplicationStage = app.stage;
    if (allCleared) {
      nextStage = "ACCOUNTS_CLEARED";
      // Update student record's fee status
      const stu = students.find((s) => s.id === app.studentId);
      if (stu) stu.feeStatus = "Cleared";
    } else {
      nextStage = "UNDER_ACCOUNTS_REVIEW";
      const stu = students.find((s) => s.id === app.studentId);
      if (stu) stu.feeStatus = "Pending";
    }

    const updated: ExamApplication = {
      ...app,
      accountsStatus: mergedStatus,
      stage: nextStage,
      updatedAt: now,
    };

    examApplications[idx] = updated;
    saveDiskApplications(examApplications);
    return updated;
  },

  async updatePrincipalApproval(
    applicationId: number,
    approval: {
      status: "Pending" | "Approved" | "Rejected";
      fineWaived?: boolean;
      fineWaiverNote?: string;
      rejectionReason?: string;
    }, actorId?: string
  ): Promise<ExamApplication | null> {
    if (supabaseStore.isConfigured()) {
      try {
        const updated = await supabaseStore.updatePrincipalApproval(applicationId, approval, actorId || "principal-system");
        if (updated) return updated;
      } catch (err) {
        console.warn("Supabase updatePrincipalApproval error, using disk fallback:", err);
      }
    }
    const idx = examApplications.findIndex((a) => a.id === applicationId);
    if (idx === -1) return null;

    const app = examApplications[idx];
    const now = new Date().toISOString();

    let nextStage: ExamApplicationStage = app.stage;
    if (approval.status === "Approved") {
      nextStage = "PRINCIPAL_APPROVED";
    } else if (approval.status === "Rejected") {
      nextStage = "REJECTED";
    } else {
      nextStage = "ACCOUNTS_CLEARED";
    }

    const updated: ExamApplication = {
      ...app,
      principalStatus: {
        status: approval.status,
        fineWaived: approval.fineWaived ?? app.principalStatus.fineWaived,
        fineWaiverNote: approval.fineWaiverNote ?? app.principalStatus.fineWaiverNote,
        rejectionReason: approval.rejectionReason ?? app.principalStatus.rejectionReason,
        reviewedAt: now,
      },
      stage: nextStage,
      updatedAt: now,
    };

    examApplications[idx] = updated;
    saveDiskApplications(examApplications);
    return updated;
  },

  async issueHallTicketForApplication(
    applicationId: number
  ): Promise<{ success: boolean; hallTicket: HallTicket; application: ExamApplication }> {
    if (supabaseStore.isConfigured()) {
      try {
        const application = await supabaseStore.getApplicationById(applicationId);
        if (application) {
          if (!["ACCOUNTS_CLEARED", "PRINCIPAL_APPROVED", "HALL_TICKET_ISSUED"].includes(application.stage)) {
            throw new Error("Hall ticket cannot be issued until Accounts clearance or an approved exception is recorded.");
          }
          const issued = await this.generateHallTickets(application.examinationId, [application.studentId]);
          const hallTicket = issued.generated[0];
          if (hallTicket) {
            await supabaseStore.linkHallTicket(application.id, hallTicket.id);
            const updated = await supabaseStore.getApplicationById(applicationId);
            if (updated) return { success: true, hallTicket, application: updated };
          }
        }
      } catch (e) {
        console.warn("Supabase issueHallTicketForApplication error, falling back to disk:", e);
      }
    }
    const idx = examApplications.findIndex((a) => a.id === applicationId);
    if (idx === -1) throw new Error("Application not found");

    const app = examApplications[idx];
    const now = new Date().toISOString();

    // Find student and exam
    const student = students.find((s) => s.id === app.studentId);
    const exam = examinations.find((e) => e.id === app.examinationId) || examinations[0];
    if (!student) throw new Error("Student not found");

    // Check if hall ticket already exists
    let ticket = hallTickets.find(
      (t) => t.studentId === student.id && t.examinationId === exam.id
    );

    if (ticket) {
      ticket.qrDataUrl = await generateQrDataUrl(
        `${getAppUrl()}/verify/${ticket.verifyCode}`
      );
    }

    if (!ticket) {
      // Build subjects including any arrears
      const combinedSubjects = [...(exam.subjects || [])];
      for (const arr of app.arrears || []) {
        if (!combinedSubjects.some((s) => s.subjectCode === arr.subjectCode)) {
          combinedSubjects.push({
            subjectCode: arr.subjectCode,
            subjectName: `${arr.subjectName} (Arrear)`,
            examDate: exam.endDate,
            startTime: "14:00",
            endTime: "17:00",
            room: "Hall C-201",
          });
        }
      }

      const verifyCode = `RVHT-25-${student.usn}`;
      const qrDataUrl = await generateQrDataUrl(
        `${getAppUrl()}/verify/${verifyCode}`
      );

      ticket = {
        id: getNextId("hallTicket"),
        number: `HT-25-${String(hallTickets.length + 1).padStart(4, "0")}`,
        studentId: student.id,
        studentName: student.name,
        usn: student.usn,
        course: student.course,
        department: student.department,
        semester: student.semester,
        section: student.section,
        photoUrl: app.photoUrl || student.photoUrl,
        examinationId: exam.id,
        examinationName: exam.name,
        academicYear: exam.academicYear,
        center: exam.center,
        verifyCode,
        qrDataUrl,
        generatedAt: now,
        status: "Valid",
        subjects: combinedSubjects,
      };

      hallTickets.unshift(ticket);
      saveDiskHallTickets(hallTickets);
    }

    const updatedApp: ExamApplication = {
      ...app,
      stage: "HALL_TICKET_ISSUED",
      hallTicketId: ticket.id,
      hallTicketNumber: ticket.number,
      updatedAt: now,
    };

    examApplications[idx] = updatedApp;
    saveDiskApplications(examApplications);
    saveDiskHallTickets(hallTickets);

    return {
      success: true,
      hallTicket: ticket,
      application: updatedApp,
    };
  },
};
