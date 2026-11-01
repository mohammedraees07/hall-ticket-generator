"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { type Department } from "@/lib/data-store";
import { Building2, Plus, Pencil, Trash2 } from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({ name: "", code: "" });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/departments");
      if (res.ok) setDepartments(await res.json());
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreate = () => {
    setEditingDept(null);
    setFormData({ name: "", code: "" });
    setModalOpen(true);
  };

  const openEdit = (d: Department) => {
    setEditingDept(d);
    setFormData({ name: d.name, code: d.code });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingDept ? `/api/departments/${editingDept.id}` : "/api/departments";
      const method = editingDept ? "PUT" : "POST";
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

  const handleDelete = async (d: Department) => {
    if (!confirm(`Are you sure you want to delete ${d.name}?`)) return;
    try {
      const res = await fetch(`/api/departments/${d.id}`, { method: "DELETE" });
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
              <Badge variant="neutral">{departments.length} Departments</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Academic Departments</h2>
            <p className="text-xs text-[#8d929d] mt-1">
              Institutional departments, code designations, and candidate allotment counters.
            </p>
          </div>
          <Button variant="primary" onClick={openCreate}>
            <Plus size={15} /> Add Department
          </Button>
        </div>

        {/* Departments Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments.map((d) => (
            <Card key={d.id} className="rounded-[5px] border border-[#23262d] bg-[#131519] p-5 hover:border-[#353944] transition-colors">
              <div className="flex items-start justify-between">
                <div className="h-10 w-10 rounded-[4px] bg-[#1a1c22] border border-[#282c36] font-mono font-bold text-white flex items-center justify-center text-xs">
                  {d.code}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(d)}>
                    <Pencil size={13} />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[#f87171] hover:bg-[#2a1313]" onClick={() => handleDelete(d)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              <h3 className="font-bold text-sm text-white mt-4">{d.name}</h3>
              <p className="font-mono text-xs text-[#8d929d] mt-0.5">Code: {d.code}</p>

              <div className="mt-4 pt-3 border-t border-[#1e2128] grid grid-cols-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase text-[#717684] block">Students</span>
                  <span className="font-mono font-bold text-white text-sm">{d.studentCount}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase text-[#717684] block">Courses</span>
                  <span className="font-mono font-bold text-white text-sm">{d.courseCount}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingDept ? "Edit Department" : "Add Department"}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4">
            <Input
              label="Department Name"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
            <Input
              label="Department Code (e.g. CSE, ISE)"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            />
            <div className="flex justify-end gap-2 pt-4 border-t border-[#22252e]">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Department
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </RoleGuard>
    </AppLayout>
  );
}
