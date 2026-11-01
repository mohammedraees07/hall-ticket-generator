import { z } from "zod";

export const collegeSettingsSchema = z.object({
  collegeName: z
    .string()
    .min(3, "Institution name must be at least 3 characters")
    .max(200, "Institution name is too long"),
  collegeCode: z
    .string()
    .min(2, "College/Center code must be at least 2 characters")
    .max(50, "College/Center code is too long"),
  email: z.string().email("Valid institutional examination email is required"),
  phone: z.string().min(5, "Helpline phone number is required"),
  controllerName: z.string().min(2, "Controller of Examinations name is required"),
  principalName: z.string().optional().default("Dr. Ramis M.K, Principal"),
  principalSignatureUrl: z.string().optional().default(""),
  principalSignatureMode: z.enum(["scribble", "upload", "typed"]).optional().default("scribble"),
  principalTypedSignature: z.string().optional().default("Dr. Ramis M.K"),
  registrarName: z.string().optional().default("Dr. B. E. Rangaswamy, Registrar (Evaluation)"),
  registrarSignatureUrl: z.string().optional().default(""),
  registrarSignatureMode: z.enum(["scribble", "upload", "typed"]).optional().default("typed"),
  registrarTypedSignature: z.string().optional().default("B. E. Rangaswamy"),
  minAttendance: z.coerce
    .number()
    .min(50, "Minimum attendance threshold must be at least 50%")
    .max(100, "Minimum attendance cannot exceed 100%"),
});

export type CollegeSettingsInput = z.infer<typeof collegeSettingsSchema>;
