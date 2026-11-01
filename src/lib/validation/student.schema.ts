import { z } from "zod";

export const studentSchema = z.object({
  studentId: z
    .string()
    .min(3, "Student ID must be at least 3 characters")
    .max(50, "Student ID must not exceed 50 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Student ID can only contain alphanumeric characters, hyphens, and underscores"),
  usn: z
    .string()
    .min(5, "USN must be at least 5 characters")
    .max(20, "USN must not exceed 20 characters"),
  name: z
    .string()
    .min(2, "Candidate name must be at least 2 characters")
    .max(150, "Candidate name must not exceed 150 characters"),
  dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}/, "Date of Birth must be in YYYY-MM-DD format"),
  gender: z.enum(["Female", "Male", "Other"]).default("Female"),
  email: z.string().email("Invalid institutional email address"),
  phone: z
    .string()
    .min(8, "Phone number must be at least 8 digits")
    .max(20, "Phone number is too long"),
  address: z.string().optional().default(""),
  departmentId: z.coerce.number().int().positive("Valid Department is required"),
  courseId: z.coerce.number().int().positive("Valid Course is required"),
  semester: z.coerce.number().int().min(1).max(10, "Semester must be between 1 and 10"),
  section: z.string().min(1).max(5).toUpperCase().default("A"),
  academicYear: z.string().default("2024-25"),
  photoUrl: z.string().nullable().optional().default(null),
  attendancePercentage: z.coerce
    .number()
    .min(0, "Attendance cannot be negative")
    .max(100, "Attendance cannot exceed 100%"),
  feeStatus: z.enum(["Cleared", "Pending"]).default("Cleared"),
});

export const studentUpdateSchema = studentSchema.partial();
export type StudentInput = z.infer<typeof studentSchema>;
