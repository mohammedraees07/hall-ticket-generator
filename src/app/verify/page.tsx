"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, Search, CheckCircle2, AlertTriangle, XCircle, ArrowLeft, Clock, MapPin, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function PublicVerifyPage() {
  const [usnInput, setUsnInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [ticketResult, setTicketResult] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlUsn = params.get("usn");
      const code = params.get("code");
      if (code) {
        verifyTicket(code);
        return;
      }
      if (urlUsn) {
        setUsnInput(urlUsn);
        performCheck(urlUsn);
      }
    }
  }, []);

  const verifyTicket = async (code: string) => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch(`/api/hall-tickets/verify?code=${encodeURIComponent(code)}`);
      setTicketResult(await response.json());
    } catch {
      setTicketResult({ valid: false, message: "Unable to verify this hall ticket." });
    } finally {
      setLoading(false);
    }
  };

  const performCheck = async (targetUsn: string) => {
    const qUsn = targetUsn.trim();
    if (!qUsn) return;
    setLoading(true);
    setResult(null);
    setTicketResult(null);

    try {
      // Intentionally not passing dateParam so it strictly checks against today's actual date
      const res = await fetch(`/api/check-exam-today?usn=${encodeURIComponent(qUsn)}`);
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({
        found: false,
        message: "Failed to communicate with examination verification server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performCheck(usnInput);
  };

  return (
    <div className="min-h-screen bg-[#0c0d10] text-[#f3f4f6] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#1e2128] bg-[#0c0d10]/90 backdrop-blur-md px-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-1.5 text-xs text-[#8d929d] hover:text-white transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Sign In</span>
          </Link>
          <span className="text-[#3a3f4d]">|</span>
          <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
            <ShieldCheck size={14} />
            <span className="uppercase tracking-wider">Public Verification</span>
          </div>
        </div>

      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 rounded-[5px] bg-[#14161d] border border-[#272b36] items-center justify-center text-emerald-400 mb-1 shadow-md">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Student Examination Verification
          </h1>
          <p className="text-xs text-[#8d929d] max-w-md mx-auto">
            For invigilators and authorised visitors. Enter a candidate&apos;s USN to confirm identity, today&apos;s paper, and hall allocation.
          </p>
        </div>

        {/* Search Input Card */}
        <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-5 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative">
              <User size={18} className="absolute left-3.5 top-3.5 text-[#6f7584]" />
              <input
                type="text"
                value={usnInput}
                onChange={(e) => setUsnInput(e.target.value)}
                placeholder="Enter USN / Registration Number (e.g. 1RV22CS001)..."
                className="h-12 w-full rounded-[5px] border border-[#2a2e38] bg-[#0c0d10] pl-10 pr-4 text-sm font-mono text-white placeholder:text-[#525765] outline-none focus:border-white focus:ring-1 focus:ring-white tracking-wider uppercase font-bold"
                required
                autoFocus
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
              <p className="text-xs text-[#8d929d]">Use the USN printed on the hall ticket or college ID.</p>

              <Button type="submit" variant="primary" disabled={loading} className="h-10 px-6 font-semibold w-full sm:w-auto">
                <Search size={14} />
                {loading ? "Checking Schedule..." : "Verify Student"}
              </Button>
            </div>
          </form>
        </Card>

        {/* Verification Result Card */}
        {ticketResult && (
          <Card className={`rounded-[5px] p-5 shadow-xl border ${ticketResult.valid ? "border-emerald-700/70 bg-emerald-950/20" : "border-red-900/60 bg-red-950/20"}`}>
            <div className="flex items-center gap-3">
              {ticketResult.valid ? <CheckCircle2 className="text-emerald-400" /> : <XCircle className="text-red-400" />}
              <div>
                <h3 className="text-sm font-bold text-white">{ticketResult.valid ? "Hall ticket verified" : "Hall ticket not verified"}</h3>
                <p className="text-xs text-neutral-300 mt-0.5">{ticketResult.message}</p>
                {ticketResult.valid && ticketResult.hallTicket && (
                  <p className="text-xs text-neutral-300 mt-2"><strong className="text-white">{ticketResult.hallTicket.studentName}</strong> · {ticketResult.hallTicket.usn} · {ticketResult.hallTicket.examinationName}</p>
                )}
              </div>
            </div>
          </Card>
        )}
        {result && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {!result.found ? (
              <Card className="rounded-[5px] border border-red-900/60 bg-red-950/20 p-6 text-center">
                <XCircle size={32} className="text-red-400 mx-auto mb-2" />
                <h3 className="text-base font-bold text-white">Student Not Found</h3>
                <p className="text-xs text-red-200 mt-1">{result.message}</p>
              </Card>
            ) : (
              <div className="space-y-4">
                {/* Exam Today Status Banner */}
                {result.hasExamToday && result.todaySubject ? (
                  <div className="p-5 rounded-[5px] border-2 border-emerald-500 bg-emerald-950/40 text-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-[5px] bg-emerald-500 text-black flex items-center justify-center shrink-0">
                        <CheckCircle2 size={28} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 block">
                          LIVE STATUS · AUTHORIZED
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          EXAM TODAY: {result.todaySubject.subjectCode} — {result.todaySubject.subjectName}
                        </h3>
                        <p className="text-xs text-emerald-200 mt-0.5">
                          Student has an authorized examination scheduled for today.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-5 rounded-[5px] border-2 border-amber-500/80 bg-amber-950/30 text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
                    <div className="flex items-center gap-3.5">
                      <div className="h-12 w-12 rounded-[5px] bg-amber-500 text-black flex items-center justify-center shrink-0">
                        <AlertTriangle size={28} />
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-amber-400 block">
                          SCHEDULE CHECK
                        </span>
                        <h3 className="text-base sm:text-lg font-black text-white">
                          NO EXAM SCHEDULED TODAY
                        </h3>
                        <p className="text-xs text-amber-200/90 mt-0.5">
                          Candidate has no examinations registered for today&apos;s date ({new Date().toISOString().split("T")[0]}).
                        </p>
                      </div>
                    </div>

                    {result.nextExam && (
                      <div className="text-xs bg-black/40 p-2.5 rounded-[4px] border border-amber-700/50">
                        <span className="text-[10px] text-neutral-400 uppercase block font-semibold">Next Scheduled Exam:</span>
                        <span className="font-bold text-white font-mono">{result.nextExam.examDate}</span>
                        <span className="block text-amber-300 font-mono text-[11px]">{result.nextExam.subjectCode}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Candidate Particulars & Allocated Hall Card */}
                {result.student && (
                  <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6 shadow-xl">
                    <div className="grid grid-cols-1 sm:grid-cols-[100px_1fr] gap-5 items-center">
                      <div className="h-28 w-24 rounded-[4px] border-2 border-black bg-white overflow-hidden flex items-center justify-center mx-auto sm:mx-0 shadow">
                        {result.student.photoUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={result.student.photoUrl}
                            alt={result.student.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <User size={36} className="text-neutral-400" />
                        )}
                      </div>

                      <div className="space-y-3 text-center sm:text-left">
                        <div className="border-b border-[#1f2229] pb-2">
                          <h4 className="text-lg font-bold text-white uppercase">{result.student.name}</h4>
                          <span className="font-mono text-sm font-bold text-emerald-400 tracking-wider">
                            USN: {result.student.usn}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase block">Degree & Branch</span>
                            <span className="font-semibold text-white">{result.student.course}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase block">Semester</span>
                            <span className="font-semibold text-white">Semester {result.student.semester}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-neutral-400 uppercase block">Allocated Hall No</span>
                            <span className="font-bold text-emerald-300 font-mono text-sm">
                              {result.todaySubject?.allocatedRoom || result.todaySubject?.room || "Not allocated"}
                            </span>
                          </div>
                        </div>

                        {result.todaySubject && (
                          <div className="pt-2 border-t border-[#1f2229] flex flex-wrap items-center gap-4 text-xs font-mono">
                            <span className="text-neutral-400">
                              Timings: <strong className="text-white">{result.todaySubject.startTime} – {result.todaySubject.endTime}</strong>
                            </span>
                            {result.todaySubject.allocatedBench && (
                              <span className="text-neutral-400">
                                Desk / Bench: <strong className="text-emerald-400">{result.todaySubject.allocatedBench}</strong>
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                )}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#606675] border-t border-[#1e2128]">
        Autonomous College Examination Division &middot; Security & Hall Invigilation Verification
      </footer>
    </div>
  );
}
