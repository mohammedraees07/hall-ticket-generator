import { NextRequest, NextResponse } from "next/server";
import { dataStore, type ExamSubject } from "@/lib/data-store";
import { examinationSchema } from "@/lib/validation/exam.schema";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertRole } from "@/lib/auth/roles";

export async function GET() {
  try {
    const list = await dataStore.getExaminations();
    return NextResponse.json(list);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const roleCheck = assertRole(auth, ["ADMIN", "STAFF"]);
    if (!roleCheck.allowed) {
      throw new ApiError(roleCheck.reason || "Forbidden: Only examination administrators can create examination windows", 403);
    }

    const body = await req.json();
    const validated = examinationSchema.parse(body);
    const exam = await dataStore.createExamination({
      name: validated.name,
      examType: validated.examType,
      semester: validated.semester,
      academicYear: validated.academicYear,
      startDate: validated.startDate,
      endDate: validated.endDate,
      center: validated.center,
      session: validated.session,
      description: validated.description,
      status: validated.status,
      subjects: (validated.subjects || []) as ExamSubject[],
    });
    return NextResponse.json(exam, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
