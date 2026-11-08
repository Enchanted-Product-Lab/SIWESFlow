"use client";

import React, { useState, useEffect } from "react";
import StudentLayout from "@/components/student/StudentLayout";
import apiClient from "@/services/apiClient";
import { 
  LineChart, CheckCircle2, Clock, Calendar, 
  Award, AlertCircle, FileCheck, ArrowRight
} from "lucide-react";
import Link from "next/link";

export default function StudentProgressPage() {
  const [stats, setStats] = useState({
    completedWeeks: 14,
    totalWeeks: 24,
    loggedHours: 280,
    requiredHours: 480,
    approvedEntries: 14,
    pendingEntries: 2,
    completionPercentage: 58,
  });

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await apiClient.get("/activities");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const totalHours = res.data.reduce((sum: number, a: any) => sum + (Number(a.hoursWorked) || 0), 0);
          const approved = res.data.filter((a: any) => a.status === "APPROVED").length;
          const pending = res.data.filter((a: any) => a.status === "PENDING").length;
          const pct = Math.min(100, Math.round((totalHours / 480) * 100));

          setStats({
            completedWeeks: Math.min(24, Math.max(1, Math.round(totalHours / 20))),
            totalWeeks: 24,
            loggedHours: totalHours,
            requiredHours: 480,
            approvedEntries: approved,
            pendingEntries: pending,
            completionPercentage: pct,
          });
        }
      } catch {
        // Fallback default
      }
    };

    fetchProgress();
  }, []);

  const milestones = [
    {
      title: "Placement Secured & Registered",
      description: "Company attachment confirmed and logged on SIWESFlow platform.",
      status: "COMPLETED",
      date: "Week 1",
    },
    {
      title: "Introduction & Acceptance Letters Submitted",
      description: "Official ITF and institutional acceptance documents uploaded and verified.",
      status: "COMPLETED",
      date: "Week 2",
    },
    {
      title: "First Month Logbook Signoff",
      description: "Initial 4 weeks of daily logs evaluated and approved by industry supervisor.",
      status: "COMPLETED",
      date: "Week 4",
    },
    {
      title: "Midterm Industrial Assessment",
      description: "Institutional supervisor on-site or digital check-in and logbook extract review.",
      status: "IN_PROGRESS",
      date: "Week 12-14",
    },
    {
      title: "Final Logbook Completion & Clearance",
      description: "480 minimum logged hours, final supervisor rating, and institutional signoff.",
      status: "UPCOMING",
      date: "Week 24",
    },
  ];

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">SIWES Progress & Milestones</h1>
          <p className="text-slate-600 text-sm">Track your progress toward the 24-week (480-hour) industrial training completion</p>
        </div>

        {/* Big Progress Overview Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-[#0015A4] border border-blue-100">
              Training Status: In Progress
            </span>
            <h2 className="text-2xl font-bold text-slate-900">
              You have completed {stats.completionPercentage}% of your required SIWES duration
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Keep submitting your daily logs consistently. Once you hit 480 verified hours and obtain all clearance documents, your school coordinator can issue your final SIWES certificate.
            </p>

            {/* Progress bar */}
            <div className="space-y-2 pt-2">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>{stats.loggedHours} Hours Logged</span>
                <span>{stats.requiredHours} Required</span>
              </div>
              <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#0015A4] h-full rounded-full transition-all duration-500"
                  style={{ width: `${stats.completionPercentage}%` }}
                />
              </div>
            </div>
          </div>

          {/* Circular progress visual */}
          <div className="relative h-36 w-36 shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="8" fill="none" />
              <circle
                cx="50"
                cy="50"
                r="40"
                stroke="#0015A4"
                strokeWidth="8"
                fill="none"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 - (251.2 * stats.completionPercentage) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-extrabold text-slate-900">{stats.completionPercentage}%</span>
              <span className="text-[10px] uppercase font-bold text-slate-400">Complete</span>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="h-5 w-5 text-[#0015A4]" />
              <p className="text-xs text-slate-500 font-semibold uppercase">Weeks Elapsed</p>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.completedWeeks} / {stats.totalWeeks}</h3>
            <p className="text-xs text-slate-400 mt-1">{stats.totalWeeks - stats.completedWeeks} weeks remaining</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <p className="text-xs text-slate-500 font-semibold uppercase">Approved Entries</p>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">{stats.approvedEntries} Logs</h3>
            <p className="text-xs text-slate-400 mt-1">{stats.pendingEntries} awaiting supervisor signoff</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <Award className="h-5 w-5 text-[#0015A4]" />
              <p className="text-xs text-slate-500 font-semibold uppercase">Clearance Status</p>
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Good Standing</h3>
            <p className="text-xs text-slate-400 mt-1">No attendance or conduct flags</p>
          </div>
        </div>

        {/* Milestone Stepper */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 mb-6">Program Milestones</h3>

          <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-start gap-4 relative">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ${
                    m.status === "COMPLETED"
                      ? "bg-emerald-600 text-white"
                      : m.status === "IN_PROGRESS"
                      ? "bg-[#0015A4] text-white"
                      : "bg-slate-200 text-slate-400"
                  }`}
                >
                  {m.status === "COMPLETED" ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <span className="text-xs font-bold">{idx + 1}</span>
                  )}
                </div>

                <div className="flex-1 bg-slate-50/70 p-4 rounded-xl border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{m.title}</h4>
                    <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{m.description}</p>
                  </div>
                  <div className="shrink-0 text-left sm:text-right">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        m.status === "COMPLETED"
                          ? "bg-emerald-100 text-emerald-800"
                          : m.status === "IN_PROGRESS"
                          ? "bg-blue-100 text-[#0015A4]"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {m.status.replace("_", " ")}
                    </span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{m.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}
