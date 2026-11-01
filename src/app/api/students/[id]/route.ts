import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { studentUpdateSchema } from "@/lib/validation/student.schema";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertResourceAccess, assertRole } from "@/lib/auth/roles";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = Number(id);

    const auth = await getAuthContext(req);
    const access = assertResourceAccess(auth, studentId);
    if (!access.allowed) {
      throw new ApiError(access.reason || "Forbidden", 403);
    }

    const student = await dataStore.getStudentById(studentId);
    if (!student) {
      throw new ApiError("Candidate record not found", 404);
    }

    return NextResponse.json(student);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = Number(id);

    const auth = await getAuthContext(req);
    const roleCheck = assertRole(auth, ["ADMIN", "STAFF"]);
    if (!roleCheck.allowed) {
      throw new ApiError(roleCheck.reason || "Forbidden", 403);
    }

    const body = await req.json();
    const validatedUpdates = studentUpdateSchema.parse(body);

    const updated = await dataStore.updateStudent(studentId, validatedUpdates);
    if (!updated) {
      throw new ApiError("Student not found", 404);
    }

    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const studentId = Number(id);

    const auth = await getAuthContext(req);
    const roleCheck = assertRole(auth, ["ADMIN"]);
    if (!roleCheck.allowed) {
      throw new ApiError(roleCheck.reason || "Forbidden: Only administrators can delete records", 403);
    }

    const deleted = await dataStore.deleteStudent(studentId);
    if (!deleted) {
      throw new ApiError("Student not found", 404);
    }

    return NextResponse.json({ success: true, message: "Record deleted successfully" });
  } catch (error) {
    return handleApiError(error);
  }
}
