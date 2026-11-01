"use client";

import React from "react";
import { Printer, Download, ShieldCheck, QrCode as QrIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CollegeSeal } from "@/components/college-seal";
import { type HallTicket, type CollegeSettings } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";

interface HallTicketDocumentProps {
  ticket: HallTicket;
  settings?: CollegeSettings;
  onClose?: () => void;
}

export function HallTicketDocument({
  ticket,
  settings,
  onClose,
}: HallTicketDocumentProps) {
  const collegeName = settings?.collegeName || "P A COLLEGE OF ENGINEERING";
  const collegeCode = settings?.collegeCode || "PACE / AUTONOMOUS EXAM CELL";
  const controllerName = settings?.controllerName || "Prof. S. R. Venkataraman, Controller of Examinations";
  const principalName = settings?.principalName || "Dr. Ramis M.K, Principal";
  const principalSignature = settings?.principalSignatureUrl || "";
  const principalMode = settings?.principalSignatureMode || (principalSignature ? "upload" : "scribble");
  const principalTyped = settings?.principalTypedSignature || settings?.principalName?.split(",")[0] || "Dr. Ramis M.K";

  const registrarName = settings?.registrarName || "Dr. B. E. Rangaswamy, Registrar (Evaluation)";
  const registrarSignature = settings?.registrarSignatureUrl || "";
  const registrarMode = settings?.registrarSignatureMode || (registrarSignature ? "upload" : "typed");
  const registrarTyped = settings?.registrarTypedSignature || "B. E. Rangaswamy";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (Hidden during print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#242730] pb-4 no-print">
        <div className="flex items-center gap-2 text-xs text-[#9ca3af]">
          <ShieldCheck size={16} className="text-white" />
          <span>Authentic Document · Security Token: <strong className="text-white font-mono">{ticket.verifyCode}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={handlePrint} size="sm">
            <Printer size={14} /> Print Admit Card
          </Button>
          <Button variant="primary" onClick={handlePrint} size="sm">
            <Download size={14} /> Download PDF
          </Button>
        </div>
      </div>

      {/* The Printable Official Admit Card Canvas */}
      <div className="print-page bg-white text-black p-6 sm:p-8 rounded-[5px] border-2 border-[#1a1c22] shadow-xl text-left select-text font-serif">
        {/* University Header - Cleanly Centered without any square logo box */}
        <div className="border-b-2 border-black pb-4 text-center">
          <div className="flex items-center justify-between mb-2">
            <div className="flex-1 text-center pl-16 pr-2">
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-wide font-sans text-black">{collegeName}</h1>
              <p className="text-xs font-sans text-neutral-800 tracking-wider font-semibold mt-0.5">{collegeCode}</p>
              <p className="text-[11px] font-sans text-neutral-600">Approved by AICTE · Autonomous Institution</p>
              <div className="mt-2 inline-block bg-black text-white px-5 py-0.5 text-xs font-bold font-sans uppercase tracking-widest rounded-[2px]">
                OFFICIAL EXAMINATION HALL TICKET / ADMIT CARD
              </div>
            </div>
            <div className="h-16 w-16 border border-neutral-300 p-1 flex flex-col items-center justify-center text-[9px] font-sans text-neutral-500 shrink-0">
              {ticket.qrDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ticket.qrDataUrl} alt="Verification QR" className="h-full w-full object-contain" />
              ) : (
                <QrIcon size={32} />
              )}
            </div>
          </div>
          <div className="flex justify-between items-center text-xs font-sans font-semibold border-t border-dashed border-neutral-400 pt-1.5 mt-2">
            <span>EXAMINATION: {ticket.examinationName.toUpperCase()}</span>
            <span>ACADEMIC YEAR: {ticket.academicYear}</span>
          </div>
        </div>

        {/* Candidate & Admit Card Details Grid */}
        <div className="grid grid-cols-[1fr_130px] gap-6 py-4 border-b-2 border-black font-sans">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Candidate Name</span>
              <span className="font-bold text-sm uppercase">{ticket.studentName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">University Seat No (USN)</span>
              <span className="font-mono font-bold text-base tracking-wider">{ticket.usn}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Degree & Branch</span>
              <span className="font-semibold">{ticket.course}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Semester & Section</span>
              <span className="font-semibold">Semester {ticket.semester} · Section {ticket.section}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Examination Center</span>
              <span className="font-semibold">{ticket.center}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-neutral-500 uppercase block">Hall Ticket Number</span>
              <span className="font-mono font-bold text-xs">{ticket.number}</span>
            </div>
          </div>

          {/* Student Photo & Attestation Box */}
          <div className="flex flex-col items-center">
            <div className="h-32 w-28 border-2 border-black relative overflow-hidden bg-neutral-100 flex items-center justify-center">
              {ticket.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={ticket.photoUrl} alt={ticket.studentName} className="h-full w-full object-cover" />
              ) : (
                <div className="text-center p-2 text-neutral-400 text-xs font-sans font-bold">
                  PASSPORT PHOTO
                </div>
              )}
              {/* Digital Attestation Watermark */}
              <div className="absolute bottom-1 inset-x-1 bg-black/80 text-white text-[8px] font-sans font-bold text-center py-0.5 rounded-[1px] uppercase tracking-wider">
                Attested
              </div>
            </div>
          </div>
        </div>

        {/* Examination Timetable */}
        <div className="py-4 font-sans">
          <h4 className="text-xs font-bold uppercase tracking-wider mb-2">Registered Examination Timetable</h4>
          <table className="w-full text-left border-collapse border border-black text-xs">
            <thead>
              <tr className="bg-neutral-100 border-b border-black text-[11px] font-bold">
                <th className="p-2 border-r border-black w-8 text-center">#</th>
                <th className="p-2 border-r border-black w-24">Subject Code</th>
                <th className="p-2 border-r border-black">Subject Title</th>
                <th className="p-2 border-r border-black w-24">Date</th>
                <th className="p-2 border-r border-black w-32">Session / Timing</th>
                <th className="p-2 border-r border-black w-20">Room No</th>
                <th className="p-2 w-28 text-center">Invigilator Sign</th>
              </tr>
            </thead>
            <tbody>
              {ticket.subjects?.map((sub, idx) => (
                <tr key={sub.subjectCode} className="border-b border-black/60">
                  <td className="p-2 border-r border-black text-center font-mono">{idx + 1}</td>
                  <td className="p-2 border-r border-black font-mono font-bold">{sub.subjectCode}</td>
                  <td className="p-2 border-r border-black font-medium">{sub.subjectName}</td>
                  <td className="p-2 border-r border-black">{formatDate(sub.examDate)}</td>
                  <td className="p-2 border-r border-black text-[11px]">{sub.startTime} – {sub.endTime}</td>
                  <td className="p-2 border-r border-black text-center font-semibold">{sub.room}</td>
                  <td className="p-2 border-black text-center"></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Candidate Rules & Instructions */}
        <div className="pt-2 pb-4 font-sans text-[10px] text-neutral-800 leading-normal border-b border-neutral-300">
          <span className="font-bold uppercase tracking-wide block mb-1 text-black">Mandatory Candidate Instructions:</span>
          <ol className="list-decimal pl-4 space-y-0.5">
            <li>Candidates must occupy assigned exam seats at least 15 minutes prior to the commencement time.</li>
            <li>Possession of electronic gadgets, programmable calculators, smart watches, or notes is strictly prohibited.</li>
            <li>Entry to the examination hall will not be permitted without this verified Admit Card and College Identity Card.</li>
            <li>Any tampering with QR code, student photograph, or timetable particulars renders this document void.</li>
          </ol>
        </div>

        {/* Three Signatures Section: Candidate, Principal (with Seal directly above), Registrar */}
        {/* Uses 3-row architecture to guarantee 100% collinear horizontal lines */}
        <div className="pt-5 font-sans">
          {/* ROW 1: Signature Graphics / Stamped Seal (Equal fixed height h-28, bottom-aligned) */}
          <div className="grid grid-cols-3 gap-6 items-end text-center">
            {/* 1. Candidate Graphic Area */}
            <div className="h-28 flex flex-col items-center justify-end pb-1">
              <span className="text-[10px] italic text-neutral-400 font-serif select-none">
                [ Candidate Signature Area ]
              </span>
            </div>

            {/* 2. Principal Seal & Signature */}
            <div className="h-28 flex flex-col items-center justify-end relative pb-1">
              {/* Dynamic Circular Institutional Seal stamped directly above/overlapping Principal's signature */}
              <div className="absolute top-0 transform -rotate-1 pointer-events-none select-none z-10">
                <CollegeSeal
                  collegeName={settings?.sealCollegeName || collegeName}
                  centerText={settings?.sealCenterText || "OFFICE OF THE PRINCIPAL"}
                  subText={settings?.sealSubText || "AUTONOMOUS EXAM CELL"}
                  year={settings?.sealYear || "ESTD 1999"}
                  size={84}
                  color="blue"
                />
              </div>

              {/* Principal Signature: Typed Script, Upload/Scribble Image, or Clean Vector */}
              <div className="h-12 w-full max-w-[170px] mx-auto flex items-end justify-center relative z-20">
                {principalMode === "typed" ? (
                  <span
                    className="text-neutral-900 select-none transform -rotate-2 pb-1 inline-block"
                    style={{
                      fontFamily: "'Brush Script MT', 'Segoe Script', 'Great Vibes', cursive, serif",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {principalTyped}
                  </span>
                ) : principalSignature ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={principalSignature}
                    alt="Principal Signature"
                    className="max-h-12 max-w-[150px] object-contain"
                  />
                ) : (
                  <svg viewBox="0 0 160 50" className="w-32 h-10 stroke-[#0f172a] fill-none stroke-[1.8] stroke-linecap-round stroke-linejoin-round">
                    <path d="M 12 34 C 28 12, 38 42, 54 22 C 64 8, 70 38, 86 16 C 96 36, 110 18, 126 30 C 138 20, 148 24, 154 28 M 24 38 C 60 36, 110 37, 148 34" />
                  </svg>
                )}
              </div>
            </div>

            {/* 3. Registrar Signature: Typed Script, Upload/Scribble Image, or Clean Vector */}
            <div className="h-28 flex flex-col items-center justify-end pb-1">
              <div className="h-12 w-full max-w-[170px] mx-auto flex items-end justify-center">
                {registrarMode === "typed" ? (
                  <span
                    className="text-neutral-900 select-none transform -rotate-2 pb-1 inline-block"
                    style={{
                      fontFamily: "'Brush Script MT', 'Segoe Script', 'Great Vibes', cursive, serif",
                      fontSize: "1.35rem",
                      fontWeight: 700,
                      letterSpacing: "0.03em",
                    }}
                  >
                    {registrarTyped}
                  </span>
                ) : registrarSignature ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={registrarSignature}
                    alt="Registrar Signature"
                    className="max-h-12 max-w-[150px] object-contain"
                  />
                ) : (
                  <svg viewBox="0 0 160 50" className="w-32 h-10 stroke-[#0f172a] fill-none stroke-[1.8] stroke-linecap-round stroke-linejoin-round">
                    <path d="M 14 36 C 30 18, 38 12, 48 38 C 55 14, 62 10, 74 34 C 84 18, 102 36, 118 20 C 132 12, 140 28, 152 24 M 20 40 C 70 37, 115 39, 145 35" />
                  </svg>
                )}
              </div>
            </div>
          </div>

          {/* ROW 2: 100% COLLINEAR SIGNATURE BASELINE (All 3 lines share exact same row & vertical coordinate) */}
          <div className="grid grid-cols-3 gap-6 my-1">
            <div className="border-b-2 border-black w-4/5 mx-auto"></div>
            <div className="border-b-2 border-black w-4/5 mx-auto"></div>
            <div className="border-b-2 border-black w-4/5 mx-auto"></div>
          </div>

          {/* ROW 3: Designations and Authority Titles */}
          <div className="grid grid-cols-3 gap-6 text-center pt-1.5">
            <div>
              <p className="text-[11px] font-bold text-black uppercase tracking-wide">Signature of Candidate</p>
              <p className="text-[9px] text-neutral-500 mt-0.5">(To be signed before examination)</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-black leading-tight">{principalName}</p>
              <p className="text-[9px] text-neutral-600 leading-tight mt-0.5">Principal · Examination Authority</p>
            </div>
            <div>
              <p className="text-[11px] font-bold text-black leading-tight">{registrarName}</p>
              <p className="text-[9px] text-neutral-600 leading-tight mt-0.5">Registrar (Evaluation) / Affiliating University</p>
            </div>
          </div>
        </div>


        {/* Anti-tamper footer */}
        <div className="mt-6 pt-2 border-t border-neutral-300 flex justify-between items-center text-[9px] font-mono text-neutral-500 font-sans">
          <span>Security Token: {ticket.verifyCode}</span>
          <span>Generated On: {new Date(ticket.generatedAt).toLocaleString()}</span>
          <span>System Status: VERIFIED AUTONOMOUS</span>
        </div>
      </div>
    </div>
  );
}
