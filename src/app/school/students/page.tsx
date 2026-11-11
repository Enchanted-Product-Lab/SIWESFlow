
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import SchoolNavigation from "@/components/shared/SchoolNavigation";
import { Student, ActivityLog } from "@/types";
import {
  fetchStudentsWithFallback,
  fetchActivitiesWithFallback,
  getSchoolApiErrorMessage,
} from "@/services/schoolService";

type PlacementFilter = "all" | "placed" | "unplaced";
type ActivityFilter = "all" | "active" | "no-activity";

const selectClassName =
  "w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

const inputClassName =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100";

function StatusBadge({
  children,
  status,
}: {
  children: React.ReactNode;
  status: "success" | "warning" | "neutral";
}) {
  const styles = {
    success: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    warning: "bg-amber-50 text-amber-700 ring-amber-100",
    neutral: "bg-slate-100 text-slate-600 ring-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${styles[status]}`}
    >
      {children}
    </span>
  );
}

function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block min-w-0 space-y-1.5">
      <span className="text-xs font-semibold text-slate-600">{label}</span>
      {children}
    </label>
  );
}

export default function SchoolStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const [studentsResult, activitiesResult] = await Promise.allSettled([
      fetchStudentsWithFallback(),
      fetchActivitiesWithFallback(),
    ]);

    if (studentsResult.status === "fulfilled") {
      setStudents(studentsResult.value);
      setStudentsError(null);
    } else {
      setStudentsError(
        getSchoolApiErrorMessage(studentsResult.reason),
      );
    }

    if (activitiesResult.status === "fulfilled") {
      setActivityLogs(activitiesResult.value);
      setActivitiesError(null);
    } else {
      setActivitiesError(
        getSchoolApiErrorMessage(activitiesResult.reason),
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
    setIsLoading(true);
    void loadData();
  };

  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [level, setLevel] = useState("all");
  const [company, setCompany] = useState("all");
  const [placementStatus, setPlacementStatus] =
    useState<PlacementFilter>("all");
  const [activityStatus, setActivityStatus] =
    useState<ActivityFilter>("all");

  const activeStudentIds = useMemo(
    () => new Set(activityLogs.map((activityLog) => activityLog.studentId)),
    [activityLogs],
  );

  const totalStudents = students.length;

  const placedStudents = students.filter(
    (student) => student.placementCompany.trim().length > 0,
  ).length;

  const unplacedStudents = totalStudents - placedStudents;

  const departments = useMemo(
    () =>
      [
        ...new Set(
          students.map((student) => student.department).filter(Boolean),
        ),
      ].sort(),
    [students],
  );

  const levels = useMemo(
    () =>
      [...new Set(students.map((student) => student.level).filter(Boolean))].sort(),
    [students],
  );

  const companies = useMemo(
    () =>
      [
        ...new Set(
          students
            .map((student) => student.placementCompany.trim())
            .filter(Boolean),
        ),
      ].sort(),
    [students],
  );

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const hasPlacement = student.placementCompany.trim().length > 0;
      const hasActivity = activeStudentIds.has(student.id);

      const matchesSearch =
        query.length === 0 ||
        [
          student.id,
          student.name,
          student.matricNumber,
          student.university,
          student.department,
          student.level,
          student.placementCompany,
        ].some((value) => value.toLowerCase().includes(query));

      const matchesDepartment =
        department === "all" || student.department === department;

      const matchesLevel = level === "all" || student.level === level;

      const matchesCompany =
        company === "all" ||
        (company === "__unplaced__" && !hasPlacement) ||
        student.placementCompany.trim() === company;

      const matchesPlacement =
        placementStatus === "all" ||
        (placementStatus === "placed" && hasPlacement) ||
        (placementStatus === "unplaced" && !hasPlacement);

      const matchesActivity =
        Boolean(activitiesError) ||
        activityStatus === "all" ||
        (activityStatus === "active" && hasActivity) ||
        (activityStatus === "no-activity" && !hasActivity);

      return (
        matchesSearch &&
        matchesDepartment &&
        matchesLevel &&
        matchesCompany &&
        matchesPlacement &&
        matchesActivity
      );
    });
  }, [
    students,
    activeStudentIds,
    search,
    department,
    level,
    company,
    placementStatus,
    activityStatus,
    activitiesError,
  ]);

  const hasActiveFilters =
    search.trim() !== "" ||
    department !== "all" ||
    level !== "all" ||
    company !== "all" ||
    placementStatus !== "all" ||
    activityStatus !== "all";

  function clearFilters() {
    setSearch("");
    setDepartment("all");
    setLevel("all");
    setCompany("all");
    setPlacementStatus("all");
    setActivityStatus("all");
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#10195c]">
      <SchoolNavigation />

      <main className="min-w-0 px-4 pb-10 pt-5 sm:px-6 lg:ml-56 lg:px-8 lg:pt-8">
        {/* Top bar */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <Link
  href="/school/dashboard"
  className="text-xs font-bold text-slate-700 transition-colors hover:text-blue-600"
>
  School Portal / Student Management
</Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                className="h-5 w-5"
                aria-hidden="true"
              >
                <path
                  d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <div className="hidden items-center gap-3 sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9eaff] text-sm font-bold text-[#343eaa]">
                SC
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-800">
                  School Coordinator
                </p>
                <p className="text-xs text-slate-500">Administrator</p>
              </div>
            </div>
          </div>
        </div>

        {/* Page heading */}
        <section className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-sm font-medium text-orange-500">
              Student Management
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-[#10195c] sm:text-3xl">
              Students
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              View student records, monitor placement progress, and track
              activity across your institution.
            </p>
          </div>

          <div className="inline-flex w-fit items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="text-sm text-slate-600">
              <strong className="font-semibold text-slate-800">
                {studentsError ? "—" : totalStudents}
              </strong>{" "}
              total students
            </span>
          </div>
        </section>

        {/* API error messages and retry */}
        {(studentsError || activitiesError) && (
          <div
            role="alert"
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-red-800">
                  Some student information could not be loaded.
                </p>

                {studentsError && (
                  <p className="mt-1 text-xs text-red-700">
                    Students: {studentsError}
                  </p>
                )}

                {activitiesError && (
                  <p className="mt-1 text-xs text-red-700">
                    Activities: {activitiesError}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleRetry}
                disabled={isLoading}
                className="shrink-0 rounded-lg bg-red-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Retrying..." : "Try again"}
              </button>
            </div>
          </div>
        )}

        {/* Summary cards */}
        <section
          aria-label="Student summary"
          className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3"
        >
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Total Students
                </p>
                <p className="mt-3 text-3xl font-bold text-[#10195c]">
                  {studentsError ? "—" : totalStudents}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Registered students
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 8v6m3-3h-6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Placed Students
                </p>
                <p className="mt-3 text-3xl font-bold text-emerald-600">
                  {studentsError ? "—" : placedStudents}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Students with a company
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="m5 12 4 4L19 6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-200/40">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Unplaced Students
                </p>
                <p className="mt-3 text-3xl font-bold text-amber-600">
                  {studentsError ? "—" : unplacedStudents}
                </p>
                <p className="mt-2 text-xs text-slate-500">
                  Students without a company
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    d="M12 9v4m0 4h.01M10.3 3.9 2.5 17.4A2 2 0 0 0 4.2 20h15.6a2 2 0 0 0 1.7-2.6L13.7 3.9a2 2 0 0 0-3.4 0Z"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* Monitoring and filters */}
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-200/40">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div>
              <h2 className="text-lg font-bold text-[#10195c]">
                Student Monitoring
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Search and filter student records.
              </p>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:self-auto"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path
                  d="M3 6h18M8 6V4h8v2m-9 0 1 14h8l1-14M10 10v6m4-6v6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Clear filters
            </button>
          </div>

          <div className="space-y-5 border-b border-slate-100 bg-slate-50/60 px-5 py-5 sm:px-6">
            <div className="relative">
              <label htmlFor="student-search" className="sr-only">
                Search students
              </label>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="7" />
                <path d="m16 16 4 4" strokeLinecap="round" />
              </svg>
              <input
                id="student-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by name, matric number, university, or company..."
                className={`${inputClassName} pl-11`}
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <FilterField label="Department">
                <select
                  value={department}
                  onChange={(event) => setDepartment(event.target.value)}
                  className={selectClassName}
                >
                  <option value="all">All departments</option>
                  {departments.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField label="Level">
                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value)}
                  className={selectClassName}
                >
                  <option value="all">All levels</option>
                  {levels.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </FilterField>

              <FilterField label="Company">
                <select
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  className={selectClassName}
                >
                  <option value="all">All companies</option>
                  {companies.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                  <option value="__unplaced__">No company assigned</option>
                </select>
              </FilterField>

              <FilterField label="Placement status">
                <select
                  value={placementStatus}
                  onChange={(event) =>
                    setPlacementStatus(event.target.value as PlacementFilter)
                  }
                  className={selectClassName}
                >
                  <option value="all">All placement statuses</option>
                  <option value="placed">Placed</option>
                  <option value="unplaced">Unplaced</option>
                </select>
              </FilterField>

              <FilterField label="Activity status">
                <select
                  value={activityStatus}
                  onChange={(event) =>
                    setActivityStatus(event.target.value as ActivityFilter)
                  }
                  className={selectClassName}
                  disabled={Boolean(activitiesError)}
                >
                  <option value="all">All activity statuses</option>
                  <option value="active">Active</option>
                  <option value="no-activity">No activity</option>
                </select>
              </FilterField>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-sm text-slate-500" aria-live="polite">
                {isLoading ? (
                  "Loading student records..."
                ) : studentsError ? (
                  "Student records are unavailable."
                ) : (
                  <>
                    <span className="font-semibold text-slate-800">
                      {filteredStudents.length}
                    </span>{" "}
                    {filteredStudents.length === 1 ? "student" : "students"} found
                  </>
                )}
              </p>

              {hasActiveFilters && (
                <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-medium text-orange-700">
                  Filters applied
                </span>
              )}
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[850px] text-left">
              <thead className="bg-slate-50/80">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-4 py-4">Matric Number</th>
                  <th className="px-4 py-4">University</th>
                  <th className="px-4 py-4">Department</th>
                  <th className="px-4 py-4">Level</th>
                  <th className="px-4 py-4">Placement</th>
                  <th className="px-4 py-4">Activity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student) => {
                  const hasPlacement =
                    student.placementCompany.trim().length > 0;
                  const hasActivity = activeStudentIds.has(student.id);

                  return (
                    <tr
                      key={student.id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/school/students/${student.id}`}
                          className="group flex items-center gap-3"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#e9eaff] text-sm font-bold text-[#343eaa]">
                            {student.name
                              .split(" ")
                              .map((part) => part[0])
                              .join("")
                              .slice(0, 2)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-800 group-hover:text-orange-600">
                              {student.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {student.id}
                            </p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {student.matricNumber}
                      </td>
                      <td className="max-w-[210px] px-4 py-4 text-sm text-slate-600">
                        {student.university}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {student.department}
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">
                        {student.level}
                      </td>
                      <td className="px-4 py-4">
                        {hasPlacement ? (
                          <div className="space-y-1.5">
                            <StatusBadge status="success">Placed</StatusBadge>
                            <p className="max-w-[180px] text-xs text-slate-500">
                              {student.placementCompany}
                            </p>
                          </div>
                        ) : (
                          <StatusBadge status="warning">Unplaced</StatusBadge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        {activitiesError ? (
                          <StatusBadge status="neutral">Unavailable</StatusBadge>
                        ) : hasActivity ? (
                          <StatusBadge status="success">Active</StatusBadge>
                        ) : (
                          <StatusBadge status="neutral">
                            No activity
                          </StatusBadge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {!isLoading &&
              !studentsError &&
              filteredStudents.length === 0 && (
                <div className="px-6 py-14 text-center">
                  <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      className="h-6 w-6"
                      aria-hidden="true"
                    >
                      <circle cx="11" cy="11" r="7" />
                      <path d="m16 16 4 4" strokeLinecap="round" />
                    </svg>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    No students found
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or clearing some filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 p-4 md:hidden">
            {filteredStudents.map((student) => {
              const hasPlacement =
                student.placementCompany.trim().length > 0;
              const hasActivity = activeStudentIds.has(student.id);

              return (
                <article
                  key={student.id}
                  className="rounded-xl border border-slate-100 bg-white p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#e9eaff] text-sm font-bold text-[#343eaa]">
                      {student.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/school/students/${student.id}`}
                        className="text-sm font-semibold text-slate-800 hover:text-orange-600"
                      >
                        {student.name}
                      </Link>
                      <p className="mt-1 text-xs text-slate-500">
                        {student.matricNumber}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {student.university}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
                    <div className="min-w-0">
                      <p className="text-xs text-slate-500">Department</p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {student.department}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Level</p>
                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {student.level}
                      </p>
                    </div>
                    <div className="col-span-2 min-w-0">
                      <p className="text-xs text-slate-500">Company</p>
                      <p className="mt-1 break-words text-sm font-medium text-slate-700">
                        {hasPlacement
                          ? student.placementCompany
                          : "No company assigned"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Placement</p>
                      <div className="mt-1">
                        {hasPlacement ? (
                          <StatusBadge status="success">Placed</StatusBadge>
                        ) : (
                          <StatusBadge status="warning">Unplaced</StatusBadge>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Activity</p>
                      <div className="mt-1">
                        {activitiesError ? (
                          <StatusBadge status="neutral">Unavailable</StatusBadge>
                        ) : hasActivity ? (
                          <StatusBadge status="success">Active</StatusBadge>
                        ) : (
                          <StatusBadge status="neutral">
                            No activity
                          </StatusBadge>
                        )}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/school/students/${student.id}`}
                    className="mt-4 inline-flex text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    View student profile →
                  </Link>
                </article>
              );
            })}

            {!isLoading &&
              !studentsError &&
              filteredStudents.length === 0 && (
                <div className="px-3 py-10 text-center">
                  <h3 className="text-sm font-semibold text-slate-800">
                    No students found
                  </h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Try changing your search or clearing some filters.
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="mt-4 text-sm font-semibold text-orange-600 hover:text-orange-700"
                  >
                    Clear all filters
                  </button>
                </div>
              )}
          </div>

          {/* Results footer */}
          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-800">
                {studentsError ? "—" : filteredStudents.length}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-800">
                {studentsError ? "—" : totalStudents}
              </span>{" "}
              {totalStudents === 1 ? "student" : "students"}
            </p>
            <Link
              href="/school/dashboard"
              className="text-sm font-medium text-[#343eaa] transition hover:text-orange-600"
            >
              Back to Dashboard →
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
