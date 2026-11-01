"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Printer, CheckCircle2, ShieldCheck, Users, ClipboardCheck, Building2, CalendarDays } from "lucide-react";

export default function ReportsPage() {
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
    departmentCounts: { code: string; name: string; count: number }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch((err) => console.error(err));
  }, []);

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["ADMIN", "STAFF"]}>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 no-print">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Institutional Audit</span>
              <span className="text-neutral-600">/</span>
              <Badge variant="neutral">Official Audit Report</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Examination Readiness Audit</h2>
            <p className="text-xs text-[#8d929d] mt-1">
              Candidate volume, attendance compliance thresholds, and admit card issuing logs.
            </p>
          </div>
          <Button variant="secondary" onClick={() => window.print()}>
            <Printer size={14} /> Print Audit Report
          </Button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-5">
            <span className="text-xs text-[#8d929d] font-medium block">Total Candidate Register</span>
            <span className="text-3xl font-mono font-bold text-white mt-2 block">{data?.totals?.students ?? 0}</span>
            <span className="text-[11px] text-[#717684] mt-1 block">Registered in database</span>
          </Card>
          <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-5">
            <span className="text-xs text-[#8d929d] font-medium block">Admit Card Eligible</span>
            <span className="text-3xl font-mono font-bold text-[#4ade80] mt-2 block">{data?.totals?.eligibleStudents ?? 0}</span>
            <span className="text-[11px] text-[#717684] mt-1 block">Full compliance verified</span>
          </Card>
          <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-5">
            <span className="text-xs text-[#8d929d] font-medium block">Admit Card Holds</span>
            <span className="text-3xl font-mono font-bold text-[#f87171] mt-2 block">{data?.totals?.ineligibleStudents ?? 0}</span>
            <span className="text-[11px] text-[#717684] mt-1 block">Low attendance or fee dues</span>
          </Card>
          <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-5">
            <span className="text-xs text-[#8d929d] font-medium block">Issued & Verified Tickets</span>
            <span className="text-3xl font-mono font-bold text-white mt-2 block">{data?.totals?.hallTickets ?? 0}</span>
            <span className="text-[11px] text-[#717684] mt-1 block">With active QR tokens</span>
          </Card>
        </div>

        {/* Detailed Audit Table */}
        <Card className="rounded-[5px] border border-[#23262d] bg-[#131519]">
          <CardHeader className="p-5 border-b border-[#1f2229]">
            <CardTitle>Departmental Candidate Allocation</CardTitle>
            <CardDescription>Audited volume breakdown by academic division</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1f2229] bg-[#0f1013] text-[#7f8592] text-[11px] font-mono uppercase tracking-wider">
                    <th className="p-4 font-semibold">Department Code</th>
                    <th className="p-4 font-semibold">Department Name</th>
                    <th className="p-4 font-semibold text-right">Registered Candidates</th>
                    <th className="p-4 font-semibold text-right">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2229]">
                  {data?.departmentCounts?.map((d) => (
                    <tr key={d.code} className="hover:bg-[#16181f]">
                      <td className="p-4 font-mono font-bold text-white">{d.code}</td>
                      <td className="p-4 font-medium text-white">{d.name}</td>
                      <td className="p-4 font-mono text-right text-white">{d.count}</td>
                      <td className="p-4 text-right">
                        <Badge variant="success">Verified</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      </RoleGuard>
    </AppLayout>
  );
}
