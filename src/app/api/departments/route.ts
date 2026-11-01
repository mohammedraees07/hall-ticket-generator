import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertRole } from "@/lib/auth/roles";
import { ApiError, handleApiError } from "@/lib/errors/api-error";

export async function GET() {
  try {
    const list = await dataStore.getDepartments();
    return NextResponse.json(list);
  } catch (error) {
    console.error("Departments error:", error);
    return NextResponse.json({ error: "Failed to fetch departments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const access = assertRole(auth, ["ADMIN"]);
    if (!access.allowed) throw new ApiError(access.reason || "Forbidden", 403);
    const body = await req.json();
    if (!body.name || !body.code) {
      return NextResponse.json({ error: "Name and code are required" }, { status: 400 });
    }
    const dept = await dataStore.createDepartment(body);
    return NextResponse.json(dept, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
