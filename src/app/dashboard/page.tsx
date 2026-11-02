"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { HallTicketDocument } from "@/components/hall-ticket-document";
import { type HallTicket, type Examination, type CollegeSettings } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";
import {
  Users,
  ShieldCheck,
  CalendarDays,
  ClipboardCheck,
  Building2,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  FileCheck2,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<{
    totals: {
      students: number;
      eligibleStudents: number;
      ineligibleStudents: number;
      departments: number;
      subjects: number;
      examinations: number;
      hallTickets: number;
    };
    recentHallTickets: HallTicket[];
    upcomingExaminations: Examination[];
    departmentCounts: { code: string; name: string; count: number }[];
  } | null>(null);

  const [settings, setSettings] = useState<CollegeSettings | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [previewTicket, setPreviewTicket] = useState<HallTicket | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [dashRes, setRes] = await Promise.all([
          fetch("/api/dashboard"),
          fetch("/api/settings"),
        ]);
        if (dashRes.ok) {
          const dashJson = await dashRes.json();
          setData(dashJson);
        }
        if (setRes.ok) {
          const setJson = await setRes.json();
          setSettings(setJson);
        }
      } catch (err) {
        console.error("Dashboard load failed:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 rounded-[5px] bg-[var(--muted)] animate-pulse border border-[var(--border)]" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const totals = data?.totals;

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["ADMIN", "STAFF"]}>
        <div className="space-y-8">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--muted-foreground)]">
                Controller of Examinations
              </span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Autonomous Examination Command</h2>
            <p className="text-xs text-[var(--muted-foreground)] mt-1">
              Active verification, candidate eligibility compliance, and admit card issuing registers.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/hall-tickets">
              <Button variant="primary">
                <PlusCircle size={15} /> Issue New Admit Cards
              </Button>
            </Link>
          </div>
        </div>

        {/* KPI Grid (Strictly 5px Border Radius & Charcoal Theme) */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {/* Total Candidates */}
          <Card className="p-5 hover:border-[var(--ring)] transition-colors">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span className="font-medium">Total Registered Candidates</span>
              <Users size={16} className="text-[var(--muted-foreground)]" />
            </div>
            <div className="mt-3 text-3xl font-bold text-[var(--foreground)] font-mono tracking-tight">
              {totals?.students ?? 0}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--muted-foreground)] border-t border-[var(--border)] pt-2.5">
              <span>Across {totals?.departments ?? 0} departments</span>
              <Link href="/students" className="text-[var(--foreground)] hover:underline flex items-center gap-1 font-medium">
                Register <ArrowRight size={11} />
              </Link>
            </div>
          </Card>

          {/* Exam Eligible Candidates */}
          <Card className="p-5 hover:border-[var(--ring)] transition-colors">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span className="font-medium">Exam Eligible Candidates</span>
              <FileCheck2 size={16} className="text-[var(--foreground)]" />
            </div>
            <div className="mt-3 text-3xl font-bold text-[var(--foreground)] font-mono tracking-tight">
              {totals?.eligibleStudents ?? 0}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--muted-foreground)] border-t border-[var(--border)] pt-2.5">
              <span>Attendance &ge; 75% & Fees Clear</span>
            </div>
          </Card>

          {/* Ineligible / Flagged Candidates */}
          <Card className="p-5 hover:border-[var(--ring)] transition-colors">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span className="font-medium">Flagged / Ineligible</span>
              <ShieldCheck size={16} className="text-[var(--foreground)]" />
            </div>
            <div className="mt-3 text-3xl font-bold text-[var(--foreground)] font-mono tracking-tight">
              {totals?.ineligibleStudents ?? 0}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--muted-foreground)] border-t border-[var(--border)] pt-2.5">
              <span>Attendance short or fee dues</span>
            </div>
          </Card>

          {/* Issued Hall Tickets */}
          <Card className="p-5 hover:border-[var(--ring)] transition-colors">
            <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)]">
              <span className="font-medium">Admit Cards Issued</span>
              <ClipboardCheck size={16} className="text-[var(--foreground)]" />
            </div>
            <div className="mt-3 text-3xl font-bold text-[var(--foreground)] font-mono tracking-tight">
              {totals?.hallTickets ?? 0}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-[var(--muted-foreground)] border-t border-[var(--border)] pt-2.5">
              <span>With dynamic QR verification</span>
              <Link href="/hall-tickets" className="text-[var(--foreground)] hover:underline flex items-center gap-1 font-medium">
                View Register <ArrowRight size={11} />
              </Link>
            </div>
          </Card>
        </div>

        {/* Content Section: 2 Columns */}
        <div className="grid gap-6 lg:grid-cols-[1.2fr_.8fr]">
          {/* Upcoming Examinations */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between p-5 border-b border-[var(--border)]">
              <div>
                <CardTitle>Active Examination Schedules</CardTitle>
                <CardDescription>Upcoming semester exam windows and test centers</CardDescription>
              </div>
              <Link href="/examinations">
                <Button variant="secondary" size="sm">
                  View All <ArrowRight size={13} />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-[var(--border)]">
              {data?.upcomingExaminations?.map((exam) => (
                <div key={exam.id} className="p-5 flex items-center justify-between gap-4 hover:bg-[var(--accent)] transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-[4px] bg-[var(--muted)] border border-[var(--border)] flex flex-col items-center justify-center font-mono text-[10px] text-[var(--foreground)]">
                      <span>{new Date(exam.startDate).toLocaleDateString("en", { month: "short" }).toUpperCase()}</span>
                      <span className="font-bold text-sm leading-none mt-0.5">{new Date(exam.startDate).getDate()}</span>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[var(--foreground)]">{exam.name}</h4>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">
                        {exam.examType} · Semester {exam.semester} · {exam.center}
                      </p>
                      <p className="text-[10px] font-mono text-[var(--muted-foreground)] mt-1">
                        Window: {formatDate(exam.startDate)} &mdash; {formatDate(exam.endDate)} ({exam.session})
                      </p>
                    </div>
                  </div>
                  <Badge variant={exam.status === "Published" ? "success" : "neutral"}>
                    {exam.status}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Department Breakdown */}
          <Card>
            <CardHeader className="p-5 border-b border-[var(--border)] flex flex-row items-center justify-between">
              <div>
                <CardTitle>Department Allotments</CardTitle>
                <CardDescription>Live candidate enrollments by academic department</CardDescription>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] px-2 py-0.5 rounded-[3px] bg-[var(--muted)] border border-[var(--border)]">
                Live Register
              </span>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              {data?.departmentCounts?.map((dept) => {
                const totalStudents = data.totals.students || 1;
                const percent = Math.min(100, Math.round((dept.count / totalStudents) * 100));
                return (
                  <div key={dept.code} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-[var(--foreground)]">{dept.name}</span>
                      <span className="font-mono text-[var(--foreground)] font-semibold">
                        {dept.count} {dept.count === 1 ? "candidate" : "candidates"}
                      </span>
                    </div>
                    <div className="h-2 w-full rounded-[2px] bg-[var(--muted)] border border-[var(--border)] overflow-hidden">
                      <div
                        className="h-full bg-[var(--foreground)] transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Recently Generated Hall Tickets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between border-b border-[var(--border)] p-5">
            <div>
              <CardTitle>Recently Issued Admit Cards</CardTitle>
              <CardDescription>Official examination documents with digital verification tokens</CardDescription>
            </div>
            <Link href="/hall-tickets">
              <Button variant="secondary" size="sm">
                Open Register <ArrowRight size={13} />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[var(--border)] bg-[var(--muted)] text-[var(--muted-foreground)] text-[11px] font-mono uppercase tracking-wider">
                    <th className="p-4 font-semibold">Ticket No</th>
                    <th className="p-4 font-semibold">Candidate</th>
                    <th className="p-4 font-semibold">USN</th>
                    <th className="p-4 font-semibold">Degree Course</th>
                    <th className="p-4 font-semibold">Examination</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border)]">
                  {data?.recentHallTickets?.map((ticket) => (
                    <tr key={ticket.id} className="hover:bg-[var(--accent)] transition-colors">
                      <td className="p-4 font-mono font-bold text-[var(--foreground)]">{ticket.number}</td>
                      <td className="p-4 font-semibold text-[var(--foreground)]">{ticket.studentName}</td>
                      <td className="p-4 font-mono text-[var(--muted-foreground)]">{ticket.usn}</td>
                      <td className="p-4 text-[var(--foreground)]">{ticket.course}</td>
                      <td className="p-4 text-[var(--muted-foreground)]">{ticket.examinationName}</td>
                      <td className="p-4 text-right">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => setPreviewTicket(ticket)}
                        >
                          <ExternalLink size={13} /> Preview
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hall Ticket Preview Modal */}
      {previewTicket && (
        <Modal
          isOpen={Boolean(previewTicket)}
          onClose={() => setPreviewTicket(null)}
          title="Official Hall Ticket Document"
          subtitle={`Ticket No: ${previewTicket.number} · Candidate: ${previewTicket.studentName}`}
          maxWidth="4xl"
        >
          <HallTicketDocument ticket={previewTicket} settings={settings} onClose={() => setPreviewTicket(null)} />
        </Modal>
      )}
      </RoleGuard>
    </AppLayout>
  );
}
