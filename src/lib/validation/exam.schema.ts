import { z } from "zod";

export const examSubjectSchema = z.object({
  subjectCode: z.string().min(2, "Subject code is required"),
  subjectName: z.string().min(2, "Subject name is required"),
  examDate: z.string().min(5, "Exam date is required"),
  startTime: z.string().min(2, "Start time is required"),
  endTime: z.string().min(2, "End time is required"),
  room: z.string().min(1, "Room/Hall number is required"),
});

export const examinationSchema = z.object({
  name: z.string().min(3, "Examination name must be at least 3 characters"),
  examType: z.string().min(2, "Exam type is required"),
  semester: z.coerce.number().int().min(1).max(10),
  academicYear: z.string().default("2024-25"),
  startDate: z.string().min(5, "Start date is required"),
  endDate: z.string().min(5, "End date is required"),
  center: z.string().min(2, "Examination center is required"),
  session: z.string().default("Morning & Afternoon Sessions"),
  description: z.string().default(""),
  status: z.enum(["Draft", "Published"]).default("Draft"),
  subjects: z.array(examSubjectSchema).default([]),
});

export type ExaminationInput = z.infer<typeof examinationSchema>;
