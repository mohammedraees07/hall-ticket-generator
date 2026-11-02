import { NextRequest, NextResponse } from "next/server";
import { dataStore, ExamSubject } from "@/lib/data-store";
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

    // Determine target check date (default to India Standard Time / college local date)
    const istToday = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
    const utcToday = new Date().toISOString().split("T")[0];
    const todayStr = dateParam || istToday || utcToday;

    // Find student's hall tickets
    const hallTickets = await dataStore.getHallTicketsByStudentId(student.id);
    const activeTicket = hallTickets[0] || null;

    // Retrieve active examination schedule
    const exams = await dataStore.getExaminations();
    const activeExam =
      (activeTicket?.examinationId ? exams.find((e) => e.id === activeTicket.examinationId) : null) ||
      exams.find((e) => e.semester === student.semester && e.status === "Published") ||
      exams.find((e) => e.semester === student.semester) ||
      exams[0];

    // Subjects list: Synchronize with live active examination timetable
    let candidateSubjects: ExamSubject[] = [];
    if (activeExam?.subjects && activeExam.subjects.length > 0) {
      candidateSubjects = [...activeExam.subjects];
      // If ticket has additional subjects (e.g. Arrears / Backlogs) not in the main exam, merge them
      if (activeTicket?.subjects) {
        for (const tSub of activeTicket.subjects) {
          if (!candidateSubjects.some((s) => s.subjectCode.toUpperCase() === tSub.subjectCode.toUpperCase())) {
            candidateSubjects.push(tSub);
          }
        }
      }
    } else if (activeTicket?.subjects && activeTicket.subjects.length > 0) {
      candidateSubjects = [...activeTicket.subjects];
    }

    // Look for subject scheduled on check date
    const todaySubject = candidateSubjects.find(
      (sub) => sub.examDate === todayStr || (dateParam ? sub.examDate === dateParam : false)
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

    // Determine allocated room & bench
    const allocatedHall = seatAllocation?.roomName || todaySubject?.room || candidateSubjects[0]?.room || activeTicket?.center || "Hall C-201";
    const allocatedBench = seatAllocation ? `${seatAllocation.benchCode} (${seatAllocation.position})` : (todaySubject ? "General Desk" : "Unassigned Desk");

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
      allocatedHall,
      allocatedBench,
      seatAllocation: seatAllocation
        ? {
            roomName: seatAllocation.roomName,
            benchCode: seatAllocation.benchCode,
            position: seatAllocation.position,
            allocatedBench,
          }
        : null,
      todaySubject: todaySubject
        ? {
            ...todaySubject,
            allocatedRoom: seatAllocation?.roomName || todaySubject.room || allocatedHall,
            allocatedBench,
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
