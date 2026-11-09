"use client";

import Link from "next/link";

import SchoolNavigation from "@/components/shared/SchoolNavigation";
import { useEffect, useMemo, useState } from "react";
import { Student } from "@/types";
import { fetchStudentsWithFallback } from "@/services/schoolService";

export default function SchoolPlacementsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "placed" | "unplaced">("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        const live = await fetchStudentsWithFallback();
        if (isMounted) setStudents(live);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    load();
    return () => { isMounted = false; };
  }, []);

  const totalStudents = students.length;

  const placedStudents = useMemo(
    () => students.filter((s) => s.placementCompany.trim().length > 0),
    [students]
  );

  const unplacedStudents = useMemo(
    () => students.filter((s) => s.placementCompany.trim().length === 0),
    [students]
  );

  const placementCoverage =
    totalStudents > 0
      ? Math.round((placedStudents.length / totalStudents) * 100)
      : 0;

  const filteredStudents = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return students.filter((student) => {
      const isPlaced = student.placementCompany.trim().length > 0;
      if (statusFilter === "placed" && !isPlaced) return false;
      if (statusFilter === "unplaced" && isPlaced) return false;
      if (!q) return true;
      return (
        student.name.toLowerCase().includes(q) ||
        student.matricNumber.toLowerCase().includes(q) ||
        student.university.toLowerCase().includes(q) ||
        student.department.toLowerCase().includes(q) ||
        student.placementCompany.toLowerCase().includes(q)
      );
    });
  }, [students, searchQuery, statusFilter]);

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
              Placement Management
            </p>

            <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-[#10195c] sm:text-3xl">
                  Placements
                </h1>

                <p className="mt-2 max-w-2xl text-sm text-slate-500">
                  Monitor student placement status and host company
                  information across your SIWES programme.
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

          {/* Placement summary */}
          <section
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Placement summary"
          >
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Total Students
                </p>

                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#eef0ff] text-[#1729c7]">
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
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {totalStudents}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Students in programme
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Placed
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
                {placedStudents.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Students with placements
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Unplaced
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
                    <path d="M12 8v4" />
                    <path d="M12 16h.01" />
                  </svg>
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {unplacedStudents.length}
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Students needing placement
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">
                  Coverage
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
                    <path d="M8 12.5 10.5 15 16 9.5" />
                  </svg>
                </div>
              </div>

              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {placementCoverage}%
              </p>

              <p className="mt-1 text-xs text-slate-400">
                Placement coverage
              </p>
            </article>
          </section>

          {/* Placement monitoring */}
          <section className="mt-6" aria-labelledby="placement-monitoring">
            <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
              <div>
                <h2
                  id="placement-monitoring"
                  className="text-base font-semibold text-[#10195c]"
                >
                  Placement Monitoring
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Review student placement assignments and identify students
                  who still need placement.
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
              {/* Search bar */}
              <div className="border-b border-slate-200 p-4">
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
                    placeholder="Search students or companies..."
                    aria-label="Search placements"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-[#f8f9fc] pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#7b83e8] focus:bg-white focus:ring-2 focus:ring-[#eef0ff]"
                  />
                </div>
              </div>

              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[800px] text-left">
                  <thead className="border-b border-slate-200 bg-[#fafbfe]">
                    <tr>
                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Student
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Matric Number
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        University
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Department
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Company
                      </th>

                      <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => {
                      const isPlaced =
                        student.placementCompany.trim().length > 0;

                      const initials = student.name
                        .split(" ")
                        .map((name) => name[0])
                        .slice(0, 2)
                        .join("");

                      return (
                        <tr
                          key={student.id}
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

                              <div>
                                <p className="text-sm font-semibold text-[#10195c] group-hover:text-[#1729c7]">
                                  {student.name}
                                </p>

                                <p className="text-xs text-slate-400">
                                  {student.id}
                                </p>
                              </div>
                            </Link>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {student.matricNumber}
                          </td>

                          <td className="max-w-[220px] px-5 py-4">
                            <p className="truncate text-sm text-slate-600">
                              {student.university}
                            </p>
                          </td>

                          <td className="px-5 py-4 text-sm text-slate-600">
                            {student.department}
                          </td>

                          <td className="px-5 py-4">
                            {isPlaced ? (
                              <p className="text-sm font-medium text-slate-700">
                                {student.placementCompany}
                              </p>
                            ) : (
                              <p className="text-sm text-slate-400">
                                No company assigned
                              </p>
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium ${
                                isPlaced
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              <span
                                className={`h-1.5 w-1.5 rounded-full ${
                                  isPlaced
                                    ? "bg-green-500"
                                    : "bg-amber-500"
                                }`}
                              />

                              {isPlaced ? "Placed" : "Not placed"}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredStudents.map((student) => {
                  const isPlaced =
                    student.placementCompany.trim().length > 0;

                  const initials = student.name
                    .split(" ")
                    .map((name) => name[0])
                    .slice(0, 2)
                    .join("");

                  return (
                    <Link
                      key={student.id}
                      href={`/school/students/${student.id}`}
                      className="block p-4 transition hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
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
                        </div>

                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          className="mt-1 h-4 w-4 shrink-0 text-slate-300"
                        >
                          <path d="m9 18 6-6-6-6" />
                        </svg>
                      </div>

                      <div className="mt-4 space-y-3">
                        <div>
                          <p className="text-[11px] text-slate-400">
                            University
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {student.university}
                          </p>
                        </div>

                        <div>
                          <p className="text-[11px] text-slate-400">
                            Department
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {student.department}
                          </p>
                        </div>

                        <div className="border-t border-slate-100 pt-3">
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="text-[11px] text-slate-400">
                                Placement Company
                              </p>

                              <p className="mt-1 truncate text-xs font-medium text-slate-700">
                                {student.placementCompany ||
                                  "No company assigned"}
                              </p>
                            </div>

                            <span
                              className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${
                                isPlaced
                                  ? "bg-green-50 text-green-700"
                                  : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {isPlaced ? "Placed" : "Not placed"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 sm:px-5">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {totalStudents}
                  </span>{" "}
                  students
                </p>

                <Link
                  href="/school/students"
                  className="text-xs font-medium text-[#1729c7] hover:underline"
                >
                  View all students
                </Link>
              </div>
            </div>
          </section>

          {/* Unplaced students */}
          {unplacedStudents.length > 0 && (
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
                    Placement attention needed
                  </h2>

                  <p className="mt-1 text-xs leading-5 text-slate-600">
                    {unplacedStudents.length}{" "}
                    {unplacedStudents.length === 1
                      ? "student currently has"
                      : "students currently have"}{" "}
                    no placement company assigned. Review the student list to
                    monitor their placement status.
                  </p>

                  <Link
                    href="/school/students"
                    className="mt-3 inline-flex text-xs font-semibold text-[#1729c7] hover:underline"
                  >
                    Review students →
                  </Link>
                </div>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}