"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import {
  CreditCard,
  Building,
  Bus,
  AlertCircle,
  CheckCircle2,
  Filter,
  Search,
  Bell,
  Save,
  Check,
  User,
  GraduationCap,
} from "lucide-react";
import { type ExamApplication, type BroadcastNotice, type AccountsFeeStatus } from "@/lib/data-store";

export default function AccountsPage() {
  const [broadcasts, setBroadcasts] = useState<BroadcastNotice[]>([]);
  const [applications, setApplications] = useState<ExamApplication[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedSemester, setSelectedSemester] = useState<string>("4");
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Card fee status edit state: map of appId -> AccountsFeeStatus
  const [feeEdits, setFeeEdits] = useState<Record<number, AccountsFeeStatus>>({});
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
        const bList: BroadcastNotice[] = await broadRes.json();
        setBroadcasts(bList);
      }

      if (appRes.ok) {
        const aList: ExamApplication[] = await appRes.json();
        setApplications(aList);

        // Prepopulate edit buffer
        const buffer: Record<number, AccountsFeeStatus> = {};
        for (const app of aList) {
          buffer[app.id] = { ...app.accountsStatus };
        }
        setFeeEdits(buffer);
      }
    } catch (err) {
      console.error("Accounts load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = (
    appId: number,
    field: keyof AccountsFeeStatus,
    value: string
  ) => {
    setFeeEdits((prev) => ({
      ...prev,
      [appId]: {
        ...prev[appId],
        [field]: value,
      },
    }));
  };

  const handleSaveStudentFee = async (appId: number) => {
    const edit = feeEdits[appId];
    if (!edit) return;

    setSavingId(appId);
    try {
      const res = await fetch("/api/exam-applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "updateFee",
          applicationId: appId,
          status: edit,
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
      console.error("Save fee status error:", err);
    } finally {
      setSavingId(null);
    }
  };

  const handleMarkAllNoDue = (appId: number) => {
    setFeeEdits((prev) => ({
      ...prev,
      [appId]: {
        collegeFees: "No Due",
        hostelFees: "No Due",
        busFees: "No Due",
        fine: "Paid",
      },
    }));
  };

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const matchSem =
      selectedSemester === "ALL" || String(app.semester) === selectedSemester;
    const matchBranch =
      selectedBranch === "ALL" ||
      app.branch.toUpperCase() === selectedBranch.toUpperCase();
    const matchSearch =
      !searchQuery.trim() ||
      app.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.usn.toLowerCase().includes(searchQuery.toLowerCase());

    return matchSem && matchBranch && matchSearch;
  });

  const activeBroadcast = broadcasts.find((b) => b.isOpen);
  const pendingCount = applications.filter(
    (a) => a.accountsStatus.collegeFees === "Pending" || a.stage === "UNDER_ACCOUNTS_REVIEW"
  ).length;

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["ACCOUNTS", "ADMIN"]}>
        <div className="space-y-6 max-w-7xl mx-auto">
          {/* Active Broadcast Notification Banner for Accounts */}
          {activeBroadcast && (
            <div className="p-4 rounded-[5px] border-2 border-amber-500/80 bg-amber-950/30 text-amber-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg animate-in fade-in duration-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-[4px] bg-amber-500 text-black flex items-center justify-center shrink-0">
                  <Bell size={20} />
                </div>
                <div>
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
                    EXAMINATION CELL BROADCAST
                  </div>
                  <h3 className="text-sm font-bold text-white">
                    {activeBroadcast.semester}th Semester Exam Application is Open
                  </h3>
                  <p className="text-xs text-amber-200/90 mt-0.5">
                    Please verify student accounts and update their fee status (Deadline:{" "}
                    <strong className="text-white font-mono">{activeBroadcast.deadline}</strong>).
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedSemester(String(activeBroadcast.semester))}
                className="px-3 py-1.5 rounded-[4px] bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shrink-0 transition-colors"
              >
                Show {activeBroadcast.semester}th Sem Students
              </button>
            </div>
          )}

          {/* Header & Filter Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1f2229] pb-4">
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">
                Candidate Fee Clearance Registry
              </h2>
              <p className="text-xs text-[#8d929d]">
                Update tuition dues, hostel fees, bus conveyance, and penalty fines for examination eligibility.
              </p>
            </div>

            <div className="flex items-center gap-2">
              {pendingCount > 0 && (
                <Badge variant="warning" className="text-xs font-mono">
                  {pendingCount} Pending Clearance
                </Badge>
              )}
              <Badge variant="neutral" className="text-xs font-mono">
                {filteredApplications.length} Candidates Displayed
              </Badge>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="p-4 rounded-[5px] border border-[#23262d] bg-[#131519] grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Semester Filter */}
            <div>
              <label className="text-[11px] uppercase font-bold text-[#717684] block mb-1">
                Filter by Semester
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
                <option value="5">5th Semester</option>
                <option value="6">6th Semester</option>
              </select>
            </div>

            {/* Branch Filter */}
            <div>
              <label className="text-[11px] uppercase font-bold text-[#717684] block mb-1">
                Filter by Branch / Stream
              </label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono"
              >
                <option value="ALL">All Branches</option>
                <option value="CSE">Computer Science (CSE)</option>
                <option value="ISE">Information Science / AI (ISE)</option>
                <option value="ECE">Electronics & Comm (ECE)</option>
                <option value="MECH">Mechanical Engineering (MECH)</option>
                <option value="MBA">Management (MBA)</option>
              </select>
            </div>

            {/* Search Input */}
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

          {/* Student Cards Grid */}
          {loading ? (
            <div className="py-12 text-center text-xs text-neutral-400 font-mono animate-pulse">
              Loading student examination applications...
            </div>
          ) : filteredApplications.length === 0 ? (
            <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-8 text-center">
              <AlertCircle size={28} className="text-neutral-500 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-white">No Candidate Applications Found</h4>
              <p className="text-xs text-neutral-400 mt-1">
                No students match the chosen semester ({selectedSemester}) and branch filter ({selectedBranch}).
              </p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredApplications.map((app) => {
                const currentEdit = feeEdits[app.id] || app.accountsStatus;
                const isSaving = savingId === app.id;
                const isSaved = savedSuccessId === app.id;

                const collegeCleared = currentEdit.collegeFees === "No Due";
                const hostelCleared =
                  currentEdit.hostelFees === "No Due" || currentEdit.hostelFees === "N/A";
                const busCleared =
                  currentEdit.busFees === "No Due" || currentEdit.busFees === "N/A";
                const fineCleared =
                  currentEdit.fine === "Paid" || currentEdit.fine === "N/A";

                const isFullyCleared =
                  collegeCleared && hostelCleared && busCleared && fineCleared;

                return (
                  <Card
                    key={app.id}
                    className="rounded-[5px] border border-[#23262d] bg-[#131519] p-4 flex flex-col justify-between hover:border-[#383d49] transition-colors shadow-md"
                  >
                    <div>
                      {/* Student Header */}
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

                        {/* Overall Badge */}
                        <Badge variant={isFullyCleared ? "success" : "danger"} className="text-[9px] shrink-0">
                          {isFullyCleared ? "Dues Cleared" : "Pending Dues"}
                        </Badge>
                      </div>

                      {/* 4 Fee Dropdowns */}
                      <div className="py-3 space-y-2.5 text-xs">
                        {/* 1. College Fees */}
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] font-medium text-neutral-300 flex items-center gap-1.5">
                            <CreditCard size={13} className="text-neutral-400" />
                            <span>College Fees:</span>
                          </label>
                          <select
                            value={currentEdit.collegeFees}
                            onChange={(e) =>
                              handleStatusChange(app.id, "collegeFees", e.target.value)
                            }
                            className={`h-8 rounded-[4px] border px-2 text-xs font-bold font-mono outline-none ${
                              currentEdit.collegeFees === "No Due"
                                ? "bg-emerald-950/40 border-emerald-600 text-emerald-300"
                                : "bg-red-950/40 border-red-600 text-red-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="No Due">No Due</option>
                          </select>
                        </div>

                        {/* 2. Hostel Fees */}
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] font-medium text-neutral-300 flex items-center gap-1.5">
                            <Building size={13} className="text-neutral-400" />
                            <span>Hostel Fees:</span>
                          </label>
                          <select
                            value={currentEdit.hostelFees}
                            onChange={(e) =>
                              handleStatusChange(app.id, "hostelFees", e.target.value)
                            }
                            className={`h-8 rounded-[4px] border px-2 text-xs font-bold font-mono outline-none ${
                              currentEdit.hostelFees === "No Due"
                                ? "bg-emerald-950/40 border-emerald-600 text-emerald-300"
                                : currentEdit.hostelFees === "N/A"
                                ? "bg-neutral-900 border-neutral-700 text-neutral-400"
                                : "bg-red-950/40 border-red-600 text-red-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="No Due">No Due</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>

                        {/* 3. Bus Fees */}
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] font-medium text-neutral-300 flex items-center gap-1.5">
                            <Bus size={13} className="text-neutral-400" />
                            <span>Bus Fees:</span>
                          </label>
                          <select
                            value={currentEdit.busFees}
                            onChange={(e) =>
                              handleStatusChange(app.id, "busFees", e.target.value)
                            }
                            className={`h-8 rounded-[4px] border px-2 text-xs font-bold font-mono outline-none ${
                              currentEdit.busFees === "No Due"
                                ? "bg-emerald-950/40 border-emerald-600 text-emerald-300"
                                : currentEdit.busFees === "N/A"
                                ? "bg-neutral-900 border-neutral-700 text-neutral-400"
                                : "bg-red-950/40 border-red-600 text-red-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="No Due">No Due</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>

                        {/* 4. Fine */}
                        <div className="flex items-center justify-between gap-2">
                          <label className="text-[11px] font-medium text-neutral-300 flex items-center gap-1.5">
                            <AlertCircle size={13} className="text-neutral-400" />
                            <span>Fine:</span>
                          </label>
                          <select
                            value={currentEdit.fine}
                            onChange={(e) =>
                              handleStatusChange(app.id, "fine", e.target.value)
                            }
                            className={`h-8 rounded-[4px] border px-2 text-xs font-bold font-mono outline-none ${
                              currentEdit.fine === "Paid"
                                ? "bg-emerald-950/40 border-emerald-600 text-emerald-300"
                                : currentEdit.fine === "N/A"
                                ? "bg-neutral-900 border-neutral-700 text-neutral-400"
                                : "bg-red-950/40 border-red-600 text-red-300"
                            }`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Paid">Paid</option>
                            <option value="N/A">N/A</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-3 border-t border-[#1f2229] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => handleMarkAllNoDue(app.id)}
                        className="text-[10px] text-neutral-400 hover:text-white underline underline-offset-2"
                      >
                        Clear All Dues
                      </button>

                      <Button
                        type="button"
                        variant={isSaved ? "secondary" : "primary"}
                        size="sm"
                        disabled={isSaving}
                        onClick={() => handleSaveStudentFee(app.id)}
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
                            <span>{isSaving ? "Saving..." : "Update Fee"}</span>
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
