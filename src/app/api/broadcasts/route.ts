import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertRole } from "@/lib/auth/roles";
import { ApiError, handleApiError } from "@/lib/errors/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const semester = searchParams.get("semester");
    const list = await dataStore.getBroadcasts(semester ? Number(semester) : undefined);
    return NextResponse.json(list);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to load broadcasts" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const access = assertRole(auth, ["ADMIN", "STAFF"]);
    if (!access.allowed) throw new ApiError(access.reason || "Forbidden", 403);
    const body = await req.json();
    if (!body.semester || !body.deadline || !body.title) {
      return NextResponse.json(
        { error: "Semester, title, and deadline are required." },
        { status: 400 }
      );
    }

    const examinations = await dataStore.getExaminations();
    const examId = body.examinationId
      ? Number(body.examinationId)
      : examinations.find((e) => e.semester === Number(body.semester))?.id || examinations[0]?.id || 1;
    const exam = examinations.find((e) => e.id === examId);
    const academicYear =
      body.academicYear || exam?.academicYear || `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`;

    const created = await dataStore.createBroadcast({
      examinationId: examId,
      semester: Number(body.semester),
      title: body.title,
      description: body.description,
      deadline: body.deadline,
      academicYear,
      courseId: body.courseId ? Number(body.courseId) : undefined,
      actorId: auth?.id || "admin-system",
    });

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const access = assertRole(auth, ["ADMIN", "STAFF"]);
    if (!access.allowed) throw new ApiError(access.reason || "Forbidden", 403);
    const body = await req.json();
    const id = Number(body.id);
    const isOpen = Boolean(body.isOpen);

    const updated = await dataStore.toggleBroadcast(id, isOpen);
    if (!updated) {
      return NextResponse.json({ error: "Broadcast not found" }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return handleApiError(err);
  }
}
