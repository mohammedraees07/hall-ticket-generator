import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { ApiError, handleApiError } from "@/lib/errors/api-error";

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) {
      throw new ApiError("Authentication required.", 401);
    }

    if (auth.role === "STUDENT") {
      let student = null;
      if (auth.studentId) {
        student = await dataStore.getStudentById(auth.studentId);
      }
      if (!student && auth.usn) {
        student = await dataStore.getStudentByUsn(auth.usn);
      }
      if (!student && auth.email) {
        const matches = await dataStore.getStudents({ search: auth.email });
        student = matches.find((s) => s.email.toLowerCase() === auth.email.toLowerCase()) || null;
      }

      const [applications, hallTickets, broadcasts, settings] = await Promise.all([
        student ? dataStore.getApplications({ studentId: student.id }) : Promise.resolve([]),
        student ? dataStore.getHallTicketsByStudentId(student.id) : Promise.resolve([]),
        dataStore.getBroadcasts(student?.semester),
        dataStore.getSettings(),
      ]);

      let seatingPlans: any[] = [];
      if (student) {
        const allPlans = await dataStore.getSeatingPlans();
        // Return only plans where this student is seated
        seatingPlans = allPlans.filter((p) =>
          p.benches.some((b) => b.leftSeat.usn === student.usn || b.rightSeat.usn === student.usn)
        );
      }

      return NextResponse.json({
        user: auth,
        student,
        applications,
        hallTickets,
        broadcasts,
        seatingPlans,
        settings,
      });
    }

    return NextResponse.json({
      user: auth,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
