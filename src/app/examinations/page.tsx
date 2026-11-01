"use client";

import React, { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { RoleGuard } from "@/components/layout/role-guard";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input, Select } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { type Examination, type ExamSubject, type Subject } from "@/lib/data-store";
import { formatDate } from "@/lib/utils";
import { CalendarDays, Plus, Pencil, Trash2, Clock, MapPin, BookOpen, Layers, Radio, Bell } from "lucide-react";
import { type BroadcastNotice } from "@/lib/data-store";

export default function ExaminationsPage() {
  const [examinations, setExaminations] = useState<Examination[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [broadcasts, setBroadcasts] = useState<BroadcastNotice[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExam, setEditingExam] = useState<Examination | null>(null);

  // Broadcast modal state
  const [broadcastModalOpen, setBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    semester: 4,
    examinationId: 1,
    title: "Hall Ticket Application for 4th Sem is Open",
    description: "Hall Ticket application window is now open. Verify registered subjects, report arrears, and upload fee receipt.",
    deadline: new Date(Date.now() + 7 * 86400000).toISOString().split("T")[0],
  });
  const [broadcasting, setBroadcasting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    examType: "End Semester",
    semester: 4,
    academicYear: `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(-2)}`,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 12 * 86400000).toISOString().split("T")[0],
    center: "Block C · Examination Complex",
    session: "09:30 AM – 12:30 PM",
    description: "",
    status: "Published" as "Draft" | "Published",
    subjects: [] as ExamSubject[],
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [examRes, subRes, broadRes] = await Promise.all([
        fetch("/api/examinations"),
        fetch("/api/subjects"),
        fetch("/api/broadcasts"),
      ]);
      if (examRes.ok) setExaminations(await examRes.json());
      if (subRes.ok) setSubjects(await subRes.json());
      if (broadRes.ok) setBroadcasts(await broadRes.json());
    } catch (err) {
      console.error("Failed to load examinations:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const recalculateDates = (subs: ExamSubject[], fallbackStart: string, fallbackEnd: string) => {
    const validDates = subs
      .map((s) => s.examDate?.slice(0, 10))
      .filter((d): d is string => Boolean(d && !isNaN(new Date(d).getTime())))
      .sort();

    if (validDates.length > 0) {
      return {
        startDate: validDates[0],
        endDate: validDates[validDates.length - 1],
      };
    }
    return { startDate: fallbackStart, endDate: fallbackEnd };
  };

  const syncDatesWithTimetable = () => {
    const { startDate, endDate } = recalculateDates(formData.subjects, formData.startDate, formData.endDate);
    setFormData((prev) => ({ ...prev, startDate, endDate }));
  };

  const openCreate = () => {
    setEditingExam(null);
    const todayStr = new Date().toISOString().split("T")[0];
    const nextDateStr = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];
    const initialSubjects: ExamSubject[] = [
      { subjectCode: "CS401", subjectName: "Design & Analysis of Algorithms", examDate: todayStr, startTime: "09:30", endTime: "12:30", room: "Hall C-201" },
      { subjectCode: "CS402", subjectName: "Operating Systems & Concurrency", examDate: nextDateStr, startTime: "09:30", endTime: "12:30", room: "Hall C-201" },
    ];
    const { startDate, endDate } = recalculateDates(initialSubjects, todayStr, nextDateStr);
    const curYear = new Date().getFullYear();
    setFormData({
      name: "IV Semester End Semester Regular Examinations",
      examType: "End Semester",
      semester: 4,
      academicYear: `${curYear}-${(curYear + 1).toString().slice(-2)}`,
      startDate,
      endDate,
      center: "Block C · Examination Complex",
      session: "09:30 AM – 12:30 PM",
      description: "Regular theory examinations for candidates.",
      status: "Published",
      subjects: initialSubjects,
    });
    setModalOpen(true);
  };

  const openEdit = (e: Examination) => {
    setEditingExam(e);
    const subs = e.subjects || [];
    const { startDate, endDate } = recalculateDates(subs, e.startDate, e.endDate);
    setFormData({
      name: e.name,
      examType: e.examType,
      semester: e.semester,
      academicYear: e.academicYear,
      startDate,
      endDate,
      center: e.center,
      session: e.session,
      description: e.description,
      status: e.status,
      subjects: subs,
    });
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingExam ? `/api/examinations/${editingExam.id}` : "/api/examinations";
      const method = editingExam ? "PUT" : "POST";
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

  const handleDelete = async (e: Examination) => {
    if (!confirm(`Are you sure you want to delete ${e.name}?`)) return;
    try {
      const res = await fetch(`/api/examinations/${e.id}`, { method: "DELETE" });
      if (res.ok) loadData();
    } catch (err) {
      console.error("Delete error:", err);
    }
  };

  const addSubjectRow = () => {
    const defaultSub = subjects[0];
    setFormData((prev) => {
      let nextDate = prev.startDate;
      if (prev.subjects.length > 0) {
        const lastExamDate = prev.subjects[prev.subjects.length - 1].examDate;
        if (lastExamDate) {
          const d = new Date(lastExamDate);
          d.setDate(d.getDate() + 3);
          nextDate = d.toISOString().slice(0, 10);
        }
      }

      const updatedSubjects = [
        ...prev.subjects,
        {
          subjectCode: defaultSub?.code || "CS401",
          subjectName: defaultSub?.name || "Subject Name",
          examDate: nextDate,
          startTime: "09:30",
          endTime: "12:30",
          room: "Hall C-201",
        },
      ];

      const { startDate, endDate } = recalculateDates(updatedSubjects, prev.startDate, prev.endDate);

      return {
        ...prev,
        startDate,
        endDate,
        subjects: updatedSubjects,
      };
    });
  };

  const removeSubjectRow = (index: number) => {
    setFormData((prev) => {
      const updatedSubjects = prev.subjects.filter((_, i) => i !== index);
      const { startDate, endDate } = recalculateDates(updatedSubjects, prev.startDate, prev.endDate);
      return {
        ...prev,
        startDate,
        endDate,
        subjects: updatedSubjects,
      };
    });
  };

  const updateSubjectRow = (index: number, field: keyof ExamSubject, val: string) => {
    setFormData((prev) => {
      const copy = [...prev.subjects];
      copy[index] = { ...copy[index], [field]: val };
      if (field === "subjectCode") {
        const matching = subjects.find((s) => s.code === val);
        if (matching) copy[index].subjectName = matching.name;
      }

      let newStart = prev.startDate;
      let newEnd = prev.endDate;

      if (field === "examDate") {
        const recalculated = recalculateDates(copy, prev.startDate, prev.endDate);
        newStart = recalculated.startDate;
        newEnd = recalculated.endDate;
      }

      return {
        ...prev,
        startDate: newStart,
        endDate: newEnd,
        subjects: copy,
      };
    });
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBroadcasting(true);
    try {
      const curYear = new Date().getFullYear();
      const payload = {
        ...broadcastForm,
        academicYear: `${curYear}-${(curYear + 1).toString().slice(-2)}`,
      };
      const res = await fetch("/api/broadcasts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setBroadcastModalOpen(false);
        await loadData();
        alert("Broadcast announcement successfully published! It is now active for eligible candidates.");
      } else {
        const err = await res.json();
        alert(err.error || "Failed to publish broadcast.");
      }
    } catch (err) {
      console.error("Broadcast submit error:", err);
      alert("An unexpected error occurred while publishing the broadcast.");
    } finally {
      setBroadcasting(false);
    }
  };

  const handleToggleBroadcast = async (id: number, currentOpen: boolean) => {
    try {
      await fetch("/api/broadcasts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isOpen: !currentOpen }),
      });
      loadData();
    } catch (err) {
      console.error("Toggle broadcast error:", err);
    }
  };

  return (
    <AppLayout>
      <RoleGuard allowedRoles={["ADMIN", "STAFF"]}>
        <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#9ca3af]">Examination Office</span>
              <span className="text-neutral-600">/</span>
              <Badge variant="neutral">{examinations.length} Scheduled Sessions</Badge>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">Examination Windows & Timetables</h2>
            <p className="text-xs text-[#8d929d] mt-1">
              Schedule semester examination periods, assign subject exam dates, and broadcast hall ticket application windows.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              onClick={() => setBroadcastModalOpen(true)}
              className="font-semibold"
            >
              <Radio size={14} className="text-amber-400" />
              <span>Broadcast Application Window</span>
            </Button>
            <Button variant="primary" onClick={openCreate}>
              <Plus size={15} /> New Examination Window
            </Button>
          </div>
        </div>

        {/* Active Broadcasts Section */}
        {broadcasts.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#7e8594] flex items-center gap-1.5">
                <Bell size={13} className="text-amber-400" /> Active Student Application Broadcasts
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {broadcasts.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 rounded-[5px] border ${
                    b.isOpen
                      ? "border-emerald-500/70 bg-emerald-950/20 text-emerald-100"
                      : "border-[#232732] bg-[#121418] text-neutral-400"
                  } flex items-center justify-between gap-3 shadow-md`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-[3px] bg-black/40 text-emerald-400">
                        Semester {b.semester}
                      </span>
                      <span className="text-xs font-bold text-white">{b.title}</span>
                    </div>
                    <p className="text-[11px] text-[#cbd0dc]/80 max-w-sm truncate">
                      {b.description}
                    </p>
                    <div className="text-[10px] font-mono text-[#8d929d]">
                      Deadline to Apply: <strong className="text-white">{b.deadline}</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={b.isOpen ? "success" : "neutral"} className="text-[9px]">
                      {b.isOpen ? "OPEN / ACTIVE" : "CLOSED"}
                    </Badge>
                    <button
                      type="button"
                      onClick={() => handleToggleBroadcast(b.id, b.isOpen)}
                      className="px-2 py-1 rounded-[3px] bg-[#1b1e26] hover:bg-[#252a36] text-[10px] font-mono text-white border border-[#2d3240] transition-colors"
                    >
                      {b.isOpen ? "Close Window" : "Re-open"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Exams List */}
        <div className="grid gap-6">
          {examinations.map((exam) => (
            <Card key={exam.id} className="rounded-[5px] border border-[#23262d] bg-[#131519] overflow-hidden">
              <div className="p-6 border-b border-[#1f2229] flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2.5">
                    <Badge variant={exam.status === "Published" ? "success" : "neutral"}>
                      {exam.status}
                    </Badge>
                    <span className="text-[11px] font-mono text-[#8d929d]">
                      {exam.examType} · Semester {exam.semester} · {exam.academicYear}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-2">{exam.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#cbd0dc] mt-2">
                    <span className="flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-[#8d929d]" />
                      {formatDate(exam.startDate)} &mdash; {formatDate(exam.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} className="text-[#8d929d]" />
                      {exam.session}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#8d929d]" />
                      {exam.center}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => openEdit(exam)}>
                    <Pencil size={13} /> Edit Window
                  </Button>
                  <Button variant="ghost" size="sm" className="text-[#f87171] hover:bg-[#2a1313]" onClick={() => handleDelete(exam)}>
                    <Trash2 size={13} />
                  </Button>
                </div>
              </div>

              {/* Timetable Table */}
              <div className="p-6 bg-[#0e1014]">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#9ca3af] mb-3 flex items-center gap-2">
                  <BookOpen size={14} /> Registered Timetable ({exam.subjects?.length || 0} Subjects)
                </h4>
                <div className="overflow-x-auto rounded-[4px] border border-[#20232a]">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#14161c] text-[#7f8592] text-[10px] font-mono uppercase tracking-wider border-b border-[#20232a]">
                        <th className="p-3">Subject Code</th>
                        <th className="p-3">Subject Name</th>
                        <th className="p-3">Exam Date</th>
                        <th className="p-3">Timing</th>
                        <th className="p-3">Room / Hall</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#20232a]">
                      {exam.subjects?.map((sub) => (
                        <tr key={sub.subjectCode} className="text-white hover:bg-[#181a22] transition-colors">
                          <td className="p-3 font-mono font-bold text-white">{sub.subjectCode}</td>
                          <td className="p-3 font-medium">{sub.subjectName}</td>
                          <td className="p-3">{formatDate(sub.examDate)}</td>
                          <td className="p-3 font-mono text-[11px] text-[#cbd0dc]">
                            {sub.startTime} – {sub.endTime}
                          </td>
                          <td className="p-3 font-semibold text-white">{sub.room}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Add / Edit Examination Modal */}
      {modalOpen && (
        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={editingExam ? "Edit Examination Window" : "Schedule New Examination Window"}
          subtitle="Configure exam dates, session center, and subject timetable slots."
          maxWidth="4xl"
        >
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Examination Title"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Select
                label="Exam Type"
                value={formData.examType}
                onChange={(e) => setFormData({ ...formData, examType: e.target.value })}
              >
                <option value="End Semester">End Semester Regular</option>
                <option value="Supplementary">Supplementary / Back-paper</option>
                <option value="Internal Assessment">Internal Assessment (Test)</option>
              </Select>
              <Select
                label="Target Semester"
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
                label="Academic Year"
                required
                value={formData.academicYear}
                onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              />
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#cbd0dc]">Start Date</label>
                  <span className="text-[10px] text-[#9ca3af] font-mono">Dynamic · Earliest Paper</span>
                </div>
                <Input
                  type="date"
                  required
                  value={formData.startDate.slice(0, 10)}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-[#cbd0dc]">End Date</label>
                  <span className="text-[10px] text-[#9ca3af] font-mono">Dynamic · Final Paper</span>
                </div>
                <Input
                  type="date"
                  required
                  value={formData.endDate.slice(0, 10)}
                  onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                />
              </div>
              <Input
                label="Examination Center"
                required
                value={formData.center}
                onChange={(e) => setFormData({ ...formData, center: e.target.value })}
              />
              <Select
                label="Status"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as "Draft" | "Published" })}
              >
                <option value="Published">Published (Admit Cards Active)</option>
                <option value="Draft">Draft (Internal Review)</option>
              </Select>
            </div>

            {/* Timetable Slots Builder */}
            <div className="space-y-3 pt-4 border-t border-[#22252e]">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-white">Timetable Schedule Builder</h4>
                  <p className="text-[11px] text-[#7f8592]">Add paper examination dates, time intervals, and assigned examination rooms.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="secondary" size="sm" onClick={syncDatesWithTimetable} title="Re-sync Start Date and End Date from earliest and latest subject papers">
                    Auto-Sync Window Dates
                  </Button>
                  <Button type="button" variant="primary" size="sm" onClick={addSubjectRow}>
                    <Plus size={13} /> Add Timetable Slot
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {formData.subjects.map((sub, idx) => (
                  <div key={idx} className="p-3 bg-[#0d0e12] rounded-[4px] border border-[#22252e] grid grid-cols-[110px_1fr_130px_140px_110px_35px] gap-2 items-center text-xs">
                    <select
                      value={sub.subjectCode}
                      onChange={(e) => updateSubjectRow(idx, "subjectCode", e.target.value)}
                      className="h-8 rounded-[3px] border border-[#272a33] bg-[#14161c] px-2 text-xs text-white"
                    >
                      {subjects.map((s) => (
                        <option key={s.id} value={s.code}>
                          {s.code}
                        </option>
                      ))}
                    </select>

                    <input
                      type="text"
                      placeholder="Subject Name"
                      value={sub.subjectName}
                      onChange={(e) => updateSubjectRow(idx, "subjectName", e.target.value)}
                      className="h-8 rounded-[3px] border border-[#272a33] bg-[#14161c] px-2 text-xs text-white"
                    />

                    <input
                      type="date"
                      value={sub.examDate.slice(0, 10)}
                      onChange={(e) => updateSubjectRow(idx, "examDate", e.target.value)}
                      className="h-8 rounded-[3px] border border-[#272a33] bg-[#14161c] px-2 text-xs text-white"
                    />

                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        value={sub.startTime}
                        onChange={(e) => updateSubjectRow(idx, "startTime", e.target.value)}
                        placeholder="09:30"
                        className="h-8 w-14 rounded-[3px] border border-[#272a33] bg-[#14161c] px-1 text-center text-xs text-white"
                      />
                      <span className="text-[#6c7280]">–</span>
                      <input
                        type="text"
                        value={sub.endTime}
                        onChange={(e) => updateSubjectRow(idx, "endTime", e.target.value)}
                        placeholder="12:30"
                        className="h-8 w-14 rounded-[3px] border border-[#272a33] bg-[#14161c] px-1 text-center text-xs text-white"
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Room (e.g. C-201)"
                      value={sub.room}
                      onChange={(e) => updateSubjectRow(idx, "room", e.target.value)}
                      className="h-8 rounded-[3px] border border-[#272a33] bg-[#14161c] px-2 text-xs text-white"
                    />

                    <button
                      type="button"
                      onClick={() => removeSubjectRow(idx)}
                      className="h-8 w-8 text-[#f87171] hover:bg-[#2a1313] rounded flex items-center justify-center cursor-pointer"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-[#22252e]">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Save Examination Window
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Broadcast Modal */}
      {broadcastModalOpen && (
        <Modal
          isOpen={broadcastModalOpen}
          onClose={() => setBroadcastModalOpen(false)}
          title="Broadcast Hall Ticket Application Window"
          maxWidth="lg"
        >
          <form onSubmit={handleBroadcastSubmit} className="space-y-4 text-xs">
            <div className="p-3 rounded-[4px] bg-[#101217] border border-[#23262d] text-[#8d929d] leading-relaxed">
              Broadcasting opens the exam application window for the selected semester&apos;s candidates and sends an active dues review notice to the Accounts Section.
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Target Semester
              </label>
              <select
                value={broadcastForm.semester}
                onChange={(e) =>
                  setBroadcastForm((prev) => ({
                    ...prev,
                    semester: Number(e.target.value),
                    title: `Hall Ticket Application for ${e.target.value}th Sem is Open`,
                  }))
                }
                className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono"
              >
                <option value={1}>1st Semester</option>
                <option value={2}>2nd Semester</option>
                <option value={3}>3rd Semester</option>
                <option value={4}>4th Semester</option>
                <option value={5}>5th Semester</option>
                <option value={6}>6th Semester</option>
                <option value={7}>7th Semester</option>
                <option value={8}>8th Semester</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Broadcast Announcement Title
              </label>
              <input
                type="text"
                required
                value={broadcastForm.title}
                onChange={(e) =>
                  setBroadcastForm((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder="e.g. Hall Ticket Application for 4th Sem is Open"
                className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-sans"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Application Submission Deadline
              </label>
              <input
                type="date"
                required
                value={broadcastForm.deadline}
                onChange={(e) =>
                  setBroadcastForm((prev) => ({ ...prev, deadline: e.target.value }))
                }
                className="h-10 w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] px-3 text-xs text-white outline-none focus:border-white font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white block mb-1">
                Candidate Guidance / Remarks
              </label>
              <textarea
                rows={3}
                value={broadcastForm.description}
                onChange={(e) =>
                  setBroadcastForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Instructions regarding fee receipt, subject verification, etc."
                className="w-full rounded-[4px] border border-[#2a2e38] bg-[#0c0d10] p-2 text-xs text-white outline-none focus:border-white font-sans"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#1f2229]">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBroadcastModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={broadcasting}>
                <Radio size={13} className="text-amber-400" />
                <span>{broadcasting ? "Broadcasting..." : "Broadcast Notice"}</span>
              </Button>
            </div>
          </form>
        </Modal>
      )}
      </RoleGuard>
    </AppLayout>
  );
}
