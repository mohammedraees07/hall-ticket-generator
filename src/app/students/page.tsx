"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { type Student, type Department, type Course } from "@/lib/data-store";
import { formatDate, getInitials } from "@/lib/utils";
import {
  Users,
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  FileCheck2,
  AlertTriangle,
  Upload,
} from "lucide-react";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [viewStudent, setViewStudent] = useState<Student | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Form State
  const [formData, setFormData] = useState<Partial<Student>>({
    studentId: "",
    usn: "",
    name: "",
    dob: "",
    gender: "Female",
    email: "",
    phone: "",
    address: "",
    departmentId: 1,
    courseId: 1,
    semester: 4,
    section: "A",
    academicYear: "2024-25",
    photoUrl: "",
    attendancePercentage: 85,
    feeStatus: "Pending",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [studRes, deptRes, crsRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/departments"),
        fetch("/api/courses"),
      ]);
      if (studRes.ok) setStudents(await studRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
      if (crsRes.ok) setCourses(await crsRes.json());
    } catch (err) {
      console.error("Failed to load students:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingStudent(null);
    setFormData({
      studentId: `STU-2022-${String(students.length + 1).padStart(3, "0")}`,
      usn: `1RV22CS${String(students.length + 1).padStart(3, "0")}`,
      name: "",
      dob: "2004-01-01",
      gender: "Female",
      email: "",
      phone: "+91 ",
      address: "Bengaluru, Karnataka",
      departmentId: departments[0]?.id || 1,
      courseId: courses[0]?.id || 1,
      semester: 4,
      section: "A",
      academicYear: "2024-25",
      photoUrl: "",
      attendancePercentage: 85,
      feeStatus: "Pending",
    });
    setModalOpen(true);
  };

  const openEditModal = (s: Student) => {
    setEditingStudent(s);
    setFormData({ ...s });
    setModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingStudent ? `/api/students/${editingStudent.id}` : "/api/students";
      const method = editingStudent ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setModalOpen(false);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save student record");
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (s: Student) => {
    if (!confirm(`Are you sure you want to delete ${s.name} (${s.usn})?`)) return;
    try {
      const res = await fetch(`/api/students/${s.id}`, { method: "DELETE" });
      if (res.ok) {
        loadData();
      }
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("purpose", "photo");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, photoUrl: data.url }));
      } else {
        console.error("Photo upload failed", await res.text());
      }
    } catch (error) {
      console.error("Photo upload failed", error);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const exportCSV = () => {
    const headers = [
      "Student ID",
      "USN",
      "Name",
      "Department",
      "Course",
      "Semester",
      "Section",
      "Attendance %",
      "Fee Status",
      "Exam Eligibility",
    ];
    const rows = filteredStudents.map((s) => [
      s.studentId,
      s.usn,
      s.name,
      s.department,
      s.course,
      s.semester,
      s.section,
      `${s.attendancePercentage}%`,
      s.feeStatus,
      s.attendancePercentage >= 75 && s.feeStatus === "Cleared" ? "Eligible" : "Ineligible",
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `student-register-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredStudents = students.filter((s) => {
    const matchSearch =
      !search ||
      [s.name, s.usn, s.studentId].some((val) =>
        val.toLowerCase().includes(search.toLowerCase())
      );
    const matchSem = !semesterFilter || String(s.semester) === semesterFilter;
    const matchDept = !departmentFilter || s.department.toLowerCase().includes(departmentFilter.toLowerCase());
    return matchSearch && matchSem && matchDept;
  });

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["ADMIN", "STAFF"]}>
        <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Academic Records</span>
              <span className="text-neutral-600">/</span>
              <Badge variant="neutral">{filteredStudents.length} Students</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Student Academic Register</h2>
            <p className="text-xs text-[#8d929d] mt-1">
              Candidate enrollment database, attendance compliance records, and hall ticket eligibility status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={exportCSV}>
              <Download size={14} /> Export CSV
            </Button>
            <Button variant="primary" onClick={openCreateModal}>
              <Plus size={15} /> Add Candidate
            </Button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_160px_200px]">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-[#6c7280]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search candidate name, USN, or Student ID..."
                className="h-9 w-full rounded-[5px] border border-[#272a33] bg-[#0d0e12] pl-9 pr-3 text-xs text-white placeholder:text-[#525866] outline-none focus:border-white focus:ring-1 focus:ring-white"
              />
            </div>
            <select
              value={semesterFilter}
              onChange={(e) => setSemesterFilter(e.target.value)}
              className="h-9 rounded-[5px] border border-[#272a33] bg-[#0d0e12] px-3 text-xs text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
            >
              <option value="">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                <option key={s} value={String(s)}>
                  Semester {s}
                </option>
              ))}
            </select>
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              className="h-9 rounded-[5px] border border-[#272a33] bg-[#0d0e12] px-3 text-xs text-white outline-none focus:border-white focus:ring-1 focus:ring-white"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </Card>

        {/* Table Register */}
        <Card className="rounded-[5px] border border-[#23262d] bg-[#131519]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1f2229] bg-[#0f1013] text-[#7f8592] text-[11px] font-mono uppercase tracking-wider">
                    <th className="p-4 font-semibold">Candidate</th>
                    <th className="p-4 font-semibold">USN</th>
                    <th className="p-4 font-semibold">Degree Course</th>
                    <th className="p-4 font-semibold">Sem / Sec</th>
                    <th className="p-4 font-semibold text-center">Attendance</th>
                    <th className="p-4 font-semibold text-center">Fees</th>
                    <th className="p-4 font-semibold text-center">Exam Eligibility</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2229]">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#737887]">
                        Loading student records...
                      </td>
                    </tr>
                  ) : filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-12 text-center text-[#737887]">
                        No candidate records match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => {
                      const isEligible = s.attendancePercentage >= 75 && s.feeStatus === "Cleared";
                      return (
                        <tr key={s.id} className="hover:bg-[#16181f] transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="h-9 w-9 rounded-[4px] bg-[#1a1c22] border border-[#272b35] overflow-hidden flex items-center justify-center font-bold text-xs text-white shrink-0">
                                {s.photoUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={s.photoUrl} alt={s.name} className="h-full w-full object-cover" />
                                ) : (
                                  getInitials(s.name)
                                )}
                              </div>
                              <div>
                                <button
                                  onClick={() => setViewStudent(s)}
                                  className="font-semibold text-white hover:underline text-left"
                                >
                                  {s.name}
                                </button>
                                <p className="text-[10px] font-mono text-[#8d929d]">{s.studentId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 font-mono font-bold text-white tracking-wider">{s.usn}</td>
                          <td className="p-4 text-[#cbd0dc]">
                            <div>{s.course}</div>
                            <div className="text-[10px] text-[#717682]">{s.department}</div>
                          </td>
                          <td className="p-4 font-mono text-[#9ca3af]">
                            Sem {s.semester} · {s.section}
                          </td>
                          <td className="p-4 text-center">
                            <span className="font-mono font-bold text-white">
                              {s.attendancePercentage}%
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant={s.feeStatus === "Cleared" ? "success" : "danger"}>
                              {s.feeStatus}
                            </Badge>
                          </td>
                          <td className="p-4 text-center">
                            <Badge variant={isEligible ? "success" : "danger"}>
                              {isEligible ? "ELIGIBLE" : "INELIGIBLE"}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(s)}
                                title="Edit Record"
                              >
                                <Pencil size={13} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-[#f87171] hover:text-[#f87171] hover:bg-[#2a1313]"
                                onClick={() => handleDelete(s)}
                                title="Delete Record"
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add / Edit Student Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingStudent ? "Edit Candidate Record" : "Register New Candidate"}
          subtitle="All academic and personal details are verified for official hall ticket issuance."
          maxWidth="2xl"
        >
          <form onSubmit={handleSaveStudent} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Student ID"
                required
                value={formData.studentId}
                onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              />
              <Input
                label="University Seat Number (USN)"
                required
                value={formData.usn}
                onChange={(e) => setFormData({ ...formData, usn: e.target.value.toUpperCase() })}
              />
              <Input
                label="Full Candidate Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Date of Birth"
                type="date"
                required
                value={formData.dob?.slice(0, 10)}
                onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
              />
              <Select
                label="Gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </Select>
              <Input
                label="Institutional Email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
              <Input
                label="Contact Phone"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Residential Address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
              <Select
                label="Academic Department"
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: Number(e.target.value) })}
              >
                {departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Degree Course"
                value={formData.courseId}
                onChange={(e) => setFormData({ ...formData, courseId: Number(e.target.value) })}
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Current Semester"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: Number(e.target.value) })}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </Select>
              <Input
                label="Section"
                value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value.toUpperCase() })}
              />

              {/* Attendance & Fee Status */}
              <Input
                label="Attendance Percentage (%)"
                type="number"
                min="0"
                max="100"
                required
                value={formData.attendancePercentage}
                onChange={(e) => setFormData({ ...formData, attendancePercentage: Number(e.target.value) })}
              />
              <div>
                <label className="block text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1.5">
                  Fee Clearance Status
                </label>
                <div className="h-10 px-3.5 rounded-[5px] border border-[#2a2e38] bg-[#0c0d10] flex items-center justify-between text-xs">
                  <Badge variant={formData.feeStatus === "Cleared" ? "success" : "danger"}>
                    {formData.feeStatus || "Pending"}
                  </Badge>
                  <span className="text-[10px] text-[#717682]">
                    Managed by Accounts Section
                  </span>
                </div>
              </div>
            </div>

            {/* Photo Upload Section */}
            <div className="pt-2 border-t border-[#22252e]">
              <label className="block text-xs font-medium text-[#9ca3af] uppercase tracking-wide mb-1.5">
                Candidate Passport Photo
              </label>
              <div className="flex items-center gap-4">
                <div className="h-16 w-14 rounded-[4px] border-2 border-[#2b2f3a] bg-[#0c0d10] overflow-hidden flex items-center justify-center">
                  {formData.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={formData.photoUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] text-[#636875] text-center font-bold">NO PHOTO</span>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input
                    type="file"
                    accept="image/*"
                    disabled={uploadingPhoto}
                    onChange={handlePhotoUpload}
                    className="text-xs text-[#9ca3af] file:mr-3 file:py-1.5 file:px-3 file:rounded-[4px] file:border-0 file:text-xs file:font-semibold file:bg-[#1f222a] file:text-white hover:file:bg-[#282c36] disabled:opacity-50"
                  />
                  {uploadingPhoto && (
                    <p className="text-[11px] font-mono text-[#9ca3af] animate-pulse">
                      Uploading to Supabase Storage...
                    </p>
                  )}
                  <Input
                    placeholder="Or enter direct image URL (https://...)"
                    value={formData.photoUrl || ""}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-4 border-t border-[#22252e]">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                {editingStudent ? "Save Changes" : "Register Student"}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* View Student Details Modal */}
      {viewStudent && (
        <Modal
          isOpen={Boolean(viewStudent)}
          onClose={() => setViewStudent(null)}
          title="Student Record Profile"
          subtitle={`USN: ${viewStudent.usn} · ${viewStudent.studentId}`}
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 border-b border-[#22252e] pb-4">
              <div className="h-16 w-14 rounded-[4px] border border-[#2b2f3a] overflow-hidden flex items-center justify-center bg-[#171920]">
                {viewStudent.photoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={viewStudent.photoUrl} alt={viewStudent.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-sm font-bold text-white">{getInitials(viewStudent.name)}</span>
                )}
              </div>
              <div>
                <h3 className="font-bold text-white text-base">{viewStudent.name}</h3>
                <p className="font-mono text-xs text-[#9ca3af]">{viewStudent.usn}</p>
                <div className="flex gap-2 mt-2">
                  <Badge variant={viewStudent.attendancePercentage >= 75 ? "success" : "danger"}>
                    {viewStudent.attendancePercentage}% Attendance
                  </Badge>
                  <Badge variant={viewStudent.feeStatus === "Cleared" ? "success" : "danger"}>
                    Fees {viewStudent.feeStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-[#0d0e12] rounded-[4px] border border-[#20232a]">
                <p className="text-[10px] uppercase text-[#737887]">Degree Course</p>
                <p className="font-semibold text-white mt-1">{viewStudent.course}</p>
              </div>
              <div className="p-3 bg-[#0d0e12] rounded-[4px] border border-[#20232a]">
                <p className="text-[10px] uppercase text-[#737887]">Department</p>
                <p className="font-semibold text-white mt-1">{viewStudent.department}</p>
              </div>
              <div className="p-3 bg-[#0d0e12] rounded-[4px] border border-[#20232a]">
                <p className="text-[10px] uppercase text-[#737887]">Semester / Section</p>
                <p className="font-semibold text-white mt-1">Sem {viewStudent.semester} · Sec {viewStudent.section}</p>
              </div>
              <div className="p-3 bg-[#0d0e12] rounded-[4px] border border-[#20232a]">
                <p className="text-[10px] uppercase text-[#737887]">Academic Session</p>
                <p className="font-semibold text-white mt-1">{viewStudent.academicYear}</p>
              </div>
              <div className="p-3 bg-[#0d0e12] rounded-[4px] border border-[#20232a]">
                <p className="text-[10px] uppercase text-[#737887]">Email</p>
                <p className="font-semibold text-white mt-1 truncate">{viewStudent.email}</p>
              </div>
              <div className="p-3 bg-[#0d0e12] rounded-[4px] border border-[#20232a]">
                <p className="text-[10px] uppercase text-[#737887]">Phone</p>
                <p className="font-semibold text-white mt-1">{viewStudent.phone}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setViewStudent(null)}>
                Close Profile
              </Button>
            </div>
          </div>
        </Modal>
      )}
      </RoleGuard>
    </AppLayout>
  );
}
