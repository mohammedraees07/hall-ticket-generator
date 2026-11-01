import { getSupabaseServer } from "@/lib/auth/supabase-server";
import type {
  Department,
  Course,
  Subject,
  Student,
  Examination,
  HallTicket,
  CollegeSettings,
  ExamSubject,
  BroadcastNotice,
  SeatingPlan,
  Bench,
  ExamApplication,
  AccountsFeeStatus,
  PrincipalApprovalStatus,
  ArrearSubject,
} from "@/lib/data-store";

/**
 * Executes queries directly against Supabase PostgreSQL tables.
 * Returns null if Supabase is unconfigured or if an unexpected query failure occurs.
 */
export const supabaseStore = {
  isConfigured(): boolean {
    return Boolean(getSupabaseServer());
  },

  // =========================================================================
  // EXAMINATION APPLICATION WINDOWS
  // =========================================================================
  async getBroadcasts(semester?: number): Promise<BroadcastNotice[] | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;
    let query = supabase.from("exam_application_windows").select("*, examinations(name)").order("created_at", { ascending: false });
    if (semester !== undefined) query = query.eq("semester", semester);
    const { data, error } = await query;
    if (error || !data) return null;
    return data.map((row: any) => ({
      id: Number(row.id), examinationId: row.examination_id,
      examinationName: row.examinations?.name || "Examination",
      semester: row.semester, title: row.title, description: row.description || "",
      deadline: row.closes_at, isOpen: row.is_open, announcedAt: row.created_at,
    }));
  },

  async createBroadcast(input: { examinationId: number; semester: number; title: string; description?: string; deadline: string; academicYear: string; courseId?: number; actorId: string }): Promise<BroadcastNotice | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;
    const { data, error } = await supabase.from("exam_application_windows").insert({
      examination_id: input.examinationId, semester: input.semester, title: input.title,
      description: input.description || "", closes_at: input.deadline, is_open: true,
      academic_year: input.academicYear, course_id: input.courseId || null, created_by: input.actorId,
    }).select("*, examinations(name)").single();
    if (error || !data) return null;
    return { id: Number(data.id), examinationId: data.examination_id, examinationName: data.examinations?.name || "Examination", semester: data.semester, title: data.title, description: data.description || "", deadline: data.closes_at, isOpen: data.is_open, announcedAt: data.created_at };
  },

  async toggleBroadcast(id: number, isOpen: boolean): Promise<BroadcastNotice | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;
    const { data, error } = await supabase.from("exam_application_windows").update({ is_open: isOpen, updated_at: new Date().toISOString() }).eq("id", id).select("*, examinations(name)").single();
    if (error || !data) return null;
    return { id: Number(data.id), examinationId: data.examination_id, examinationName: data.examinations?.name || "Examination", semester: data.semester, title: data.title, description: data.description || "", deadline: data.closes_at, isOpen: data.is_open, announcedAt: data.created_at };
  },

  mapApplication(row: any): ExamApplication {
    const decisions = (row.exam_application_decisions || []) as any[];
    const latest = (kind: string) => decisions.filter((decision) => decision.decision_type === kind).sort((a, b) => String(b.decided_at).localeCompare(String(a.decided_at)))[0];
    const accounts = latest("ACCOUNTS_CLEARANCE"); const principal = latest("PRINCIPAL_EXCEPTION");
    const student = row.students || {}; const exam = row.examinations || {};
    return {
      id: Number(row.id), applicationNumber: row.application_number, examinationId: row.examination_id, examinationName: exam.name || "Examination",
      studentId: row.student_id, studentName: student.name || "Candidate", usn: student.usn || "", course: student.course || "", department: student.department || "",
      branch: student.department || "", semester: student.semester || exam.semester || 0, section: student.section || "", academicYear: student.academic_year || exam.academic_year || "",
      photoUrl: row.photo_url, feeReceiptUrl: row.fee_receipt_url, subjectsConfirmed: row.subjects_confirmed, subjectIssueNote: row.subject_issue_note || undefined,
      arrears: (row.arrears || []) as ArrearSubject[], accountsStatus: { collegeFees: accounts?.college_fees || "Pending", hostelFees: accounts?.hostel_fees || "Pending", busFees: accounts?.bus_fees || "Pending", fine: accounts?.fine || "Pending", updatedAt: accounts?.decided_at },
      principalStatus: { status: principal?.decision === "APPROVED" ? "Approved" : principal?.decision === "REJECTED" ? "Rejected" : "Pending", fineWaived: principal?.reason?.includes("waiver") || undefined, fineWaiverNote: principal?.reason || undefined, reviewedAt: principal?.decided_at },
      stage: row.stage, hallTicketId: row.hall_ticket_id || undefined, appliedAt: row.submitted_at, updatedAt: row.updated_at,
    };
  },
  async getApplications(filters?: { semester?: number; branch?: string; studentId?: number; usn?: string; stage?: string }): Promise<ExamApplication[] | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    let query = supabase.from("exam_applications").select("*, students(*), examinations(*), exam_application_decisions(*)").order("updated_at", { ascending: false });
    if (filters?.studentId) query = query.eq("student_id", filters.studentId);
    if (filters?.stage) query = query.eq("stage", filters.stage);
    const { data, error } = await query; if (error || !data) return null;
    return data.map((row: any) => this.mapApplication(row)).filter((app) =>
      (!filters?.semester || app.semester === filters.semester) &&
      (!filters?.usn || app.usn.toLowerCase() === filters.usn.toLowerCase()) &&
      (!filters?.branch || filters.branch === "ALL" || app.department.toLowerCase().includes(filters.branch.toLowerCase()))
    );
  },
  async getApplicationById(id: number): Promise<ExamApplication | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const { data, error } = await supabase.from("exam_applications").select("*, students(*), examinations(*), exam_application_decisions(*)").eq("id", id).single();
    return error || !data ? null : this.mapApplication(data);
  },
  async submitExamApplication(input: { studentId: number; examinationId: number; photoUrl?: string | null; feeReceiptUrl?: string | null; subjectsConfirmed: boolean; subjectIssueNote?: string; arrears: ArrearSubject[]; actorId: string }): Promise<ExamApplication | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const existing = await supabase.from("exam_applications").select("id").eq("student_id", input.studentId).eq("examination_id", input.examinationId).maybeSingle();
    const payload = { photo_url: input.photoUrl ?? null, fee_receipt_url: input.feeReceiptUrl ?? null, subjects_confirmed: input.subjectsConfirmed, subject_issue_note: input.subjectIssueNote || null, arrears: input.arrears, stage: "UNDER_ACCOUNTS_REVIEW", updated_at: new Date().toISOString() };
    const write = existing.data ? supabase.from("exam_applications").update(payload).eq("id", existing.data.id) : supabase.from("exam_applications").insert({ ...payload, student_id: input.studentId, examination_id: input.examinationId, application_number: `APP-${crypto.randomUUID()}`, submitted_by: input.actorId });
    const { data, error } = await write.select("*, students(*), examinations(*), exam_application_decisions(*)").single();
    return error || !data ? null : this.mapApplication(data);
  },
  async updateAccountsFeeStatus(applicationId: number, status: Partial<AccountsFeeStatus>, actorId: string): Promise<ExamApplication | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const previous = await this.getApplicationById(applicationId); if (!previous) return null;
    const merged = { ...previous.accountsStatus, ...status };
    const clear = merged.collegeFees === "No Due" && (merged.hostelFees === "No Due" || merged.hostelFees === "N/A") && (merged.busFees === "No Due" || merged.busFees === "N/A") && (merged.fine === "Paid" || merged.fine === "N/A");
    const stage = clear ? "ACCOUNTS_CLEARED" : "UNDER_ACCOUNTS_REVIEW";
    const { error: decisionError } = await supabase.from("exam_application_decisions").insert({ application_id: applicationId, decision_type: "ACCOUNTS_CLEARANCE", decision: clear ? "CLEARED" : "PENDING", college_fees: merged.collegeFees, hostel_fees: merged.hostelFees, bus_fees: merged.busFees, fine: merged.fine, decided_by: actorId });
    if (decisionError) return null;
    const { error } = await supabase.from("exam_applications").update({ stage, updated_at: new Date().toISOString() }).eq("id", applicationId); if (error) return null;
    return this.getApplicationById(applicationId);
  },
  async updatePrincipalApproval(applicationId: number, approval: { status: "Pending" | "Approved" | "Rejected"; fineWaived?: boolean; fineWaiverNote?: string; rejectionReason?: string }, actorId: string): Promise<ExamApplication | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const stage = approval.status === "Approved" ? "PRINCIPAL_APPROVED" : approval.status === "Rejected" ? "REJECTED" : "ACCOUNTS_CLEARED";
    const reason = approval.status === "Rejected" ? approval.rejectionReason : approval.fineWaived ? `Fee waiver: ${approval.fineWaiverNote || "Approved"}` : approval.fineWaiverNote;
    const { error: decisionError } = await supabase.from("exam_application_decisions").insert({ application_id: applicationId, decision_type: "PRINCIPAL_EXCEPTION", decision: approval.status === "Approved" ? "APPROVED" : approval.status === "Rejected" ? "REJECTED" : "PENDING", reason: reason || null, decided_by: actorId });
    if (decisionError) return null;
    const { error } = await supabase.from("exam_applications").update({ stage, updated_at: new Date().toISOString() }).eq("id", applicationId); if (error) return null;
    return this.getApplicationById(applicationId);
  },
  async linkHallTicket(applicationId: number, hallTicketId: number): Promise<boolean> { const supabase = getSupabaseServer(); if (!supabase) return false; return !(await supabase.from("exam_applications").update({ hall_ticket_id: hallTicketId, stage: "HALL_TICKET_ISSUED", updated_at: new Date().toISOString() }).eq("id", applicationId)).error; },

  // =========================================================================
  // DEPARTMENTS & COURSES & SUBJECTS
  // =========================================================================
  async getDepartments(): Promise<Department[] | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("departments")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data) return null;

    return data.map((d) => ({
      id: d.id,
      name: d.name,
      code: d.code,
      studentCount: d.student_count || 0,
      courseCount: d.course_count || 0,
    }));
  },

  async getCourses(): Promise<Course[] | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("courses")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data) return null;

    return data.map((c) => ({
      id: c.id,
      name: c.name,
      code: c.code,
      department: c.department,
      departmentId: c.department_id,
      duration: c.duration || 4,
      description: c.description || "",
    }));
  },

  async getSubjects(filters?: { search?: string; semester?: number }): Promise<Subject[] | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    let query = supabase.from("subjects").select("*").order("id", { ascending: true });

    if (filters?.semester) {
      query = query.eq("semester", filters.semester);
    }
    if (filters?.search) {
      query = query.or(`name.ilike.%${filters.search}%,code.ilike.%${filters.search}%`);
    }

    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      course: s.course,
      department: s.department,
      semester: s.semester,
      credits: s.credits,
      courseId: s.course_id,
      departmentId: s.department_id,
    }));
  },

  async createDepartment(input: { name: string; code: string }): Promise<Department | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const { data, error } = await supabase.from("departments").insert({ name: input.name, code: input.code.toUpperCase() }).select().single();
    return error || !data ? null : { id: data.id, name: data.name, code: data.code, studentCount: data.student_count || 0, courseCount: data.course_count || 0 };
  },
  async updateDepartment(id: number, input: Partial<Department>): Promise<Department | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.code !== undefined) payload.code = input.code.toUpperCase();
    const { data, error } = await supabase.from("departments").update(payload).eq("id", id).select().single();
    return error || !data ? null : { id: data.id, name: data.name, code: data.code, studentCount: data.student_count || 0, courseCount: data.course_count || 0 };
  },
  async deleteDepartment(id: number): Promise<boolean> {
    const supabase = getSupabaseServer(); if (!supabase) return false;
    return !(await supabase.from("departments").delete().eq("id", id)).error;
  },
  async createCourse(input: { name: string; code: string; departmentId: number; duration: number; description?: string }): Promise<Course | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const department = await this.getDepartments(); const dept = department?.find((item) => item.id === input.departmentId);
    if (!dept) return null;
    const { data, error } = await supabase.from("courses").insert({ name: input.name, code: input.code.toUpperCase(), department_id: dept.id, department: dept.name, duration: input.duration, description: input.description || "" }).select().single();
    return error || !data ? null : { id: data.id, name: data.name, code: data.code, department: data.department, departmentId: data.department_id, duration: data.duration, description: data.description || "" };
  },
  async updateCourse(id: number, input: Partial<Course>): Promise<Course | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const payload: Record<string, unknown> = {};
    if (input.name !== undefined) payload.name = input.name;
    if (input.code !== undefined) payload.code = input.code.toUpperCase();
    if (input.duration !== undefined) payload.duration = input.duration;
    if (input.description !== undefined) payload.description = input.description;
    if (input.departmentId !== undefined) {
      const depts = await this.getDepartments(); const dept = depts?.find((item) => item.id === input.departmentId); if (!dept) return null;
      payload.department_id = dept.id; payload.department = dept.name;
    }
    const { data, error } = await supabase.from("courses").update(payload).eq("id", id).select().single();
    return error || !data ? null : { id: data.id, name: data.name, code: data.code, department: data.department, departmentId: data.department_id, duration: data.duration, description: data.description || "" };
  },
  async deleteCourse(id: number): Promise<boolean> { const supabase = getSupabaseServer(); if (!supabase) return false; return !(await supabase.from("courses").delete().eq("id", id)).error; },
  async createSubject(input: { code: string; name: string; courseId: number; departmentId: number; semester: number; credits: number }): Promise<Subject | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const [courses, departments] = await Promise.all([this.getCourses(), this.getDepartments()]);
    const course = courses?.find((item) => item.id === input.courseId); const department = departments?.find((item) => item.id === input.departmentId);
    if (!course || !department || course.departmentId !== department.id) return null;
    const { data, error } = await supabase.from("subjects").insert({ code: input.code.toUpperCase(), name: input.name, course_id: course.id, course: course.name, department_id: department.id, department: department.name, semester: input.semester, credits: input.credits }).select().single();
    return error || !data ? null : { id: data.id, code: data.code, name: data.name, course: data.course, department: data.department, semester: data.semester, credits: data.credits, courseId: data.course_id, departmentId: data.department_id };
  },
  async updateSubject(id: number, input: Partial<Subject>): Promise<Subject | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const payload: Record<string, unknown> = {};
    if (input.code !== undefined) payload.code = input.code.toUpperCase(); if (input.name !== undefined) payload.name = input.name;
    if (input.semester !== undefined) payload.semester = input.semester; if (input.credits !== undefined) payload.credits = input.credits;
    if (input.courseId !== undefined || input.departmentId !== undefined) {
      const current = await supabase.from("subjects").select("course_id, department_id").eq("id", id).single();
      if (current.error || !current.data) return null;
      const courseId = input.courseId ?? current.data.course_id; const departmentId = input.departmentId ?? current.data.department_id;
      const [courses, departments] = await Promise.all([this.getCourses(), this.getDepartments()]); const course = courses?.find((item) => item.id === courseId); const department = departments?.find((item) => item.id === departmentId);
      if (!course || !department || course.departmentId !== department.id) return null;
      Object.assign(payload, { course_id: course.id, course: course.name, department_id: department.id, department: department.name });
    }
    const { data, error } = await supabase.from("subjects").update(payload).eq("id", id).select().single();
    return error || !data ? null : { id: data.id, code: data.code, name: data.name, course: data.course, department: data.department, semester: data.semester, credits: data.credits, courseId: data.course_id, departmentId: data.department_id };
  },
  async deleteSubject(id: number): Promise<boolean> { const supabase = getSupabaseServer(); if (!supabase) return false; return !(await supabase.from("subjects").delete().eq("id", id)).error; },

  // =========================================================================
  // STUDENTS
  // =========================================================================
  async getStudents(filters?: {
    search?: string;
    semester?: number;
    department?: string;
  }): Promise<Student[] | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    let query = supabase.from("students").select("*").order("id", { ascending: true });

    if (filters?.semester) {
      query = query.eq("semester", filters.semester);
    }
    if (filters?.department) {
      query = query.eq("department", filters.department);
    }
    if (filters?.search) {
      query = query.or(
        `name.ilike.%${filters.search}%,usn.ilike.%${filters.search}%,student_id.ilike.%${filters.search}%`
      );
    }

    const { data, error } = await query;
    if (error || !data) return null;

    return data.map((r) => ({
      id: r.id,
      studentId: r.student_id,
      usn: r.usn,
      name: r.name,
      dob: r.dob,
      gender: r.gender,
      email: r.email,
      phone: r.phone,
      address: r.address || "",
      course: r.course,
      department: r.department,
      departmentId: r.department_id,
      courseId: r.course_id,
      semester: r.semester,
      section: r.section,
      academicYear: r.academic_year,
      photoUrl: r.photo_url,
      attendancePercentage: r.attendance_percentage,
      feeStatus: r.fee_status,
    }));
  },

  async getStudentById(id: number): Promise<Student | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("students")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      studentId: data.student_id,
      usn: data.usn,
      name: data.name,
      dob: data.dob,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      address: data.address || "",
      course: data.course,
      department: data.department,
      departmentId: data.department_id,
      courseId: data.course_id,
      semester: data.semester,
      section: data.section,
      academicYear: data.academic_year,
      photoUrl: data.photo_url,
      attendancePercentage: data.attendance_percentage,
      feeStatus: data.fee_status,
    };
  },

  async createStudent(input: Partial<Student>): Promise<Student | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("students")
      .insert({
        student_id: input.studentId,
        usn: input.usn,
        name: input.name,
        dob: input.dob,
        gender: input.gender,
        email: input.email,
        phone: input.phone,
        address: input.address,
        course: input.course || "B.Tech Computer Science & Engineering",
        department: input.department || "Computer Science & Engineering",
        department_id: input.departmentId,
        course_id: input.courseId,
        semester: input.semester,
        section: input.section,
        academic_year: input.academicYear || "2024-25",
        photo_url: input.photoUrl,
        attendance_percentage: input.attendancePercentage,
        fee_status: input.feeStatus,
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase createStudent error:", error);
      return null;
    }

    return {
      id: data.id,
      studentId: data.student_id,
      usn: data.usn,
      name: data.name,
      dob: data.dob,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      address: data.address || "",
      course: data.course,
      department: data.department,
      departmentId: data.department_id,
      courseId: data.course_id,
      semester: data.semester,
      section: data.section,
      academicYear: data.academic_year,
      photoUrl: data.photo_url,
      attendancePercentage: data.attendance_percentage,
      feeStatus: data.fee_status,
    };
  },

  async updateStudent(id: number, updates: Partial<Student>): Promise<Student | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const payload: Record<string, unknown> = {};
    if (updates.name) payload.name = updates.name;
    if (updates.usn) payload.usn = updates.usn;
    if (updates.email) payload.email = updates.email;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.semester) payload.semester = updates.semester;
    if (updates.section) payload.section = updates.section;
    if (updates.photoUrl !== undefined) payload.photo_url = updates.photoUrl;
    if (updates.attendancePercentage !== undefined) payload.attendance_percentage = updates.attendancePercentage;
    if (updates.feeStatus) payload.fee_status = updates.feeStatus;

    const { data, error } = await supabase
      .from("students")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      studentId: data.student_id,
      usn: data.usn,
      name: data.name,
      dob: data.dob,
      gender: data.gender,
      email: data.email,
      phone: data.phone,
      address: data.address || "",
      course: data.course,
      department: data.department,
      departmentId: data.department_id,
      courseId: data.course_id,
      semester: data.semester,
      section: data.section,
      academicYear: data.academic_year,
      photoUrl: data.photo_url,
      attendancePercentage: data.attendance_percentage,
      feeStatus: data.fee_status,
    };
  },

  async deleteStudent(id: number): Promise<boolean> {
    const supabase = getSupabaseServer();
    if (!supabase) return false;

    const { error } = await supabase.from("students").delete().eq("id", id);
    return !error;
  },

  // =========================================================================
  // EXAMINATIONS
  // =========================================================================
  async getExaminations(): Promise<Examination[] | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("examinations")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data) return null;

    return data.map((e) => ({
      id: e.id,
      name: e.name,
      examType: e.exam_type,
      semester: e.semester,
      academicYear: e.academic_year,
      startDate: e.start_date,
      endDate: e.end_date,
      center: e.center,
      session: e.session,
      description: e.description || "",
      subjectCount: e.subject_count || (e.subjects ? e.subjects.length : 0),
      status: e.status,
      subjects: (e.subjects as ExamSubject[]) || [],
    }));
  },

  async getExaminationById(id: number): Promise<Examination | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("examinations")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      examType: data.exam_type,
      semester: data.semester,
      academicYear: data.academic_year,
      startDate: data.start_date,
      endDate: data.end_date,
      center: data.center,
      session: data.session,
      description: data.description || "",
      subjectCount: data.subject_count || (data.subjects ? data.subjects.length : 0),
      status: data.status,
      subjects: (data.subjects as ExamSubject[]) || [],
    };
  },

  async createExamination(input: Omit<Examination, "id" | "subjectCount">): Promise<Examination | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("examinations")
      .insert({
        name: input.name,
        exam_type: input.examType,
        semester: input.semester,
        academic_year: input.academicYear,
        start_date: input.startDate,
        end_date: input.endDate,
        center: input.center,
        session: input.session,
        description: input.description,
        subject_count: input.subjects?.length || 0,
        status: input.status || "Draft",
        subjects: input.subjects || [],
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase createExamination error:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      examType: data.exam_type,
      semester: data.semester,
      academicYear: data.academic_year,
      startDate: data.start_date,
      endDate: data.end_date,
      center: data.center,
      session: data.session,
      description: data.description || "",
      subjectCount: data.subject_count,
      status: data.status,
      subjects: (data.subjects as ExamSubject[]) || [],
    };
  },

  async updateExamination(id: number, updates: Partial<Examination>): Promise<Examination | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const payload: Record<string, unknown> = {};
    if (updates.name) payload.name = updates.name;
    if (updates.examType) payload.exam_type = updates.examType;
    if (updates.semester) payload.semester = updates.semester;
    if (updates.academicYear) payload.academic_year = updates.academicYear;
    if (updates.startDate) payload.start_date = updates.startDate;
    if (updates.endDate) payload.end_date = updates.endDate;
    if (updates.center) payload.center = updates.center;
    if (updates.session) payload.session = updates.session;
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.status) payload.status = updates.status;
    if (updates.subjects) {
      payload.subjects = updates.subjects;
      payload.subject_count = updates.subjects.length;
    }

    const { data, error } = await supabase
      .from("examinations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      name: data.name,
      examType: data.exam_type,
      semester: data.semester,
      academicYear: data.academic_year,
      startDate: data.start_date,
      endDate: data.end_date,
      center: data.center,
      session: data.session,
      description: data.description || "",
      subjectCount: data.subject_count,
      status: data.status,
      subjects: (data.subjects as ExamSubject[]) || [],
    };
  },

  async deleteExamination(id: number): Promise<boolean> {
    const supabase = getSupabaseServer();
    if (!supabase) return false;

    const { error } = await supabase.from("examinations").delete().eq("id", id);
    return !error;
  },

  // =========================================================================
  // HALL TICKETS
  // =========================================================================
  async getHallTickets(): Promise<HallTicket[] | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("hall_tickets")
      .select("*")
      .order("id", { ascending: true });

    if (error || !data) return null;

    return data.map((t) => ({
      id: t.id,
      number: t.number,
      studentId: t.student_id,
      studentName: t.student_name,
      usn: t.usn,
      course: t.course,
      department: t.department,
      semester: t.semester,
      section: t.section,
      photoUrl: t.photo_url,
      examinationId: t.examination_id,
      examinationName: t.examination_name,
      academicYear: t.academic_year,
      center: t.center,
      verifyCode: t.verify_code,
      qrDataUrl: t.qr_data_url,
      status: t.status,
      subjects: (t.subjects as ExamSubject[]) || [],
      generatedAt: t.generated_at,
    }));
  },

  async getHallTicketsByStudentId(studentId: number): Promise<HallTicket[] | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("hall_tickets")
      .select("*")
      .eq("student_id", studentId)
      .order("id", { ascending: true });

    if (error || !data) return null;

    return data.map((t) => ({
      id: t.id,
      number: t.number,
      studentId: t.student_id,
      studentName: t.student_name,
      usn: t.usn,
      course: t.course,
      department: t.department,
      semester: t.semester,
      section: t.section,
      photoUrl: t.photo_url,
      examinationId: t.examination_id,
      examinationName: t.examination_name,
      academicYear: t.academic_year,
      center: t.center,
      verifyCode: t.verify_code,
      qrDataUrl: t.qr_data_url,
      status: t.status,
      subjects: (t.subjects as ExamSubject[]) || [],
      generatedAt: t.generated_at,
    }));
  },

  async getHallTicketById(id: number): Promise<HallTicket | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("hall_tickets")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      number: data.number,
      studentId: data.student_id,
      studentName: data.student_name,
      usn: data.usn,
      course: data.course,
      department: data.department,
      semester: data.semester,
      section: data.section,
      photoUrl: data.photo_url,
      examinationId: data.examination_id,
      examinationName: data.examination_name,
      academicYear: data.academic_year,
      center: data.center,
      verifyCode: data.verify_code,
      qrDataUrl: data.qr_data_url,
      status: data.status,
      subjects: (data.subjects as ExamSubject[]) || [],
      generatedAt: data.generated_at,
    };
  },

  async getHallTicketByVerifyCode(code: string): Promise<HallTicket | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const clean = code.trim();
    const { data, error } = await supabase
      .from("hall_tickets")
      .select("*")
      .or(`verify_code.ilike.${clean},number.ilike.${clean}`)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      number: data.number,
      studentId: data.student_id,
      studentName: data.student_name,
      usn: data.usn,
      course: data.course,
      department: data.department,
      semester: data.semester,
      section: data.section,
      photoUrl: data.photo_url,
      examinationId: data.examination_id,
      examinationName: data.examination_name,
      academicYear: data.academic_year,
      center: data.center,
      verifyCode: data.verify_code,
      qrDataUrl: data.qr_data_url,
      status: data.status,
      subjects: (data.subjects as ExamSubject[]) || [],
      generatedAt: data.generated_at,
    };
  },

  async createHallTicket(t: Omit<HallTicket, "id">): Promise<HallTicket | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("hall_tickets")
      .insert({
        number: t.number,
        student_id: t.studentId,
        student_name: t.studentName,
        usn: t.usn,
        course: t.course,
        department: t.department,
        semester: t.semester,
        section: t.section,
        photo_url: t.photoUrl,
        examination_id: t.examinationId,
        examination_name: t.examinationName,
        academic_year: t.academicYear,
        center: t.center,
        verify_code: t.verifyCode,
        qr_data_url: t.qrDataUrl,
        status: t.status || "Valid",
        subjects: t.subjects || [],
      })
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase createHallTicket error:", error);
      return null;
    }

    return {
      id: data.id,
      number: data.number,
      studentId: data.student_id,
      studentName: data.student_name,
      usn: data.usn,
      course: data.course,
      department: data.department,
      semester: data.semester,
      section: data.section,
      photoUrl: data.photo_url,
      examinationId: data.examination_id,
      examinationName: data.examination_name,
      academicYear: data.academic_year,
      center: data.center,
      verifyCode: data.verify_code,
      qrDataUrl: data.qr_data_url,
      status: data.status,
      subjects: (data.subjects as ExamSubject[]) || [],
      generatedAt: data.generated_at,
    };
  },

  // =========================================================================
  // SEATING PLANS
  // =========================================================================
  async getSeatingPlans(filters?: { examinationId?: number; roomName?: string }): Promise<SeatingPlan[] | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    let query = supabase.from("seating_plans").select("*, examinations(name)").order("exam_date", { ascending: true }).order("room_name", { ascending: true });
    if (filters?.examinationId) query = query.eq("examination_id", filters.examinationId);
    if (filters?.roomName) query = query.ilike("room_name", `%${filters.roomName}%`);
    const { data, error } = await query; if (error || !data) return null;
    return data.map((row: any) => ({ id: Number(row.id), roomName: row.room_name, examinationId: row.examination_id, examinationName: row.examinations?.name || "Examination", examDate: row.exam_date, session: row.session, totalBenches: row.total_benches, benchesPerRow: row.benches_per_row, benches: (row.benches || []) as Bench[], createdAt: row.created_at, updatedAt: row.updated_at }));
  },
  async getSeatingPlanById(id: number): Promise<SeatingPlan | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const { data, error } = await supabase.from("seating_plans").select("*, examinations(name)").eq("id", id).single();
    return error || !data ? null : { id: Number(data.id), roomName: data.room_name, examinationId: data.examination_id, examinationName: data.examinations?.name || "Examination", examDate: data.exam_date, session: data.session, totalBenches: data.total_benches, benchesPerRow: data.benches_per_row, benches: (data.benches || []) as Bench[], createdAt: data.created_at, updatedAt: data.updated_at };
  },
  async saveSeatingPlan(input: Omit<SeatingPlan, "id" | "createdAt" | "updatedAt"> & { id?: number }): Promise<SeatingPlan | null> {
    const supabase = getSupabaseServer(); if (!supabase) return null;
    const payload = { examination_id: input.examinationId, room_name: input.roomName, exam_date: input.examDate, session: input.session, total_benches: input.totalBenches, benches_per_row: input.benchesPerRow, benches: input.benches, updated_at: new Date().toISOString() };
    const query = input.id ? supabase.from("seating_plans").update(payload).eq("id", input.id) : supabase.from("seating_plans").insert(payload);
    const { data, error } = await query.select("*, examinations(name)").single();
    return error || !data ? null : { id: Number(data.id), roomName: data.room_name, examinationId: data.examination_id, examinationName: data.examinations?.name || input.examinationName, examDate: data.exam_date, session: data.session, totalBenches: data.total_benches, benchesPerRow: data.benches_per_row, benches: (data.benches || []) as Bench[], createdAt: data.created_at, updatedAt: data.updated_at };
  },
  async deleteSeatingPlan(id: number): Promise<boolean> { const supabase = getSupabaseServer(); if (!supabase) return false; return !(await supabase.from("seating_plans").delete().eq("id", id)).error; },

  // =========================================================================
  // DASHBOARD KPI SUMMARY
  // =========================================================================
  async getDashboardSummary(): Promise<{
    totalStudents: number;
    totalExams: number;
    totalHallTickets: number;
    departmentsCount: number;
  } | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const [students, exams, tickets, depts] = await Promise.all([
      supabase.from("students").select("id", { count: "exact", head: true }),
      supabase.from("examinations").select("id", { count: "exact", head: true }),
      supabase.from("hall_tickets").select("id", { count: "exact", head: true }),
      supabase.from("departments").select("id", { count: "exact", head: true }),
    ]);

    return {
      totalStudents: students.count || 0,
      totalExams: exams.count || 0,
      totalHallTickets: tickets.count || 0,
      departmentsCount: depts.count || 0,
    };
  },

  // =========================================================================
  // COLLEGE SETTINGS & PRINCIPAL DIGITAL SIGNATURE
  // =========================================================================
  async getSettings(): Promise<CollegeSettings | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const { data, error } = await supabase
      .from("college_settings")
      .select("*")
      .eq("id", 1)
      .single();

    if (error || !data) return null;

    return {
      collegeName: data.college_name,
      collegeCode: data.college_code,
      email: data.email,
      phone: data.phone,
      controllerName: data.controller_name,
      principalName: data.principal_name,
      principalSignatureUrl: data.principal_signature_url,
      principalSignatureMode: data.principal_signature_mode || "scribble",
      principalTypedSignature: data.principal_typed_signature || "",
      registrarName: data.registrar_name || "Dr. B. E. Rangaswamy, Registrar (Evaluation)",
      registrarSignatureUrl: data.registrar_signature_url || "",
      registrarSignatureMode: data.registrar_signature_mode || "typed",
      registrarTypedSignature: data.registrar_typed_signature || "",
      minAttendance: data.min_attendance,
    };
  },

  async updateSettings(updates: Partial<CollegeSettings>): Promise<CollegeSettings | null> {
    const supabase = getSupabaseServer();
    if (!supabase) return null;

    const payload: Record<string, unknown> = {};
    if (updates.collegeName) payload.college_name = updates.collegeName;
    if (updates.collegeCode) payload.college_code = updates.collegeCode;
    if (updates.email) payload.email = updates.email;
    if (updates.phone) payload.phone = updates.phone;
    if (updates.controllerName) payload.controller_name = updates.controllerName;
    if (updates.principalName) payload.principal_name = updates.principalName;
    if (updates.principalSignatureUrl !== undefined) payload.principal_signature_url = updates.principalSignatureUrl;
    if (updates.principalSignatureMode !== undefined) payload.principal_signature_mode = updates.principalSignatureMode;
    if (updates.principalTypedSignature !== undefined) payload.principal_typed_signature = updates.principalTypedSignature;
    if (updates.registrarName !== undefined) payload.registrar_name = updates.registrarName;
    if (updates.registrarSignatureUrl !== undefined) payload.registrar_signature_url = updates.registrarSignatureUrl;
    if (updates.registrarSignatureMode !== undefined) payload.registrar_signature_mode = updates.registrarSignatureMode;
    if (updates.registrarTypedSignature !== undefined) payload.registrar_typed_signature = updates.registrarTypedSignature;
    if (updates.minAttendance) payload.min_attendance = updates.minAttendance;

    const { data, error } = await supabase
      .from("college_settings")
      .upsert({ id: 1, ...payload })
      .select()
      .single();

    if (error || !data) return null;

    return {
      collegeName: data.college_name,
      collegeCode: data.college_code,
      email: data.email,
      phone: data.phone,
      controllerName: data.controller_name,
      principalName: data.principal_name,
      principalSignatureUrl: data.principal_signature_url,
      principalSignatureMode: data.principal_signature_mode || "scribble",
      principalTypedSignature: data.principal_typed_signature || "",
      registrarName: data.registrar_name || "Dr. B. E. Rangaswamy, Registrar (Evaluation)",
      registrarSignatureUrl: data.registrar_signature_url || "",
      registrarSignatureMode: data.registrar_signature_mode || "typed",
      registrarTypedSignature: data.registrar_typed_signature || "",
      minAttendance: data.min_attendance,
    };
  },
};
