"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { UserRole } from "@/lib/auth/roles";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ArrowRight } from "lucide-react";
import Link from "next/link";

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectIfStudent?: boolean;
}

export function RoleGuard({ children, allowedRoles, redirectIfStudent = true }: RoleGuardProps) {
  const { user, role, isStudent, isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    // 1. If not authenticated, always send to /login
    if (!isAuthenticated || !user) {
      router.replace("/login");
      return;
    }

    // 2. If student trying to access admin/staff pages, redirect to student-portal
    if (isStudent && redirectIfStudent && !allowedRoles.includes("STUDENT")) {
      router.replace("/student-portal");
      return;
    }
  }, [isAuthenticated, user, isStudent, redirectIfStudent, allowedRoles, loading, router]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-xs font-mono text-[#8d929d] animate-pulse">Checking credentials...</p>
      </div>
    );
  }

  // Not logged in -> send to /login immediately without flashing intermediate screens
  if (!isAuthenticated || !user) {
    return null;
  }

  // Student on admin route
  if (isStudent && redirectIfStudent && !allowedRoles.includes("STUDENT")) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-xs font-mono text-[#8d929d]">Redirecting to Candidate Portal...</p>
      </div>
    );
  }

  // Logged in with wrong role
  if (!role || !allowedRoles.includes(role)) {
    return (
      <div className="p-8 max-w-lg mx-auto mt-12 text-center">
        <Card className="rounded-[5px] border border-[#232732] bg-[#111318] p-8 space-y-4 shadow-xl">
          <div className="mx-auto w-12 h-12 rounded-[5px] bg-[#221010] border border-[#441a1a] flex items-center justify-center text-[#f87171]">
            <ShieldAlert size={24} />
          </div>
          <h2 className="text-lg font-bold text-white">Access Restricted</h2>
          <p className="text-xs text-[#8d929d] leading-relaxed">
            You do not have permissions to access this administrative module. This resource is reserved for{" "}
            <span className="font-semibold text-white">{allowedRoles.join(" / ")}</span> personnel.
          </p>
          <div className="pt-2">
            <Link href={isStudent ? "/student-portal" : "/dashboard"}>
              <Button variant="primary" className="gap-2">
                Return to {isStudent ? "Candidate Portal" : "Dashboard"} <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
