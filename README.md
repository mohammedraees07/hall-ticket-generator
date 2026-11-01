# College Hall Ticket & Examination Generator

A full-stack examination management system built with **Next.js 15 (App Router)**, **PostgreSQL (Supabase Ready)**, **Drizzle ORM**, **Tailwind CSS**, and **shadcn/ui**.

Designed specifically for autonomous colleges and universities to manage candidate enrollments, enforce examination eligibility (attendance & fee clearance), generate verifiable admit cards with dynamic QR codes, and provide instant public verification.

---

## Design System

- **Palette**: Charcoal-black (`#0c0d10`) & high-contrast white with subtle borders (`#23262d`).
- **Border Radius**: Strictly **5px** (`rounded-[5px]`) across all cards, KPIs, tables, and dialogs.
- **Badges / Tags**: Solid, architectural micro-rounded tags (`rounded-[3px]`) with no transparent neon pills or dotted indicators.

---

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Supabase / PostgreSQL Configuration

The application is completely Supabase-compatible.

To connect your Supabase database:
1. Create a `.env.local` file in the project root:
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres
```
2. If `DATABASE_URL` is omitted, the application automatically runs in local development mode using the pre-seeded in-memory data store with zero configuration needed.

---

## Key Features

1. **Candidate Eligibility Engine**:
   - Automated attendance rule check ($\ge 75\%$ required).
   - Semester fee clearance validation (`Cleared` vs `Pending`).
   - Ineligible students are flagged and locked from admit card generation with an administrative override option.
2. **Dynamic QR Code Generation**:
   - Each issued hall ticket embeds an authentic high-density QR code linking to `/verification?code=...`.
3. **Student Passport Photo Support**:
   - Upload candidate passport photos with real-time preview, rendered on the hall ticket with an "Attested" watermark.
4. **Official University Admit Card Format**:
   - Formatted with institutional header, candidate particulars, room allotments, timetable schedule, candidate signature box, and Controller of Examinations seal.
   - Clean `@media print` styling for print and PDF export.
5. **Public Verification Portal (`/verification`)**:
   - Real-time QR scanner and code validation for invigilators on examination day.
6. **Student Portal (`/student-portal`)**:
   - Self-service portal for candidates to check their eligibility and view/print their issued admit cards.
7. **Academic Master Registers**:
   - CRUD management for Departments, Degree Programs, Subjects, and Examinations.
   - CSV export for student registers.