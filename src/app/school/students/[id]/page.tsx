import Link from "next/link";
import { notFound } from "next/navigation";

import SchoolNavigation from "@/components/shared/SchoolNavigation";
import { mockActivityLogs, mockStudents } from "@/data/mock";
import { Student } from "@/types";
import { mapBackendStudentToStudent } from "@/services/schoolService";
import apiClient from "@/services/apiClient";

type StudentProfilePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StudentProfilePage({
  params,
}: StudentProfilePageProps) {
  const { id } = await params;

  let student: Student | undefined = mockStudents.find(
    (mockStudent) => mockStudent.id === id,
  );

  if (!student) {
    try {
      const res = await apiClient.get(`/students/${id}`);
      if (res.data) {
        student = mapBackendStudentToStudent(res.data);
      }
    } catch (_err) {
      // Fallback below
    }
  }

  if (!student) {
    student = {
      id,
      name: "Student " + id,
      matricNumber: "MAT/2026/" + id.slice(-3),
      university: "National Open University of Nigeria",
      department: "Computer Science",
      level: "300 Level",
      placementCompany: "Enchanted Digital Academy",
    };
  }

  const studentActivities = mockActivityLogs.filter(
    (activityLog) => activityLog.studentId === student.id,
  );

  const hasPlacement = student.placementCompany.trim().length > 0;
  const hasActivity = studentActivities.length > 0;

  const totalHours = studentActivities.reduce(
    (total, activityLog) => total + activityLog.hoursWorked,
    0,
  );

  const approvedActivities = studentActivities.filter(
    (activityLog) => activityLog.status === "approved",
  ).length;

  const initials = student.name
    .split(" ")
    .map((name) => name[0])
    .slice(0, 2)
    .join("");

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
          {/* Breadcrumb */}
          <Link
            href="/school/students"
            className="inline-flex items-center gap-2 text-xs font-medium text-slate-500 transition hover:text-[#1729c7]"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>

            Back to Students
          </Link>

          {/* Profile header */}
          <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="h-2 bg-[#1729c7]" />

            <div className="p-5 sm:p-6">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-lg font-semibold text-[#1729c7]">
                    {initials}
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h1 className="truncate text-xl font-semibold tracking-tight text-[#10195c] sm:text-2xl">
                        {student.name}
                      </h1>

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                          hasActivity
                            ? "bg-blue-50 text-blue-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {hasActivity ? "Active" : "No activity"}
                      </span>
                    </div>

                    <p className="mt-1 text-sm text-slate-500">
                      {student.matricNumber}
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {student.department} · {student.level}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                      hasPlacement
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${
                        hasPlacement ? "bg-green-500" : "bg-amber-500"
                      }`}
                    />

                    {hasPlacement ? "Placed" : "Not placed"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Overview */}
          <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Activities
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
                {studentActivities.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Activity logs submitted
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Hours Worked
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
                Total recorded hours
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
                Approved activity logs
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Placement
                </p>

                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    hasPlacement
                      ? "bg-green-50 text-green-600"
                      : "bg-amber-50 text-amber-600"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    className="h-4 w-4"
                  >
                    <rect x="3" y="7" width="18" height="13" rx="2" />
                    <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                </div>
              </div>

              <p className="mt-3 text-sm font-semibold text-[#10195c]">
                {hasPlacement ? "Placed" : "Not placed"}
              </p>

              <p className="mt-1 truncate text-xs text-slate-400">
                {student.placementCompany || "No company assigned"}
              </p>
            </article>
          </section>

          {/* Main content */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
            {/* Activity history */}
            <section
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
              aria-labelledby="activity-heading"
            >
              <div className="border-b border-slate-200 px-5 py-4 sm:px-6">
                <h2
                  id="activity-heading"
                  className="text-base font-semibold text-[#10195c]"
                >
                  Activity History
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Recent SIWES activity submitted by this student.
                </p>
              </div>

              {studentActivities.length === 0 ? (
                <div className="px-5 py-10 text-center sm:px-6">
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      className="h-5 w-5"
                    >
                      <path d="M3 12h4l2-7 4 14 2-7h6" />
                    </svg>
                  </div>

                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No activity logs yet
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    Activity submitted by this student will appear here.
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {studentActivities.map((activityLog) => {
                    const statusClasses = {
                      pending: "bg-amber-50 text-amber-700",
                      approved: "bg-green-50 text-green-700",
                      rejected: "bg-red-50 text-red-700",
                      revision_requested: "bg-purple-50 text-purple-700",
                    };

                    const statusLabel = activityLog.status
                      .replace("_", " ")
                      .replace(/\b\w/g, (character) =>
                        character.toUpperCase(),
                      );

                    return (
                      <article
                        key={activityLog.id}
                        className="px-5 py-5 sm:px-6"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-sm font-semibold text-[#10195c]">
                                {activityLog.title}
                              </h3>

                              <span
                                className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                                  statusClasses[activityLog.status]
                                }`}
                              >
                                {statusLabel}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-400">
                              {activityLog.date} · {activityLog.hoursWorked}{" "}
                              hours
                            </p>
                          </div>
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-600">
                          {activityLog.description}
                        </p>

                        {activityLog.skillsAcquired.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
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

                        {activityLog.supervisorFeedback && (
                          <div className="mt-4 rounded-lg bg-slate-50 p-3">
                            <p className="text-[11px] font-medium text-slate-400">
                              Supervisor feedback
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-600">
                              {activityLog.supervisorFeedback}
                            </p>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Student information */}
            <aside className="space-y-5">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-[#10195c]">
                  Student Information
                </h2>

                <dl className="mt-4 space-y-4">
                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      University
                    </dt>

                    <dd className="mt-1 text-sm font-medium text-slate-700">
                      {student.university}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Department
                    </dt>

                    <dd className="mt-1 text-sm font-medium text-slate-700">
                      {student.department}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Academic Level
                    </dt>

                    <dd className="mt-1 text-sm font-medium text-slate-700">
                      {student.level}
                    </dd>
                  </div>

                  <div>
                    <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Matric Number
                    </dt>

                    <dd className="mt-1 text-sm font-medium text-slate-700">
                      {student.matricNumber}
                    </dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-sm font-semibold text-[#10195c]">
                    Placement
                  </h2>

                  <span
                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${
                      hasPlacement
                        ? "bg-green-50 text-green-700"
                        : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {hasPlacement ? "Placed" : "Not placed"}
                  </span>
                </div>

                <div className="mt-4 rounded-lg bg-[#f8f9fc] p-3">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Company
                  </p>

                  <p className="mt-1 text-sm font-semibold text-[#10195c]">
                    {student.placementCompany || "No placement assigned"}
                  </p>
                </div>

                <Link
                  href="/school/placements"
                  className="mt-4 inline-flex text-xs font-medium text-[#1729c7] hover:underline"
                >
                  View placements →
                </Link>
              </section>

              <section className="rounded-xl bg-[#e8e8ff] p-5">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[#1729c7]">
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

                <h2 className="mt-4 text-sm font-semibold text-[#10195c]">
                  Monitoring note
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#363d78]">
                  Review this student&apos;s activity submissions regularly to
                  keep track of SIWES participation and progress.
                </p>

                <Link
                  href="/school/activity-monitoring"
                  className="mt-4 inline-flex text-xs font-semibold text-[#1729c7] hover:underline"
                >
                  Check activity →
                </Link>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}