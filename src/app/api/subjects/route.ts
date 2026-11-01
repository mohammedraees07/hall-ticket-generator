import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertRole } from "@/lib/auth/roles";
import { ApiError, handleApiError } from "@/lib/errors/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const semParam = searchParams.get("semester");
    const semester = semParam ? Number(semParam) : undefined;

    const list = await dataStore.getSubjects({ search, semester });
    return NextResponse.json(list);
  } catch (error) {
    console.error("Subjects error:", error);
    return NextResponse.json({ error: "Failed to fetch subjects" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const access = assertRole(auth, ["ADMIN"]);
    if (!access.allowed) throw new ApiError(access.reason || "Forbidden", 403);
    const body = await req.json();
    if (!body.code || !body.name || !body.courseId || !body.departmentId) {
      return NextResponse.json({ error: "Code, name, course, and department are required" }, { status: 400 });
    }
    const sub = await dataStore.createSubject(body);
    return NextResponse.json(sub, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
