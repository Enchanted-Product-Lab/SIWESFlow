
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import SchoolHeader from "@/components/shared/SchoolHeader";
import SchoolNavigation from "@/components/shared/SchoolNavigation";
import {
  fetchStudentsWithFallback,
  getSchoolApiErrorMessage,
  type SchoolStudent,
} from "@/services/schoolService";

type PlacementFilter = "all" | "placed" | "unplaced";

const isStudentPlaced = (student: SchoolStudent): boolean => {
  if (student.placementStatus) {
    return student.placementStatus.toUpperCase() === "PLACED";
  }

  return student.placementCompany.trim().length > 0;
};

const formatStatus = (status?: string): string => {
  if (!status) return "Not provided";

  return status
    .toLowerCase()
    .split(/[_\s-]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function SchoolPlacementsPage() {
  const [students, setStudents] = useState<SchoolStudent[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [placementFilter, setPlacementFilter] =
    useState<PlacementFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchStudentsWithFallback();
      setStudents(result as SchoolStudent[]);
    } catch (err) {
      setError(getSchoolApiErrorMessage(err));
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  const placedStudents = useMemo(
    () => students.filter(isStudentPlaced),
    [students],
  );

  const unplacedStudents = useMemo(
    () => students.filter((student) => !isStudentPlaced(student)),
    [students],
  );

  const placementCoverage =
    students.length > 0
      ? Math.round((placedStudents.length / students.length) * 100)
      : 0;

  const filteredStudents = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return students.filter((student) => {
      const matchesSearch =
        !normalizedSearch ||
        student.name.toLowerCase().includes(normalizedSearch) ||
        student.matricNumber.toLowerCase().includes(normalizedSearch) ||
        student.university.toLowerCase().includes(normalizedSearch) ||
        student.department.toLowerCase().includes(normalizedSearch) ||
        student.placementCompany.toLowerCase().includes(normalizedSearch) ||
        (student.placementTitle ?? "").toLowerCase().includes(normalizedSearch);

      const placed = isStudentPlaced(student);

      const matchesFilter =
        placementFilter === "all" ||
        (placementFilter === "placed" && placed) ||
        (placementFilter === "unplaced" && !placed);

      return matchesSearch && matchesFilter;
    });
  }, [students, searchTerm, placementFilter]);

  const handleFilterChange = (filter: PlacementFilter) => {
    setPlacementFilter(filter);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SchoolNavigation />

      <div className="lg:pl-64">
        <SchoolHeader />

        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              Placement Monitoring
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Monitor student placement assignments and their approval status.
            </p>
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="font-medium text-red-800">
                    Unable to load placement information
                  </p>
                  <p className="mt-1 text-sm text-red-700">{error}</p>
                </div>

                <button
                  onClick={() => void loadStudents()}
                  disabled={isLoading}
                  className="rounded-lg bg-red-700 px-4 py-2 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50"
                >
                  {isLoading ? "Retrying..." : "Try again"}
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Total Students
              </p>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {isLoading ? "—" : error ? "—" : students.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Placed Students
              </p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {isLoading || error ? "—" : placedStudents.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Unplaced Students
              </p>
              <p className="mt-2 text-3xl font-bold text-orange-600">
                {isLoading || error ? "—" : unplacedStudents.length}
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-sm font-medium text-gray-500">
                Placement Coverage
              </p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {isLoading || error ? "—" : `${placementCoverage}%`}
              </p>
            </div>
          </div>

          {!isLoading && !error && unplacedStudents.length > 0 && (
            <div className="rounded-xl border border-orange-200 bg-orange-50 p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-full bg-orange-100 p-2">
                  <svg
                    className="h-5 w-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v4m0 4h.01M10.29 3.86l-8.1 14.02A2 2 0 003.92 21h16.16a2 2 0 001.73-3.12l-8.1-14.02a2 2 0 00-3.46 0z"
                    />
                  </svg>
                </div>

                <div>
                  <h3 className="font-semibold text-orange-900">
                    Students Without Placement
                  </h3>
                  <p className="mt-1 text-sm text-orange-800">
                    {unplacedStudents.length} student
                    {unplacedStudents.length === 1 ? " has" : "s have"} no
                    recorded placement assignment. Review their records and
                    follow up where necessary.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="border-b border-gray-200 p-4 sm:p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">
                    Student Placements
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    View student placement assignments and approval details.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="11" cy="11" r="7" strokeWidth="2" />
                      <path
                        strokeLinecap="round"
                        strokeWidth="2"
                        d="m20 20-4-4"
                      />
                    </svg>

                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(event) => setSearchTerm(event.target.value)}
                      placeholder="Search students or companies..."
                      className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-64"
                    />
                  </div>

                  <select
                    value={placementFilter}
                    onChange={(event) =>
                      handleFilterChange(event.target.value as PlacementFilter)
                    }
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="all">All Students</option>
                    <option value="placed">Placed</option>
                    <option value="unplaced">Unplaced</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 border-b border-gray-200 px-4 py-3 sm:px-5">
              {(
                [
                  ["all", "All Students"],
                  ["placed", "Placed"],
                  ["unplaced", "Unplaced"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  onClick={() => handleFilterChange(value)}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
                    placementFilter === value
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
                <p className="mt-3 text-sm text-gray-500">
                  Loading placement information...
                </p>
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <p className="font-medium text-gray-700">
                  Placement information could not be loaded.
                </p>
                <button
                  onClick={() => void loadStudents()}
                  className="mt-3 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Retry loading
                </button>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className="py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                  <svg
                    className="h-6 w-6 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h6l6 6v10a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>

                <p className="mt-3 font-medium text-gray-700">
                  {students.length === 0
                    ? "No students found"
                    : "No matching students"}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {students.length === 0
                    ? "Student placement records will appear here when available."
                    : "Try adjusting your search or placement filter."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Student</th>
                        <th className="px-5 py-4 font-semibold">
                          Matric Number
                        </th>
                        <th className="px-5 py-4 font-semibold">Department</th>
                        <th className="px-5 py-4 font-semibold">Company</th>
                        <th className="px-5 py-4 font-semibold">
                          Assignment Status
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Approval Status
                        </th>
                        <th className="px-5 py-4 font-semibold">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100">
                      {filteredStudents.map((student) => {
                        const placed = isStudentPlaced(student);

                        return (
                          <tr
                            key={student.id}
                            className="transition hover:bg-gray-50"
                          >
                            <td className="px-5 py-4">
                              <p className="font-medium text-gray-900">
                                {student.name}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {student.university}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {student.matricNumber || "—"}
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {student.department || "—"}
                            </td>

                            <td className="px-5 py-4">
                              <p className="font-medium text-gray-700">
                                {student.placementCompany || "Not assigned"}
                              </p>
                              {student.placementTitle && (
                                <p className="mt-1 text-xs text-gray-500">
                                  {student.placementTitle}
                                </p>
                              )}
                            </td>

                            <td className="px-5 py-4">
                              <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                                  placed
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                }`}
                              >
                                {placed ? "Placed" : "Unplaced"}
                              </span>
                            </td>

                            <td className="px-5 py-4 text-gray-600">
                              {formatStatus(student.placementApprovalStatus)}
                            </td>

                            <td className="px-5 py-4">
                              <Link
                                href={`/school/students/${encodeURIComponent(student.id)}`}
                                className="font-medium text-blue-600 hover:text-blue-800"
                              >
                                View student →
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-gray-100 md:hidden">
                  {filteredStudents.map((student) => {
                    const placed = isStudentPlaced(student);

                    return (
                      <div key={student.id} className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900">
                              {student.name}
                            </p>
                            <p className="mt-1 text-xs text-gray-500">
                              {student.matricNumber || "—"}
                            </p>
                          </div>

                          <span
                            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                              placed
                                ? "bg-green-100 text-green-700"
                                : "bg-orange-100 text-orange-700"
                            }`}
                          >
                            {placed ? "Placed" : "Unplaced"}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <p className="text-xs text-gray-500">Department</p>
                            <p className="mt-1 text-gray-700">
                              {student.department || "—"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Company</p>
                            <p className="mt-1 text-gray-700">
                              {student.placementCompany || "Not assigned"}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">
                              Approval Status
                            </p>
                            <p className="mt-1 text-gray-700">
                              {formatStatus(student.placementApprovalStatus)}
                            </p>
                          </div>

                          <div>
                            <p className="text-xs text-gray-500">Institution</p>
                            <p className="mt-1 text-gray-700">
                              {student.university || "—"}
                            </p>
                          </div>
                        </div>

                        <Link
                          href={`/school/students/${encodeURIComponent(student.id)}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-800"
                        >
                          View student →
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {!isLoading && !error && filteredStudents.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-3 text-sm text-gray-500 sm:px-5">
                Showing {filteredStudents.length} of {students.length} students
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
