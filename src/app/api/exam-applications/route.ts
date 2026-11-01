import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { getAuthContext } from "@/lib/auth/supabase-server";
import { assertResourceAccess, assertRole } from "@/lib/auth/roles";
import { ApiError, handleApiError } from "@/lib/errors/api-error";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const semester = searchParams.get("semester");
    const branch = searchParams.get("branch");
    const studentId = searchParams.get("studentId");
    const usn = searchParams.get("usn");
    const stage = searchParams.get("stage");

    const auth = await getAuthContext(req);
    if (!auth) throw new ApiError("Authentication is required.", 401);
    if (auth.role === "STUDENT") {
      if (!auth.studentId) throw new ApiError("Student account is not linked to a candidate record.", 403);
      if (studentId && Number(studentId) !== auth.studentId) throw new ApiError("Candidates may only view their own application.", 403);
    } else {
      const access = assertRole(auth, ["ADMIN", "STAFF", "ACCOUNTS", "PRINCIPAL"]);
      if (!access.allowed) throw new ApiError(access.reason || "Forbidden", 403);
    }
    const applications = await dataStore.getApplications({
      semester: semester ? Number(semester) : undefined,
      branch: branch || undefined,
      studentId: auth.role === "STUDENT" ? auth.studentId : studentId ? Number(studentId) : undefined,
      usn: usn || undefined,
      stage: stage || undefined,
    });

    return NextResponse.json(applications);
  } catch (err) {
    return handleApiError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) throw new ApiError("Authentication is required.", 401);
    const body = await req.json();
    if (!body.studentId) {
      return NextResponse.json({ error: "studentId is required" }, { status: 400 });
    }
    if (!body.examinationId) {
      return NextResponse.json({ error: "examinationId is required" }, { status: 400 });
    }
    const access = assertResourceAccess(auth, Number(body.studentId));
    if (!access.allowed) throw new ApiError(access.reason || "Forbidden", 403);
    if (auth.role !== "STUDENT" && !assertRole(auth, ["ADMIN", "STAFF"]).allowed) {
      throw new ApiError("Only the candidate or Examination Staff can submit an application.", 403);
    }

    const application = await dataStore.submitExamApplication({
      studentId: Number(body.studentId),
      examinationId: Number(body.examinationId),
      photoUrl: body.photoUrl,
      feeReceiptUrl: body.feeReceiptUrl,
      subjectsConfirmed: Boolean(body.subjectsConfirmed),
      subjectIssueNote: body.subjectIssueNote,
      arrears: Array.isArray(body.arrears) ? body.arrears : [],
      actorId: auth.id,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    return handleApiError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    if (!auth) throw new ApiError("Authentication is required.", 401);
    const body = await req.json();
    const { action, applicationId } = body;

    if (!applicationId) {
      return NextResponse.json({ error: "applicationId is required" }, { status: 400 });
    }

    if (action === "updateFee") {
      const access = assertRole(auth, ["ACCOUNTS"]);
      if (!access.allowed) throw new ApiError(access.reason || "Only Accounts can record fee clearance.", 403);
      const updated = await dataStore.updateAccountsFeeStatus(Number(applicationId), body.status, auth.id);
      if (!updated) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    if (action === "principalApproval") {
      const access = assertRole(auth, ["PRINCIPAL"]);
      if (!access.allowed) throw new ApiError(access.reason || "Only the Principal can decide an exception.", 403);
      const updated = await dataStore.updatePrincipalApproval(Number(applicationId), {
        status: body.status,
        fineWaived: body.fineWaived,
        fineWaiverNote: body.fineWaiverNote,
        rejectionReason: body.rejectionReason,
      }, auth.id);
      if (!updated) {
        return NextResponse.json({ error: "Application not found" }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    if (action === "issueTicket") {
      const access = assertRole(auth, ["ADMIN", "STAFF"]);
      if (!access.allowed) throw new ApiError(access.reason || "Only Examination Staff can issue a hall ticket.", 403);
      const res = await dataStore.issueHallTicketForApplication(Number(applicationId));
      return NextResponse.json(res);
    }

    return NextResponse.json({ error: `Unknown action '${action}'` }, { status: 400 });
  } catch (err) {
    return handleApiError(err);
  }
}
