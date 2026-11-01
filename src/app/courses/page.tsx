"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { type Course, type Department } from "@/lib/data-store";
import { GraduationCap, Plus, Pencil, Trash2 } from "lucide-react";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    departmentId: 1,
    duration: 4,
    description: "",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [crsRes, deptRes] = await Promise.all([
        fetch("/api/courses"),
        fetch("/api/departments"),
      ]);
      if (crsRes.ok) setCourses(await crsRes.json());
      if (deptRes.ok) setDepartments(await deptRes.json());
    } catch (err) {
      console.error("Failed to load courses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingCourse(null);
    setFormData({
      name: "",
      code: "",
      departmentId: departments[0]?.id || 1,
      duration: 4,
      description: "",
    });
    setModalOpen(true);
  };

  const openEdit = (c: Course) => {
    setEditingCourse(c);
    setFormData({
      name: c.name,
      code: c.code,
      departmentId: c.departmentId,
      duration: c.duration,
      description: c.description,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingCourse ? `/api/courses/${editingCourse.id}` : "/api/courses";
      const method = editingCourse ? "PUT" : "POST";
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

  const handleDelete = async (c: Course) => {
    if (!confirm(`Are you sure you want to delete ${c.name}?`)) return;
    try {
      const res = await fetch(`/api/courses/${c.id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["ADMIN"]}>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Academic Structure</span>
              <span className="text-neutral-600">/</span>
              <Badge variant="neutral">{courses.length} Degree Programs</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Degree Programs & Courses</h2>
            <p className="text-xs text-[#8d929d] mt-1">
              Degree curricula, branch specializations, and study duration specifications.
            </p>
          </div>
          <Button variant="primary" onClick={openCreate}>
            <Plus size={15} /> Add Course
          </Button>
        </div>

        <Card className="rounded-[5px] border border-[#23262d] bg-[#131519]">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1f2229] bg-[#0f1013] text-[#7f8592] text-[11px] font-mono uppercase tracking-wider">
                    <th className="p-4 font-semibold">Degree Program</th>
                    <th className="p-4 font-semibold">Code</th>
                    <th className="p-4 font-semibold">Department</th>
                    <th className="p-4 font-semibold">Duration</th>
                    <th className="p-4 font-semibold">Description</th>
                    <th className="p-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1f2229]">
                  {courses.map((c) => (
                    <tr key={c.id} className="hover:bg-[#16181f] transition-colors">
                      <td className="p-4 font-semibold text-white">{c.name}</td>
                      <td className="p-4 font-mono font-bold text-white">{c.code}</td>
                      <td className="p-4 text-[#cbd0dc]">{c.department}</td>
                      <td className="p-4 font-mono text-[#9ca3af]">{c.duration} Years</td>
                      <td className="p-4 text-[#787d8a] max-w-xs truncate">{c.description || "—"}</td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => openEdit(c)}>
                            <Pencil size={13} />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-[#f87171] hover:bg-[#2a1313]" onClick={() => handleDelete(c)}>
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
          title={editingCourse ? "Edit Course" : "Add Degree Program"}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Course / Degree Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Course Code (e.g. BT-CSE)"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
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
            <Input
              label="Duration (Years)"
              type="number"
              min="1"
              max="6"
              required
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
            />
            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
            <div className="flex justify-end gap-2 pt-4 border-t border-[#22252e]">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Course
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </RoleGuard>
    </AppLayout>
  );
}
