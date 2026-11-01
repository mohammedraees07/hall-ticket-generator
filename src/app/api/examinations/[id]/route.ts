import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertRole } from "@/lib/auth/roles";
import { ApiError, handleApiError } from "@/lib/errors/api-error";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const exam = await dataStore.getExaminationById(Number(id));
    if (!exam) {
      return NextResponse.json({ error: "Examination not found" }, { status: 404 });
    }
    return NextResponse.json(exam);
  } catch (error) {
    console.error("Get examination error:", error);
    return NextResponse.json({ error: "Failed to get examination" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(req);
    const access = assertRole(auth, ["ADMIN", "STAFF"]);
    if (!access.allowed) throw new ApiError(access.reason || "Forbidden", 403);
    const { id } = await params;
    const body = await req.json();
    const updated = await dataStore.updateExamination(Number(id), body);
    if (!updated) {
      return NextResponse.json({ error: "Examination not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await getAuthContext(_req);
    const access = assertRole(auth, ["ADMIN", "STAFF"]);
    if (!access.allowed) throw new ApiError(access.reason || "Forbidden", 403);
    const { id } = await params;
    const deleted = await dataStore.deleteExamination(Number(id));
    if (!deleted) {
      return NextResponse.json({ error: "Examination not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleApiError(error);
  }
}
