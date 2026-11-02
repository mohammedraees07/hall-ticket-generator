"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  Settings,
  Bell,
  CreditCard,
  Building,
  Bus,
  AlertCircle,
  Save,
  Check,
  User,
  Stamp,
  FileText,
} from "lucide-react";
import { type ExamApplication, type BroadcastNotice } from "@/lib/data-store";

export default function PrincipalPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotice[]>([]);
  const [applications, setApplications] = useState<ExamApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSemester, setSelectedSemester] = useState<string>("4");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Principal decision edits: map of appId -> { status, fineWaived, fineWaiverNote, rejectionReason }
  const [decisionEdits, setDecisionEdits] = useState<
    Record<
      number,
      {
        status: "Pending" | "Approved" | "Rejected";
        fineWaived: boolean;
        fineWaiverNote: string;
        rejectionReason: string;
      }
    >
  >({});
  const [savingId, setSavingId] = useState<number | null>(null);
  const [savedSuccessId, setSavedSuccessId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [broadRes, appRes] = await Promise.all([
        fetch("/api/broadcasts"),
        fetch("/api/exam-applications"),
      ]);

      if (broadRes.ok) {
        setBroadcasts(await broadRes.json());
      }

      if (appRes.ok) {
        const list: ExamApplication[] = await appRes.json();
        setApplications(list);

        const buffer: Record<number, any> = {};
        for (const app of list) {
          buffer[app.id] = {
            status: app.principalStatus.status || "Pending",
            fineWaived: Boolean(app.principalStatus.fineWaived),
            fineWaiverNote: app.principalStatus.fineWaiverNote || "",
            rejectionReason: app.principalStatus.rejectionReason || "",
          };
        }
        setDecisionEdits(buffer);
      }
    } catch (err) {
      console.error("Principal load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDecisionChange = (appId: number, field: string, value: any) => {
    setDecisionEdits((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        [field]: value,
      },
    }));
  };

  const handleSaveDecision = async (appId: number) => {
    const edit = decisionEdits[appId];
    if (!edit) return;

    setSavingId(appId);
    try {
      const res = await fetch("/api/exam-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "principalApproval",
          applicationId: appId,
          status: edit.status,
          fineWaived: edit.fineWaived,
          fineWaiverNote: edit.fineWaiverNote,
          rejectionReason: edit.rejectionReason,
        }),
      });

      if (res.ok) {
        const updated: ExamApplication = await res.json();
        setApplications((prev) =>
          prev.map((a) => (a.id === appId ? updated : a))
        );
        setSavedSuccessId(appId);
        setTimeout(() => setSavedSuccessId(null), 2500);
      }
    } catch (err) {
      console.error("Save decision error:", err);
    } finally {
      setSavingId(null);
    }
  };

  const filteredApplications = applications.filter((app) => {
    const matchSem =
      selectedSemester === "ALL" || String(app.semester) === selectedSemester;
    const matchBranch =
      selectedBranch === "ALL" ||
      app.branch.toUpperCase() === selectedBranch.toUpperCase();
    const matchStatus =
      statusFilter === "ALL" || app.principalStatus.status === statusFilter;
    const matchSearch =
      !searchQuery.trim() ||
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.usn.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSem && matchBranch && matchStatus && matchSearch;
  });

  const activeBroadcast = broadcasts.find((b) => b.isOpen);
  const pendingCount = applications.filter((a) => a.principalStatus.status === "Pending").length;

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["PRINCIPAL", "ADMIN"]}>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Notification Banner for Principal */}
          {activeBroadcast && (
            <div className="p-4 rounded-[5px] border-2 border-emerald-500/80 bg-emerald-950/30 text-emerald-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[4px] bg-emerald-500 text-black flex items-center justify-center shrink-0">
                  <Bell size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400">
                    EXAMINATION CLEARANCE ENDORSEMENT
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {activeBroadcast.semester}th Semester Examination Applications Ready for Review
                  </h3>
                  <p className="text-xs text-emerald-200/90 mt-0.5">
                    Please verify fee clearance records from Accounts and endorse approval for admit card generation.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Link href="/principal/settings">
                  <Button variant="outline" size="sm" className="h-8 text-xs">
                    <Stamp size={13} />
                    <span>Seal & Sign Settings</span>
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2229] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Principal Office &middot; Hall Ticket Approval Desk
              </h2>
              <p className="text-xs text-[#8d929d]">
                Review Accounts Section fee clearances, grant fine waivers with reference notes, and approve candidate admit cards.
              </p>
            </div>

            <div className="flex items-center gap-3">
              {pendingCount > 0 && (
                <Badge variant="warning" className="text-xs font-mono">
                  {pendingCount} Awaiting Review
                </Badge>
              )}
              <Link href="/principal/settings">
                <Button variant="secondary" size="sm" className="h-8 text-xs">
                  <Stamp size={13} />
                  <span>Configure Seal & Signature</span>
                </Button>
              </Link>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-[5px] border border-[#23262d] bg-[#131519] grid grid-cols-1 sm:grid-cols-4 gap-3">
            {/* Semester Filter */}
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

            {/* Branch Filter */}
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

            {/* Status Filter */}
            <div>
              <label className="text-[11px] uppercase font-bold text-[#717684] block mb-1">
                Approval Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono"
              >
                <option value="ALL">All Decisions</option>
                <option value="Pending">Pending Review</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Search */}
            <div>
              <label className="text-[11px] uppercase font-bold text-[#717684] block mb-1">
                Search Candidate
              </label>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-3 text-[#6f7584]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="USN or Name..."
                  className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] pl-9 pr-3 text-xs text-white outline-none focus:border-white font-mono"
                />
              </div>
            </div>
          </div>

          {/* Cards Grid */}
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400 font-mono animate-pulse">
              Loading candidates for Principal endorsement...
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-8 text-center">
              <AlertCircle size={28} className="text-neutral-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Candidate Applications Found</h4>
              <p className="text-xs text-neutral-400 mt-1">
                No students match your selected filters.
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplications.map((app) => {
                const currentDecision = decisionEdits[app.id] || {
                  status: app.principalStatus.status || "Pending",
                  fineWaived: false,
                  fineWaiverNote: "",
                  rejectionReason: "",
                };
                const isSaving = savingId === app.id;
                const isSaved = savedSuccessId === app.id;

                const acc = app.accountsStatus;
                const collegeCleared = acc.collegeFees === "No Due";
                const hostelCleared = acc.hostelFees === "No Due" || acc.hostelFees === "N/A";
                const busCleared = acc.busFees === "No Due" || acc.busFees === "N/A";
                const fineCleared = acc.fine === "Paid" || acc.fine === "N/A";
                const allAccountsCleared = collegeCleared && hostelCleared && busCleared && fineCleared;

                return (
                  <Card
                    key={app.id}
                    className="rounded-[5px] border border-[#23262d] bg-[#131519] p-4 flex flex-col justify-between hover:border-[#383d49] transition-colors shadow-md"
                  >
                    <div className="space-y-3">
                      {/* Student Info Header */}
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
                            ? "Approved"
                            : app.principalStatus.status === "Rejected"
                            ? "Rejected"
                            : "Pending Review"}
                        </Badge>
                      </div>

                      {/* Accounts Clearance Read-Only Chips */}
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#6f7584] block mb-1.5 flex items-center justify-between">
                          <span>Accounts Fee Clearance Status</span>
                          {allAccountsCleared ? (
                            <span className="text-emerald-400 font-mono text-[9px] flex items-center gap-1">
                              <CheckCircle2 size={11} /> Clear
                            </span>
                          ) : (
                            <span className="text-amber-400 font-mono text-[9px] flex items-center gap-1">
                              <AlertCircle size={11} /> Dues Pending
                            </span>
                          )}
                        </span>

                        <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                          <div
                            className={`p-1.5 rounded-[3px] border flex items-center justify-between ${
                              acc.collegeFees === "No Due"
                                ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-300"
                                : "bg-red-950/20 border-red-900/60 text-red-300"
                            }`}
                          >
                            <span className="text-[10px] text-neutral-400">College:</span>
                            <span className="font-bold">{acc.collegeFees}</span>
                          </div>

                          <div
                            className={`p-1.5 rounded-[3px] border flex items-center justify-between ${
                              acc.hostelFees === "No Due"
                                ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-300"
                                : acc.hostelFees === "N/A"
                                ? "bg-neutral-900 border-neutral-800 text-neutral-400"
                                : "bg-red-950/20 border-red-900/60 text-red-300"
                            }`}
                          >
                            <span className="text-[10px] text-neutral-400">Hostel:</span>
                            <span className="font-bold">{acc.hostelFees}</span>
                          </div>

                          <div
                            className={`p-1.5 rounded-[3px] border flex items-center justify-between ${
                              acc.busFees === "No Due"
                                ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-300"
                                : acc.busFees === "N/A"
                                ? "bg-neutral-900 border-neutral-800 text-neutral-400"
                                : "bg-red-950/20 border-red-900/60 text-red-300"
                            }`}
                          >
                            <span className="text-[10px] text-neutral-400">Bus:</span>
                            <span className="font-bold">{acc.busFees}</span>
                          </div>

                          <div
                            className={`p-1.5 rounded-[3px] border flex items-center justify-between ${
                              acc.fine === "Paid"
                                ? "bg-emerald-950/20 border-emerald-900/60 text-emerald-300"
                                : acc.fine === "N/A"
                                ? "bg-neutral-900 border-neutral-800 text-neutral-400"
                                : "bg-red-950/20 border-red-900/60 text-red-300"
                            }`}
                          >
                            <span className="text-[10px] text-neutral-400">Fine:</span>
                            <span className="font-bold">{acc.fine}</span>
                          </div>
                        </div>
                      </div>

                      {/* Arrears Indicator if present */}
                      {app.arrears && app.arrears.length > 0 && (
                        <div className="p-2 rounded-[3px] bg-[#1a1c24] border border-[#2b2f3c] text-[11px]">
                          <span className="text-[10px] uppercase font-bold text-amber-400 block mb-0.5">
                            Reported Arrears ({app.arrears.length})
                          </span>
                          <div className="space-y-0.5 font-mono text-[10px] text-neutral-300">
                            {app.arrears.map((arr, i) => (
                              <div key={i} className="truncate">
                                &bull; {arr.subjectCode} - {arr.subjectName}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Principal Decision Controls */}
                      <div className="pt-2 border-t border-[#1f2229] space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] font-bold text-neutral-300">
                            Principal Decision:
                          </label>
                          <select
                            value={currentDecision.status}
                            onChange={(e) =>
                              handleDecisionChange(app.id, "status", e.target.value)
                            }
                            className={`h-8 rounded-[4px] border px-2.5 text-xs font-bold font-mono outline-none ${
                              currentDecision.status === "Approved"
                                ? "bg-emerald-950/50 border-emerald-500 text-emerald-300"
                                : currentDecision.status === "Rejected"
                                ? "bg-red-950/50 border-red-500 text-red-300"
                                : "bg-neutral-900 border-neutral-700 text-neutral-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </div>

                        {/* Fine Waiver Toggle & Note */}
                        <div className="space-y-1.5 pt-1">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-neutral-300">
                            <input
                              type="checkbox"
                              checked={currentDecision.fineWaived}
                              onChange={(e) =>
                                handleDecisionChange(app.id, "fineWaived", e.target.checked)
                              }
                              className="rounded border-[#2a2e38] bg-[#0c0d10] text-emerald-500 focus:ring-0"
                            />
                            <span className="text-[11px]">Grant Principal Fine Waiver</span>
                          </label>

                          {currentDecision.fineWaived && (
                            <input
                              type="text"
                              value={currentDecision.fineWaiverNote}
                              onChange={(e) =>
                                handleDecisionChange(app.id, "fineWaiverNote", e.target.value)
                              }
                              placeholder="Waiver reason (internal reference note)..."
                              className="h-8 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-2 text-[11px] text-white placeholder:text-neutral-500 outline-none focus:border-white font-sans"
                            />
                          )}
                        </div>

                        {/* Rejection Note if Rejected */}
                        {currentDecision.status === "Rejected" && (
                          <div className="space-y-1 pt-1 animate-in fade-in duration-200">
                            <label className="text-[10px] text-red-400 font-bold uppercase block">
                              Rejection Reason (Visible to Student):
                            </label>
                            <input
                              type="text"
                              value={currentDecision.rejectionReason}
                              onChange={(e) =>
                                handleDecisionChange(app.id, "rejectionReason", e.target.value)
                              }
                              placeholder="e.g. Accounts dues pending / Insufficient attendance..."
                              className="h-8 w-full rounded-[4px] border border-red-800 bg-[#160c0c] px-2 text-[11px] text-red-200 placeholder:text-red-400/50 outline-none focus:border-red-500 font-sans"
                              required
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Save Button */}
                    <div className="pt-3 border-t border-[#1f2229] flex items-center justify-between gap-2 mt-3">
                      <span className="text-[10px] text-neutral-500 font-mono">
                        {app.applicationNumber}
                      </span>

                      <Button
                        type="button"
                        variant={isSaved ? "secondary" : "primary"}
                        size="sm"
                        disabled={isSaving}
                        onClick={() => handleSaveDecision(app.id)}
                        className="h-8 px-3 text-xs"
                      >
                        {isSaved ? (
                          <>
                            <Check size={12} className="text-emerald-400" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Save size={12} />
                            <span>{isSaving ? "Saving..." : "Endorse Decision"}</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
