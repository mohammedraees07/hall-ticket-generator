import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertRole } from "@/lib/auth/roles";
import { handleApiError, ApiError } from "@/lib/errors/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const examinationId = searchParams.get("examinationId");
    const roomName = searchParams.get("roomName");

    if (id) {
      const plan = await dataStore.getSeatingPlanById(Number(id));
      if (!plan) throw new ApiError("Seating plan not found", 404);
      return NextResponse.json(plan);
    }

    const plans = await dataStore.getSeatingPlans({
      examinationId: examinationId ? Number(examinationId) : undefined,
      roomName: roomName || undefined,
    });

    // Also return list of eligible students for allocation helper
    const students = await dataStore.getStudents();
    const settings = await dataStore.getSettings();
    const examinations = await dataStore.getExaminations();

    const eligibleStudents = students.filter(
      (s) => s.attendancePercentage >= settings.minAttendance && s.feeStatus === "Cleared"
    );

    return NextResponse.json({
      plans,
      eligibleStudents,
      examinations,
      settings,
    });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const roleCheck = assertRole(auth, ["ADMIN", "STAFF"]);
    if (!roleCheck.allowed) {
      throw new ApiError(roleCheck.reason || "Forbidden: Only staff and administrators can manage seating plans", 403);
    }

    const body = await req.json();

    if (!body.roomName || !body.benches || !Array.isArray(body.benches)) {
      throw new ApiError("Room name and valid benches array are required", 400);
    }

    const savedPlan = await dataStore.saveSeatingPlan({
      id: body.id ? Number(body.id) : undefined,
      roomName: body.roomName,
      examinationId: Number(body.examinationId) || 1,
      examinationName: body.examinationName || "End Semester Regular Examinations",
      examDate: body.examDate || new Date().toISOString().split("T")[0],
      session: body.session || "09:30 AM – 12:30 PM",
      totalBenches: Number(body.totalBenches) || body.benches.length,
      benchesPerRow: Number(body.benchesPerRow) || 2,
      benches: body.benches,
    });

    return NextResponse.json(savedPlan, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const roleCheck = assertRole(auth, ["ADMIN", "STAFF"]);
    if (!roleCheck.allowed) {
      throw new ApiError(roleCheck.reason || "Forbidden: Only staff and administrators can manage seating plans", 403);
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) throw new ApiError("Plan ID is required", 400);

    const deleted = await dataStore.deleteSeatingPlan(Number(id));
    if (!deleted) throw new ApiError("Seating plan not found", 404);

    return NextResponse.json({ success: true, message: "Seating plan deleted" });
  } catch (error) {
    return handleApiError(error);
  }
}
