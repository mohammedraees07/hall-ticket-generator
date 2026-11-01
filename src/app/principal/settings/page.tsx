"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CollegeSeal } from "@/components/college-seal";
import { SignatureCanvas } from "@/components/signature-canvas";
import { type CollegeSettings } from "@/lib/data-store";
import {
  Stamp,
  PenTool,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export default function PrincipalSettingsPage() {
  const [settings, setSettings] = useState<CollegeSettings>({
    collegeName: "P A College of Engineering",
    collegeCode: "PACE / AUTONOMOUS EXAM CELL",
    email: "coe@pace.ac.in",
    phone: "+91 824 2284701",
    controllerName: "Prof. S. R. Venkataraman, Controller of Examinations",
    principalName: "Dr. Ramis M.K, Principal",
    principalSignatureUrl: "",
    principalSignatureMode: "scribble",
    principalTypedSignature: "Dr. Ramis M.K",
    sealCollegeName: "P A COLLEGE OF ENGINEERING",
    sealCenterText: "OFFICE OF THE PRINCIPAL",
    sealSubText: "AUTONOMOUS EXAM CELL",
    sealYear: "ESTD 1999",
    registrarName: "Dr. B. E. Rangaswamy, Registrar (Evaluation)",
    registrarSignatureUrl: "",
    registrarSignatureMode: "typed",
    registrarTypedSignature: "B. E. Rangaswamy",
    minAttendance: 75,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings((prev) => ({ ...prev, ...d })))
      .catch((err) => console.error("Error loading settings:", err));
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch (err) {
      console.error("Save settings error:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleSignatureCanvasSave = (dataUrl: string) => {
    const updated = {
      ...settings,
      principalSignatureUrl: dataUrl,
      principalSignatureMode: "scribble" as const,
    };
    setSettings(updated);
    setShowSignaturePad(false);
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
  };

  const handleSignatureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          const updated = {
            ...settings,
            principalSignatureUrl: dataUrl,
            principalSignatureMode: "upload" as const,
          };
          setSettings(updated);
          fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updated),
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["PRINCIPAL", "ADMIN"]}>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1f2229] pb-4">
            <div className="flex items-center gap-3">
              <Link
                href="/principal"
                className="p-1.5 rounded-[4px] bg-[#14161c] hover:bg-[#1e222b] text-neutral-400 hover:text-white transition-colors"
                title="Back to Approvals"
              >
                <ArrowLeft size={16} />
              </Link>
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Stamp size={18} className="text-emerald-400" />
                  <span>Principal Office &middot; Official Seal & Signature</span>
                </h2>
                <p className="text-xs text-[#8d929d]">
                  Configure your dynamic institutional rubber seal and digital endorsement signature used on all verified hall tickets.
                </p>
              </div>
            </div>

            <Button
              type="button"
              variant="primary"
              disabled={saving}
              onClick={handleSave}
              className="h-9 px-4 font-semibold shrink-0"
            >
              {savedSuccess ? (
                <>
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span>Saved Successfully</span>
                </>
              ) : (
                <>
                  <Save size={13} />
                  <span>{saving ? "Saving..." : "Save Endorsement Settings"}</span>
                </>
              )}
            </Button>
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* SECTION 1: DYNAMIC RUBBER SEAL */}
            <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1f2229] pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Stamp size={16} className="text-emerald-400" />
                    <span>Dynamic Rubber Stamp Seal Configuration</span>
                  </h3>
                  <p className="text-xs text-[#8d929d]">
                    Customizable institutional stamp rendered directly on candidate hall tickets.
                  </p>
                </div>
                <Badge variant="neutral" className="text-[10px] font-mono uppercase">
                  Live Preview
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-[1fr_220px] gap-6 items-center">
                {/* Inputs */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Curved Institutional Header (College Name)
                    </label>
                    <input
                      type="text"
                      value={settings.sealCollegeName || settings.collegeName}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          sealCollegeName: e.target.value,
                        }))
                      }
                      placeholder="e.g. P A COLLEGE OF ENGINEERING"
                      className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono tracking-wide"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Center Authority Text
                    </label>
                    <input
                      type="text"
                      value={settings.sealCenterText || "OFFICE OF THE PRINCIPAL"}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          sealCenterText: e.target.value,
                        }))
                      }
                      placeholder="e.g. OFFICE OF THE PRINCIPAL"
                      className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Subtext / Department
                      </label>
                      <input
                        type="text"
                        value={settings.sealSubText || "AUTONOMOUS EXAM CELL"}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            sealSubText: e.target.value,
                          }))
                        }
                        placeholder="e.g. AUTONOMOUS EXAM CELL"
                        className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono text-[11px]"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-neutral-300 block mb-1">
                        Established Year
                      </label>
                      <input
                        type="text"
                        value={settings.sealYear || "ESTD 1999"}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            sealYear: e.target.value,
                          }))
                        }
                        placeholder="e.g. ESTD 1999"
                        className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                {/* Live SVG Seal Preview */}
                <div className="flex flex-col items-center justify-center p-4 rounded-[4px] border border-[#252833] bg-white text-black shadow-inner">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 font-mono mb-2">
                    Admit Card Stamp Preview
                  </span>
                  <div className="p-2 transform hover:scale-105 transition-transform">
                    <CollegeSeal
                      collegeName={settings.sealCollegeName || settings.collegeName}
                      centerText={settings.sealCenterText || "OFFICE OF THE PRINCIPAL"}
                      subText={settings.sealSubText || "AUTONOMOUS EXAM CELL"}
                      year={settings.sealYear || "ESTD 1999"}
                      size={120}
                      color="blue"
                    />
                  </div>
                  <span className="text-[9px] text-neutral-500 font-sans mt-1 text-center">
                    Authentic Ink Impression
                  </span>
                </div>
              </div>
            </Card>

            {/* SECTION 2: PRINCIPAL DIGITAL SIGNATURE */}
            <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-[#1f2229] pb-3 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <PenTool size={16} className="text-emerald-400" />
                    <span>Principal Endorsement Signature</span>
                  </h3>
                  <p className="text-xs text-[#8d929d]">
                    Choose one of 3 digital signing methods: Draw on canvas, upload a signature PNG, or type your official name.
                  </p>
                </div>

                <div className="inline-flex p-1 bg-[#0c0d10] border border-[#23262d] rounded-[4px]">
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        principalSignatureMode: "scribble",
                      }))
                    }
                    className={`px-3 py-1 rounded-[3px] text-xs font-semibold transition-colors ${
                      settings.principalSignatureMode === "scribble"
                        ? "bg-white text-black shadow"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Draw Canvas
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        principalSignatureMode: "upload",
                      }))
                    }
                    className={`px-3 py-1 rounded-[3px] text-xs font-semibold transition-colors ${
                      settings.principalSignatureMode === "upload"
                        ? "bg-white text-black shadow"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Upload PNG
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setSettings((prev) => ({
                        ...prev,
                        principalSignatureMode: "typed",
                      }))
                    }
                    className={`px-3 py-1 rounded-[3px] text-xs font-semibold transition-colors ${
                      settings.principalSignatureMode === "typed"
                        ? "bg-white text-black shadow"
                        : "text-neutral-400 hover:text-white"
                    }`}
                  >
                    Type Name
                  </button>
                </div>
              </div>

              {/* Principal Name Input */}
              <div className="mb-4">
                <label className="text-xs font-semibold text-neutral-300 block mb-1">
                  Principal Full Name & Title (Printed Below Baseline)
                </label>
                <input
                  type="text"
                  value={settings.principalName || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      principalName: e.target.value,
                    }))
                  }
                  placeholder="e.g. Dr. Ramis M.K, Principal"
                  className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-sans"
                />
              </div>

              {/* Mode 1: Scribble / Canvas */}
              {settings.principalSignatureMode === "scribble" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-[4px] border border-[#252833] bg-[#0c0d10] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="h-20 w-48 border border-neutral-700 bg-white rounded-[3px] flex items-center justify-center p-2 shadow-inner">
                      {settings.principalSignatureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settings.principalSignatureUrl}
                          alt="Principal Signature"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-neutral-400 italic">No signature drawn</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="primary"
                        size="sm"
                        onClick={() => setShowSignaturePad(true)}
                        className="h-9 px-4 text-xs"
                      >
                        <PenTool size={13} />
                        <span>Open Signature Drawing Pad</span>
                      </Button>
                      {settings.principalSignatureUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setSettings((prev) => ({
                              ...prev,
                              principalSignatureUrl: "",
                            }))
                          }
                          className="text-[11px] text-neutral-400 hover:text-white underline text-center"
                        >
                          Clear Signature
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: Upload */}
              {settings.principalSignatureMode === "upload" && (
                <div className="space-y-3">
                  <div className="p-4 rounded-[4px] border border-[#252833] bg-[#0c0d10] flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="h-20 w-48 border border-neutral-700 bg-white rounded-[3px] flex items-center justify-center p-2 shadow-inner">
                      {settings.principalSignatureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settings.principalSignatureUrl}
                          alt="Uploaded Principal Signature"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[11px] text-neutral-400 italic">No signature uploaded</span>
                      )}
                    </div>

                    <div className="flex flex-col gap-2 w-full sm:w-auto">
                      <label className="cursor-pointer inline-flex items-center justify-center gap-1.5 h-9 px-4 rounded-[4px] bg-white text-black hover:bg-neutral-200 text-xs font-semibold transition-colors">
                        <Upload size={13} />
                        <span>Upload Signature PNG</span>
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/svg+xml"
                          onChange={handleSignatureUpload}
                          className="hidden"
                        />
                      </label>
                      <span className="text-[10px] text-neutral-500 text-center font-mono">
                        Transparent PNG recommended
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 3: Typed */}
              {settings.principalSignatureMode === "typed" && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-neutral-300 block mb-1">
                      Type Your Signature Name
                    </label>
                    <input
                      type="text"
                      value={settings.principalTypedSignature || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          principalTypedSignature: e.target.value,
                        }))
                      }
                      placeholder="e.g. Dr. Ramis M.K"
                      className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono"
                    />
                  </div>

                  <div className="p-4 rounded-[4px] border border-[#252833] bg-white text-black flex flex-col items-center justify-center shadow-inner">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 font-mono mb-1">
                      Cursive Signature Rendering
                    </span>
                    <span
                      className="text-neutral-900 select-none transform -rotate-2 py-2 inline-block"
                      style={{
                        fontFamily:
                          "'Brush Script MT', 'Segoe Script', 'Great Vibes', cursive, serif",
                        fontSize: "2rem",
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                      }}
                    >
                      {settings.principalTypedSignature || "Dr. Ramis M.K"}
                    </span>
                  </div>
                </div>
              )}
            </Card>

            {/* Bottom Save Action */}
            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                variant="primary"
                disabled={saving}
                className="h-10 px-6 font-semibold"
              >
                {savedSuccess ? (
                  <>
                    <CheckCircle2 size={14} className="text-emerald-400" />
                    <span>Saved & Endorsed</span>
                  </>
                ) : (
                  <>
                    <Save size={14} />
                    <span>{saving ? "Saving..." : "Save Endorsement Settings"}</span>
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Signature Canvas Modal Pad */}
          {showSignaturePad && (
            <SignatureCanvas
              initialSignature={settings.principalSignatureUrl}
              onSave={handleSignatureCanvasSave}
              onCancel={() => setShowSignaturePad(false)}
            />
          )}
        </div>
      </RoleGuard>
    </AppLayout>
  );
}
