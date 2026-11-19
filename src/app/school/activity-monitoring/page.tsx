
"use client";

import Link from "next/link";
import SchoolNavigation from "@/components/shared/SchoolNavigation";
import SchoolHeader from "@/components/shared/SchoolHeader";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ActivityLog, ActivityStatus, Student } from "@/types";
import {
  fetchActivitiesWithFallback,
  fetchStudentsWithFallback,
  getSchoolApiErrorMessage,
} from "@/services/schoolService";

const statusStyles: Record<
  ActivityStatus,
  {
    label: string;
    className: string;
    dotClassName: string;
  }
> = {
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
};

type ActivityFilter = "all" | ActivityStatus;

const statusFilters: ActivityFilter[] = [
  "all",
  "pending",
  "approved",
  "rejected",
  "revision_requested",
];

export default function SchoolActivityMonitoringPage() {
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<ActivityFilter>("all");

  const [isLoading, setIsLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(
    null,
  );
  const [studentsError, setStudentsError] = useState<string | null>(null);

  const requestId = useRef(0);

  const loadData = useCallback(async () => {
    const currentRequestId = ++requestId.current;

    setIsLoading(true);

    const [activitiesResult, studentsResult] = await Promise.allSettled([
      fetchActivitiesWithFallback(),
      fetchStudentsWithFallback(),
    ]);

    // Ignore responses from older requests.
    if (currentRequestId !== requestId.current) return;

    if (activitiesResult.status === "fulfilled") {
      setActivities(activitiesResult.value);
      setActivitiesError(null);
    } else {
      setActivities([]);
      setActivitiesError(
        getSchoolApiErrorMessage(activitiesResult.reason),
      );
    }

    if (studentsResult.status === "fulfilled") {
      setStudents(studentsResult.value);
      setStudentsError(null);
    } else {
      setStudents([]);
      setStudentsError(getSchoolApiErrorMessage(studentsResult.reason));
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
      requestId.current += 1;
    };
  }, [loadData]);

  const handleRetry = () => {
    void loadData();
  };

  const totalActivities = activities.length;

  const pendingActivities = activities.filter(
    (activity) => activity.status === "pending",
  ).length;

  const approvedActivities = activities.filter(
    (activity) => activity.status === "approved",
  ).length;

  // This represents all submitted activity hours, not official
  // SIWES completion hours.
  const totalSubmittedHours = activities.reduce(
    (total, activity) => total + activity.hoursWorked,
    0,
  );

  const activeStudents = students.filter(
    (student) => student.engagementStatus === "ACTIVE",
  );

  const atRiskStudents = students.filter(
    (student) => student.engagementStatus === "AT_RISK",
  );

  // Engagement status is independent of official SIWES completion.
  const inactiveStudents = students.filter(
    (student) => student.engagementStatus === "INACTIVE",
  );

  const studentsNeedingAttention = [
    ...atRiskStudents,
    ...inactiveStudents,
  ];

  const getStudent = useCallback(
    (studentId: string): Student | undefined =>
      students.find((student) => student.id === studentId),
    [students],
  );

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return activities.filter((log) => {
      if (statusFilter !== "all" && log.status !== statusFilter) {
        return false;
      }

      if (!query) return true;

      const student = getStudent(log.studentId);

      return (
        log.title.toLowerCase().includes(query) ||
        log.description.toLowerCase().includes(query) ||
        student?.name.toLowerCase().includes(query) ||
        student?.matricNumber.toLowerCase().includes(query)
      );
    });
  }, [activities, searchQuery, statusFilter, getStudent]);

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#10195c]">
      <SchoolNavigation />

      <div className="lg:pl-56">
        <SchoolHeader />

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          <section className="mb-7">
            <p className="text-sm font-medium text-[#1729c7]">
              SIWES Monitoring
            </p>

            <div className="mt-1 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#10195c] sm:text-3xl">
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

          {(activitiesError || studentsError) && (
            <div
              role="alert"
              className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-800">
                    Some activity monitoring information could not be loaded.
                  </p>

                  {activitiesError && (
                    <p className="mt-1 text-xs text-red-700">
                      Activities: {activitiesError}
                    </p>
                  )}

                  {studentsError && (
                    <p className="mt-1 text-xs text-red-700">
                      Students: {studentsError}
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

          <section
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
            aria-label="Activity summary"
          >
            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Total Activities
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {isLoading || activitiesError ? "—" : totalActivities}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Submitted activity logs
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Pending Review
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {isLoading || activitiesError ? "—" : pendingActivities}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Awaiting supervisor action
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Approved
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {isLoading || activitiesError ? "—" : approvedActivities}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Supervisor-approved logs
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-medium text-slate-500">
                Hours Logged
              </p>
              <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                {isLoading || activitiesError ? "—" : totalSubmittedHours}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Across all submitted activities
              </p>
            </article>
          </section>

          <section className="mt-6" aria-labelledby="activity-monitoring">
            <div className="mb-3">
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

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
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
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search activities or students..."
                    aria-label="Search activities"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-[#f8f9fc] pl-9 pr-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:border-[#7b83e8] focus:bg-white focus:ring-2 focus:ring-[#eef0ff]"
                  />
                </div>

                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Filter activities by status"
                >
                  {statusFilters.map((status) => {
                    const label =
                      status === "all"
                        ? "All"
                        : statusStyles[status].label;

                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setStatusFilter(status)}
                        aria-pressed={statusFilter === status}
                        className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                          statusFilter === status
                            ? "border-[#1729c7] bg-[#eef0ff] text-[#1729c7]"
                            : "border-slate-200 bg-white text-slate-600 hover:border-[#7b83e8]"
                        }`}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[900px] text-left">
                  <thead className="border-b border-slate-200 bg-[#fafbfe]">
                    <tr>
                      {[
                        "Student",
                        "Activity",
                        "Date",
                        "Hours",
                        "Status",
                        "Action",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {!isLoading &&
                      !activitiesError &&
                      filteredActivities.map((activity) => {
                        const student = getStudent(activity.studentId);
                        const status = statusStyles[activity.status];

                        const initials = student
                          ? student.name
                              .split(" ")
                              .map((name) => name[0])
                              .slice(0, 2)
                              .join("")
                          : "?";

                        return (
                          <tr
                            key={activity.id}
                            className="transition hover:bg-slate-50"
                          >
                            <td className="px-5 py-4">
                              {student ? (
                                <Link
                                  href={`/school/students/${encodeURIComponent(student.id)}`}
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
                              ) : (
                                <div className="flex items-center gap-3">
                                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                                    {initials}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium text-slate-600">
                                      Student record unavailable
                                    </p>
                                    <p className="text-xs text-slate-400">
                                      ID: {activity.studentId || "Unavailable"}
                                    </p>
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="max-w-[260px] px-5 py-4">
                              <p className="truncate text-sm font-medium text-slate-700">
                                {activity.title}
                              </p>
                              <p className="mt-1 truncate text-xs text-slate-400">
                                {activity.description}
                              </p>
                            </td>

                            <td className="px-5 py-4 text-sm text-slate-600">
                              {activity.date}
                            </td>

                            <td className="px-5 py-4 text-sm font-medium text-slate-600">
                              {activity.hoursWorked}h
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
                              {student ? (
                                <Link
                                  href={`/school/students/${encodeURIComponent(student.id)}`}
                                  className="text-xs font-medium text-[#1729c7] hover:underline"
                                >
                                  View student
                                </Link>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  Unavailable
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                    {activitiesError && !isLoading && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-sm text-red-600"
                        >
                          Activity submissions are unavailable. Please try
                          again.
                        </td>
                      </tr>
                    )}

                    {isLoading && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-5 py-10 text-center text-sm text-slate-500"
                        >
                          Loading activity submissions...
                        </td>
                      </tr>
                    )}

                    {!isLoading &&
                      !activitiesError &&
                      filteredActivities.length === 0 && (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-5 py-10 text-center text-sm text-slate-500"
                          >
                            No activities found. Try changing your search or
                            status filter.
                          </td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>

              <div className="divide-y divide-slate-100 md:hidden">
                {!isLoading &&
                  !activitiesError &&
                  filteredActivities.map((activity) => {
                    const student = getStudent(activity.studentId);
                    const status = statusStyles[activity.status];

                    const initials = student
                      ? student.name
                          .split(" ")
                          .map((name) => name[0])
                          .slice(0, 2)
                          .join("")
                      : "?";

                    return (
                      <article key={activity.id} className="p-4">
                        <div className="flex items-start justify-between gap-3">
                          {student ? (
                            <Link
                              href={`/school/students/${encodeURIComponent(student.id)}`}
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
                          ) : (
                            <div className="flex min-w-0 items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-500">
                                ?
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-slate-600">
                                  Student record unavailable
                                </p>
                                <p className="mt-0.5 truncate text-xs text-slate-400">
                                  ID: {activity.studentId || "Unavailable"}
                                </p>
                              </div>
                            </div>
                          )}

                          <span
                            className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-medium ${status.className}`}
                          >
                            {status.label}
                          </span>
                        </div>

                        <div className="mt-4">
                          <p className="text-sm font-semibold text-[#10195c]">
                            {activity.title}
                          </p>
                          <p className="mt-1 text-xs leading-5 text-slate-500">
                            {activity.description}
                          </p>
                        </div>

                        <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
                          <div>
                            <p className="text-[11px] text-slate-400">Date</p>
                            <p className="mt-1 text-xs font-medium text-slate-600">
                              {activity.date}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] text-slate-400">Hours</p>
                            <p className="mt-1 text-xs font-medium text-slate-600">
                              {activity.hoursWorked} hours
                            </p>
                          </div>
                        </div>

                        {activity.skillsAcquired.length > 0 && (
                          <div className="mt-4">
                            <p className="text-[11px] text-slate-400">
                              Skills acquired
                            </p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              {activity.skillsAcquired.map((skill) => (
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

                        {student && (
                          <Link
                            href={`/school/students/${encodeURIComponent(student.id)}`}
                            className="mt-4 inline-flex text-xs font-semibold text-[#1729c7] hover:underline"
                          >
                            View student →
                          </Link>
                        )}
                      </article>
                    );
                  })}

                {activitiesError && !isLoading && (
                  <p className="px-4 py-10 text-center text-sm text-red-600">
                    Activity submissions are unavailable. Please try again.
                  </p>
                )}

                {isLoading && (
                  <p className="px-4 py-10 text-center text-sm text-slate-500">
                    Loading activity submissions...
                  </p>
                )}

                {!isLoading &&
                  !activitiesError &&
                  filteredActivities.length === 0 && (
                    <p className="px-4 py-10 text-center text-sm text-slate-500">
                      No activities found. Try changing your search or status
                      filter.
                    </p>
                  )}
              </div>

              <div className="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <p className="text-xs text-slate-500">
                  Showing{" "}
                  <span className="font-medium text-slate-700">
                    {isLoading || activitiesError
                      ? "—"
                      : filteredActivities.length}
                  </span>{" "}
                  of {isLoading || activitiesError ? "—" : totalActivities}{" "}
                  activity logs
                </p>

                <p className="text-xs text-slate-400">
                  {isLoading || studentsError
                    ? "Student engagement counts unavailable"
                    : `${activeStudents.length} active · ${atRiskStudents.length} at risk · ${inactiveStudents.length} inactive`}
                </p>
              </div>
            </div>
          </section>

          {!isLoading &&
            !studentsError &&
            studentsNeedingAttention.length > 0 && (
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

                  <div className="min-w-0 flex-1">
                    <h2 className="text-sm font-semibold text-[#10195c]">
                      Students needing attention
                    </h2>

                    <p className="mt-1 text-xs leading-5 text-slate-600">
                      These students have an at-risk or inactive engagement
                      status from the backend. Check their individual
                      completion records before deciding whether follow-up is
                      required.
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {studentsNeedingAttention.map((student) => {
                        const isAtRisk =
                          student.engagementStatus === "AT_RISK";

                        return (
                          <Link
                            key={student.id}
                            href={`/school/students/${encodeURIComponent(student.id)}`}
                            className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-[#1729c7] transition hover:bg-[#f3f4ff]"
                          >
                            {student.name}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] ${
                                isAtRisk
                                  ? "bg-amber-100 text-amber-800"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {isAtRisk ? "At risk" : "Inactive"}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </section>
            )}

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
                  follow-up. Review pending submissions and engagement
                  statuses as part of routine SIWES monitoring. Official
                  completion hours are tracked separately through student
                  completion records.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
