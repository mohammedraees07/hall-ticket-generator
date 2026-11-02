"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ShieldCheck,
  ClipboardCheck,
  GraduationCap,
  Bell,
  CheckCircle2,
  AlertCircle,
  Radio,
  CreditCard,
  Stamp,
  ExternalLink,
  X,
} from "lucide-react";

interface AppNotification {
  id: string;
  type: "broadcast" | "fee_pending" | "principal_pending" | "ticket_ready" | "application_status";
  title: string;
  message: string;
  timestamp: string;
  link: string;
  unread: boolean;
  priority: "low" | "medium" | "high";
  actionLabel?: string;
}

export function Header() {
  const pathname = usePathname();
  const { isStudent, isAccounts, isPrincipal, role } = useAuth();

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      // Quiet fail in background
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 12000);
    return () => clearInterval(interval);
  }, [pathname, role]);

  // Click outside listener for notification dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    setUnreadCount(0);
  };

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--card)]/90 backdrop-blur-md sticky top-0 z-30 px-3 sm:px-6 flex items-center justify-between no-print w-full min-w-0 transition-colors">
      <div className="pl-10 md:pl-0 min-w-0 pr-2">
        <h1 className="text-xs sm:text-sm font-semibold text-[var(--foreground)] tracking-tight truncate max-w-[200px] sm:max-w-none">
          {current.title}
        </h1>
        <p className="text-[10px] sm:text-[11px] text-[var(--muted-foreground)] hidden sm:block truncate">{current.subtitle}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* THEME TOGGLE (Circular expanding ripple + Sun/Moon morph) */}
        <ThemeToggle />

        {/* NOTIFICATION BELL ICON (Visible to Accounts, Principal, Student, Staff, Admin) */}
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-label="View system notifications"
            className="relative h-9 w-9 rounded-[5px] bg-[var(--card)] hover:bg-[var(--accent)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center transition-colors shadow-sm cursor-pointer"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 min-w-[16px] px-1 rounded-full bg-amber-500 text-black text-[9px] font-bold font-mono flex items-center justify-center shadow animate-pulse">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Floating Notification Popover Menu */}
          {dropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-[5px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              <div className="p-3.5 border-b border-[var(--border)] flex items-center justify-between bg-[var(--muted)]">
                <div className="flex items-center gap-2">
                  <Bell size={14} className="text-amber-500" />
                  <span className="text-xs font-bold text-[var(--foreground)]">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-[3px] bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-600/30 font-mono font-bold">
                      {unreadCount} NEW
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={markAllRead}
                      className="text-[10px] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors cursor-pointer"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setDropdownOpen(false)}
                    aria-label="Close notifications"
                    className="h-5 w-5 rounded flex items-center justify-center text-[var(--muted-foreground)] hover:text-[var(--foreground)] cursor-pointer"
                  >
                    <X size={13} />
                  </button>
                </div>
              </div>

              {/* Notification List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-[var(--border)]">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[var(--muted-foreground)] font-mono">
                    <CheckCircle2 size={24} className="mx-auto mb-2 text-[var(--muted-foreground)] opacity-60" />
                    All caught up! No notifications right now.
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-xs transition-colors hover:bg-[var(--accent)] ${
                        notif.unread ? "bg-[var(--accent)]/50" : "bg-transparent opacity-85"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 shrink-0">
                          {notif.type === "broadcast" && (
                            <div className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                              <Radio size={12} />
                            </div>
                          )}
                          {notif.type === "fee_pending" && (
                            <div className="h-6 w-6 rounded bg-amber-500/20 border border-amber-500/40 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                              <CreditCard size={12} />
                            </div>
                          )}
                          {notif.type === "principal_pending" && (
                            <div className="h-6 w-6 rounded bg-blue-500/20 border border-blue-500/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                              <Stamp size={12} />
                            </div>
                          )}
                          {notif.type === "ticket_ready" && (
                            <div className="h-6 w-6 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                          {notif.type === "application_status" && (
                            <div className="h-6 w-6 rounded bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] flex items-center justify-center">
                              <ClipboardCheck size={12} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-bold text-[var(--foreground)] truncate">{notif.title}</h4>
                            {notif.unread && (
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5 line-clamp-2 leading-relaxed">
                            {notif.message}
                          </p>

                          {notif.actionLabel && (
                            <div className="mt-2">
                              <Link
                                href={notif.link}
                                onClick={() => setDropdownOpen(false)}
                                className="inline-flex items-center gap-1 text-[11px] font-bold text-[var(--foreground)] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors underline underline-offset-2"
                              >
                                {notif.actionLabel} <ExternalLink size={10} />
                              </Link>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="p-2 border-t border-[var(--border)] bg-[var(--background)] text-center">
                <span className="text-[10px] text-[var(--muted-foreground)] font-mono">
                  Autonomous Examination Notification System
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Primary Role Shortcuts */}
        {(role === "ADMIN" || role === "STAFF") && (
          <Link href="/verification">
            <Button variant="outline" size="sm" className="h-8 px-2 sm:px-3 text-xs">
              <ShieldCheck size={13} />
              <span className="hidden sm:inline">Verify Admit Card</span>
              <span className="sm:hidden">Verify</span>
            </Button>
          </Link>
        )}

        {isStudent ? (
          <Link href="/student-portal">
            <Button variant="primary" size="sm" className="h-8 px-2 sm:px-3 text-xs">
              <GraduationCap size={13} />
              <span className="hidden sm:inline">My Admit Card</span>
              <span className="sm:hidden">Portal</span>
            </Button>
          </Link>
        ) : isAccounts ? (
          <Link href="/accounts">
            <Button variant="primary" size="sm" className="h-8 px-2 sm:px-3 text-xs">
              <ClipboardCheck size={13} />
              <span className="hidden sm:inline">Fee Clearance</span>
              <span className="sm:hidden">Fees</span>
            </Button>
          </Link>
        ) : isPrincipal ? (
          <Link href="/principal">
            <Button variant="primary" size="sm" className="h-8 px-2 sm:px-3 text-xs">
              <ClipboardCheck size={13} />
              <span className="hidden sm:inline">Review Approvals</span>
              <span className="sm:hidden">Approvals</span>
            </Button>
          </Link>
        ) : (
          <Link href="/hall-tickets">
            <Button variant="primary" size="sm" className="h-8 px-2 sm:px-3 text-xs">
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
