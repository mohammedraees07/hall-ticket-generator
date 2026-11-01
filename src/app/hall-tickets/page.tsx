"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { HallTicketDocument } from "@/components/hall-ticket-document";
import {
  type HallTicket,
  type Examination,
  type ExamApplication,
  type CollegeSettings,
} from "@/lib/data-store";
import {
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Search,
  Sparkles,
  User,
  Eye,
  FileCheck2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  CreditCard,
  Building,
  Bus,
  AlertCircle,
} from "lucide-react";

export default function HallTicketsPage() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [applications, setApplications] = useState<ExamApplication[]>([]);
  const [tickets, setTickets] = useState<HallTicket[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSemester, setSelectedSemester] = useState<string>("4");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [search, setSearch] = useState("");

  // Modals
  const [detailModalApp, setDetailModalApp] = useState<ExamApplication | null>(null);
  const [previewTicket, setPreviewTicket] = useState<HallTicket | null>(null);
  const [issuingAppId, setIssuingAppId] = useState<number | null>(null);
  const [issuedSuccessAppId, setIssuedSuccessAppId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [examRes, appRes, tickRes, setRes] = await Promise.all([
        fetch("/api/examinations"),
        fetch("/api/exam-applications"),
        fetch("/api/hall-tickets"),
        fetch("/api/settings"),
      ]);

      if (examRes.ok) setExaminations(await examRes.json());
      if (appRes.ok) setApplications(await appRes.json());
      if (tickRes.ok) setTickets(await tickRes.json());
      if (setRes.ok) setSettings(await setRes.json());
    } catch (err) {
      console.error("Failed to load hall tickets data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleGenerateClick = (app: ExamApplication) => {
    // If ticket already exists in tickets array, load it
    const existing = tickets.find(
      (t) => t.studentId === app.studentId && t.examinationId === app.examinationId
    );

    if (existing) {
      setPreviewTicket(existing);
      setIssuingAppId(app.id);
    } else {
      // Build on-the-fly preview ticket
      const exam = examinations.find((e) => e.id === app.examinationId) || examinations[0];
      const combinedSubjects = [...(exam?.subjects || [])];
      for (const arr of app.arrears || []) {
        if (!combinedSubjects.some((s) => s.subjectCode === arr.subjectCode)) {
          combinedSubjects.push({
            subjectCode: arr.subjectCode,
            subjectName: `${arr.subjectName} (Arrear)`,
            examDate: exam?.endDate || new Date(Date.now() + 10 * 86400000).toISOString().split("T")[0],
            startTime: "14:00",
            endTime: "17:00",
            room: "Hall C-201",
          });
        }
      }

      const curYearSuffix = new Date().getFullYear().toString().slice(-2);
      const tempTicket: HallTicket = {
        id: app.hallTicketId || 999,
        number: app.hallTicketNumber || `HT-${curYearSuffix}-${String(app.id).padStart(4, "0")}`,
        studentId: app.studentId,
        studentName: app.studentName,
        usn: app.usn,
        course: app.course,
        department: app.department,
        semester: app.semester,
        section: app.section,
        photoUrl: app.photoUrl,
        examinationId: app.examinationId,
        examinationName: app.examinationName,
        academicYear: app.academicYear || `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
        center: "Block C · Examination Complex",
        verifyCode: `PACE-${curYearSuffix}-${app.usn}`,
        status: "Valid",
        subjects: combinedSubjects,
        generatedAt: new Date().toISOString(),
      };

      setPreviewTicket(tempTicket);
      setIssuingAppId(app.id);
    }
  };

  const handleIssueHallTicket = async () => {
    if (!issuingAppId) return;

    try {
      const res = await fetch("/api/exam-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "issueTicket",
          applicationId: issuingAppId,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setIssuedSuccessAppId(issuingAppId);
        if (data.hallTicket) {
          setPreviewTicket(data.hallTicket);
        }
        await loadData();
        setTimeout(() => setIssuedSuccessAppId(null), 3000);
      }
    } catch (err) {
      console.error("Issue ticket error:", err);
    }
  };

  // Filtered applications
  const filteredCandidates = applications.filter((app) => {
    const matchSem =
      selectedSemester === "ALL" || String(app.semester) === selectedSemester;
    const matchBranch =
      selectedBranch === "ALL" ||
      app.branch.toUpperCase() === selectedBranch.toUpperCase();
    const matchSearch =
      !search ||
      app.studentName.toLowerCase().includes(search.toLowerCase()) ||
      app.usn.toLowerCase().includes(search.toLowerCase());

    return matchSem && matchBranch && matchSearch;
  });

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["ADMIN", "STAFF"]}>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2229] pb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">
                  Examination Administration
                </span>
                <span className="text-neutral-600">/</span>
                <Badge variant="neutral">{filteredCandidates.length} Student Cards</Badge>
              </div>
              <h2 className="text-2xl font-bold tracking-tight text-white">
                Hall Ticket Generation & Issuance
              </h2>
              <p className="text-xs text-[#8d929d] mt-1">
                View submitted candidate application particulars, verify Principal approval, preview authentic admit cards, and officially issue tickets.
              </p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-[5px] border border-[#23262d] bg-[#131519] grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] uppercase font-bold text-[#717684] block mb-1">
                Semester
              </label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono"
              >
                <option value="ALL">All Semesters</option>
                <option value="4">4th Semester</option>
                <option value="3">3rd Semester</option>
                <option value="2">2nd Semester</option>
                <option value="1">1st Semester</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-[#717684] block mb-1">
                Branch / Department
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono"
              >
                <option value="ALL">All Branches</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ISE">Information Science (ISE)</option>
                <option value="ECE">Electronics (ECE)</option>
                <option value="MECH">Mechanical (MECH)</option>
                <option value="MBA">Management (MBA)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] uppercase font-bold text-[#717684] block mb-1">
                Search USN or Name
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-[#6f7584]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="USN or Student Name..."
                  className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] pl-9 pr-3 text-xs text-white outline-none focus:border-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Student Cards Grid */}
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400 font-mono animate-pulse">
              Loading student examination records...
            </div>
          ) : filteredCandidates.length === 0 ? (
            <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-8 text-center">
              <AlertCircle size={28} className="text-neutral-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Students Found</h4>
              <p className="text-xs text-neutral-400 mt-1">
                Try selecting a different semester or branch filter.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCandidates.map((app) => {
                const isApprovedByPrincipal = app.principalStatus.status === "Approved";
                const isAccountsCleared =
                  app.stage === "ACCOUNTS_CLEARED" ||
                  app.stage === "PRINCIPAL_APPROVED" ||
                  app.stage === "HALL_TICKET_ISSUED" ||
                  (app.accountsStatus.collegeFees === "No Due" &&
                    (app.accountsStatus.hostelFees === "No Due" || app.accountsStatus.hostelFees === "N/A") &&
                    (app.accountsStatus.busFees === "No Due" || app.accountsStatus.busFees === "N/A") &&
                    (app.accountsStatus.fine === "Paid" || app.accountsStatus.fine === "N/A"));
                const isTicketIssued = app.stage === "HALL_TICKET_ISSUED" || Boolean(app.hallTicketId);
                const canGenerate = isAccountsCleared || isApprovedByPrincipal || isTicketIssued;

                return (
                  <Card
                    key={app.id}
                    className="rounded-[5px] border border-[#23262d] bg-[#131519] p-4 flex flex-col justify-between hover:border-[#3a3f4e] transition-all shadow-md group"
                  >
                    <div>
                      {/* Card Header */}
                      <div className="flex items-start justify-between gap-3 border-b border-[#1f2229] pb-3">
                        <div className="flex items-center gap-3">
                          <div className="h-11 w-11 rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] overflow-hidden flex items-center justify-center shrink-0">
                            {app.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={app.photoUrl}
                                alt={app.studentName}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <User size={20} className="text-neutral-400" />
                            )}
                          </div>
                          <div>
                            <span className="font-mono text-xs font-bold text-emerald-400 tracking-wider block">
                              {app.usn}
                            </span>
                            <h4 className="text-sm font-bold text-white uppercase truncate max-w-[170px]" title={app.studentName}>
                              {app.studentName}
                            </h4>
                            <span className="text-[10px] text-[#717684]">
                              {app.branch} &middot; Sem {app.semester} ({app.academicYear})
                            </span>
                          </div>
                        </div>

                        {/* Principal Approval Status Badge */}
                        <Badge
                          variant={
                            app.principalStatus.status === "Approved"
                              ? "success"
                              : app.principalStatus.status === "Rejected"
                              ? "danger"
                              : "neutral"
                          }
                          className="text-[9px] shrink-0"
                        >
                          {app.principalStatus.status === "Approved"
                            ? "Principal Approved"
                            : app.principalStatus.status === "Rejected"
                            ? "Principal Rejected"
                            : "Principal Pending"}
                        </Badge>
                      </div>

                      {/* Card Body & Click to View Submission Details */}
                      <div className="py-3 space-y-2 text-xs">
                        <div className="flex items-center justify-between text-[#8d929d]">
                          <span>Accounts Clearance:</span>
                          <span
                            className={`font-semibold font-mono text-[11px] ${
                              app.accountsStatus.collegeFees === "No Due"
                                ? "text-emerald-400"
                                : "text-amber-400"
                            }`}
                          >
                            {app.accountsStatus.collegeFees === "No Due"
                              ? "Dues Cleared ✓"
                              : "Tuition Due"}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[#8d929d]">
                          <span>Subject Verification:</span>
                          <span
                            className={`font-semibold text-[11px] ${
                              app.subjectsConfirmed ? "text-emerald-400" : "text-red-400"
                            }`}
                          >
                            {app.subjectsConfirmed ? "Confirmed Correct" : "Issue Reported"}
                          </span>
                        </div>

                        {app.arrears && app.arrears.length > 0 && (
                          <div className="flex items-center justify-between text-[#8d929d]">
                            <span>Arrears:</span>
                            <span className="font-mono text-amber-300 font-bold">
                              {app.arrears.length} Subject(s)
                            </span>
                          </div>
                        )}

                        {/* Interactive Clickable Area to view all details */}
                        <button
                          type="button"
                          onClick={() => setDetailModalApp(app)}
                          className="w-full mt-2 py-1.5 px-2 rounded-[3px] bg-[#1a1d26] hover:bg-[#232733] text-[11px] text-[#cbd0dc] flex items-center justify-center gap-1.5 transition-colors border border-[#2b303f]"
                        >
                          <Eye size={12} />
                          <span>View Full Submitted Particulars</span>
                        </button>
                      </div>
                    </div>

                    {/* Action Footer */}
                    <div className="pt-3 border-t border-[#1f2229] flex items-center justify-between gap-2">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {isTicketIssued ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 size={11} /> {app.hallTicketNumber || "Ticket Issued"}
                          </span>
                        ) : (
                          "Awaiting Issue"
                        )}
                      </span>

                      {/* Generate Hall Ticket Button (Enabled when Accounts Cleared or Principal Approved) */}
                      {canGenerate ? (
                        <Button
                          type="button"
                          variant="primary"
                          size="sm"
                          onClick={() => handleGenerateClick(app)}
                          className="h-8 px-3 text-xs font-semibold"
                        >
                          <Sparkles size={12} />
                          <span>{isTicketIssued ? "View / Print Ticket" : "Generate Hall Ticket"}</span>
                        </Button>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-mono italic">
                          Awaiting Accounts Fee Clearance
                        </span>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {/* MODAL 1: CANDIDATE SUBMITTED APPLICATION DETAILS (ADMIN ONLY) */}
          {detailModalApp && (
            <Modal
              isOpen={Boolean(detailModalApp)}
              onClose={() => setDetailModalApp(null)}
              title="Candidate Submitted Application Review (Exam Cell Administration)"
              maxWidth="2xl"
            >
              <div className="space-y-4 text-xs">
                {/* Student Bio */}
                <div className="p-4 rounded-[4px] border border-[#23262d] bg-[#0c0d10] flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-24 w-20 rounded-[4px] border border-neutral-700 bg-white overflow-hidden flex items-center justify-center shrink-0 shadow">
                    {detailModalApp.photoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={detailModalApp.photoUrl}
                        alt={detailModalApp.studentName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <User size={30} className="text-neutral-400" />
                    )}
                  </div>

                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <h3 className="text-base font-bold text-white uppercase">{detailModalApp.studentName}</h3>
                    <div className="font-mono text-emerald-400 font-bold text-sm">
                      USN: {detailModalApp.usn}
                    </div>
                    <p className="text-[#8d929d]">
                      {detailModalApp.course} &middot; Semester {detailModalApp.semester} ({detailModalApp.academicYear})
                    </p>
                    <div className="pt-1 flex flex-wrap gap-2 justify-center sm:justify-start">
                      <Badge variant={detailModalApp.principalStatus.status === "Approved" ? "success" : "neutral"}>
                        Principal: {detailModalApp.principalStatus.status}
                      </Badge>
                      <Badge variant={detailModalApp.accountsStatus.collegeFees === "No Due" ? "success" : "danger"}>
                        Accounts: {detailModalApp.accountsStatus.collegeFees === "No Due" ? "Cleared" : "Pending Dues"}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Subject Confirmation & Issue Note */}
                <div className="p-4 rounded-[4px] border border-[#23262d] bg-[#111317] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-white">Subject List Confirmation:</span>
                    <Badge variant={detailModalApp.subjectsConfirmed ? "success" : "danger"}>
                      {detailModalApp.subjectsConfirmed ? "Confirmed Correct by Candidate" : "Discrepancy Reported"}
                    </Badge>
                  </div>

                  {!detailModalApp.subjectsConfirmed && detailModalApp.subjectIssueNote && (
                    <div className="p-2.5 rounded-[3px] bg-red-950/30 border border-red-800 text-red-200">
                      <span className="text-[10px] uppercase font-bold text-red-400 block mb-0.5">
                        Candidate Issue Note:
                      </span>
                      <p className="font-sans italic">{detailModalApp.subjectIssueNote}</p>
                    </div>
                  )}
                </div>

                {/* Arrears List */}
                <div className="p-4 rounded-[4px] border border-[#23262d] bg-[#111317] space-y-2">
                  <span className="font-semibold text-white block">
                    Reported Arrears ({detailModalApp.arrears?.length || 0}):
                  </span>
                  {detailModalApp.arrears && detailModalApp.arrears.length > 0 ? (
                    <div className="space-y-1">
                      {detailModalApp.arrears.map((arr, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-[3px] bg-[#0c0d10] border border-[#252833] flex items-center justify-between font-mono"
                        >
                          <span className="text-white font-bold">{arr.subjectCode}</span>
                          <span className="text-neutral-300 font-sans">{arr.subjectName}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-neutral-500 italic">No arrears reported for this examination.</p>
                  )}
                </div>

                {/* Fee Receipt Preview */}
                <div className="p-4 rounded-[4px] border border-[#23262d] bg-[#111317] space-y-2">
                  <span className="font-semibold text-white block">Submitted Hall Ticket Fee Receipt:</span>
                  {detailModalApp.feeReceiptUrl ? (
                    <div className="border border-neutral-700 rounded-[4px] overflow-hidden max-h-48 bg-black flex items-center justify-center p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={detailModalApp.feeReceiptUrl}
                        alt="Fee Receipt"
                        className="max-h-44 object-contain"
                      />
                    </div>
                  ) : (
                    <p className="text-neutral-500 italic">No receipt document uploaded.</p>
                  )}
                </div>

                {/* Action in Modal */}
                <div className="pt-2 flex justify-end gap-2 border-t border-[#1f2229]">
                  <Button variant="secondary" onClick={() => setDetailModalApp(null)}>
                    Close Particulars
                  </Button>
                  {(detailModalApp.principalStatus.status === "Approved" ||
                    detailModalApp.stage === "ACCOUNTS_CLEARED" ||
                    detailModalApp.stage === "PRINCIPAL_APPROVED" ||
                    detailModalApp.stage === "HALL_TICKET_ISSUED" ||
                    detailModalApp.accountsStatus.collegeFees === "No Due") && (
                    <Button
                      variant="primary"
                      onClick={() => {
                        const target = detailModalApp;
                        setDetailModalApp(null);
                        handleGenerateClick(target);
                      }}
                    >
                      <Sparkles size={13} />
                      <span>Proceed to Hall Ticket</span>
                    </Button>
                  )}
                </div>
              </div>
            </Modal>
          )}

          {/* MODAL 2: HALL TICKET PREVIEW & ISSUE ACTION BUTTON */}
          {previewTicket && (
            <Modal
              isOpen={Boolean(previewTicket)}
              onClose={() => setPreviewTicket(null)}
              title="Official Examination Hall Ticket Document"
              maxWidth="4xl"
            >
              <div className="space-y-6">
                <HallTicketDocument
                  ticket={previewTicket}
                  settings={settings}
                  onClose={() => setPreviewTicket(null)}
                />

                {/* Issue Hall Ticket Action Button Below Preview */}
                <div className="p-4 rounded-[5px] border border-[#282d3b] bg-[#12141a] flex flex-col sm:flex-row items-center justify-between gap-4 no-print">
                  <div className="flex items-center gap-3">
                    <ShieldCheck size={20} className="text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Official Verification & Issuance</h4>
                      <p className="text-xs text-[#8d929d]">
                        Clicking &quot;Issue Hall Ticket&quot; officially releases this document to the student portal for download.
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="primary"
                    onClick={handleIssueHallTicket}
                    className="h-10 px-6 font-bold shadow-lg shrink-0"
                  >
                    {issuedSuccessAppId ? (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-400" />
                        <span>Issued & Live on Student Portal!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardCheck size={15} />
                        <span>Issue Hall Ticket to Student</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </Modal>
          )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
