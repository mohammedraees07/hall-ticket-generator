"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type HallTicket } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";
import {
  ShieldCheck,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  QrCode,
  CalendarDays,
  User,
  GraduationCap,
  Clock,
  DoorOpen,
  MapPin,
  AlertTriangle,
  AlertCircle,
  FileCheck,
} from "lucide-react";

type GateCheckResponse = {
  found: boolean;
  message?: string;
  checkDate?: string;
  student?: {
    id: number;
    name: string;
    usn: string;
    department: string;
    course: string;
    semester: number;
    section: string;
    photoUrl: string | null;
    attendancePercentage: number;
    feeStatus: string;
    isCompliant: boolean;
  };
  hasExamToday?: boolean;
  entryPermitted?: boolean;
  gateStatus?: "PERMITTED" | "NO_EXAM_TODAY" | "BARRED_FEES" | "BARRED_ATTENDANCE" | "NO_TICKET";
  gatePassMessage?: string;
  todaySubject?: {
    subjectCode: string;
    subjectName: string;
    examDate: string;
    startTime: string;
    endTime: string;
    room: string;
    allocatedRoom: string;
    allocatedBench: string;
  } | null;
  nextExam?: {
    subjectCode: string;
    subjectName: string;
    examDate: string;
    startTime: string;
    endTime: string;
    room: string;
  } | null;
  hallTicket?: {
    number: string;
    verifyCode: string;
    status: string;
  } | null;
  allSubjects?: Array<{
    subjectCode: string;
    subjectName: string;
    examDate: string;
    startTime: string;
    endTime: string;
    room: string;
  }>;
};

export default function VerificationPage({ initialCode }: { initialCode?: string }) {
  const [activeTab, setActiveTab] = useState<"today" | "token">("today");

  // Today's Exam Gate Check State
  const [usnInput, setUsnInput] = useState("");
  const [checkDate, setCheckDate] = useState(new Date().toISOString().split("T")[0]);
  const [gateLoading, setGateLoading] = useState(false);
  const [gateResult, setGateResult] = useState<GateCheckResponse | null>(null);

  // QR / Token Verification State
  const [code, setCode] = useState(initialCode || "");
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenResult, setTokenResult] = useState<{
    valid: boolean;
    hallTicket: HallTicket | null;
    message: string;
  } | null>(null);

  // Check student exam schedule for today
  const handleCheckToday = async (targetUsn?: string, targetDate?: string) => {
    const qUsn = targetUsn || usnInput.trim();
    if (!qUsn) return;
    setGateLoading(true);
    setGateResult(null);
    try {
      const qDate = targetDate || checkDate;
      const res = await fetch(`/api/check-exam-today?usn=${encodeURIComponent(qUsn)}&date=${encodeURIComponent(qDate)}`);
      const data = await res.json();
      setGateResult(data);
    } catch (err) {
      console.error("Gate check error:", err);
      setGateResult({
        found: false,
        message: "Failed to communicate with examination verification server.",
      });
    } finally {
      setGateLoading(false);
    }
  };

  // QR / Token verification
  const verifyCode = async (searchCode: string) => {
    if (!searchCode.trim()) return;
    setTokenLoading(true);
    try {
      const res = await fetch(`/api/hall-tickets/verify?code=${encodeURIComponent(searchCode.trim())}`);
      if (res.ok) {
        const json = await res.json();
        setTokenResult(json);
      }
    } catch (err) {
      console.error("Verification error:", err);
      setTokenResult({
        valid: false,
        hallTicket: null,
        message: "Network or server connection failed while verifying document.",
      });
    } finally {
      setTokenLoading(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setActiveTab("token");
      setCode(initialCode);
      verifyCode(initialCode);
      return;
    }

    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlCode = params.get("code");
      const urlUsn = params.get("usn");
      if (urlCode) {
        setActiveTab("token");
        setCode(urlCode);
        verifyCode(urlCode);
      } else if (urlUsn) {
        setActiveTab("today");
        setUsnInput(urlUsn);
        handleCheckToday(urlUsn);
      }
    }
  }, [initialCode]);

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["ADMIN", "STAFF"]}>
        <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2 py-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[3px] bg-[#14181f] border border-[#232938] text-[11px] font-mono text-[#4ade80] uppercase tracking-wider">
            <ShieldCheck size={14} /> Official Examination Cell
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Security Gate Pass & Admit Card Verification
          </h2>
          <p className="text-xs text-[#8d929d] max-w-lg mx-auto">
            Used by Campus Security, Examination Hall Invigilators, and Flying Squads to verify candidate identity and today&apos;s exam eligibility.
          </p>

          {/* Mode Tabs */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex p-1 bg-[#131519] border border-[#23262d] rounded-[5px]">
              <button
                type="button"
                onClick={() => setActiveTab("today")}
                className={`px-4 py-1.5 rounded-[4px] text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "today"
                    ? "bg-white text-black shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <Clock size={13} />
                <span>Today&apos;s Exam Check (USN / Reg No)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("token")}
                className={`px-4 py-1.5 rounded-[4px] text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                  activeTab === "token"
                    ? "bg-white text-black shadow"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <QrCode size={13} />
                <span>Admit Card QR & Token Verify</span>
              </button>
            </div>
          </div>
        </div>

        {/* TAB 1: TODAY'S EXAM SCHEDULE CHECKER (FOR GATE SECURITY & INVIGILATORS) */}
        {activeTab === "today" && (
          <div className="space-y-6">
            <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6 shadow-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleCheckToday();
                }}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2 relative">
                    <User size={18} className="absolute left-3.5 top-3 text-[#6f7584]" />
                    <input
                      type="text"
                      value={usnInput}
                      onChange={(e) => setUsnInput(e.target.value)}
                      placeholder="Enter Student Register Number / USN (e.g. 1RV22CS001)..."
                      className="h-11 w-full rounded-[5px] border border-[#2a2e38] bg-[#0c0d10] pl-10 pr-4 text-xs font-mono text-white placeholder:text-[#525765] outline-none focus:border-white focus:ring-1 focus:ring-white tracking-wider uppercase font-bold"
                      required
                      autoFocus
                    />
                  </div>

                  <div>
                    <input
                      type="date"
                      value={checkDate}
                      onChange={(e) => setCheckDate(e.target.value)}
                      className="h-11 w-full rounded-[5px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs font-mono text-white outline-none focus:border-white"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2 text-xs text-[#8d929d] flex-wrap">
                    <span className="text-[11px] uppercase font-bold text-neutral-500">Quick Test Candidates:</span>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        setUsnInput("1RV22CS001");
                        setCheckDate(today);
                        handleCheckToday("1RV22CS001", today);
                      }}
                      className="text-xs text-white bg-[#1a1c23] hover:bg-[#252833] px-2 py-0.5 rounded-[3px] border border-[#2e3340] font-mono font-bold"
                    >
                      1RV22CS001 (Scheduled Today)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const today = new Date().toISOString().split("T")[0];
                        setUsnInput("1RV22CS014");
                        setCheckDate(today);
                        handleCheckToday("1RV22CS014", today);
                      }}
                      className="text-xs text-white bg-[#1a1c23] hover:bg-[#252833] px-2 py-0.5 rounded-[3px] border border-[#2e3340] font-mono font-bold"
                    >
                      1RV22CS014 (Seated in Hall C-201)
                    </button>
                  </div>

                  <Button type="submit" variant="primary" disabled={gateLoading} className="h-10 px-6 font-semibold w-full sm:w-auto">
                    <Search size={14} />
                    {gateLoading ? "Checking Schedule..." : "Verify Gate Entry"}
                  </Button>
                </div>
              </form>
            </Card>

            {/* GATE CHECK RESULTS */}
            {gateResult && (
              <div className="space-y-4">
                {!gateResult.found ? (
                  <Card className="rounded-[5px] border border-red-900/60 bg-red-950/20 p-6 text-center">
                    <XCircle size={32} className="text-red-400 mx-auto mb-2" />
                    <h3 className="text-base font-bold text-white">Candidate Not Found</h3>
                    <p className="text-xs text-red-200 mt-1">{gateResult.message}</p>
                  </Card>
                ) : (
                  <div className="space-y-4">
                    {/* GIANT VERDICT BANNER */}
                    {gateResult.entryPermitted && gateResult.todaySubject ? (
                      <div className="p-5 rounded-[5px] border-2 border-emerald-500 bg-emerald-950/40 text-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 rounded-[5px] bg-emerald-500 text-black flex items-center justify-center shrink-0">
                            <CheckCircle2 size={28} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 block">
                              GATE PASS · STATUS AUTHORIZED
                            </span>
                            <h3 className="text-lg font-black text-white">
                              EXAMINATION SCHEDULED TODAY — ENTRY PERMITTED
                            </h3>
                            <p className="text-xs text-emerald-200/90 mt-0.5">
                              {gateResult.todaySubject.subjectCode} — {gateResult.todaySubject.subjectName}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-col md:items-end text-xs font-mono bg-black/30 p-3 rounded-[4px] border border-emerald-700/50">
                          <span className="text-emerald-300 font-bold">
                            SESSION: {gateResult.todaySubject.startTime} – {gateResult.todaySubject.endTime}
                          </span>
                          <span className="text-white font-bold text-sm">
                            ROOM: {gateResult.todaySubject.allocatedRoom}
                          </span>
                          <span className="text-emerald-400 font-bold">
                            DESK: {gateResult.todaySubject.allocatedBench}
                          </span>
                        </div>
                      </div>
                    ) : gateResult.gateStatus === "BARRED_FEES" || gateResult.gateStatus === "BARRED_ATTENDANCE" ? (
                      <div className="p-5 rounded-[5px] border-2 border-red-500 bg-red-950/40 text-red-100 flex items-center gap-3.5 shadow-xl">
                        <div className="h-12 w-12 rounded-[5px] bg-red-600 text-white flex items-center justify-center shrink-0">
                          <XCircle size={28} />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-red-400 block">
                            GATE PASS · ACCESS DENIED
                          </span>
                          <h3 className="text-lg font-black text-white">
                            ENTRY BARRED — CANDIDATE NOT ELIGIBLE
                          </h3>
                          <p className="text-xs text-red-200 mt-0.5">
                            {gateResult.gatePassMessage}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="p-5 rounded-[5px] border-2 border-amber-500 bg-amber-950/40 text-amber-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xl">
                        <div className="flex items-center gap-3.5">
                          <div className="h-12 w-12 rounded-[5px] bg-amber-500 text-black flex items-center justify-center shrink-0">
                            <AlertTriangle size={28} />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-400 block">
                              GATE PASS · NO ACTIVE SESSION
                            </span>
                            <h3 className="text-lg font-black text-white">
                              NO EXAMINATION SCHEDULED TODAY
                            </h3>
                            <p className="text-xs text-amber-200 mt-0.5">
                              Candidate has no exam on {gateResult.checkDate}. Not authorized for exam hall entry today.
                            </p>
                          </div>
                        </div>

                        {gateResult.nextExam && (
                          <div className="text-xs bg-black/40 p-2.5 rounded-[4px] border border-amber-700/50">
                            <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Next Scheduled Exam:</span>
                            <span className="font-bold text-white">{formatDate(gateResult.nextExam.examDate)}</span>
                            <span className="block text-amber-300 font-mono text-[11px]">{gateResult.nextExam.subjectCode} · {gateResult.nextExam.subjectName}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* CANDIDATE PARTICULARS CARD */}
                    {gateResult.student && (
                      <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6 shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-[100px_1fr] gap-6 items-start">
                          <div className="h-28 w-24 rounded-[4px] border-2 border-black bg-white overflow-hidden flex items-center justify-center mx-auto md:mx-0 shadow">
                            {gateResult.student.photoUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={gateResult.student.photoUrl} alt={gateResult.student.name} className="h-full w-full object-cover" />
                            ) : (
                              <User size={36} className="text-neutral-400" />
                            )}
                          </div>

                          <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1f2229] pb-3">
                              <div>
                                <h4 className="text-lg font-bold text-white uppercase">{gateResult.student.name}</h4>
                                <span className="font-mono text-sm font-bold text-[#4ade80] tracking-wider">
                                  USN: {gateResult.student.usn}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={gateResult.student.feeStatus === "Cleared" ? "success" : "danger"}>
                                  Fees {gateResult.student.feeStatus}
                                </Badge>
                                <Badge variant={gateResult.student.attendancePercentage >= 75 ? "success" : "danger"}>
                                  Attendance: {gateResult.student.attendancePercentage}%
                                </Badge>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                              <div>
                                <span className="text-[10px] text-neutral-400 uppercase block">Degree & Branch</span>
                                <span className="font-semibold text-white">{gateResult.student.course}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-neutral-400 uppercase block">Semester / Section</span>
                                <span className="font-semibold text-white">Semester {gateResult.student.semester} · Section {gateResult.student.section}</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-neutral-400 uppercase block">Admit Card Token</span>
                                <span className="font-mono text-neutral-300 font-bold">
                                  {gateResult.hallTicket?.verifyCode || "Generated & Active"}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Complete Registered Subject Schedule */}
                        {gateResult.allSubjects && gateResult.allSubjects.length > 0 && (
                          <div className="mt-6 pt-4 border-t border-[#1f2229]">
                            <h5 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-1.5">
                              <CalendarDays size={13} /> Complete Registered Timetable
                            </h5>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                              {gateResult.allSubjects.map((sub) => {
                                const isCurrent = sub.examDate === gateResult.checkDate;
                                return (
                                  <div
                                    key={sub.subjectCode}
                                    className={`p-2.5 rounded-[4px] border ${
                                      isCurrent
                                        ? "border-emerald-500 bg-emerald-950/30 text-white font-bold"
                                        : "border-[#232731] bg-[#0c0d10] text-neutral-400"
                                    } flex items-center justify-between`}
                                  >
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-mono text-xs font-bold text-white">{sub.subjectCode}</span>
                                        {isCurrent && (
                                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-[2px] bg-emerald-500 text-black font-extrabold">
                                            TODAY
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] truncate max-w-[200px]">{sub.subjectName}</p>
                                    </div>
                                    <div className="text-right text-[11px] font-mono">
                                      <span className="block text-neutral-300 font-semibold">{formatDate(sub.examDate)}</span>
                                      <span className="text-neutral-500 text-[10px]">{sub.startTime}</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </Card>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADMIT CARD TOKEN & QR VERIFIER */}
        {activeTab === "token" && (
          <div className="space-y-6">
            <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6 shadow-xl">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  verifyCode(code);
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1">
                  <QrCode size={18} className="absolute left-3.5 top-3 text-[#6f7584]" />
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter verification code (e.g. RVHT-25-1RV22CS001 or HT-25-0001)..."
                    className="h-11 w-full rounded-[5px] border border-[#2a2e38] bg-[#0c0d10] pl-10 pr-4 text-xs font-mono text-white placeholder:text-[#525765] outline-none focus:border-white focus:ring-1 focus:ring-white tracking-wider uppercase"
                    required
                  />
                </div>
                <Button type="submit" variant="primary" disabled={tokenLoading} className="h-11 px-6">
                  <Search size={15} />
                  {tokenLoading ? "Verifying..." : "Verify Document"}
                </Button>
              </form>

              <div className="mt-4 pt-3 border-t border-[#1e2128] flex items-center justify-between text-[11px] text-[#717684]">
                <span>
                  Sample Token:{" "}
                  <code
                    className="text-white font-bold cursor-pointer hover:underline"
                    onClick={() => {
                      setCode("RVHT-25-1RV22CS001");
                      verifyCode("RVHT-25-1RV22CS001");
                    }}
                  >
                    RVHT-25-1RV22CS001
                  </code>
                </span>
                <span>Cryptographic QR Token Verification</span>
              </div>
            </Card>

            {tokenResult && (
              <div className="space-y-4">
                {tokenResult.valid && tokenResult.hallTicket ? (
                  <Card className="rounded-[5px] border border-emerald-900/60 bg-emerald-950/20 p-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 size={24} className="text-emerald-400" />
                      <div>
                        <h4 className="text-sm font-bold text-white">Genuine Examination Hall Ticket Verified</h4>
                        <p className="text-xs text-emerald-200/80">{tokenResult.message}</p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="rounded-[5px] border border-red-900/60 bg-red-950/20 p-6 text-center">
                    <XCircle size={28} className="text-red-400 mx-auto mb-2" />
                    <h4 className="text-sm font-bold text-white">Verification Failed</h4>
                    <p className="text-xs text-red-200 mt-1">{tokenResult.message}</p>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
