import { z } from "zod";

export const generateHallTicketsSchema = z.object({
  examinationId: z.coerce.number().int().positive("Valid Examination ID is required"),
  studentIds: z.array(z.coerce.number().int().positive()).min(1, "At least one student must be selected"),
  overrideEligibility: z.boolean().optional().default(false),
});

export const verifyTicketSchema = z.object({
  code: z
    .string()
    .min(3, "Verification code or ticket number must be at least 3 characters")
    .max(100, "Verification code is too long"),
});

export type GenerateHallTicketsInput = z.infer<typeof generateHallTicketsSchema>;
export type VerifyTicketInput = z.infer<typeof verifyTicketSchema>;
