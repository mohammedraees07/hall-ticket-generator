"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { ShieldCheck, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const { login, loading } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await login(email, password);
      if (!res.success) {
        setError(res.error || "Authentication failed. Please verify your institutional email and password.");
      }
    } catch {
      setError("An unexpected error occurred during sign-in.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-col justify-center items-center px-4 py-12 relative transition-colors">
      {/* Top right Theme Toggle with circular ripple effect */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          
          <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">Autonomous Examination Portal</h1>
          <p className="text-xs text-[var(--muted-foreground)]">
            Sign in to access candidate registers, verification tokens, or your official admit card.
          </p>
        </div>

        {/* Credentials Form */}
        <Card className="p-6 shadow-xl">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-[var(--border)]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base text-[var(--foreground)]">Institutional Sign In</CardTitle>
            </div>
            <CardDescription className="text-xs text-[var(--muted-foreground)]">
              Enter your authorized college email address and security password.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[4px] bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs leading-relaxed">
                {error}
              </div>
            )}

            <Input
              label="Institutional Email"
              type="email"
              required
              placeholder="name@college.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />

            <Button type="submit" variant="primary" className="w-full h-10 mt-2" disabled={submitting || loading}>
              <Lock size={13} />
              {submitting ? "Authenticating..." : "Sign In to Portal"}
            </Button>
          </form>
        </Card>

        {/* Public Student Verification Link */}
        <div className="p-3.5 rounded-[5px] border border-[var(--border)] bg-[var(--card)] text-center transition-colors shadow-sm">
          <p className="text-xs text-[var(--muted-foreground)]">
            Want to verify student?{" "}
            <Link
              href="/verify"
              className="font-bold text-[var(--foreground)] underline underline-offset-4 hover:opacity-80 transition-opacity inline-flex items-center gap-1"
            >
              Public Verify <ArrowRight size={13} />
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-[var(--muted-foreground)] font-mono">
          Autonomous College Examination Division &middot; Official Verifiable System
        </div>
      </div>
    </div>
  );
}
