
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import SchoolNavigation from "@/components/shared/SchoolNavigation";
import SchoolHeader from "@/components/shared/SchoolHeader";
import { Student } from "@/types";
import {
  fetchStudentsWithFallback,
  fetchSchoolDashboardMetrics,
  getSchoolApiErrorMessage,
  type SchoolDashboardMetrics,
} from "@/services/schoolService";

export default function SchoolDashboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [metrics, setMetrics] = useState<SchoolDashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const [studentsResult, metricsResult] = await Promise.allSettled([
      fetchStudentsWithFallback(),
      fetchSchoolDashboardMetrics(),
    ]);

    if (studentsResult.status === "fulfilled") {
      setStudents(studentsResult.value);
      setStudentsError(null);
    } else {
      setStudentsError(
        getSchoolApiErrorMessage(studentsResult.reason),
      );
    }

    if (metricsResult.status === "fulfilled") {
      setMetrics(metricsResult.value);
      setMetricsError(null);
    } else {
      setMetricsError(
        getSchoolApiErrorMessage(metricsResult.reason),
      );
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [loadData]);

  const handleRetry = () => {
    void loadData();
  };

  // Use backend aggregated metrics where available.
  // Fall back to student-list calculations for metrics that can
  // safely be calculated from the available student records.
  const totalStudents = metrics?.totalStudents ?? students.length;

  const placedStudents =
    metrics?.placedStudents ??
    students.filter(
      (student) => student.placementCompany.trim().length > 0,
    ).length;

  const unplacedStudents =
    metrics?.unplacedStudents ?? totalStudents - placedStudents;

  const activeStudents =
    metrics?.activeStudents ??
    students.filter(
      (student) => student.engagementStatus === "ACTIVE",
    ).length;

  const atRiskStudents =
    metrics?.atRiskStudents ??
    students.filter(
      (student) => student.engagementStatus === "AT_RISK",
    ).length;

  // Official SIWES completion comes from the backend aggregated
  // metrics endpoint, not placementStatus.
  const completedStudents = metrics?.completedStudents ?? null;

  const placementCoverage =
    metrics?.placementCoverage ??
    (totalStudents > 0
      ? Math.round((placedStudents / totalStudents) * 100)
      : 0);

  const dashboardMetrics = [
    {
      label: "Total Students",
      value: totalStudents,
      description: "Students registered",
      href: "/school/students",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
    {
      label: "Placed Students",
      value: placedStudents,
      description: "Students with placements",
      href: "/school/placements",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <rect x="3" y="7" width="18" height="13" rx="2" />
          <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        </svg>
      ),
    },
    {
      label: "Unplaced Students",
      value: unplacedStudents,
      description: "Students needing placement",
      href: "/school/students",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M12 8v4" />
          <path d="M12 16h.01" />
        </svg>
      ),
    },
    {
      label: "Active Students",
      value: activeStudents,
      description: "Students marked active by SIWES monitoring",
      href: "/school/activity-monitoring",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path d="M3 12h4l2-7 4 14 2-7h6" />
        </svg>
      ),
    },
    {
      label: "At-Risk Students",
      value: atRiskStudents,
      description: "Students flagged for low engagement",
      href: "/school/activity-monitoring",
      icon: (
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
      ),
    },
    {
      label: "Completed Students",
      value: completedStudents,
      description: "Students who completed SIWES",
      href: "/school/students",
      icon: (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="h-5 w-5"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      ),
    },
  ];

  const dashboardError = studentsError || metricsError;
  const metricsUnavailable = Boolean(metricsError && studentsError);

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#10195c]">
      <SchoolNavigation />

      <div className="lg:pl-56">
        <SchoolHeader isLoading={isLoading} />

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          <section className="mb-7">
            <p className="text-sm font-medium text-[#1729c7]">
              SIWES Monitoring
            </p>

            <h1 className="mt-1 text-2xl font-bold tracking-tight text-[#10195c] sm:text-3xl">
              Good morning, Coordinator
            </h1>

            <p className="mt-2 max-w-2xl text-sm text-slate-500">
              Here&apos;s an overview of your students, placements, and SIWES
              activity.
            </p>
          </section>

          {dashboardError && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Some dashboard information could not be loaded.
                  </p>

                  {studentsError && (
                    <p className="mt-1 text-xs text-amber-700">
                      Students: {studentsError}
                    </p>
                  )}

                  {metricsError && (
                    <p className="mt-1 text-xs text-amber-700">
                      Dashboard metrics: {metricsError}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="shrink-0 rounded-lg bg-amber-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isLoading ? "Retrying..." : "Try again"}
                </button>
              </div>
            </div>
          )}

          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_250px]">
            <div>
              <section aria-labelledby="student-overview-heading">
                <div className="mb-3 flex items-center justify-between">
                  <h2
                    id="student-overview-heading"
                    className="text-base font-semibold text-[#10195c]"
                  >
                    Student Overview
                  </h2>

                  <Link
                    href="/school/students"
                    className="text-xs font-medium text-[#1729c7] hover:underline"
                  >
                    View all students
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {dashboardMetrics.map((metric) => (
                    <Link
                      key={metric.label}
                      href={metric.href}
                      className="group rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef0ff] text-[#1729c7]">
                          {metric.icon}
                        </div>

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="h-4 w-4 text-slate-300 transition group-hover:text-[#1729c7]"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>

                      <p className="mt-4 text-2xl font-semibold text-[#10195c]">
                        {isLoading ||
                        metricsUnavailable ||
                        metric.value === null ||
                        (metricsError &&
                          metric.label === "Completed Students")
                          ? "—"
                          : metric.value.toLocaleString()}
                      </p>

                      <p className="mt-1 text-sm font-medium text-[#10195c]">
                        {metric.label}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {metric.description}
                      </p>
                    </Link>
                  ))}
                </div>
              </section>

              <section className="mt-6" aria-labelledby="students-heading">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h2
                      id="students-heading"
                      className="text-base font-semibold text-[#10195c]"
                    >
                      Students
                    </h2>

                    <p className="mt-1 text-xs text-slate-500">
                      Recent students in your SIWES programme.
                    </p>
                  </div>

                  <Link
                    href="/school/students"
                    className="text-xs font-medium text-[#1729c7] hover:underline"
                  >
                    View all
                  </Link>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
                  <div className="divide-y divide-slate-100">
                    {studentsError ? (
                      <p className="px-4 py-8 text-center text-sm text-red-600">
                        Student information is unavailable.
                      </p>
                    ) : isLoading ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-500">
                        Loading students...
                      </p>
                    ) : students.length === 0 ? (
                      <p className="px-4 py-8 text-center text-sm text-slate-500">
                        No students found.
                      </p>
                    ) : (
                      students.slice(0, 3).map((student) => {
                        // Placement status is not official SIWES completion.
                        const engagementLabel =
                          student.engagementStatus === "ACTIVE"
                            ? "Active"
                            : student.engagementStatus === "AT_RISK"
                              ? "At risk"
                              : student.engagementStatus === "INACTIVE"
                                ? "Inactive"
                                : "Status unavailable";

                        const engagementClass =
                          student.engagementStatus === "ACTIVE"
                            ? "bg-green-50 text-green-700"
                            : student.engagementStatus === "AT_RISK"
                              ? "bg-amber-50 text-amber-700"
                              : student.engagementStatus === "INACTIVE"
                                ? "bg-red-50 text-red-700"
                                : "bg-slate-100 text-slate-500";

                        return (
                          <Link
                            key={student.id}
                            href={`/school/students/${student.id}`}
                            className="flex items-center justify-between gap-4 px-4 py-4 transition hover:bg-slate-50"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#eef0ff] text-sm font-semibold text-[#1729c7]">
                                {student.name
                                  .split(" ")
                                  .map((name) => name[0])
                                  .slice(0, 2)
                                  .join("")}
                              </div>

                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#10195c]">
                                  {student.name}
                                </p>

                                <p className="truncate text-xs text-slate-500">
                                  {student.department} · {student.level}
                                </p>
                              </div>
                            </div>

                            <div className="hidden text-right sm:block">
                              <p className="text-xs font-medium text-slate-700">
                                {student.placementCompany ||
                                  "No placement yet"}
                              </p>

                              <span
                                className={`mt-1 inline-flex rounded-full px-2 py-1 text-[10px] font-medium ${engagementClass}`}
                              >
                                {engagementLabel}
                              </span>
                            </div>
                          </Link>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>
            </div>

            <aside className="space-y-4">
              <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-[#10195c]">
                    Placement Coverage
                  </h2>

                  <span className="text-xs font-medium text-[#1729c7]">
                    {isLoading || metricsUnavailable
                      ? "—"
                      : `${placementCoverage}%`}
                  </span>
                </div>

                <div className="mt-5 flex justify-center">
                  <div
                    className="relative flex h-32 w-32 items-center justify-center rounded-full"
                    style={{
                      background: `conic-gradient(#1729c7 ${placementCoverage}%, #e8eaff ${placementCoverage}% 100%)`,
                    }}
                  >
                    <div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white">
                      <span className="text-xl font-semibold text-[#10195c]">
                        {isLoading || metricsUnavailable
                          ? "—"
                          : `${placementCoverage}%`}
                      </span>

                      <span className="text-[10px] text-slate-500">
                        placed
                      </span>
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  {metricsUnavailable
                    ? "Placement information is currently unavailable."
                    : isLoading
                      ? "Loading placement information..."
                      : `${placedStudents} of ${totalStudents} students currently have placements.`}
                </p>

                <Link
                  href="/school/placements"
                  className="mt-4 block rounded-lg border border-[#7b83e8] px-4 py-2 text-center text-xs font-medium text-[#1729c7] transition hover:bg-[#f4f5ff]"
                >
                  View placements
                </Link>
              </section>

              <section className="rounded-xl bg-[#e8e8ff] p-5 shadow-sm">
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
                  Keep monitoring
                </h2>

                <p className="mt-2 text-xs leading-5 text-[#363d78]">
                  Stay on top of student placements and activity submissions to
                  help keep the SIWES programme moving smoothly.
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
