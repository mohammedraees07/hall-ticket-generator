"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { type Subject, type Course, type Department } from "@/lib/data-store";
import { BookOpen, Plus, Pencil, Trash2, Search } from "lucide-react";

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubj, setEditingSubj] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    courseId: 1,
    departmentId: 1,
    semester: 4,
    credits: 4,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [subRes, crsRes, deptRes] = await Promise.all([
        fetch("/api/subjects"),
        fetch("/api/courses"),
        fetch("/api/departments"),
      ]);
      if (subRes.ok) setSubjects(await subRes.json());
      if (crsRes.ok) setCourses(await crsRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (err) {
      console.error("Failed to load subjects:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingSubj(null);
    setFormData({
      code: "",
      name: "",
      courseId: courses[0]?.id || 1,
      departmentId: departments[0]?.id || 1,
      semester: 4,
      credits: 4,
    });
    setModalOpen(true);
  };

  const openEdit = (s: Subject) => {
    setEditingSubj(s);
    setFormData({
      code: s.code,
      name: s.name,
      courseId: s.courseId,
      departmentId: s.departmentId,
      semester: s.semester,
      credits: s.credits,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingSubj ? `/api/subjects/${editingSubj.id}` : "/api/subjects";
      const method = editingSubj ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        loadData();
      }
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleDelete = async (s: Subject) => {
    if (!confirm(`Are you sure you want to delete ${s.name}?`)) return;
    try {
      const res = await fetch(`/api/subjects/${s.id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const filtered = subjects.filter((s) => {
    const matchSearch =
      !search || `${s.code} ${s.name}`.toLowerCase().includes(search.toLowerCase());
    const matchSem = !semesterFilter || String(s.semester) === semesterFilter;
    return matchSearch && matchSem;
  });

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Academic Structure</span>
              <span className="text-neutral-600">/</span>
              <Badge variant="neutral">{filtered.length} Subjects</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Course Subjects Register</h2>
            <p className="text-xs text-[#8d929d] mt-1">
              Curricular subjects, semester mappings, and credits for examination schedule assignment.
            </p>
          </div>
          <Button variant="primary" onClick={openCreate}>
            <Plus size={15} /> Add Subject
          </Button>
        </div>

        {/* Filter */}
        <Card className="rounded-[5px] border border-[#23262d] bg-[#131519] p-4">
          <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-2.5 text-[#6c7280]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search subject code or name..."
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
          </div>
        </Card>

        <Card className="rounded-[5px] border border-[#23262d] bg-[#131519]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1f2229] bg-[#0f1013] text-[#7f8592] text-[11px] font-mono uppercase tracking-wider">
                    <th className="p-4 font-semibold">Subject Code</th>
                    <th className="p-4 font-semibold">Subject Title</th>
                    <th className="p-4 font-semibold">Degree Program</th>
                    <th className="p-4 font-semibold">Department</th>
                    <th className="p-4 font-semibold">Semester</th>
                    <th className="p-4 font-semibold text-center">Credits</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2229]">
                  {filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-[#16181f] transition-colors">
                      <td className="p-4 font-mono font-bold text-white">{s.code}</td>
                      <td className="p-4 font-semibold text-white">{s.name}</td>
                      <td className="p-4 text-[#cbd0dc]">{s.course}</td>
                      <td className="p-4 text-[#8d929d]">{s.department}</td>
                      <td className="p-4 font-mono text-[#9ca3af]">Semester {s.semester}</td>
                      <td className="p-4 font-mono text-center text-white">{s.credits}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(s)}>
                            <Pencil size={13} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-[#f87171] hover:bg-[#2a1313]" onClick={() => handleDelete(s)}>
                            <Trash2 size={13} />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingSubj ? "Edit Subject" : "Add Course Subject"}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Subject Code (e.g. CS401)"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            <Input
              label="Subject Title"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Select
              label="Department"
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
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Semester"
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
                label="Credits"
                type="number"
                min="1"
                max="10"
                required
                value={formData.credits}
                onChange={(e) => setFormData({ ...formData, credits: Number(e.target.value) })}
              />
            </div>
            <div className="flex justify-end gap-2 pt-4 border-t border-[#22252e]">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Subject
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </RoleGuard>
    </AppLayout>
  );
}
