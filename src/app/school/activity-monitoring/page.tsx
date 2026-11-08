"use client";

import Link from "next/link";

import SchoolNavigation from "@/components/shared/SchoolNavigation";
import { useEffect, useMemo, useState } from "react";
import { mockActivityLogs, mockStudents } from "@/data/mock";
import { ActivityLog, Student } from "@/types";
import { fetchActivitiesWithFallback, fetchStudentsWithFallback } from "@/services/schoolService";

const statusStyles = {
  pending: {
    label: "Pending",
    className: "bg-amber-50 text-amber-700",
    dotClassName: "bg-amber-500",
  },
  approved: {
    label: "Approved",
    className: "bg-green-50 text-green-700",
    dotClassName: "bg-green-500",
  },
  rejected: {
    label: "Rejected",
    className: "bg-red-50 text-red-700",
    dotClassName: "bg-red-500",
  },
  revision_requested: {
    label: "Revision requested",
    className: "bg-purple-50 text-purple-700",
    dotClassName: "bg-purple-500",
  },
} as const;

export default function SchoolActivityMonitoringPage() {
  const [activities, setActivities] = useState<ActivityLog[]>(mockActivityLogs);
  const [students, setStudents] = useState<Student[]>(mockStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const [liveActivities, liveStudents] = await Promise.all([
          fetchActivitiesWithFallback(),
          fetchStudentsWithFallback(),
        ]);
        if (isMounted) {
          setActivities(liveActivities);
          setStudents(liveStudents);
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const totalActivities = activities.length;

  const pendingActivities = activities.filter(
    (activityLog) => activityLog.status === "pending",
  ).length;

  const approvedActivities = activities.filter(
    (activityLog) => activityLog.status === "approved",
  ).length;

  const totalHours = activities.reduce(
    (total, activityLog) => total + activityLog.hoursWorked,
    0,
  );

  const activeStudentIds = useMemo(
    () => new Set(activities.map((activityLog) => activityLog.studentId)),
    [activities]
  );

  const studentsWithActivity = students.filter((student) =>
    activeStudentIds.has(student.id),
  ).length;

  const studentsWithoutActivity = students.filter(
    (student) => !activeStudentIds.has(student.id),
  );

  const getStudent = (studentId: string) =>
    students.find((student) => student.id === studentId) || {
      id: studentId,
      name: "Student " + studentId,
      matricNumber: "MAT/2026",
      university: "Institution",
      department: "SIWES Department",
      level: "300 Level",
      placementCompany: "Placement Company",
    };

  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return activities.filter((log) => {
      if (statusFilter !== "all" && log.status !== statusFilter) return false;
      if (!q) return true;
      const student = getStudent(log.studentId);
      return (
        log.title.toLowerCase().includes(q) ||
        log.description.toLowerCase().includes(q) ||
        student.name.toLowerCase().includes(q) ||
        student.matricNumber.toLowerCase().includes(q)
      );
    });
  }, [activities, students, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#10195c]">
      <SchoolNavigation />

      <div className="lg:pl-56">
        {/* Top bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-5 sm:px-8">
          <div>
            <p className="text-xs font-medium text-slate-500">
              School Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <button
              type="button"
              aria-label="Notifications"
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-[#10195c]"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5"
              >
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M10 21h4" />
              </svg>
            </button>

            <div className="hidden h-8 w-px bg-slate-200 sm:block" />

            {/* Coordinator */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#10195c] text-xs font-semibold text-white">
                SC
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-[#10195c]">
                  School Coordinator
                </p>

                <p className="text-xs text-slate-500">
                  SIWES Coordinator
                </p>
              </div>

              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="hidden h-4 w-4 text-slate-500 sm:block"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          {/* Page heading */}
          <section className="mb-7">
            <p className="text-sm font-medium text-[#1729c7]">
              SIWES Monitoring
            </p>

            <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#10195c] sm:text-3xl">
                  Activity Monitoring
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Track student activity submissions, monitor approvals, and
                  identify students who may need attention.
                </p>
              </div>

              <Link
                href="/school/students"
                className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-600 shadow-sm transition hover:border-[#7b83e8] hover:text-[#1729c7]"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-4 w-4"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>

                View students
              </Link>
            </div>
          </section>

          {/* Summary cards */}
          <section
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Activity summary"
          >
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Total Activities
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef0ff] text-[#1729c7]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path d="M3 12h4l2-7 4 14 2-7h6" />
                  </svg>
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {totalActivities}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Submitted activity logs
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Pending Review
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {pendingActivities}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Awaiting supervisor action
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Approved
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {approvedActivities}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Supervisor-approved logs
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Hours Logged
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef0ff] text-[#1729c7]">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 7v5l3 2" />
                  </svg>
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {totalHours}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Across submitted activities
              </p>
            </article>
          </section>

          {/* Activity monitoring */}
          <section className="mt-6" aria-labelledby="activity-monitoring">
            <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2
                  id="activity-monitoring"
                  className="text-base font-semibold text-[#10195c]"
                >
                  Activity Submissions
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Review activity logs submitted by students in the SIWES
                  programme.
                </p>
              </div>

              <button
                type="button"
                className="w-fit rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 shadow-sm transition hover:border-[#7b83e8] hover:text-[#1729c7]"
              >
                Filter
              </button>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              {/* Search / filters */}
              <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-4-4" />
                  </svg>

                  <input
                    type="text"
                    placeholder="Search activities or students..."
                    aria-label="Search activities"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-[#f8f9fc] pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#7b83e8] focus:bg-white focus:ring-2 focus:ring-[#eef0ff]"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {['all', 'pending', 'approved', 'rejected', 'revision_requested'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setStatusFilter(st)}
                      className={`rounded-lg border px-3 py-1.5 text-xs font-medium capitalize transition ${statusFilter === st ? "border-[#1729c7] bg-[#eef0ff] text-[#1729c7]" : "border-slate-200 bg-white text-slate-600 hover:border-[#7b83e8]"}`}
                    >
                      {st.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-slate-200 bg-[#fafbfe]">
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Activity
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Date
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Hours
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredActivities.map((activityLog) => {
                      const student = getStudent(activityLog.studentId);

                      if (!student) {
                        return null;
                      }

                      const status = (statusStyles as any)[activityLog.status] || statusStyles.pending;

                      const initials = student.name
                        .split(" ")
                        .map((name) => name[0])
                        .slice(0, 2)
                        .join("");

                      return (
                        <tr
                          key={activityLog.id}
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-5 py-4">
                            <Link
                              href={`/school/students/${student.id}`}
                              className="group flex items-center gap-3"
                            >
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-xs font-semibold text-[#1729c7]">
                                {initials}
                              </div>

                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-[#10195c] group-hover:text-[#1729c7]">
                                  {student.name}
                                </p>

                                <p className="text-xs text-slate-400">
                                  {student.matricNumber}
                                </p>
                              </div>
                            </Link>
                          </td>

                          <td className="max-w-[260px] px-5 py-4">
                            <p className="truncate text-sm font-medium text-slate-700">
                              {activityLog.title}
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {activityLog.description}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {activityLog.date}
                          </td>

                          <td className="px-5 py-4 text-sm font-medium text-slate-600">
                            {activityLog.hoursWorked}h
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${status.className}`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${status.dotClassName}`}
                              />

                              {status.label}
                            </span>
                          </td>

                          <td className="px-5 py-4">
                            <Link
                              href={`/school/students/${student.id}`}
                              className="text-xs font-medium text-[#1729c7] hover:underline"
                            >
                              View student
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredActivities.map((activityLog) => {
                  const student = getStudent(activityLog.studentId);

                  if (!student) {
                    return null;
                  }

                  const status = statusStyles[activityLog.status];

                  const initials = student.name
                    .split(" ")
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join("");

                  return (
                    <article
                      key={activityLog.id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Link
                          href={`/school/students/${student.id}`}
                          className="flex min-w-0 items-center gap-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-sm font-semibold text-[#1729c7]">
                            {initials}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-[#10195c]">
                              {student.name}
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              {student.matricNumber}
                            </p>
                          </div>
                        </Link>

                        <span
                          className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${status.className}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="text-sm font-semibold text-[#10195c]">
                          {activityLog.title}
                        </p>

                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          {activityLog.description}
                        </p>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                        <div>
                          <p className="text-[11px] text-slate-400">
                            Date
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {activityLog.date}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-slate-400">
                            Hours
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {activityLog.hoursWorked} hours
                          </p>
                        </div>
                      </div>

                      {activityLog.skillsAcquired.length > 0 && (
                        <div className="mt-4">
                          <p className="text-[11px] text-slate-400">
                            Skills acquired
                          </p>

                          <div className="mt-2 flex flex-wrap gap-2">
                            {activityLog.skillsAcquired.map((skill) => (
                              <span
                                key={skill}
                                className="rounded-full bg-[#f3f4ff] px-2.5 py-1 text-[10px] font-medium text-[#4b55b5]"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <Link
                        href={`/school/students/${student.id}`}
                        className="mt-4 inline-flex text-xs font-semibold text-[#1729c7] hover:underline"
                      >
                        View student →
                      </Link>
                    </article>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-5">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {totalActivities}
                  </span>{" "}
                  activity logs
                </p>

                <p className="text-xs text-slate-400">
                  {studentsWithActivity} of {students.length} students
                  active
                </p>
              </div>
            </div>
          </section>

          {/* Students needing attention */}
          {studentsWithoutActivity.length > 0 && (
            <section className="mt-6 rounded-xl border border-amber-100 bg-amber-50/60 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-amber-600">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-5 w-5"
                  >
                    <path d="M12 3 2.5 20h19L12 3Z" />
                    <path d="M12 9v5" />
                    <path d="M12 17h.01" />
                  </svg>
                </div>

                <div>
                  <h2 className="text-sm font-semibold text-[#10195c]">
                    Students needing attention
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    The following students currently have no activity logs in
                    the available monitoring data.
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {studentsWithoutActivity.map((student) => (
                      <Link
                        key={student.id}
                        href={`/school/students/${student.id}`}
                        className="rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#1729c7] transition hover:bg-[#f3f4ff]"
                      >
                        {student.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* Monitoring note */}
          <section className="mt-6 rounded-xl bg-[#e8e8ff] p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-[#1729c7]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-5 w-5"
                >
                  <path d="M12 3 2.5 20h19L12 3Z" />
                  <path d="M12 9v5" />
                  <path d="M12 17h.01" />
                </svg>
              </div>

              <div>
                <h2 className="text-sm font-semibold text-[#10195c]">
                  Monitoring overview
                </h2>

                <p className="mt-1 max-w-2xl text-xs leading-5 text-[#363d78]">
                  Activity monitoring helps the school identify students who
                  are submitting work regularly and those who may require
                  follow-up. Review pending submissions and students without
                  recent activity as part of routine SIWES monitoring.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}