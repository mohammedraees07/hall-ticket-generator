"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Lock, Mail, ArrowRight, Info } from "lucide-react";


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
    <div className="min-h-screen bg-[#0c0d10] flex flex-col justify-center items-center px-4 py-12 relative">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-10 w-10 rounded-[5px] bg-[#16181f] border border-[#272b36] text-white items-center justify-center mb-1 shadow-md">
            <ShieldCheck size={20} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Autonomous Examination Portal</h1>
          <p className="text-xs text-[#8d929d]">
            Sign in to access candidate registers, verification tokens, or your official admit card.
          </p>
        </div>

        {/* Credentials Form */}
        <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6 shadow-xl">
          <CardHeader className="p-0 pb-4 mb-4 border-b border-[#1f2229]">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Institutional Sign In</CardTitle>
              <Badge variant="neutral" className="text-[9px] font-mono uppercase tracking-widest">
                SUPABASE AUTH
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Enter your authorized college email address and security password.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-[4px] bg-[#1f1414] border border-[#422222] text-[#f87171] text-xs leading-relaxed">
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
        <div className="p-3.5 rounded-[5px] border border-[#23262d] bg-[#111317] text-center">
          <p className="text-xs text-[#8d929d]">
            Want to verify student?{" "}
            <Link
              href="/verify"
              className="font-bold text-white underline underline-offset-4 hover:text-emerald-400 transition-colors inline-flex items-center gap-1"
            >
              Public Verify <ArrowRight size={13} />
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center text-[11px] text-[#606675]">
          Autonomous College Examination Division &middot; Official Verifiable System
        </div>
      </div>
    </div>
  );
}

