import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { generateHallTicketsSchema } from "@/lib/validation/hall-ticket.schema";
import { handleApiError, ApiError } from "@/lib/errors/api-error";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertResourceAccess, assertRole } from "@/lib/auth/roles";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentIdParam = searchParams.get("studentId");

    const auth = await getAuthContext(req);

    if (studentIdParam) {
      const studentId = Number(studentIdParam);
      // IDOR Protection: candidate can only access their own hall tickets
      const access = assertResourceAccess(auth, studentId);
      if (!access.allowed) {
        throw new ApiError(access.reason || "Forbidden", 403);
      }

      const tickets = await dataStore.getHallTicketsByStudentId(studentId);
      return NextResponse.json(tickets);
    }

    // Listing all tickets requires staff/admin role if authenticated
    const roleCheck = assertRole(auth, ["ADMIN", "STAFF"]);
    if (!roleCheck.allowed) {
      throw new ApiError(roleCheck.reason || "Forbidden: Only examination staff can view the full register", 403);
    }

    const list = await dataStore.getHallTickets();
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
      throw new ApiError(roleCheck.reason || "Forbidden: Only examination authorities can issue admit cards", 403);
    }

    const body = await req.json();
    const validated = generateHallTicketsSchema.parse(body);

    const result = await dataStore.generateHallTickets(
      validated.examinationId,
      validated.studentIds,
      validated.overrideEligibility
    );

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
