"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { ShieldCheck, ClipboardCheck, GraduationCap } from "lucide-react";


export function Header() {
  const pathname = usePathname();
  const { isStudent, isAccounts, isPrincipal, role } = useAuth();

  const titleMap: Record<string, { title: string; subtitle: string }> = {
    "/dashboard": { title: "Executive Dashboard", subtitle: "Live examination readiness & candidate compliance" },
    "/students": { title: "Student Register", subtitle: "Candidate records, attendance & fee clearance" },
    "/departments": { title: "Academic Departments", subtitle: "Institutional structure & student allocations" },
    "/courses": { title: "Degree Programs", subtitle: "Curricula & branch specifications" },
    "/subjects": { title: "Course Subjects", subtitle: "Syllabus courses & credit allotments" },
    "/examinations": { title: "Examination Windows", subtitle: "Active exam sessions & timetables" },
    "/hall-tickets": { title: "Hall Ticket Generator", subtitle: "Admit card issuing & eligibility compliance" },
    "/verification": { title: "Document Verification", subtitle: "Instant verification of official admit cards" },
    "/student-portal": { title: "Student Admit Card Portal", subtitle: "Candidate access to official examination documents" },
    "/accounts": { title: "Accounts Section", subtitle: "Candidate fee status, dues clearance & fine review" },
    "/principal": { title: "Principal Office", subtitle: "Examination application approvals & clearance endorsements" },
    "/principal/settings": { title: "Principal Seal & Signature", subtitle: "Institutional rubber seal & digital endorsement setup" },
    "/reports": { title: "Examination Reports", subtitle: "Readiness snapshots & candidate registers" },
    "/settings": { title: "Institution Settings", subtitle: "College identity, seals & digital signatures" },
    "/login": { title: "Institutional Sign In", subtitle: "Authentication & Role-Based Access" },
  };

  const current = titleMap[pathname] || { title: "Examination Cell", subtitle: "Autonomous College System" };

  return (
    <header className="h-16 border-b border-[#1e2128] bg-[#0c0d10]/95 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between no-print">
      <div className="pl-12 md:pl-0 min-w-0 pr-2">
        <h1 className="text-xs sm:text-sm font-semibold text-white tracking-tight truncate">{current.title}</h1>
        <p className="text-[10px] sm:text-[11px] text-[#7d8391] hidden sm:block truncate">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {(role === "ADMIN" || role === "STAFF") && (
          <Link href="/verification">
            <Button variant="outline" size="sm" className="h-8 px-2.5 sm:px-3 text-xs">
              <ShieldCheck size={13} />
              <span className="hidden sm:inline">Verify Admit Card</span>
              <span className="sm:hidden">Verify</span>
            </Button>
          </Link>
        )}

        {isStudent ? (
          <Link href="/student-portal">
            <Button variant="primary" size="sm" className="h-8 px-2.5 sm:px-3 text-xs">
              <GraduationCap size={13} />
              <span className="hidden sm:inline">My Admit Card</span>
              <span className="sm:hidden">Portal</span>
            </Button>
          </Link>
        ) : isAccounts ? (
          <Link href="/accounts">
            <Button variant="primary" size="sm" className="h-8 px-2.5 sm:px-3 text-xs">
              <ClipboardCheck size={13} />
              <span className="hidden sm:inline">Fee Clearance</span>
              <span className="sm:hidden">Fees</span>
            </Button>
          </Link>
        ) : isPrincipal ? (
          <Link href="/principal">
            <Button variant="primary" size="sm" className="h-8 px-2.5 sm:px-3 text-xs">
              <ClipboardCheck size={13} />
              <span className="hidden sm:inline">Review Approvals</span>
              <span className="sm:hidden">Approvals</span>
            </Button>
          </Link>
        ) : (
          <Link href="/hall-tickets">
            <Button variant="primary" size="sm" className="h-8 px-2.5 sm:px-3 text-xs">
              <ClipboardCheck size={13} />
              <span className="hidden sm:inline">Issue Tickets</span>
              <span className="sm:hidden">Issue</span>
            </Button>
          </Link>
        )}

      </div>
    </header>
  );
}
