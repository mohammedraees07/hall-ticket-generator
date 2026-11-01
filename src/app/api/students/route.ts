import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { studentSchema } from "@/lib/validation/student.schema";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertRole } from "@/lib/auth/roles";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const semParam = searchParams.get("semester");
    const semester = semParam ? Number(semParam) : undefined;
    const department = searchParams.get("department") || undefined;

    const list = await dataStore.getStudents({ search, semester, department });
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
      throw new ApiError(roleCheck.reason || "Unauthorized", 403);
    }

    const body = await req.json();
    const validatedData = studentSchema.parse(body);

    const studentData = {
      studentId: validatedData.studentId,
      usn: validatedData.usn.toUpperCase(),
      name: validatedData.name,
      dob: validatedData.dob,
      gender: validatedData.gender,
      email: validatedData.email,
      phone: validatedData.phone,
      address: validatedData.address || "",
      departmentId: validatedData.departmentId,
      courseId: validatedData.courseId,
      semester: validatedData.semester,
      section: validatedData.section,
      academicYear: validatedData.academicYear,
      photoUrl: validatedData.photoUrl || null,
      attendancePercentage: validatedData.attendancePercentage,
      feeStatus: validatedData.feeStatus,
    };

    const student = await dataStore.createStudent(studentData);
    return NextResponse.json(student, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

