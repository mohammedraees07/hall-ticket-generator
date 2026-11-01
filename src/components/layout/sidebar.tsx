"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Users,
  Building2,
  GraduationCap,
  BookOpen,
  CalendarDays,
  ClipboardCheck,
  ShieldCheck,
  BarChart3,
  Settings,
  LayoutGrid,
  Menu,
  X,
  LogOut,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  group: string;
};

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, role, isStudent, logout } = useAuth();

  // Distinct, role-separated navigation definitions
  let navItems: NavItem[] = [];

  if (role === "ADMIN") {
    navItems = [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, group: "Workspace" },
      { label: "Students", href: "/students", icon: Users, group: "Academic Records" },
      { label: "Departments", href: "/departments", icon: Building2, group: "Academic Records" },
      { label: "Courses", href: "/courses", icon: GraduationCap, group: "Academic Records" },
      { label: "Subjects", href: "/subjects", icon: BookOpen, group: "Academic Records" },
      { label: "Examinations", href: "/examinations", icon: CalendarDays, group: "Examination Cell" },
      { label: "Hall Tickets", href: "/hall-tickets", icon: ClipboardCheck, group: "Examination Cell" },
      { label: "Seating Plan", href: "/seating", icon: LayoutGrid, group: "Examination Cell" },
      { label: "Verification", href: "/verification", icon: ShieldCheck, group: "Examination Cell" },
      { label: "Reports", href: "/reports", icon: BarChart3, group: "Administration" },
      { label: "Settings", href: "/settings", icon: Settings, group: "Administration" },
    ];
  } else if (role === "ACCOUNTS") {
    navItems = [
      { label: "Fee Clearance", href: "/accounts", icon: ClipboardCheck, group: "Accounts Section" },
    ];
  } else if (role === "PRINCIPAL") {
    navItems = [
      { label: "Exam Approvals", href: "/principal", icon: ClipboardCheck, group: "Principal Office" },
      { label: "Seal & Signature", href: "/principal/settings", icon: Settings, group: "Principal Office" },
    ];
  } else if (role === "STAFF") {
    navItems = [
      { label: "Overview", href: "/dashboard", icon: LayoutDashboard, group: "Workspace" },
      { label: "Students", href: "/students", icon: Users, group: "Academic Records" },
      { label: "Examinations", href: "/examinations", icon: CalendarDays, group: "Examination Cell" },
      { label: "Hall Tickets", href: "/hall-tickets", icon: ClipboardCheck, group: "Examination Cell" },
      { label: "Seating Plan", href: "/seating", icon: LayoutGrid, group: "Examination Cell" },
      { label: "Verification", href: "/verification", icon: ShieldCheck, group: "Examination Cell" },
      { label: "Reports", href: "/reports", icon: BarChart3, group: "Administration" },
    ];
  } else {
    // STUDENT role: dedicated candidate portal
    navItems = [
      { label: "My Admit Card", href: "/student-portal", icon: ClipboardCheck, group: "Candidate Portal" },
    ];
  }

  const groups = Array.from(new Set(navItems.map((item) => item.group)));

  return (
    <>
      {/* Mobile Menu Hamburger (Visible on small screens when drawer is closed) */}
      {!mobileOpen && (
        <div className="fixed top-3 left-4 z-40 md:hidden no-print">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-2 rounded-[5px] bg-[#171920] border border-[#2b2f3a] text-white shadow-md hover:bg-[#20242e] transition-colors"
          >
            <Menu size={18} />
          </button>
        </div>
      )}

      {/* Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Main Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 border-r border-[#1e2128] bg-[#0d0e12] flex flex-col justify-between transition-transform duration-200 ease-in-out md:translate-x-0 no-print",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          {/* Header (No logo box; Title on left, mobile close button 'X' on right) */}
          <div className="flex h-16 items-center justify-between px-5 border-b border-[#1e2128]">
            <div className="min-w-0 pr-2">
              <div className="font-bold text-sm tracking-tight text-white truncate">
                Hall Ticket System
              </div>
              <div className="text-[10px] font-mono uppercase tracking-widest text-[#787e8b]">
                {isStudent ? "Candidate Portal" : "Autonomous Exam Cell"}
              </div>
            </div>

            {/* Mobile Close Button 'X' on the right side */}
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close menu"
              className="md:hidden p-1.5 rounded-[5px] text-[#8e94a3] hover:text-white hover:bg-[#1a1d24] transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Navigation Items Grouped */}
          <div className="py-5 px-3 space-y-6 overflow-y-auto max-h-[calc(100vh-210px)]">
            {groups.map((group) => (
              <div key={group} className="space-y-1">
                <div className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-[#636875] mb-2">
                  {group}
                </div>
                {navItems
                  .filter((item) => item.group === group)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 text-xs font-medium rounded-[5px] transition-colors",
                          isActive
                            ? "bg-[#181a20] text-white border-l-2 border-white pl-2.5 font-semibold"
                            : "text-[#8d929d] hover:bg-[#14151a] hover:text-white"
                        )}
                      >
                        <Icon size={16} strokeWidth={isActive ? 2.2 : 1.8} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
              </div>
            ))}
          </div>
        </div>

        {/* User Session & Logout Footer */}
        <div className="p-3 border-t border-[#1e2128] bg-[#090a0d] space-y-2">
          {user ? (
            <div className="flex items-center justify-between p-2.5 rounded-[5px] border border-[#232732] bg-[#111318]">
              <div className="min-w-0 flex-1 pr-2">
                {/* Full User Name on top line (brackets stripped) */}
                <div className="text-xs font-semibold text-white truncate" title={user.name}>
                  {user.name.replace(/\s*\(.*?\)\s*/g, "").trim()}
                </div>

                {/* Role indicator placed below the name (borderless) */}
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center px-1.5 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider rounded-[3px] bg-[#1a1c23] text-[#cbd0dc]">
                    {role === "ADMIN" ? "Administrator" : role === "STAFF" ? "Exam Staff" : role === "ACCOUNTS" ? "Accounts Officer" : role === "PRINCIPAL" ? "Principal" : "Student"}
                  </span>
                </div>

                {/* User email */}
                <p className="text-[10px] text-[#717684] truncate mt-1">{user.email}</p>
              </div>

              {/* Logout button */}
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="p-1.5 rounded-[4px] text-[#8e94a3] hover:text-white hover:bg-[#1f232d] transition-colors shrink-0"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-center gap-2 w-full py-1.5 px-3 rounded-[5px] bg-[#1a1d24] text-xs font-medium text-white hover:bg-[#252832]"
            >
              Sign In
            </Link>
          )}

          <div className="text-center pt-0.5">
            <p className="text-[10px] font-mono text-[#5b606c]">Examination Division · 2024–25</p>
          </div>
        </div>
      </aside>
    </>
  );
}
