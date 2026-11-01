"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { AppLayout } from "@/components/layout/app-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { CollegeSeal } from "@/components/college-seal";
import { SignatureCanvas } from "@/components/signature-canvas";
import { type CollegeSettings } from "@/lib/data-store";
import { useAuth } from "@/lib/auth/auth-context";
import { Settings, Save, CheckCircle2, ShieldCheck, PenTool, Stamp, Upload, RotateCcw } from "lucide-react";

export default function SettingsPage() {
  const { isStudent } = useAuth();
  const [settings, setSettings] = useState<CollegeSettings>({
    collegeName: "P A College of Engineering",
    collegeCode: "PACE / AUTONOMOUS EXAM CELL",
    email: "coe@pace.ac.in",
    phone: "+91 824 2284701",
    controllerName: "Prof. S. R. Venkataraman, Controller of Examinations",
    principalName: "Dr. Ramis M.K, Principal",
    principalSignatureUrl: "",
    registrarName: "Dr. B. E. Rangaswamy, Registrar (Evaluation)",
    registrarSignatureUrl: "",
    minAttendance: 75,
  });

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPrincipalPad, setShowPrincipalPad] = useState(false);
  const [showRegistrarPad, setShowRegistrarPad] = useState(false);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setSettings((prev) => ({ ...prev, ...d })))
      .catch((err) => console.error(err));
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

  const handlePrincipalSignatureSave = (dataUrl: string) => {
    setSettings((prev) => ({ ...prev, principalSignatureUrl: dataUrl }));
    setShowPrincipalPad(false);
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, principalSignatureUrl: dataUrl }),
    });
  };

  const handlePrincipalUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) handlePrincipalSignatureSave(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegistrarSignatureSave = (dataUrl: string) => {
    setSettings((prev) => ({ ...prev, registrarSignatureUrl: dataUrl }));
    setShowRegistrarPad(false);
    fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...settings, registrarSignatureUrl: dataUrl }),
    });
  };

  const handleRegistrarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) handleRegistrarSignatureSave(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  if (isStudent) {
    return (
      <AppLayout>
        <div className="max-w-md mx-auto my-16 text-center space-y-4">
          <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-8 shadow-2xl">
            <div className="h-12 w-12 rounded-[5px] bg-[#181a20] border border-[#2e323e] flex items-center justify-center mx-auto text-white mb-3">
              <ShieldCheck size={22} />
            </div>
            <h3 className="text-base font-bold text-white">Administrator Access Required</h3>
            <p className="text-xs text-[#8d929d] mt-1">
              Institution Settings and Seal configuration are restricted to the Controller of Examinations and authorized administrative officers.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              <Link href="/student-portal">
                <Button variant="primary" className="w-full">
                  Return to Student Portal
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" className="w-full">
                  Switch Account / Sign In as Admin
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Institutional Configuration</span>
            <span className="text-neutral-600">/</span>
            <Badge variant="neutral">System Settings</Badge>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">College Identity, Seals & Digital Signatures</h2>
          <p className="text-xs text-[#8d929d] mt-1">
            These particulars are officially rendered on candidate admit cards, QR tokens, and verification registries.
          </p>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* College Profile & Live Seal Grid */}
          <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6">
            <CardHeader className="p-0 pb-5 border-b border-[#1f2229] mb-5">
              <CardTitle>College Authority Profile & Dynamic Seal</CardTitle>
              <CardDescription>
                The institutional rubber seal dynamically curves the exact college name you type below.
              </CardDescription>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-[1fr_150px] gap-6 items-start">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Institution Full Name (Reflected in Seal)"
                    required
                    value={settings.collegeName}
                    onChange={(e) => setSettings({ ...settings, collegeName: e.target.value })}
                  />
                </div>
                <Input
                  label="Autonomous College / Center Code"
                  required
                  value={settings.collegeCode}
                  onChange={(e) => setSettings({ ...settings, collegeCode: e.target.value })}
                />
                <Input
                  label="Controller of Examinations Email"
                  type="email"
                  required
                  value={settings.email}
                  onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                />
                <Input
                  label="Examination Cell Helpline Phone"
                  required
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                />
              </div>

              {/* Dynamic Live Seal Preview */}
              <div className="flex flex-col items-center justify-center p-4 rounded-[5px] border border-[#272b35] bg-[#ffffff] text-black">
                <CollegeSeal
                  collegeName={settings.collegeName}
                  subText="OFFICE OF THE PRINCIPAL"
                  size={120}
                  color="blue"
                />
                <p className="text-[9px] font-sans font-bold uppercase tracking-wider text-neutral-600 mt-2 text-center">
                  Live Dynamic Seal
                </p>
              </div>
            </div>
          </Card>

          {/* Institutional Authority Signatures: Principal & Registrar */}
          <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6">
            <CardHeader className="p-0 pb-5 border-b border-[#1f2229] mb-5">
              <CardTitle>Institutional Authority Signatures (Principal & Registrar)</CardTitle>
              <CardDescription>
                Configure official authority designations and digital signatures stamped automatically on candidate admit cards. Choose between drawing by hand or uploading scanned PNG signatures.
              </CardDescription>
            </CardHeader>

            {/* Authority Designations Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <Input
                label="Principal Designation & Name"
                required
                value={settings.principalName || ""}
                onChange={(e) => setSettings({ ...settings, principalName: e.target.value })}
              />
              <Input
                label="Registrar (Evaluation) Designation & Name"
                required
                value={settings.registrarName || ""}
                onChange={(e) => setSettings({ ...settings, registrarName: e.target.value })}
              />
              <Input
                label="Controller of Examinations Name"
                required
                value={settings.controllerName}
                onChange={(e) => setSettings({ ...settings, controllerName: e.target.value })}
              />
            </div>

            {/* 1. Principal Signature & Seal (Managed by Principal Office) */}
            <div className="pt-5 border-t border-[#1f2229] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>1. Principal Digital Signature & Seal</span>
                    <Badge variant="success" className="text-[9px] py-0 px-1.5">Configured by Principal Office</Badge>
                  </h4>
                  <p className="text-[11px] text-[#7d8392]">
                    Managed and endorsed by the Office of the Principal. Rendered dynamically on candidate admit cards.
                  </p>
                </div>

                <div className="text-xs text-[#8d929d] bg-[#0c0d10] border border-[#262933] px-3 py-1.5 rounded-[4px] font-mono">
                  Principal Mode: <strong className="text-white capitalize">{settings.principalSignatureMode || "Active"}</strong>
                </div>
              </div>

              {/* Synchronized Display from Principal Office */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#0d0e12] rounded-[5px] border border-[#21242d] gap-3">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-40 rounded-[4px] border border-[#2e323d] bg-white flex items-center justify-center p-1 overflow-hidden shadow-inner">
                    {settings.principalSignatureMode === "typed" ? (
                      <span
                        className="text-neutral-900 select-none transform -rotate-2 inline-block text-center"
                        style={{
                          fontFamily: "'Brush Script MT', 'Segoe Script', 'Great Vibes', cursive, serif",
                          fontSize: "1.25rem",
                          fontWeight: 700,
                        }}
                      >
                        {settings.principalTypedSignature || "Dr. Ramis M.K"}
                      </span>
                    ) : settings.principalSignatureUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={settings.principalSignatureUrl}
                        alt="Principal Signature"
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <svg viewBox="0 0 160 50" className="w-32 h-10 stroke-[#0f172a] fill-none stroke-[1.8] stroke-linecap-round stroke-linejoin-round">
                        <path d="M 12 34 C 28 12, 38 42, 54 22 C 64 8, 70 38, 86 16 C 96 36, 110 18, 126 30 C 138 20, 148 24, 154 28 M 24 38 C 60 36, 110 37, 148 34" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">
                      {settings.principalName || "Dr. Ramis M.K, Principal"}
                    </p>
                    <p className="text-[11px] text-[#7d8392]">
                      Fetched live from Principal Office settings.
                    </p>
                  </div>
                </div>

                <Link href="/principal/settings">
                  <Button type="button" variant="outline" size="sm" className="h-8 text-xs">
                    <Stamp size={12} />
                    <span>View Principal Office Settings</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* 2. Registrar (Evaluation) Signature Section */}
            <div className="mt-6 pt-5 border-t border-[#1f2229] space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                    <span>2. Registrar (Evaluation) Signature</span>
                    <Badge variant="neutral" className="text-[9px] py-0 px-1.5">Affiliating University Endorsement</Badge>
                  </h4>
                  <p className="text-[11px] text-[#7d8392]">
                    University authority signature (e.g. VTU Registrar / COE) in the right column.
                  </p>
                </div>

                {/* 3 Signature Options Selector: Draw, Upload, Type */}
                <div className="inline-flex rounded-[4px] border border-[#262933] bg-[#0c0d10] p-1 gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setSettings((prev) => ({ ...prev, registrarSignatureMode: "scribble" }));
                      setShowRegistrarPad(true);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-[3px] font-medium transition-all flex items-center gap-1.5 ${
                      settings.registrarSignatureMode === "scribble"
                        ? "bg-[#252833] text-white shadow-sm font-semibold"
                        : "text-[#8d929d] hover:text-white"
                    }`}
                  >
                    <PenTool size={11} /> <span>Draw</span>
                  </button>
                  <label className={`cursor-pointer px-2.5 py-1 text-xs rounded-[3px] font-medium transition-all flex items-center gap-1.5 ${
                    settings.registrarSignatureMode === "upload"
                      ? "bg-[#252833] text-white shadow-sm font-semibold"
                      : "text-[#8d929d] hover:text-white"
                  }`}>
                    <Upload size={11} /> <span>Upload</span>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml"
                      onChange={(e) => {
                        setSettings((prev) => ({ ...prev, registrarSignatureMode: "upload" }));
                        handleRegistrarUpload(e);
                      }}
                      className="hidden"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setShowRegistrarPad(false);
                      setSettings((prev) => ({
                        ...prev,
                        registrarSignatureMode: "typed",
                        registrarTypedSignature: prev.registrarTypedSignature || prev.registrarName?.split(",")[0] || "B. E. Rangaswamy",
                      }));
                    }}
                    className={`px-2.5 py-1 text-xs rounded-[3px] font-medium transition-all flex items-center gap-1.5 ${
                      settings.registrarSignatureMode === "typed"
                        ? "bg-[#252833] text-white shadow-sm font-semibold"
                        : "text-[#8d929d] hover:text-white"
                    }`}
                  >
                    <span>⌨ Type Name</span>
                  </button>
                </div>
              </div>

              {/* Registrar Signature Editor Body based on active mode */}
              {settings.registrarSignatureMode === "typed" ? (
                <div className="p-4 bg-[#0d0e12] rounded-[5px] border border-[#21242d] space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-[1fr_200px] gap-4 items-center">
                    <div>
                      <label className="text-xs font-semibold text-white block mb-1">
                        Type Registrar Signature Name
                      </label>
                      <input
                        type="text"
                        value={settings.registrarTypedSignature || ""}
                        onChange={(e) => setSettings({ ...settings, registrarTypedSignature: e.target.value })}
                        placeholder="e.g. B. E. Rangaswamy"
                        className="h-10 w-full rounded-[4px] border border-[#2e323d] bg-[#14161c] px-3 text-xs text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
                      />
                      <p className="text-[11px] text-[#7d8392] mt-1">
                        Rendered on admit cards using authentic executive cursive script calligraphy.
                      </p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7d8392] block mb-1">
                        Live Script Preview
                      </span>
                      <div className="h-14 w-full rounded-[4px] border border-[#2e323d] bg-white flex items-center justify-center p-2 shadow-inner">
                        <span
                          className="text-neutral-900 select-none transform -rotate-2 inline-block"
                          style={{
                            fontFamily: "'Brush Script MT', 'Segoe Script', 'Great Vibes', cursive, serif",
                            fontSize: "1.35rem",
                            fontWeight: 700,
                            letterSpacing: "0.03em",
                          }}
                        >
                          {settings.registrarTypedSignature || settings.registrarName?.split(",")[0] || "B. E. Rangaswamy"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : showRegistrarPad ? (
                <div className="p-4 bg-[#0d0e12] rounded-[5px] border border-[#272b35]">
                  <SignatureCanvas
                    initialSignature={settings.registrarSignatureUrl}
                    onSave={(url) => {
                      setSettings((prev) => ({ ...prev, registrarSignatureMode: "scribble" }));
                      handleRegistrarSignatureSave(url);
                    }}
                    onCancel={() => setShowRegistrarPad(false)}
                  />
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#0d0e12] rounded-[5px] border border-[#21242d] gap-3">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-40 rounded-[4px] border border-[#2e323d] bg-white flex items-center justify-center p-1 overflow-hidden shadow-inner">
                      {settings.registrarSignatureUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settings.registrarSignatureUrl}
                          alt="Registrar Signature"
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <svg viewBox="0 0 160 50" className="w-32 h-10 stroke-[#0f172a] fill-none stroke-[1.8] stroke-linecap-round stroke-linejoin-round">
                          <path d="M 14 36 C 30 18, 38 12, 48 38 C 55 14, 62 10, 74 34 C 84 18, 102 36, 118 20 C 132 12, 140 28, 152 24 M 20 40 C 70 37, 115 39, 145 35" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {settings.registrarSignatureMode === "upload"
                          ? "Uploaded Scanned PNG Active"
                          : settings.registrarSignatureUrl
                          ? "Handwritten Scribble Signature Active"
                          : "Default University Vector Active"}
                      </p>
                      <p className="text-[11px] text-[#7d8392]">
                        Positioned in the right-hand column on candidate admit cards.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {settings.registrarSignatureUrl && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRegistrarSignatureSave("")}
                        className="text-xs text-neutral-400 hover:text-red-400"
                      >
                        <RotateCcw size={12} /> Clear Graphic
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowRegistrarPad(true)}
                    >
                      <PenTool size={12} /> Redraw Pad
                    </Button>
                  </div>
                </div>
              )}
            </div>

          </Card>

          {/* Eligibility Rules */}
          <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-6">
            <CardHeader className="p-0 pb-5 border-b border-[#1f2229] mb-5">
              <CardTitle>Attendance & Compliance Threshold</CardTitle>
              <CardDescription>Configures strict eligibility locking for admit card generation</CardDescription>
            </CardHeader>
            <div className="max-w-sm">
              <Input
                label="Minimum Mandatory Attendance (%)"
                type="number"
                min="50"
                max="100"
                required
                value={settings.minAttendance}
                onChange={(e) => setSettings({ ...settings, minAttendance: Number(e.target.value) })}
              />
              <p className="text-[11px] text-[#717684] mt-1.5">
                Students below this threshold are locked from receiving hall tickets unless an override is authorized.
              </p>
            </div>
          </Card>

          <div className="flex items-center gap-3">
            <Button type="submit" variant="primary" disabled={saving}>
              <Save size={14} />
              {saving ? "Saving Configuration..." : "Save Configuration"}
            </Button>
            {savedSuccess && (
              <span className="flex items-center gap-1.5 text-xs font-mono text-white">
                <CheckCircle2 size={14} /> Settings updated successfully
              </span>
            )}
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
