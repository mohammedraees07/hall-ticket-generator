"use client";

import React, { useState, useEffect, useMemo } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth/auth-context";
import {
  LayoutGrid,
  Sparkles,
  Printer,
  Save,
  Plus,
  X,
  Search,
  CheckCircle2,
  Trash2,
  FileText,
  Tag,
  Building,
  Users,
  AlertCircle,
  GraduationCap,
} from "lucide-react";
import { type SeatingPlan, type Bench, type Seat, type Student, type Examination, type CollegeSettings } from "@/lib/data-store";

export default function SeatingPage() {
  const { role, isStudent } = useAuth();

  const [loading, setLoading] = useState(true);
  const [plans, setPlans] = useState<SeatingPlan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);

  const [roomName, setRoomName] = useState("Hall C-201");
  const [examinationId, setExaminationId] = useState<number>(1);
  const [examinationName, setExaminationName] = useState("IV Semester End Semester Regular Examinations");
  const [examDate, setExamDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [session, setSession] = useState("09:30 AM – 12:30 PM");

  const [totalBenches, setTotalBenches] = useState<number>(10);
  const [benchesPerRow, setBenchesPerRow] = useState<number>(2);

  const [benches, setBenches] = useState<Bench[]>([]);
  const [eligibleStudents, setEligibleStudents] = useState<Student[]>([]);
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [settings, setSettings] = useState<CollegeSettings | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Manual assign modal state
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [activeSeatTarget, setActiveSeatTarget] = useState<{ benchNumber: number; position: "L" | "R" } | null>(null);
  const [studentSearch, setStudentSearch] = useState("");

  // Print mode: "none" | "door" | "slips"
  const [printMode, setPrintMode] = useState<"none" | "door" | "slips">("none");

  // Load initial data
  useEffect(() => {
    fetch("/api/seating")
      .then((res) => res.json())
      .then((data) => {
        if (data.plans) setPlans(data.plans);
        if (data.eligibleStudents) setEligibleStudents(data.eligibleStudents);
        if (data.examinations) setExaminations(data.examinations);
        if (data.settings) setSettings(data.settings);

        // Load first plan if exists
        if (data.plans && data.plans.length > 0) {
          const first = data.plans[0];
          setSelectedPlanId(first.id);
          setRoomName(first.roomName);
          setExaminationId(first.examinationId);
          setExaminationName(first.examinationName);
          setExamDate(first.examDate);
          setSession(first.session);
          setTotalBenches(first.totalBenches);
          setBenchesPerRow(first.benchesPerRow || 2);
          setBenches(first.benches);
        } else {
          // Initialize fresh empty grid
          buildFreshGrid(10, 2);
        }
      })
      .catch((err) => console.error("Error loading seating data:", err))
      .finally(() => setLoading(false));
  }, []);

  // Helper to build empty benches grid
  const buildFreshGrid = (count: number, perRow: number) => {
    const fresh: Bench[] = [];
    for (let i = 1; i <= count; i++) {
      const code = `B-${i < 10 ? "0" + i : i}`;
      fresh.push({
        benchNumber: i,
        benchCode: code,
        leftSeat: {
          seatId: `${code}-L`,
          benchNumber: i,
          position: "L",
        },
        rightSeat: {
          seatId: `${code}-R`,
          benchNumber: i,
          position: "R",
        },
      });
    }
    setBenches(fresh);
  };

  // Re-dimension grid if user modifies total benches or benches per row
  const handleDimensionChange = (newTotal: number, newPerRow: number) => {
    const validTotal = Math.max(1, Math.min(100, newTotal));
    const validPerRow = Math.max(1, Math.min(10, newPerRow));
    setTotalBenches(validTotal);
    setBenchesPerRow(validPerRow);

    // Keep existing seat assignments if bench index exists
    const updated: Bench[] = [];
    for (let i = 1; i <= validTotal; i++) {
      const code = `B-${i < 10 ? "0" + i : i}`;
      const existing = benches.find((b) => b.benchNumber === i);
      if (existing) {
        updated.push({
          ...existing,
          benchNumber: i,
          benchCode: code,
        });
      } else {
        updated.push({
          benchNumber: i,
          benchCode: code,
          leftSeat: {
            seatId: `${code}-L`,
            benchNumber: i,
            position: "L",
          },
          rightSeat: {
            seatId: `${code}-R`,
            benchNumber: i,
            position: "R",
          },
        });
      }
    }
    setBenches(updated);
  };

  // Select a saved plan
  const handleSelectPlan = (plan: SeatingPlan) => {
    setSelectedPlanId(plan.id);
    setRoomName(plan.roomName);
    setExaminationId(plan.examinationId);
    setExaminationName(plan.examinationName);
    setExamDate(plan.examDate);
    setSession(plan.session);
    setTotalBenches(plan.totalBenches);
    setBenchesPerRow(plan.benchesPerRow || 2);
    setBenches(plan.benches);
  };

  // Auto-generate diagonal anti-cheating seating plan
  const handleAutoGenerateDiagonal = () => {
    if (eligibleStudents.length === 0) {
      alert("No eligible students found to seat.");
      return;
    }

    // Group students by branch/department
    const branchMap: Record<string, Student[]> = {};
    eligibleStudents.forEach((st) => {
      const deptCode =
        st.department.includes("Computer") || st.department.includes("CSE")
          ? "CSE"
          : st.department.includes("Information") || st.department.includes("ISE")
          ? "ISE"
          : st.department.includes("Electronics") || st.department.includes("ECE")
          ? "ECE"
          : st.department.includes("Mechanical")
          ? "MECH"
          : st.department.includes("Management")
          ? "MBA"
          : "AIML";

      if (!branchMap[deptCode]) branchMap[deptCode] = [];
      branchMap[deptCode].push(st);
    });

    const branchKeys = Object.keys(branchMap);
    // Prefer alternating between two major branches (e.g. CSE & ECE or CSE & AIML)
    const branchA = branchKeys[0] || "CSE";
    const branchB = branchKeys[1] || branchKeys[0] || "AIML";
    const branchC = branchKeys[2] || branchB;

    const poolA = [...(branchMap[branchA] || [])];
    const poolB = [...(branchMap[branchB] || [])];
    const poolC = [...(branchMap[branchC] || [])];

    // Combine any other students
    const otherPool: Student[] = [];
    branchKeys.forEach((key) => {
      if (key !== branchA && key !== branchB && key !== branchC) {
        otherPool.push(...(branchMap[key] || []));
      }
    });

    // Generate new benches with alternating diagonal pattern
    const updated: Bench[] = benches.map((bench, idx) => {
      const rowIndex = Math.floor(idx / benchesPerRow);
      const colIndex = idx % benchesPerRow;
      const code = bench.benchCode;

      // Checkerboard diagonal logic:
      // Even row: Left gets Branch A, Right gets Branch B (or C if col is odd)
      // Odd row: Left gets Branch B, Right gets Branch A (diagonally switched!)
      const isEvenRow = rowIndex % 2 === 0;

      let leftStudent: Student | undefined;
      let rightStudent: Student | undefined;

      if (isEvenRow) {
        if (colIndex % 2 === 0) {
          leftStudent = poolA.shift() || poolB.shift() || otherPool.shift();
          rightStudent = poolB.shift() || poolA.shift() || otherPool.shift();
        } else {
          leftStudent = poolC.shift() || poolB.shift() || otherPool.shift();
          rightStudent = poolA.shift() || poolB.shift() || otherPool.shift();
        }
      } else {
        if (colIndex % 2 === 0) {
          leftStudent = poolB.shift() || poolA.shift() || otherPool.shift();
          rightStudent = poolA.shift() || poolB.shift() || otherPool.shift();
        } else {
          leftStudent = poolA.shift() || poolC.shift() || otherPool.shift();
          rightStudent = poolC.shift() || poolB.shift() || otherPool.shift();
        }
      }

      const getDeptTag = (s?: Student) => {
        if (!s) return "";
        if (s.department.includes("Computer") || s.department.includes("CSE")) return "CSE";
        if (s.department.includes("Electronics") || s.department.includes("ECE")) return "ECE";
        if (s.department.includes("Information") || s.department.includes("ISE")) return "ISE";
        if (s.department.includes("Management") || s.department.includes("MBA")) return "MBA";
        return "AIML";
      };

      return {
        ...bench,
        leftSeat: {
          seatId: `${code}-L`,
          benchNumber: bench.benchNumber,
          position: "L",
          studentId: leftStudent?.id,
          studentName: leftStudent?.name,
          usn: leftStudent?.usn,
          branch: getDeptTag(leftStudent),
          subjectCode: leftStudent ? "CS401" : undefined,
        },
        rightSeat: {
          seatId: `${code}-R`,
          benchNumber: bench.benchNumber,
          position: "R",
          studentId: rightStudent?.id,
          studentName: rightStudent?.name,
          usn: rightStudent?.usn,
          branch: getDeptTag(rightStudent),
          subjectCode: rightStudent ? "EC401" : undefined,
        },
      };
    });

    setBenches(updated);
  };

  // Clear all assigned seats
  const handleClearGrid = () => {
    const cleared: Bench[] = benches.map((b) => ({
      ...b,
      leftSeat: {
        seatId: `${b.benchCode}-L`,
        benchNumber: b.benchNumber,
        position: "L",
      },
      rightSeat: {
        seatId: `${b.benchCode}-R`,
        benchNumber: b.benchNumber,
        position: "R",
      },
    }));
    setBenches(cleared);
  };

  // Remove a single candidate from a seat
  const handleRemoveSeat = (benchNumber: number, position: "L" | "R") => {
    setBenches((prev) =>
      prev.map((b) => {
        if (b.benchNumber === benchNumber) {
          if (position === "L") {
            return {
              ...b,
              leftSeat: {
                seatId: `${b.benchCode}-L`,
                benchNumber,
                position: "L",
              },
            };
          } else {
            return {
              ...b,
              rightSeat: {
                seatId: `${b.benchCode}-R`,
                benchNumber,
                position: "R",
              },
            };
          }
        }
        return b;
      })
    );
  };

  // Open manual assign modal
  const handleOpenAssignModal = (benchNumber: number, position: "L" | "R") => {
    setActiveSeatTarget({ benchNumber, position });
    setStudentSearch("");
    setAssignModalOpen(true);
  };

  // Assign a selected student to the active seat
  const handleAssignStudent = (student: Student) => {
    if (!activeSeatTarget) return;

    const deptTag =
      student.department.includes("Computer") || student.department.includes("CSE")
        ? "CSE"
        : student.department.includes("Electronics") || student.department.includes("ECE")
        ? "ECE"
        : student.department.includes("Information") || student.department.includes("ISE")
        ? "ISE"
        : student.department.includes("Management") || student.department.includes("MBA")
        ? "MBA"
        : "AIML";

    setBenches((prev) =>
      prev.map((b) => {
        if (b.benchNumber === activeSeatTarget.benchNumber) {
          if (activeSeatTarget.position === "L") {
            return {
              ...b,
              leftSeat: {
                seatId: `${b.benchCode}-L`,
                benchNumber: b.benchNumber,
                position: "L",
                studentId: student.id,
                studentName: student.name,
                usn: student.usn,
                branch: deptTag,
                subjectCode: "CS401",
              },
            };
          } else {
            return {
              ...b,
              rightSeat: {
                seatId: `${b.benchCode}-R`,
                benchNumber: b.benchNumber,
                position: "R",
                studentId: student.id,
                studentName: student.name,
                usn: student.usn,
                branch: deptTag,
                subjectCode: "EC401",
              },
            };
          }
        }
        return b;
      })
    );

    setAssignModalOpen(false);
    setActiveSeatTarget(null);
  };

  // Save current seating plan to database
  const handleSavePlan = async () => {
    setSaving(true);
    try {
      const payload = {
        id: selectedPlanId || undefined,
        roomName,
        examinationId,
        examinationName,
        examDate,
        session,
        totalBenches,
        benchesPerRow,
        benches,
      };

      const res = await fetch("/api/seating", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const saved: SeatingPlan = await res.json();
        setSelectedPlanId(saved.id);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);

        // Update plans list
        setPlans((prev) => {
          const idx = prev.findIndex((p) => p.id === saved.id);
          if (idx !== -1) {
            const next = [...prev];
            next[idx] = saved;
            return next;
          }
          return [saved, ...prev];
        });
      }
    } catch (err) {
      console.error("Error saving seating plan:", err);
    } finally {
      setSaving(false);
    }
  };

  // Filter students for manual modal
  const assignedUsns = useMemo(() => {
    const set = new Set<string>();
    benches.forEach((b) => {
      if (b.leftSeat.usn) set.add(b.leftSeat.usn);
      if (b.rightSeat.usn) set.add(b.rightSeat.usn);
    });
    return set;
  }, [benches]);

  const filteredStudents = useMemo(() => {
    const q = studentSearch.trim().toLowerCase();
    return eligibleStudents.filter(
      (s) =>
        (s.name.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q) || s.department.toLowerCase().includes(q))
    );
  }, [eligibleStudents, studentSearch]);

  // Statistics
  const totalSeats = benches.length * 2;
  const occupiedSeats = benches.reduce((acc, b) => {
    let cnt = 0;
    if (b.leftSeat.usn) cnt++;
    if (b.rightSeat.usn) cnt++;
    return acc + cnt;
  }, 0);
  const vacantSeats = totalSeats - occupiedSeats;

  // Department color helper
  const getBranchBadgeStyle = (branch?: string) => {
    switch (branch) {
      case "CSE":
        return "bg-emerald-950/70 text-emerald-300 border-emerald-700/50";
      case "AIML":
      case "AI":
        return "bg-purple-950/70 text-purple-300 border-purple-700/50";
      case "ECE":
      case "EC":
        return "bg-amber-950/70 text-amber-300 border-amber-700/50";
      case "ISE":
      case "IS":
        return "bg-cyan-950/70 text-cyan-300 border-cyan-700/50";
      default:
        return "bg-neutral-800 text-neutral-300 border-neutral-700";
    }
  };

  // Print trigger
  const handlePrint = (mode: "door" | "slips") => {
    setPrintMode(mode);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  if (isStudent) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto my-16 text-center space-y-4">
          <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-8">
            <AlertCircle size={28} className="text-amber-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white">Examination Cell Access Only</h3>
            <p className="text-xs text-[#8d929d]">
              Examination room seating charts and invigilator arrangements are managed by the Examination Cell.
            </p>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1f2229] pb-4 no-print">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Examination Cell</span>
              <span className="text-neutral-600">/</span>
              <Badge variant="neutral">Seating Matrix</Badge>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <LayoutGrid size={22} className="text-white" /> Pictorial Seating Arrangement
            </h1>
            <p className="text-xs text-[#8d929d] mt-1">
              Dual-desk seating allocation matrix with anti-cheating diagonal branch interleaving.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePrint("door")}
              className="text-xs"
            >
              <Printer size={13} /> Print Door Chart
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePrint("slips")}
              className="text-xs"
            >
              <Tag size={13} /> Print Desk Slips
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleAutoGenerateDiagonal}
              className="text-xs font-semibold"
            >
              <Sparkles size={13} /> Auto Diagonal Seating
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSavePlan}
              disabled={saving}
              className="text-xs font-semibold"
            >
              <Save size={13} /> {saving ? "Saving..." : saveSuccess ? "Saved!" : "Save Plan"}
            </Button>
          </div>
        </div>

        {/* Configuration Bar */}
        <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-4 no-print">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
            <div>
              <label className="text-[11px] font-semibold text-[#8d929d] uppercase block mb-1">Room / Hall</label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full bg-[#0c0d10] border border-[#272b35] text-white px-3 py-1.5 rounded-[5px] text-xs font-semibold focus:outline-none focus:border-neutral-400"
                placeholder="e.g. Hall C-201"
              />
            </div>

            <div className="lg:col-span-2">
              <label className="text-[11px] font-semibold text-[#8d929d] uppercase block mb-1">Examination Session</label>
              <select
                value={examinationId}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setExaminationId(id);
                  const found = examinations.find((x) => x.id === id);
                  if (found) setExaminationName(found.name);
                }}
                className="w-full bg-[#0c0d10] border border-[#272b35] text-white px-3 py-1.5 rounded-[5px] text-xs font-medium focus:outline-none focus:border-neutral-400"
              >
                {examinations.map((ex) => (
                  <option key={ex.id} value={ex.id}>
                    {ex.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8d929d] uppercase block mb-1">Total Benches</label>
              <input
                type="number"
                min="1"
                max="60"
                value={totalBenches}
                onChange={(e) => handleDimensionChange(Number(e.target.value), benchesPerRow)}
                className="w-full bg-[#0c0d10] border border-[#272b35] text-white px-3 py-1.5 rounded-[5px] text-xs font-mono font-bold focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-[#8d929d] uppercase block mb-1">Benches Per Row</label>
              <input
                type="number"
                min="1"
                max="6"
                value={benchesPerRow}
                onChange={(e) => handleDimensionChange(totalBenches, Number(e.target.value))}
                className="w-full bg-[#0c0d10] border border-[#272b35] text-white px-3 py-1.5 rounded-[5px] text-xs font-mono font-bold focus:outline-none focus:border-neutral-400"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearGrid}
                className="w-full text-xs text-neutral-400 hover:text-white"
              >
                <Trash2 size={12} /> Clear Seats
              </Button>
            </div>
          </div>

          {/* Quick Metrics & Saved Plans Pills */}
          <div className="mt-4 pt-3 border-t border-[#1f2229] flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-4 text-[#8d929d]">
              <span>
                Total Desks: <strong className="text-white font-mono">{totalBenches}</strong> ({totalSeats} Seats)
              </span>
              <span>
                Occupied: <strong className="text-emerald-400 font-mono">{occupiedSeats}</strong>
              </span>
              <span>
                Available: <strong className="text-neutral-400 font-mono">{vacantSeats}</strong>
              </span>
              <span>
                Layout: <strong className="text-white font-mono">{Math.ceil(totalBenches / benchesPerRow)} Rows × {benchesPerRow} Columns</strong>
              </span>
            </div>

            {plans.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-[#6f7584]">Saved Halls:</span>
                {plans.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPlan(p)}
                    className={`px-2.5 py-0.5 rounded-[3px] text-[11px] font-medium transition-colors ${
                      selectedPlanId === p.id
                        ? "bg-white text-black font-bold"
                        : "bg-[#181a20] text-[#9ca3af] hover:text-white hover:bg-[#20232b]"
                    }`}
                  >
                    {p.roomName}
                  </button>
                ))}
              </div>
            )}
          </div>
        </Card>

        {/* Diagonal Seating Notice Banner */}
        <div className="p-3 bg-[#131519] border border-[#23262d] rounded-[5px] flex items-center justify-between text-xs text-[#9ca3af] no-print">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>
              <strong>Anti-Cheating Principle:</strong> Alternating branches (<code className="text-emerald-300">CSE</code>, <code className="text-purple-300">AIML</code>, <code className="text-amber-300">ECE</code>) placed diagonally across adjacent desks so candidates never sit adjacent or behind the same paper.
            </span>
          </div>
          <div className="flex items-center gap-3 font-mono text-[11px]">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-[2px] bg-emerald-500 inline-block"></span> CSE
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-[2px] bg-purple-500 inline-block"></span> AIML
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-[2px] bg-amber-500 inline-block"></span> ECE
            </span>
          </div>
        </div>

        {/* Pictorial Bench Cards Grid */}
        <div
          className="grid gap-4 no-print"
          style={{
            gridTemplateColumns: `repeat(${benchesPerRow}, minmax(0, 1fr))`,
          }}
        >
          {benches.map((bench) => {
            const hasLeft = Boolean(bench.leftSeat?.usn);
            const hasRight = Boolean(bench.rightSeat?.usn);

            return (
              <Card
                key={bench.benchNumber}
                className="rounded-[5px] border border-[#23262d] bg-[#131519] p-4 flex flex-col justify-between hover:border-[#2f3440] transition-colors shadow-lg"
              >
                {/* Bench Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#1f2229] mb-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-[3px] bg-[#1c1f26] border border-[#2a2e39] text-xs font-mono font-bold text-white tracking-wider">
                      {bench.benchCode}
                    </span>
                    <span className="text-[11px] text-[#7d8392]">
                      Bench #{bench.benchNumber}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-[3px] ${
                      hasLeft && hasRight
                        ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/40"
                        : hasLeft || hasRight
                        ? "bg-amber-950/60 text-amber-300 border border-amber-800/40"
                        : "bg-neutral-900 text-neutral-500"
                    }`}
                  >
                    {hasLeft && hasRight ? "Full (2/2)" : hasLeft || hasRight ? "Partial (1/2)" : "Empty"}
                  </span>
                </div>

                {/* Dual-Seat Visual Layout [ Left Seat | Right Seat ] */}
                <div className="grid grid-cols-2 gap-3 bg-[#0c0d10] p-3 rounded-[5px] border border-[#1f2229]">
                  {/* Left Seat */}
                  <div className="flex flex-col justify-between p-2.5 rounded-[4px] border border-[#232731] bg-[#111317] min-h-[90px] relative group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold uppercase text-[#6d7382]">
                        Seat L
                      </span>
                      {hasLeft && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSeat(bench.benchNumber, "L")}
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity"
                          title="Remove from seat"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {hasLeft ? (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-[2px] border ${getBranchBadgeStyle(
                              bench.leftSeat.branch
                            )}`}
                          >
                            {bench.leftSeat.branch || "CS"}
                          </span>
                          <span className="font-mono text-xs font-bold text-white tracking-wide">
                            {bench.leftSeat.usn}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-neutral-300 truncate">
                          {bench.leftSeat.studentName}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(bench.benchNumber, "L")}
                        className="my-auto py-2 flex flex-col items-center justify-center text-neutral-500 hover:text-white border border-dashed border-[#2a2e3b] hover:border-neutral-400 rounded-[3px] transition-colors"
                      >
                        <Plus size={14} className="mb-0.5" />
                        <span className="text-[10px] font-semibold">+ Assign</span>
                      </button>
                    )}
                  </div>

                  {/* Right Seat */}
                  <div className="flex flex-col justify-between p-2.5 rounded-[4px] border border-[#232731] bg-[#111317] min-h-[90px] relative group">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold uppercase text-[#6d7382]">
                        Seat R
                      </span>
                      {hasRight && (
                        <button
                          type="button"
                          onClick={() => handleRemoveSeat(bench.benchNumber, "R")}
                          className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity"
                          title="Remove from seat"
                        >
                          <X size={12} />
                        </button>
                      )}
                    </div>

                    {hasRight ? (
                      <div>
                        <div className="flex items-center gap-1.5 mb-1">
                          <span
                            className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-[2px] border ${getBranchBadgeStyle(
                              bench.rightSeat.branch
                            )}`}
                          >
                            {bench.rightSeat.branch || "AI"}
                          </span>
                          <span className="font-mono text-xs font-bold text-white tracking-wide">
                            {bench.rightSeat.usn}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium text-neutral-300 truncate">
                          {bench.rightSeat.studentName}
                        </p>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleOpenAssignModal(bench.benchNumber, "R")}
                        className="my-auto py-2 flex flex-col items-center justify-center text-neutral-500 hover:text-white border border-dashed border-[#2a2e3b] hover:border-neutral-400 rounded-[3px] transition-colors"
                      >
                        <Plus size={14} className="mb-0.5" />
                        <span className="text-[10px] font-semibold">+ Assign</span>
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Manual Assign Student Modal */}
        {assignModalOpen && activeSeatTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 no-print">
            <Card className="rounded-[5px] border border-[#2d323f] bg-[#131519] w-full max-w-lg p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#1f2229] pb-3">
                <div>
                  <h3 className="text-base font-bold text-white">
                    Assign Student to Bench {activeSeatTarget.benchNumber} ({activeSeatTarget.position === "L" ? "Left Seat" : "Right Seat"})
                  </h3>
                  <p className="text-xs text-[#8d929d]">
                    Select an eligible candidate from the hall ticket clearance registry.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAssignModalOpen(false)}
                  className="text-neutral-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search size={15} className="absolute left-3 top-2.5 text-neutral-500" />
                <input
                  type="text"
                  placeholder="Type USN, Student Name, or Department..."
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full bg-[#0c0d10] border border-[#272b35] text-white pl-9 pr-3 py-2 rounded-[5px] text-xs focus:outline-none focus:border-white"
                  autoFocus
                />
              </div>

              {/* Students Scroll List */}
              <div className="max-h-64 overflow-y-auto space-y-2 pr-1 divide-y divide-[#1f2229]">
                {filteredStudents.length === 0 ? (
                  <p className="text-center py-6 text-xs text-neutral-500">No eligible candidates match search.</p>
                ) : (
                  filteredStudents.map((st) => {
                    const alreadyAssigned = assignedUsns.has(st.usn);
                    return (
                      <div
                        key={st.id}
                        className="pt-2 flex items-center justify-between hover:bg-[#181a20] p-2 rounded-[4px] transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">{st.usn}</span>
                            <span className="text-[10px] font-semibold text-neutral-400">
                              {st.department}
                            </span>
                            {alreadyAssigned && (
                              <Badge variant="warning" className="text-[9px] py-0 px-1">
                                Already Seated
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-neutral-300 font-medium">{st.name}</p>
                        </div>
                        <Button
                          variant={alreadyAssigned ? "outline" : "primary"}
                          size="sm"
                          onClick={() => handleAssignStudent(st)}
                          className="text-xs h-7"
                        >
                          {alreadyAssigned ? "Move Here" : "Place"}
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="flex justify-end pt-2 border-t border-[#1f2229]">
                <Button variant="secondary" size="sm" onClick={() => setAssignModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Printable Section: Official Door Notice & Desk Slips */}
        {printMode === "door" && (
          <div className="print-page bg-white text-black p-8 rounded-[5px] font-serif select-text">
            {/* Door Notice Header */}
            <div className="text-center border-b-2 border-black pb-4 mb-4">
              <h2 className="text-xl font-bold uppercase tracking-wider font-sans">
                {settings?.collegeName || "P A COLLEGE OF ENGINEERING"}
              </h2>
              <p className="text-xs font-sans font-medium text-neutral-700">
                {settings?.collegeCode || "PACE / AUTONOMOUS EXAM CELL"} · Autonomous Examination Division
              </p>
              <div className="mt-2 inline-block bg-black text-white px-4 py-1 text-sm font-bold font-sans uppercase tracking-widest rounded-[2px]">
                EXAMINATION HALL SEATING CHART · DOOR NOTICE
              </div>
            </div>

            {/* Hall Particulars */}
            <div className="grid grid-cols-4 gap-4 py-3 border-b border-black text-xs font-sans mb-4">
              <div>
                <span className="text-[10px] font-bold uppercase text-neutral-600 block">Examination Room</span>
                <span className="font-bold text-sm uppercase">{roomName}</span>
              </div>
              <div className="col-span-2">
                <span className="text-[10px] font-bold uppercase text-neutral-600 block">Examination Title</span>
                <span className="font-bold">{examinationName}</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase text-neutral-600 block">Date & Timing</span>
                <span className="font-bold">{examDate} ({session})</span>
              </div>
            </div>

            {/* Printable Table of Benches */}
            <table className="w-full border-collapse border border-black text-xs font-sans">
              <thead>
                <tr className="bg-neutral-100 border-b border-black font-bold text-center">
                  <th className="border border-black p-2 w-20">Bench #</th>
                  <th className="border border-black p-2">Seat Left (USN & Name)</th>
                  <th className="border border-black p-2 w-20">Branch L</th>
                  <th className="border border-black p-2">Seat Right (USN & Name)</th>
                  <th className="border border-black p-2 w-20">Branch R</th>
                </tr>
              </thead>
              <tbody>
                {benches.map((b) => (
                  <tr key={b.benchNumber} className="border-b border-black text-center">
                    <td className="border border-black p-2 font-mono font-bold bg-neutral-50">{b.benchCode}</td>
                    <td className="border border-black p-2 text-left font-mono">
                      {b.leftSeat.usn ? (
                        <span>
                          <strong>{b.leftSeat.usn}</strong> — {b.leftSeat.studentName}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">-- Vacant --</span>
                      )}
                    </td>
                    <td className="border border-black p-2 font-bold">{b.leftSeat.branch || "-"}</td>
                    <td className="border border-black p-2 text-left font-mono">
                      {b.rightSeat.usn ? (
                        <span>
                          <strong>{b.rightSeat.usn}</strong> — {b.rightSeat.studentName}
                        </span>
                      ) : (
                        <span className="text-neutral-400 italic">-- Vacant --</span>
                      )}
                    </td>
                    <td className="border border-black p-2 font-bold">{b.rightSeat.branch || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Door Notice Footer */}
            <div className="mt-8 pt-4 border-t border-black flex justify-between items-end font-sans text-xs">
              <div>
                <p className="text-[10px] text-neutral-600">Chief Superintendent / Hall Invigilator Signature</p>
                <div className="h-10 w-48 border-b border-black mt-2"></div>
              </div>
              <div className="text-right">
                <p className="font-bold">{settings?.controllerName || "Controller of Examinations"}</p>
                <p className="text-[10px] text-neutral-600">Issued by Central Autonomous Examination Office</p>
              </div>
            </div>
          </div>
        )}

        {/* Printable Section: Individual Desk Slips to Tape on Tables */}
        {printMode === "slips" && (
          <div className="print-page bg-white text-black p-4 font-sans select-text">
            <h3 className="text-center text-xs font-bold uppercase mb-4 tracking-wider no-print">
              Desk Slips (Cut along dashed lines and stick on benches)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {benches.map((b) => (
                <div
                  key={b.benchNumber}
                  className="border-2 border-dashed border-black p-3 rounded-[3px] text-xs flex flex-col justify-between min-h-[130px]"
                >
                  <div className="flex justify-between items-center border-b border-black pb-1 mb-2">
                    <span className="font-mono font-bold text-sm bg-black text-white px-2 py-0.5 rounded-[1px]">
                      {b.benchCode}
                    </span>
                    <span className="font-bold text-[10px] uppercase text-neutral-700">{roomName}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="border-r border-neutral-400 pr-2">
                      <span className="text-[9px] font-bold uppercase text-neutral-500 block">Seat Left</span>
                      <span className="font-mono font-bold block">{b.leftSeat.usn || "VACANT"}</span>
                      <span className="text-[10px] truncate block">{b.leftSeat.studentName || ""}</span>
                      {b.leftSeat.branch && (
                        <span className="text-[9px] font-bold uppercase bg-neutral-200 px-1 rounded-[1px]">
                          {b.leftSeat.branch}
                        </span>
                      )}
                    </div>

                    <div className="pl-1">
                      <span className="text-[9px] font-bold uppercase text-neutral-500 block">Seat Right</span>
                      <span className="font-mono font-bold block">{b.rightSeat.usn || "VACANT"}</span>
                      <span className="text-[10px] truncate block">{b.rightSeat.studentName || ""}</span>
                      {b.rightSeat.branch && (
                        <span className="text-[9px] font-bold uppercase bg-neutral-200 px-1 rounded-[1px]">
                          {b.rightSeat.branch}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="border-t border-dashed border-neutral-300 pt-1 mt-2 text-[8px] text-neutral-500 flex justify-between">
                    <span>{examinationName.slice(0, 30)}...</span>
                    <span>{examDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
