import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { handleApiError, ApiError } from "@/lib/errors/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const usn = searchParams.get("usn")?.trim();
    const dateParam = searchParams.get("date")?.trim();

    if (!usn) {
      throw new ApiError("Registration Number / USN is required", 400);
    }

    const cleanUsn = usn.toUpperCase();
    const student = await dataStore.getStudentByUsn(cleanUsn);

    if (!student) {
      return NextResponse.json({
        found: false,
        message: `No candidate found matching registration number "${cleanUsn}".`,
      });
    }

    const settings = await dataStore.getSettings();
    const isFeeCleared = student.feeStatus === "Cleared";
    const isAttendanceEligible = student.attendancePercentage >= settings.minAttendance;
    const isCompliant = isFeeCleared && isAttendanceEligible;

    // Determine target check date (default to today or fallback to first subject's date if requested)
    const todayStr = dateParam || new Date().toISOString().split("T")[0];

    // Find student's hall tickets
    const hallTickets = await dataStore.getHallTicketsByStudentId(student.id);
    const activeTicket = hallTickets[0] || null;

    // Subjects list from hall ticket or semester examinations
    let candidateSubjects = activeTicket?.subjects || [];
    if (candidateSubjects.length === 0) {
      const exams = await dataStore.getExaminations();
      const semExam = exams.find((e) => e.semester === student.semester) || exams[0];
      if (semExam) {
        candidateSubjects = semExam.subjects;
      }
    }

    // Look for subject scheduled on check date
    const todaySubject = candidateSubjects.find(
      (sub) => sub.examDate === todayStr
    ) || null;

    // Find next upcoming exam if not today
    const upcomingSubjects = candidateSubjects
      .filter((sub) => sub.examDate >= todayStr && sub.examDate !== todayStr)
      .sort((a, b) => a.examDate.localeCompare(b.examDate));
    const nextExam = upcomingSubjects[0] || null;

    // Check seating plan allocation for bench info
    const seatingPlans = await dataStore.getSeatingPlans();
    let seatAllocation: {
      roomName: string;
      benchCode: string;
      position: "Left Seat" | "Right Seat";
    } | null = null;

    for (const plan of seatingPlans) {
      for (const bench of plan.benches) {
        if (bench.leftSeat?.usn?.toUpperCase() === cleanUsn) {
          seatAllocation = {
            roomName: plan.roomName,
            benchCode: bench.benchCode,
            position: "Left Seat",
          };
          break;
        }
        if (bench.rightSeat?.usn?.toUpperCase() === cleanUsn) {
          seatAllocation = {
            roomName: plan.roomName,
            benchCode: bench.benchCode,
            position: "Right Seat",
          };
          break;
        }
      }
      if (seatAllocation) break;
    }

    // Determine Entry Clearance
    let entryPermitted = false;
    let gateStatus: "PERMITTED" | "NO_EXAM_TODAY" | "BARRED_FEES" | "BARRED_ATTENDANCE" | "NO_TICKET";
    let gatePassMessage = "";

    if (!isFeeCleared) {
      gateStatus = "BARRED_FEES";
      gatePassMessage = "ENTRY DENIED: Semester tuition fee dues are pending. Clearance from Accounts Office required.";
    } else if (!isAttendanceEligible) {
      gateStatus = "BARRED_ATTENDANCE";
      gatePassMessage = `ENTRY DENIED: Attendance shortage (${student.attendancePercentage}% < ${settings.minAttendance}% minimum threshold).`;
    } else if (todaySubject) {
      entryPermitted = true;
      gateStatus = "PERMITTED";
      gatePassMessage = `ENTRY AUTHORIZED: Candidate is scheduled for ${todaySubject.subjectCode} (${todaySubject.subjectName}) today from ${todaySubject.startTime} to ${todaySubject.endTime}.`;
    } else {
      gateStatus = "NO_EXAM_TODAY";
      gatePassMessage = `NO EXAM TODAY: Candidate has no examination scheduled for ${todayStr}.`;
    }

    return NextResponse.json({
      found: true,
      checkDate: todayStr,
      student: {
        id: student.id,
        name: student.name,
        usn: student.usn,
        department: student.department,
        course: student.course,
        semester: student.semester,
        section: student.section,
        photoUrl: student.photoUrl,
        attendancePercentage: student.attendancePercentage,
        feeStatus: student.feeStatus,
        isCompliant,
      },
      hasExamToday: Boolean(todaySubject),
      entryPermitted,
      gateStatus,
      gatePassMessage,
      todaySubject: todaySubject
        ? {
            ...todaySubject,
            allocatedRoom: seatAllocation?.roomName || todaySubject.room,
            allocatedBench: seatAllocation ? `${seatAllocation.benchCode} (${seatAllocation.position})` : "Unassigned Desk",
          }
        : null,
      nextExam,
      hallTicket: activeTicket
        ? {
            number: activeTicket.number,
            verifyCode: activeTicket.verifyCode,
            status: activeTicket.status,
          }
        : null,
      allSubjects: candidateSubjects,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
