"use client";

import React, { useState, useEffect } from "react";
import StudentLayout from "@/components/student/StudentLayout";
import apiClient from "@/services/apiClient";
import { 
  BookOpen, Plus, Calendar, Clock, CheckCircle2, 
  AlertCircle, MessageSquare, Tag, Filter, ChevronRight
} from "lucide-react";

interface ActivityItem {
  id: string;
  title: string;
  date: string;
  hoursWorked: number;
  description: string;
  whatILearned?: string;
  skillsUsed?: string[];
  category?: string;
  status: "PENDING" | "APPROVED" | "NEEDS_REVISION";
  supervisorComment?: string;
  rating?: number;
}

export default function StudentLogbookPage() {
  const [activities, setActivities] = useState<ActivityItem[]>([
    {
      id: "act-1",
      title: "Configured API Rate Limiting & JWT Validation",
      date: "2026-11-06",
      hoursWorked: 8,
      description: "Implemented Redis token bucket rate limiting on public endpoints and configured JWT bearer verification middleware.",
      whatILearned: "Deep understanding of HTTP 429 response handling and distributed redis cache keys.",
      skillsUsed: ["Express", "Redis", "TypeScript", "JWT"],
      category: "Backend Development",
      status: "APPROVED",
      supervisorComment: "Solid implementation. Clean error handling and proper status code responses.",
      rating: 5,
    },
    {
      id: "act-2",
      title: "Built Student Document Upload Interface",
      date: "2026-11-07",
      hoursWorked: 7.5,
      description: "Constructed drag and drop file upload screen supporting PDF, PNG, and JPEG formats up to 10MB.",
      whatILearned: "Working with FormData, browser FileReader API, and multipart boundary payloads.",
      skillsUsed: ["Next.js", "Tailwind CSS", "Axios"],
      category: "Frontend Development",
      status: "APPROVED",
      supervisorComment: "Good work on the file validation UX.",
      rating: 5,
    },
    {
      id: "act-3",
      title: "Database Indexing & Prisma Migration Check",
      date: "2026-11-08",
      hoursWorked: 6,
      description: "Audited foreign key relations on Student and Verification tables. Ran migration sanity checks against Postgres.",
      whatILearned: "Understanding Prisma migrate diff and query plan optimization using EXPLAIN ANALYZE.",
      skillsUsed: ["PostgreSQL", "Prisma ORM", "SQL"],
      category: "Database Engineering",
      status: "PENDING",
    },
  ]);

  const [filter, setFilter] = useState<string>("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    title: "",
    hoursWorked: 8,
    category: "Software Development",
    description: "",
    whatILearned: "",
    skillsInput: "",
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await apiClient.get("/activities");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped: ActivityItem[] = res.data.map((a: any) => ({
            id: a.id,
            title: a.title,
            date: a.date ? String(a.date).slice(0, 10) : new Date().toISOString().split("T")[0],
            hoursWorked: Number(a.hoursWorked) || 8,
            description: a.description || "",
            whatILearned: a.whatILearned || "",
            skillsUsed: Array.isArray(a.skillsUsed) ? a.skillsUsed : [],
            category: a.category || "General",
            status: a.status || "PENDING",
            supervisorComment: a.comment || a.supervisorComment || undefined,
            rating: a.rating || undefined,
          }));
          setActivities(mapped);
        }
      } catch {
        // Fallback to local default state
      }
    };

    fetchActivities();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMsg(null);

    const skillsArray = form.skillsInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const payload = {
      date: form.date,
      title: form.title,
      hoursWorked: Number(form.hoursWorked),
      description: form.description,
      whatILearned: form.whatILearned || undefined,
      skillsUsed: skillsArray.length > 0 ? skillsArray : undefined,
      category: form.category || undefined,
    };

    try {
      const res = await apiClient.post("/activities", payload);
      const newEntry: ActivityItem = {
        id: res.data?.id || `act-${Date.now()}`,
        title: form.title,
        date: form.date,
        hoursWorked: Number(form.hoursWorked),
        description: form.description,
        whatILearned: form.whatILearned,
        skillsUsed: skillsArray,
        category: form.category,
        status: "PENDING",
      };

      setActivities([newEntry, ...activities]);
      setModalOpen(false);
      setStatusMsg({ type: "success", text: "Activity logged and submitted for supervisor review." });
      setForm({
        date: new Date().toISOString().split("T")[0],
        title: "",
        hoursWorked: 8,
        category: "Software Development",
        description: "",
        whatILearned: "",
        skillsInput: "",
      });
    } catch {
      // Optimistic fallback for smooth local testing
      const localEntry: ActivityItem = {
        id: `act-${Date.now()}`,
        title: form.title,
        date: form.date,
        hoursWorked: Number(form.hoursWorked),
        description: form.description,
        whatILearned: form.whatILearned,
        skillsUsed: skillsArray,
        category: form.category,
        status: "PENDING",
      };
      setActivities([localEntry, ...activities]);
      setModalOpen(false);
      setStatusMsg({ type: "success", text: "Activity recorded locally and marked pending." });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredActivities = activities.filter((act) => {
    if (filter === "ALL") return true;
    return act.status === filter;
  });

  const totalHours = activities.reduce((acc, curr) => acc + (Number(curr.hoursWorked) || 0), 0);
  const approvedCount = activities.filter((a) => a.status === "APPROVED").length;

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Logbook & Activity Diary</h1>
            <p className="text-slate-600 text-sm">Record daily tasks, track accumulated hours, and review supervisor evaluations</p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0015A4] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors self-start"
          >
            <Plus className="h-4 w-4" />
            Log New Activity
          </button>
        </div>

        {/* Quick Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Hours Logged</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{totalHours} hrs</h3>
            <p className="text-xs text-slate-400 mt-1">Target: 480 hours (24 weeks)</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Approved Logs</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{approvedCount} / {activities.length}</h3>
            <p className="text-xs text-slate-400 mt-1">Signed off by company supervisor</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Pending Review</p>
            <h3 className="text-2xl font-bold text-amber-600 mt-1">
              {activities.filter((a) => a.status === "PENDING").length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">Awaiting signoff</p>
          </div>
        </div>

        {/* Notification Toast */}
        {statusMsg && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
              statusMsg.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="font-medium">{statusMsg.text}</p>
          </div>
        )}

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {["ALL", "APPROVED", "PENDING", "NEEDS_REVISION"].map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                filter === st
                  ? "bg-[#04104B] text-white"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {st === "ALL" ? "All Entries" : st.replace("_", " ")}
            </button>
          ))}
        </div>

        {/* Entries List */}
        <div className="space-y-4">
          {filteredActivities.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-700">No log entries found</h3>
              <p className="text-xs text-slate-400 mt-1">Click &apos;Log New Activity&apos; to submit your daily training report.</p>
            </div>
          ) : (
            filteredActivities.map((act) => (
              <div
                key={act.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        act.status === "APPROVED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : act.status === "PENDING"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200"
                      }`}
                    >
                      {act.status.replace("_", " ")}
                    </span>
                    <h3 className="text-base font-bold text-slate-900">{act.title}</h3>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      {act.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {act.hoursWorked} hrs
                    </span>
                  </div>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">{act.description}</p>

                {act.whatILearned && (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs text-slate-600">
                    <strong className="text-slate-800">What I Learned: </strong>
                    {act.whatILearned}
                  </div>
                )}

                {/* Skills tags */}
                {act.skillsUsed && act.skillsUsed.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <Tag className="h-3.5 w-3.5 text-slate-400 mr-1" />
                    {act.skillsUsed.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}

                {/* Supervisor Feedback Callout */}
                {act.supervisorComment && (
                  <div className="bg-blue-50 border border-blue-100 p-3.5 rounded-xl flex items-start gap-2.5">
                    <MessageSquare className="h-4 w-4 text-[#0015A4] shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-semibold text-[#0015A4]">Supervisor Feedback</p>
                      <p className="text-slate-700 mt-0.5 leading-relaxed">{act.supervisorComment}</p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Form */}
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <h3 className="text-lg font-bold text-slate-900 mb-1">Log Daily Activity</h3>
              <p className="text-xs text-slate-500 mb-4">
                Record your industrial attachment tasks for supervisor verification
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Date</label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0015A4]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Hours Worked</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="24"
                      required
                      value={form.hoursWorked}
                      onChange={(e) => setForm({ ...form, hoursWorked: Number(e.target.value) })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0015A4]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Activity Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Developed API endpoints for payment verification"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0015A4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">Work Description</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Detailed explanation of activities carried out, challenges encountered, and solutions discovered..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0015A4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">What I Learned (Optional)</label>
                  <input
                    type="text"
                    placeholder="Key concepts, algorithms, or tools mastered..."
                    value={form.whatILearned}
                    onChange={(e) => setForm({ ...form, whatILearned: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0015A4]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                    Skills Used (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., TypeScript, Docker, PostgreSQL"
                    value={form.skillsInput}
                    onChange={(e) => setForm({ ...form, skillsInput: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0015A4]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-5 py-2 bg-[#0015A4] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Submitting..." : "Save Entry"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
