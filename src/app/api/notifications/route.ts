import { NextRequest, NextResponse } from "next/server";
import { dataStore } from "@/lib/data-store";
import { getAuthContext } from "@/lib/auth/supabase-server";

export interface AppNotification {
  id: string;
  type: "broadcast" | "fee_pending" | "principal_pending" | "ticket_ready" | "application_status";
  title: string;
  message: string;
  timestamp: string;
  link: string;
  unread: boolean;
  priority: "low" | "medium" | "high";
  actionLabel?: string;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthContext(req);
    const notifications: AppNotification[] = [];

    const [broadcasts, applications] = await Promise.all([
      dataStore.getBroadcasts(),
      dataStore.getApplications(),
    ]);

    const activeBroadcasts = broadcasts.filter((b) => b.isOpen);

    if (auth?.role === "ACCOUNTS" || auth?.role === "ADMIN") {
      // 1. Broadcast notifications for Accounts
      for (const b of activeBroadcasts) {
        notifications.push({
          id: `broad-acc-${b.id}`,
          type: "broadcast",
          title: `Broadcast Window Open · Semester ${b.semester}`,
          message: `Application window is open. Verify fee dues and clear candidates before deadline: ${b.deadline}.`,
          timestamp: b.announcedAt,
          link: "/accounts",
          unread: true,
          priority: "high",
          actionLabel: "Verify Accounts",
        });
      }

      // 2. Pending student fee reviews
      const pendingFees = applications.filter(
        (app) => app.accountsStatus.collegeFees === "Pending" || app.stage === "UNDER_ACCOUNTS_REVIEW"
      );

      if (pendingFees.length > 0) {
        notifications.push({
          id: `fee-pending-${pendingFees.length}`,
          type: "fee_pending",
          title: `${pendingFees.length} Fee Clearance(s) Pending`,
          message: `${pendingFees.length} student application(s) require tuition/hostel fee review for examination clearance.`,
          timestamp: pendingFees[0]?.appliedAt || new Date().toISOString(),
          link: "/accounts",
          unread: true,
          priority: "high",
          actionLabel: "Review Fees",
        });
      }
    }

    if (auth?.role === "PRINCIPAL" || auth?.role === "ADMIN") {
      // 1. Broadcast notification for Principal
      for (const b of activeBroadcasts) {
        notifications.push({
          id: `broad-prin-${b.id}`,
          type: "broadcast",
          title: `Exam Session Broadcast · Semester ${b.semester}`,
          message: `${b.title}. Endorse candidate approvals once Accounts Section completes fee verification.`,
          timestamp: b.announcedAt,
          link: "/principal",
          unread: true,
          priority: "medium",
          actionLabel: "View Approvals",
        });
      }

      // 2. Pending Principal approvals
      const pendingPrincipal = applications.filter(
        (app) => app.principalStatus.status === "Pending"
      );

      if (pendingPrincipal.length > 0) {
        notifications.push({
          id: `prin-pending-${pendingPrincipal.length}`,
          type: "principal_pending",
          title: `${pendingPrincipal.length} Endorsement(s) Awaiting Review`,
          message: `${pendingPrincipal.length} candidate(s) awaiting Principal clearance, attendance condonation, or fine waiver.`,
          timestamp: pendingPrincipal[0]?.appliedAt || new Date().toISOString(),
          link: "/principal",
          unread: true,
          priority: "high",
          actionLabel: "Review Endorsements",
        });
      }
    }

    if (auth?.role === "STUDENT") {
      let myStudent = null;
      if (auth.studentId) myStudent = await dataStore.getStudentById(auth.studentId);
      if (!myStudent && auth.usn) myStudent = await dataStore.getStudentByUsn(auth.usn);

      // Student active broadcast notification
      const myBroadcast = myStudent
        ? activeBroadcasts.find((b) => b.semester === myStudent?.semester)
        : activeBroadcasts[0];

      if (myBroadcast) {
        notifications.push({
          id: `broad-stu-${myBroadcast.id}`,
          type: "broadcast",
          title: `📢 ${myBroadcast.title}`,
          message: `Hall ticket application is open for Semester ${myBroadcast.semester}. Deadline: ${myBroadcast.deadline}.`,
          timestamp: myBroadcast.announcedAt,
          link: "/student-portal",
          unread: true,
          priority: "high",
          actionLabel: "Apply Now",
        });
      }

      // Student application progress notification
      if (myStudent) {
        const myApps = applications.filter((a) => a.studentId === myStudent.id);
        if (myApps.length > 0) {
          const app = myApps[0];
          if (app.stage === "HALL_TICKET_ISSUED") {
            notifications.push({
              id: `ticket-ready-${app.id}`,
              type: "ticket_ready",
              title: `🎉 Official Admit Card Issued`,
              message: `Your hall ticket (${app.hallTicketNumber || "Issued"}) is officially signed and ready to print with dynamic QR code.`,
              timestamp: app.updatedAt,
              link: "/student-portal",
              unread: true,
              priority: "high",
              actionLabel: "Download Admit Card",
            });
          } else if (app.stage === "PRINCIPAL_APPROVED") {
            notifications.push({
              id: `app-prin-appr-${app.id}`,
              type: "application_status",
              title: `Principal Endorsement Granted`,
              message: `Your application has been approved by the Principal. Examination Cell is issuing your hall ticket.`,
              timestamp: app.updatedAt,
              link: "/student-portal",
              unread: false,
              priority: "medium",
            });
          } else if (app.stage === "ACCOUNTS_CLEARED") {
            notifications.push({
              id: `app-acc-clr-${app.id}`,
              type: "application_status",
              title: `Fees Cleared by Accounts`,
              message: `Your fee status has been verified and cleared by the Accounts Section.`,
              timestamp: app.updatedAt,
              link: "/student-portal",
              unread: false,
              priority: "medium",
            });
          } else {
            notifications.push({
              id: `app-sub-${app.id}`,
              type: "application_status",
              title: `Application Submitted (${app.applicationNumber})`,
              message: `Your application is currently under review with the Accounts Section.`,
              timestamp: app.appliedAt,
              link: "/student-portal",
              unread: false,
              priority: "low",
            });
          }
        }
      }
    }

    if (auth?.role === "ADMIN" || auth?.role === "STAFF") {
      const readyToIssue = applications.filter(
        (app) => app.stage === "ACCOUNTS_CLEARED" || app.stage === "PRINCIPAL_APPROVED"
      );

      if (readyToIssue.length > 0) {
        notifications.push({
          id: `ready-issue-${readyToIssue.length}`,
          type: "ticket_ready",
          title: `${readyToIssue.length} Hall Ticket(s) Ready to Issue`,
          message: `Cleared candidate applications ready for official admit card issuance.`,
          timestamp: new Date().toISOString(),
          link: "/hall-tickets",
          unread: true,
          priority: "high",
          actionLabel: "Issue Tickets",
        });
      }
    }

    return NextResponse.json({
      notifications,
      unreadCount: notifications.filter((n) => n.unread).length,
    });
  } catch (err: any) {
    return NextResponse.json(
      { notifications: [], unreadCount: 0, error: err.message },
      { status: 500 }
    );
  }
}
