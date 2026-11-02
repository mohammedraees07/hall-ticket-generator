"use client";

import React, { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { HallTicketDocument } from "@/components/hall-ticket-document";
import {
  type Student,
  type HallTicket,
  type CollegeSettings,
  type ExamApplication,
  type BroadcastNotice,
  type Examination,
  type ArrearSubject,
  type SeatingPlan,
} from "@/lib/data-store";
import { formatDate } from "@/lib/utils";
import {
  UserRound,
  Search,
  ClipboardCheck,
  Printer,
  ShieldCheck,
  AlertTriangle,
  GraduationCap,
  CalendarDays,
  FileCheck2,
  Bell,
  Clock,
  CheckCircle2,
  XCircle,
  Plus,
  Trash2,
  Upload,
  Check,
  LayoutGrid,
  MapPin,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function StudentPortalPage() {
  const { user, isStudent } = useAuth();
  const [activeTab, setActiveTab] = useState<"admit-card" | "seating">("admit-card");

  const [usnInput, setUsnInput] = useState(user?.usn || "1RV22CS001");
  const [student, setStudent] = useState<Student | null>(null);
  const [application, setApplication] = useState<ExamApplication | null>(null);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotice[]>([]);
  const [examination, setExamination] = useState<Examination | null>(null);
  const [tickets, setTickets] = useState<HallTicket[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | undefined>(undefined);
  const [seatingPlans, setSeatingPlans] = useState<SeatingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Active ticket modal
  const [activeTicket, setActiveTicket] = useState<HallTicket | null>(null);

  // Application submission modal
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [submittingApp, setSubmittingApp] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [subjectsConfirmed, setSubjectsConfirmed] = useState<boolean | null>(null);
  const [subjectIssueNote, setSubjectIssueNote] = useState("");
  const [showSubjectConfirmPopup, setShowSubjectConfirmPopup] = useState(false);
  const [showSubjectIssuePopup, setShowSubjectIssuePopup] = useState(false);
  const [arrears, setArrears] = useState<ArrearSubject[]>([]);

  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  useEffect(() => {
    if (isStudent) {
      loadMyStudentProfile();
    } else if (user?.usn) {
      setUsnInput(user.usn);
      fetchStudentData(user.usn);
    } else {
      fetchStudentData(usnInput);
    }
  }, [user, isStudent]);

  const loadMyStudentProfile = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const [meRes, examRes] = await Promise.all([
        fetch("/api/me"),
        fetch("/api/examinations"),
      ]);

      if (examRes.ok) {
        const exList: Examination[] = await examRes.json();
        if (exList.length > 0) setExamination(exList[0]);
      }

      if (meRes.ok) {
        const meData = await meRes.json();
        if (meData.student) {
          setStudent(meData.student);
          setPhotoPreview(meData.student.photoUrl);
          if (meData.applications && meData.applications.length > 0) {
            setApplication(meData.applications[0]);
          } else {
            setApplication(null);
          }
          setTickets(meData.hallTickets || []);
          setBroadcasts(meData.broadcasts || []);
          if (meData.settings) setSettings(meData.settings);
          setSeatingPlans(meData.seatingPlans || []);
        } else {
          setStudent(null);
          setTickets([]);
          setApplication(null);
        }
      }
    } catch (err) {
      console.error("Student portal profile error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentData = async (usn: string) => {
    if (!usn.trim()) return;
    setLoading(true);
    setHasSearched(true);
    try {
      const [studRes, broadRes, setRes, examRes, seatRes] = await Promise.all([
        fetch(`/api/students?search=${encodeURIComponent(usn.trim())}`),
        fetch("/api/broadcasts"),
        fetch("/api/settings"),
        fetch("/api/examinations"),
        fetch("/api/seating"),
      ]);

      if (broadRes.ok) setBroadcasts(await broadRes.json());
      if (setRes.ok) setSettings(await setRes.json());
      if (seatRes.ok) {
        const sData = await seatRes.json();
        if (sData.plans) setSeatingPlans(sData.plans);
      }

      if (examRes.ok) {
        const exList: Examination[] = await examRes.json();
        if (exList.length > 0) setExamination(exList[0]);
      }

      if (studRes.ok) {
        const list: Student[] = await studRes.json();
        const found = list.find(
          (s) =>
            s.usn.toLowerCase() === usn.trim().toLowerCase() ||
            s.studentId.toLowerCase() === usn.trim().toLowerCase()
        );
        if (found) {
          setStudent(found);
          setPhotoPreview(found.photoUrl);

          // Fetch student tickets & application
          const [tickRes, appRes] = await Promise.all([
            fetch(`/api/hall-tickets?studentId=${found.id}`),
            fetch(`/api/exam-applications?studentId=${found.id}`),
          ]);

          if (tickRes.ok) setTickets(await tickRes.json());
          if (appRes.ok) {
            const apps: ExamApplication[] = await appRes.json();
            if (apps.length > 0) {
              setApplication(apps[0]);
            } else {
              setApplication(null);
            }
          }
        } else {
          setStudent(null);
          setTickets([]);
          setApplication(null);
        }
      }
    } catch (err) {
      console.error("Student portal error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudentData(usnInput);
  };

  const handleAddArrear = () => {
    setArrears((prev) => [...prev, { subjectCode: "", subjectName: "" }]);
  };

  const handleRemoveArrear = (idx: number) => {
    setArrears((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleArrearChange = (idx: number, field: "subjectCode" | "subjectName", val: string) => {
    setArrears((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: val };
      return copy;
    });
  };

  const handleReceiptUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingReceipt(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "receipt");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setReceiptPreview(data.url);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setReceiptPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setReceiptPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "photo");
      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setPhotoPreview(data.url);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          setPhotoPreview(event.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    } catch {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoPreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!student) return;

    if (subjectsConfirmed === null) {
      alert("Please confirm whether the subject list is correct (click Yes or No).");
      return;
    }

    if (subjectsConfirmed === false && !subjectIssueNote.trim()) {
      alert("Please write a short note describing the subject issue.");
      return;
    }

    setSubmittingApp(true);
    try {
      const res = await fetch("/api/exam-applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: student.id,
          examinationId: activeSemesterBroadcast?.examinationId || examination?.id || 1,
          photoUrl: photoPreview || student.photoUrl,
          feeReceiptUrl: receiptPreview || "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&auto=format&fit=crop&q=80",
          subjectsConfirmed,
          subjectIssueNote,
          arrears: arrears.filter((a) => a.subjectCode.trim() && a.subjectName.trim()),
        }),
      });

      if (res.ok) {
        const created: ExamApplication = await res.json();
        setApplication(created);
        setApplyModalOpen(false);
        if (isStudent) {
          await loadMyStudentProfile();
        } else {
          await fetchStudentData(student.usn);
        }
      }
    } catch (err) {
      console.error("Submit application error:", err);
    } finally {
      setSubmittingApp(false);
    }
  };

  // Find broadcast notice matching student semester
  const activeSemesterBroadcast = student
    ? broadcasts.find((b) => Number(b.semester) === Number(student.semester) && b.isOpen)
    : broadcasts.find((b) => b.isOpen);

  // Derive workflow step states for the Scholarship-style tracker
  const isApplied = Boolean(application);
  const isAccountsCleared =
    application?.stage === "ACCOUNTS_CLEARED" ||
    application?.stage === "PRINCIPAL_APPROVED" ||
    application?.stage === "HALL_TICKET_ISSUED";
  const isPrincipalApproved =
    application?.stage === "PRINCIPAL_APPROVED" ||
    application?.stage === "HALL_TICKET_ISSUED";
  const isHallTicketIssued =
    application?.stage === "HALL_TICKET_ISSUED" || tickets.length > 0;
  const isRejected = application?.stage === "REJECTED";

  // Seating arrangement look-up
  const activeSeatingPlan = seatingPlans[0] || null;
  const studentCleanUsn = student?.usn?.toUpperCase() || "";

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["STUDENT", "ADMIN", "STAFF"]}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Top Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1e2128] pb-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                {isStudent ? "Candidate Examination Portal" : "Student Verification & Admit Desk"}
              </h2>
              <p className="text-xs text-[#8d929d] mt-0.5">
                Track examination application status, verify fee dues, view seating arrangement, and download authentic admit cards.
              </p>
            </div>

            {/* Mode Tabs */}
            <div className="inline-flex p-1 bg-[#131519] border border-[#23262d] rounded-[5px] shrink-0 self-start sm:self-auto overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setActiveTab("admit-card")}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "admit-card"
                    ? "bg-white text-black shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <ClipboardCheck size={13} />
                <span>Application & Hall Ticket</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("seating")}
                className={`px-3 py-1.5 rounded-[4px] text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "seating"
                    ? "bg-white text-black shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <LayoutGrid size={13} />
                <span>Seating Arrangement</span>
              </button>
            </div>
          </div>

          {/* Admin / Staff USN Lookup Card */}
          {!isStudent && (
            <Card className="rounded-[5px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  value={usnInput}
                  onChange={(e) => setUsnInput(e.target.value)}
                  placeholder="Enter candidate USN (e.g. 1RV22CS001)..."
                  className="h-11 flex-1 rounded-[5px] border border-[var(--border)] bg-[var(--background)] px-4 text-xs font-mono text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] outline-none focus:border-[var(--foreground)] focus:ring-1 focus:ring-[var(--foreground)] tracking-wider uppercase"
                  required
                />
                <Button type="submit" variant="primary" disabled={loading} className="h-11 px-6">
                  <Search size={15} />
                  {loading ? "Searching..." : "Access Candidate"}
                </Button>
              </form>
            </Card>
          )}

          {/* TAB 1: APPLICATION & ADMIT CARD */}
          {activeTab === "admit-card" && (
            <div className="space-y-6">
              {/* BROADCAST BANNER FOR STUDENT SEMESTER */}
              {activeSemesterBroadcast && (
                <div className="p-4 rounded-[5px] border-2 border-emerald-600 bg-emerald-500/10 text-[var(--foreground)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-in fade-in duration-300">
                  <div className="flex items-center gap-3.5">
                    <div className="h-11 w-11 rounded-[4px] bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Bell size={22} />
                    </div>
                    <div>
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">
                        EXAMINATION CELL ANNOUNCEMENT
                      </span>
                      <h3 className="text-base font-bold text-[var(--foreground)]">
                        {activeSemesterBroadcast.title}
                      </h3>
                      <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                        Deadline to submit examination application & fee receipt:{" "}
                        <strong className="text-[var(--foreground)] font-mono">{activeSemesterBroadcast.deadline}</strong>
                      </p>
                    </div>
                  </div>

                  {!application ? (
                    <Button
                      type="button"
                      variant="primary"
                      onClick={() => setApplyModalOpen(true)}
                      className="h-10 px-6 font-bold shadow-sm shrink-0"
                    >
                      <ArrowRight size={14} />
                      <span>Apply for Hall Ticket</span>
                    </Button>
                  ) : (
                    <div className="text-right text-xs shrink-0">
                      <span className="text-[10px] text-[var(--muted-foreground)] block uppercase font-mono">Status:</span>
                      <Badge variant="success" className="text-xs font-bold">
                        Application Submitted
                      </Badge>
                    </div>
                  )}
                </div>
              )}

              {/* SCHOLARSHIP-STYLE MULTI-STAGE TRACKER */}
              {application && (
                <Card className="rounded-[5px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-4">
                    <div>
                      <div className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase">
                        Application Tracking ID: <strong className="text-[var(--foreground)]">{application.applicationNumber}</strong>
                      </div>
                      <h3 className="text-base font-bold text-[var(--foreground)] mt-0.5">
                        Examination Application Progress
                      </h3>
                    </div>
                    <Badge
                      variant={
                        isHallTicketIssued
                          ? "success"
                          : isRejected
                          ? "danger"
                          : "neutral"
                      }
                      className="font-mono text-xs"
                    >
                      {isHallTicketIssued
                        ? "HALL TICKET ISSUED"
                        : isRejected
                        ? "DECLINED"
                        : "WAITING FOR APPROVAL"}
                    </Badge>
                  </div>

                  {/* 5-Step Visual Stepper Bar */}
                  <div className="relative">
                    <div className="hidden sm:block absolute top-5 left-8 right-8 h-1 bg-[var(--border)] -z-0" />
                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 relative z-10">
                      {/* Step 1: Applied */}
                      <div className="flex flex-col items-center text-center space-y-1.5">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isApplied
                              ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-500/20"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]"
                          }`}
                        >
                          <Check size={18} />
                        </div>
                        <span className="text-xs font-bold text-[var(--foreground)]">Applied</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">Candidate Form</span>
                      </div>

                      {/* Step 2: Accounts Section */}
                      <div className="flex flex-col items-center text-center space-y-1.5">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isAccountsCleared
                              ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-500/20"
                              : application.stage === "UNDER_ACCOUNTS_REVIEW" || application.stage === "APPLIED"
                              ? "bg-amber-500 text-black ring-4 ring-amber-500/20 animate-pulse font-bold"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]"
                          }`}
                        >
                          {isAccountsCleared ? <Check size={18} /> : <Clock size={16} />}
                        </div>
                        <span className="text-xs font-bold text-[var(--foreground)]">Accounts Section</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {isAccountsCleared ? "Fee Cleared ✓" : "Under Verification"}
                        </span>
                      </div>

                      {/* Step 3: Principal Office */}
                      <div className="flex flex-col items-center text-center space-y-1.5">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isPrincipalApproved
                              ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-500/20"
                              : isAccountsCleared && !isPrincipalApproved && !isRejected
                              ? "bg-amber-500 text-black ring-4 ring-amber-500/20 animate-pulse font-bold"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]"
                          }`}
                        >
                          {isPrincipalApproved ? <Check size={18} /> : <Clock size={16} />}
                        </div>
                        <span className="text-xs font-bold text-[var(--foreground)]">Principal Office</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {isPrincipalApproved ? "Approved ✓" : isAccountsCleared ? "Under Review" : "Pending Dues"}
                        </span>
                      </div>

                      {/* Step 4: Exam Section */}
                      <div className="flex flex-col items-center text-center space-y-1.5">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isHallTicketIssued
                              ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-500/20"
                              : isPrincipalApproved && !isHallTicketIssued
                              ? "bg-amber-500 text-black ring-4 ring-amber-500/20 animate-pulse font-bold"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]"
                          }`}
                        >
                          {isHallTicketIssued ? <Check size={18} /> : <Clock size={16} />}
                        </div>
                        <span className="text-xs font-bold text-[var(--foreground)]">Exam Section</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {isHallTicketIssued ? "Admit Card Issued" : "Under Generation"}
                        </span>
                      </div>

                      {/* Step 5: Download */}
                      <div className="flex flex-col items-center text-center space-y-1.5">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center font-bold text-xs ${
                            isHallTicketIssued
                              ? "bg-emerald-600 text-white shadow-md ring-4 ring-emerald-500/20"
                              : "bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]"
                          }`}
                        >
                          <Printer size={16} />
                        </div>
                        <span className="text-xs font-bold text-[var(--foreground)]">Download</span>
                        <span className="text-[10px] text-[var(--muted-foreground)]">
                          {isHallTicketIssued ? "Ready to Print" : "Locked"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Rejection Alert if Rejected */}
                  {isRejected && (
                    <div className="p-4 rounded-[4px] border-2 border-red-500 bg-red-500/10 text-[var(--foreground)] flex items-start gap-3">
                      <XCircle size={22} className="text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-sm font-bold text-red-600 dark:text-red-400 uppercase">Application Declined</h4>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1">
                          {application.principalStatus.rejectionReason ||
                            "Your examination application was declined due to pending fees in Accounts Section or attendance shortage. Please contact your department coordinator."}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Download Admit Card CTA when Issued */}
                  {isHallTicketIssued && (
                    <div className="p-4 rounded-[4px] border border-emerald-600 bg-emerald-500/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 size={24} className="text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <h4 className="text-sm font-bold text-[var(--foreground)]">Your Hall Ticket is Officially Issued</h4>
                          <p className="text-xs text-[var(--muted-foreground)]">
                            Verified by Controller of Examinations & endorsed by the Principal.
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        onClick={async () => {
                          if (tickets.length > 0) {
                            setActiveTicket(tickets[0]);
                          } else if (student) {
                            try {
                              const res = await fetch(`/api/hall-tickets?studentId=${student.id}`);
                              if (res.ok) {
                                const tList = await res.json();
                                if (tList.length > 0) {
                                  setTickets(tList);
                                  setActiveTicket(tList[0]);
                                  return;
                                }
                              }
                            } catch (e) {
                              console.error("Failed to load ticket on click:", e);
                            }
                          }
                        }}
                        className="h-10 px-6 font-bold shrink-0"
                      >
                        <Printer size={14} /> Download Hall Ticket
                      </Button>
                    </div>
                  )}
                </Card>
              )}

              {/* STUDENT PROFILE & PARTICULARS CARD */}
              {student && (
                <Card className="rounded-[5px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 border-b border-[var(--border)] pb-6">
                    <div className="flex items-start gap-4">
                      <div className="h-24 w-20 rounded-[4px] border border-[var(--border)] overflow-hidden bg-[var(--muted)] shrink-0 flex items-center justify-center shadow">
                        {student.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={student.photoUrl} alt={student.name} className="h-full w-full object-cover" />
                        ) : (
                          <UserRound size={28} className="text-[var(--muted-foreground)]" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-[var(--foreground)] tracking-tight">{student.name}</h3>
                        <p className="font-mono text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
                          USN: {student.usn} &middot; Register ID: {student.studentId}
                        </p>
                        <p className="text-xs text-[var(--muted-foreground)] mt-2">
                          {student.course} &middot; Semester {student.semester} (Section {student.section})
                        </p>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end gap-2 text-right">
                      <div>
                        <span className="text-[10px] text-[var(--muted-foreground)] uppercase font-mono block">Attendance</span>
                        <span
                          className={`font-mono font-bold text-sm ${
                            student.attendancePercentage >= 75 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {student.attendancePercentage}%
                        </span>
                      </div>
                      <Badge variant={student.feeStatus === "Cleared" ? "success" : "danger"}>
                        Fees {student.feeStatus}
                      </Badge>
                    </div>
                  </div>

                  {/* Registered Timetable */}
                  {examination && (
                    <div className="mt-4 pt-4 border-t border-[var(--border)]">
                      <h4 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <CalendarDays size={13} /> Registered Examination Subjects ({examination.subjects?.length || 0})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {examination.subjects?.map((sub) => (
                          <div
                            key={sub.subjectCode}
                            className="p-2.5 rounded-[4px] border border-[var(--border)] bg-[var(--muted)] flex items-center justify-between"
                          >
                            <div>
                              <span className="font-mono text-xs font-bold text-[var(--foreground)] block">{sub.subjectCode}</span>
                              <span className="text-[11px] text-[var(--muted-foreground)] truncate max-w-[200px] block">
                                {sub.subjectName}
                              </span>
                            </div>
                            <div className="text-right text-[11px] font-mono text-[var(--muted-foreground)]">
                              <span>{formatDate(sub.examDate)}</span>
                              <span className="block text-[10px] text-[var(--muted-foreground)]">{sub.startTime}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* TAB 2: SEATING ARRANGEMENT (PICTORIAL VIEW WITH STRICT PRIVACY MASKING) */}
          {activeTab === "seating" && (
            <div className="space-y-6">
              <Card className="rounded-[5px] border border-[var(--border)] bg-[var(--card)] p-6 shadow-xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-4">
                  <div>
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[3px] bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 uppercase mb-1">
                      <ShieldCheck size={11} /> Privacy Shield Active &middot; Anonymous Desks
                    </div>
                    <h3 className="text-base font-bold text-[var(--foreground)]">
                      Examination Hall Seating Allocation
                    </h3>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      Your allocated bench is highlighted. For candidate privacy, other seat assignments remain anonymous.
                    </p>
                  </div>

                  <div className="text-right text-xs bg-[var(--muted)] p-2.5 rounded-[4px] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--muted-foreground)] uppercase block font-semibold">Allocated Room:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{activeSeatingPlan?.roomName || "Hall C-201"}</span>
                  </div>
                </div>

                {/* Seating Grid Benches */}
                {activeSeatingPlan ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeSeatingPlan.benches.map((bench) => {
                        const isStudentLeft =
                          bench.leftSeat?.usn?.toUpperCase() === studentCleanUsn;
                        const isStudentRight =
                          bench.rightSeat?.usn?.toUpperCase() === studentCleanUsn;
                        const hasStudent = isStudentLeft || isStudentRight;

                        return (
                          <div
                            key={bench.benchNumber}
                            className={`p-3.5 rounded-[5px] border ${
                              hasStudent
                                ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500"
                                : "border-[var(--border)] bg-[var(--muted)]"
                            } space-y-2.5 shadow`}
                          >
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-mono font-bold text-[var(--muted-foreground)]">
                                Desk Bench: <strong className="text-[var(--foreground)]">{bench.benchCode}</strong>
                              </span>
                              {hasStudent && (
                                <span className="px-2 py-0.5 rounded-[3px] bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-wider animate-pulse">
                                  ★ Your Allocated Bench
                                </span>
                              )}
                            </div>

                            {/* Two Seats per Bench: Left & Right */}
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              {/* Left Seat */}
                              <div
                                className={`p-2.5 rounded-[4px] border text-center ${
                                  isStudentLeft
                                    ? "border-emerald-600 bg-emerald-600 text-white font-bold shadow-md"
                                    : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]"
                                }`}
                              >
                                <span className="text-[10px] font-mono block uppercase">Left Seat</span>
                                {isStudentLeft ? (
                                  <div className="mt-1">
                                    <span className="font-mono text-xs font-black block">{student?.usn}</span>
                                    <span className="text-[10px] truncate block font-sans">{student?.name}</span>
                                  </div>
                                ) : (
                                  <div className="mt-1">
                                    <span className="text-[11px] text-[var(--muted-foreground)] italic">Reserved Desk</span>
                                    <span className="text-[9px] text-[var(--muted-foreground)] opacity-70 block">Identity Masked</span>
                                  </div>
                                )}
                              </div>

                              {/* Right Seat */}
                              <div
                                className={`p-2.5 rounded-[4px] border text-center ${
                                  isStudentRight
                                    ? "border-emerald-600 bg-emerald-600 text-white font-bold shadow-md"
                                    : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)]"
                                }`}
                              >
                                <span className="text-[10px] font-mono block uppercase">Right Seat</span>
                                {isStudentRight ? (
                                  <div className="mt-1">
                                    <span className="font-mono text-xs font-black block">{student?.usn}</span>
                                    <span className="text-[10px] truncate block font-sans">{student?.name}</span>
                                  </div>
                                ) : (
                                  <div className="mt-1">
                                    <span className="text-[11px] text-[var(--muted-foreground)] italic">Reserved Desk</span>
                                    <span className="text-[9px] text-[var(--muted-foreground)] opacity-70 block">Identity Masked</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Legend */}
                    <div className="p-3 rounded-[4px] bg-[var(--card)] border border-[var(--border)] flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-emerald-600 inline-block" />
                          <span className="text-[var(--foreground)] font-semibold">Your Assigned Seat</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="h-3 w-3 rounded-full bg-[var(--muted)] border border-[var(--border)] inline-block" />
                          <span>Candidate Desk (Masked)</span>
                        </div>
                      </div>
                      <span className="text-[var(--muted-foreground)] font-mono text-[10px]">
                        Center: Block C Examination Complex
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-neutral-400 text-center py-6">
                    Seating arrangements will be published 48 hours prior to examination commencement.
                  </p>
                )}
              </Card>
            </div>
          )}

          {/* APPLICATION SUBMISSION MODAL */}
          {applyModalOpen && student && (
            <Modal
              isOpen={applyModalOpen}
              onClose={() => setApplyModalOpen(false)}
              title="Official Examination Hall Ticket Application"
              maxWidth="xl"
            >
              <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
                {/* Candidate Particulars Auto-Filled */}
                <div className="p-3.5 rounded-[4px] border border-[var(--border)] bg-[var(--card)] space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-16 w-14 rounded-[3px] border border-[var(--border)] bg-[var(--muted)] overflow-hidden flex items-center justify-center shrink-0">
                      {photoPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={photoPreview} alt="Candidate" className="h-full w-full object-cover" />
                      ) : (
                        <UserRound size={24} className="text-[var(--muted-foreground)]" />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-bold text-[var(--foreground)] uppercase text-sm">{student.name}</div>
                      <div className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">USN: {student.usn}</div>
                      <div className="text-[11px] text-[var(--muted-foreground)]">
                        Semester: <strong className="text-[var(--foreground)] font-mono">{student.semester}th Semester (Auto)</strong> &middot; {student.course}
                      </div>
                    </div>
                    <label className="cursor-pointer text-[10px] text-[var(--foreground)] bg-[var(--muted)] hover:bg-[var(--accent)] px-2.5 py-1.5 rounded border border-[var(--border)] shrink-0 font-medium transition-colors">
                      Change Photo
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                {/* 1. SUBJECT VERIFICATION SECTION WITH YES/NO & POPUP */}
                <div className="p-3.5 rounded-[4px] border border-[var(--border)] bg-[var(--card)] space-y-2.5">
                  <span className="font-semibold text-[var(--foreground)] block">
                    Verify Your Semester Examination Subjects:
                  </span>

                  {examination && (
                    <div className="space-y-1 max-h-36 overflow-y-auto font-mono text-[11px] p-2.5 rounded bg-[var(--muted)] border border-[var(--border)]">
                      {examination.subjects?.map((sub) => (
                        <div key={sub.subjectCode} className="flex justify-between text-[var(--foreground)] py-0.5">
                          <span className="font-bold font-mono text-[var(--foreground)]">{sub.subjectCode}</span>
                          <span className="truncate max-w-[280px] font-sans text-[var(--foreground)]">{sub.subjectName}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Question Prompt */}
                  <div className="pt-2 border-t border-[var(--border)]">
                    <label className="font-bold text-[var(--foreground)] block mb-2">
                      Are all the subjects shown above correct?
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => setShowSubjectConfirmPopup(true)}
                        className={`px-4 py-1.5 rounded-[4px] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                          subjectsConfirmed === true
                            ? "bg-emerald-600 text-white shadow"
                            : "bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 border border-[var(--foreground)]"
                        }`}
                      >
                        <Check size={13} />
                        <span>Yes, All Correct</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowSubjectIssuePopup(true)}
                        className={`px-4 py-1.5 rounded-[4px] font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                          subjectsConfirmed === false
                            ? "bg-red-600 text-white shadow"
                            : "bg-[var(--muted)] text-[var(--foreground)] hover:bg-[var(--accent)] border border-[var(--border)]"
                        }`}
                      >
                        <XCircle size={13} />
                        <span>No, Report Issue</span>
                      </button>
                    </div>

                    {subjectsConfirmed === false && (
                      <div className="mt-2 text-[11px] text-red-600 dark:text-red-400 bg-red-500/10 p-2 rounded border border-red-500/30">
                        <strong>Reported Note:</strong> {subjectIssueNote || "(No note entered)"}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. ARREARS SECTION */}
                <div className="p-3.5 rounded-[4px] border border-[var(--border)] bg-[var(--card)] space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-semibold text-[var(--foreground)] block">Arrear / Backlog Papers</span>
                      <span className="text-[10px] text-[var(--muted-foreground)]">Add any previous semester subjects you are appearing for.</span>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={handleAddArrear} className="h-7 text-xs">
                      <Plus size={12} /> Add Arrear
                    </Button>
                  </div>

                  {arrears.map((arr, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Subject Code (e.g. CS301)"
                        value={arr.subjectCode}
                        onChange={(e) => handleArrearChange(idx, "subjectCode", e.target.value)}
                        className="h-8 w-28 rounded-[3px] border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)] font-mono uppercase"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Subject Name (e.g. Data Structures)"
                        value={arr.subjectName}
                        onChange={(e) => handleArrearChange(idx, "subjectName", e.target.value)}
                        className="h-8 flex-1 rounded-[3px] border border-[var(--border)] bg-[var(--background)] px-2 text-xs text-[var(--foreground)]"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveArrear(idx)}
                        className="h-8 w-8 text-red-600 dark:text-red-400 hover:bg-red-500/20 rounded flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>

                {/* 3. FEE RECEIPT UPLOAD */}
                <div className="p-3.5 rounded-[4px] border border-[var(--border)] bg-[var(--card)] space-y-2">
                  <span className="font-semibold text-[var(--foreground)] block">Upload Hall Ticket Examination Fee Receipt:</span>
                  <div className="flex items-center gap-3">
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] bg-[var(--foreground)] text-[var(--background)] hover:opacity-90 text-xs font-semibold shadow-sm transition-opacity">
                      <Upload size={13} />
                      <span>{receiptPreview ? "Replace Receipt File" : "Choose Receipt Image"}</span>
                      <input type="file" accept="image/*" onChange={handleReceiptUpload} className="hidden" />
                    </label>
                    <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                      {receiptPreview ? "Receipt attached ✓" : "Fee challan or UPI receipt screenshot"}
                    </span>
                  </div>
                </div>

                {/* Modal Buttons */}
                <div className="flex justify-end gap-2 pt-3 border-t border-[var(--border)]">
                  <Button type="button" variant="outline" onClick={() => setApplyModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary" disabled={submittingApp}>
                    <span>{submittingApp ? "Submitting Application..." : "Submit & Apply"}</span>
                  </Button>
                </div>
              </form>
            </Modal>
          )}

          {/* POPUP: CONFIRM YES SUBJECTS */}
          {showSubjectConfirmPopup && (
            <Modal
              isOpen={showSubjectConfirmPopup}
              onClose={() => setShowSubjectConfirmPopup(false)}
              title="Confirm Examination Subjects"
              maxWidth="md"
            >
              <div className="space-y-4 text-xs">
                <p className="text-[var(--foreground)] leading-relaxed">
                  Are you sure that all registered subjects, codes, and credit listings displayed are accurate for your semester examination?
                </p>
                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                  <Button variant="outline" onClick={() => setShowSubjectConfirmPopup(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setSubjectsConfirmed(true);
                      setSubjectIssueNote("");
                      setShowSubjectConfirmPopup(false);
                    }}
                  >
                    Confirm Correct
                  </Button>
                </div>
              </div>
            </Modal>
          )}

          {/* POPUP: REPORT ISSUE ON SUBJECTS */}
          {showSubjectIssuePopup && (
            <Modal
              isOpen={showSubjectIssuePopup}
              onClose={() => setShowSubjectIssuePopup(false)}
              title="Report Subject Discrepancy"
              maxWidth="md"
            >
              <div className="space-y-3 text-xs">
                <p className="text-[var(--foreground)] leading-relaxed">
                  Please provide a short note describing the discrepancy with your examination subjects so the Exam Office can correct it:
                </p>
                <textarea
                  rows={3}
                  value={subjectIssueNote}
                  onChange={(e) => setSubjectIssueNote(e.target.value)}
                  placeholder="e.g. Elective code CS404 is listed instead of CS408 Machine Learning..."
                  className="w-full rounded-[4px] border border-[var(--border)] bg-[var(--background)] p-2 text-xs text-[var(--foreground)] outline-none focus:border-[var(--foreground)] font-sans"
                  required
                />
                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                  <Button variant="outline" onClick={() => setShowSubjectIssuePopup(false)}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    onClick={() => {
                      if (!subjectIssueNote.trim()) {
                        alert("Please enter a short note explaining the issue.");
                        return;
                      }
                      setSubjectsConfirmed(false);
                      setShowSubjectIssuePopup(false);
                    }}
                  >
                    Save Discrepancy Note
                  </Button>
                </div>
              </div>
            </Modal>
          )}

          {/* HALL TICKET PREVIEW MODAL */}
          {activeTicket && (
            <Modal
              isOpen={Boolean(activeTicket)}
              onClose={() => setActiveTicket(null)}
              title="Official Autonomous Examination Admit Card"
              maxWidth="4xl"
            >
              <HallTicketDocument
                ticket={activeTicket}
                settings={settings}
                onClose={() => setActiveTicket(null)}
              />
            </Modal>
          )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
