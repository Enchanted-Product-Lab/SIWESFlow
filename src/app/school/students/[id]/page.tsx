
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

import SchoolNavigation from "@/components/shared/SchoolNavigation";
import SchoolHeader from "@/components/shared/SchoolHeader";
import { ActivityLog } from "@/types";
import {
  SchoolStudent,
  StudentCompletion,
  fetchStudentById,
  fetchStudentActivities,
  fetchStudentCompletion,
  verifyStudentCompletion,
  getSchoolApiErrorMessage,
} from "@/services/schoolService";

function formatDate(value?: string): string {
  if (!value) return "Not available";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Not available";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(value?: string): string {
  if (!value) return "Status unavailable";

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function StudentProfilePage() {
  const params = useParams<{ id: string }>();
  const id = params.id;

  const [student, setStudent] = useState<SchoolStudent | null>(null);
  const [studentActivities, setStudentActivities] = useState<ActivityLog[]>([]);
  const [completion, setCompletion] = useState<StudentCompletion | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [studentError, setStudentError] = useState<string | null>(null);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);
  const [verifyBusy, setVerifyBusy] = useState(false);
  const [verifyFeedback, setVerifyFeedback] = useState<string | null>(null);
  const [declineRemarks, setDeclineRemarks] = useState("");

  const loadData = useCallback(async () => {
    setIsLoading(true);

    const [
      studentResult,
      activitiesResult,
      completionResult,
    ] = await Promise.allSettled([
      fetchStudentById(id),
      fetchStudentActivities(id),
      fetchStudentCompletion(id),
    ]);

    if (studentResult.status === "fulfilled") {
      setStudent(studentResult.value);
      setStudentError(null);
    } else {
      setStudentError(
        getSchoolApiErrorMessage(studentResult.reason),
      );
    }

    if (activitiesResult.status === "fulfilled") {
      setStudentActivities(activitiesResult.value);
      setActivitiesError(null);
    } else {
      setActivitiesError(
        getSchoolApiErrorMessage(activitiesResult.reason),
      );
    }

    if (completionResult.status === "fulfilled") {
      setCompletion(completionResult.value);
      setCompletionError(null);
    } else {
      setCompletion(null);
      setCompletionError(
        getSchoolApiErrorMessage(completionResult.reason),
      );
    }

    setIsLoading(false);
  }, [id]);

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

  const hasPlacement = Boolean(
    student?.placementStatus === "PLACED" ||
    student?.placementCompany?.trim(),
  );

  const isCompleted = completion?.requirements.met === true;
  const isVerified = student?.verificationStatus === "VERIFIED";

  const engagementStatus = student?.engagementStatus;

  const engagementLabel =
    engagementStatus === "ACTIVE"
      ? "Active"
      : engagementStatus === "AT_RISK"
        ? "At risk"
        : engagementStatus === "INACTIVE"
          ? "Inactive"
          : "Status unavailable";

  const engagementClasses =
    engagementStatus === "ACTIVE"
      ? "bg-green-50 text-green-700"
      : engagementStatus === "AT_RISK"
        ? "bg-amber-50 text-amber-700"
        : engagementStatus === "INACTIVE"
          ? "bg-slate-100 text-slate-600"
          : "bg-slate-100 text-slate-500";

  const placementLabel = hasPlacement ? "Placed" : "Not placed";

  const totalRecordedHours = studentActivities.reduce(
    (total, activityLog) => total + activityLog.hoursWorked,
    0,
  );

  const approvedActivities = studentActivities.filter(
    (activityLog) => activityLog.status === "approved",
  ).length;

  const completionRequirements = completion?.requirements;
  const approvedHours = completionRequirements?.totalHours ?? 0;
  const minimumHours = completionRequirements?.minHours ?? 480;
  const weeksLogged = completionRequirements?.weeksLogged ?? 0;
  const minimumWeeks = completionRequirements?.minWeeks ?? 12;

  const hoursProgress = Math.min(
    100,
    minimumHours > 0 ? (approvedHours / minimumHours) * 100 : 0,
  );

  const weeksProgress = Math.min(
    100,
    minimumWeeks > 0 ? (weeksLogged / minimumWeeks) * 100 : 0,
  );

  const initials =
    student?.name
      ?.split(" ")
      .map((name) => name[0])
      .slice(0, 2)
      .join("") || "ST";

  const statusClasses: Record<ActivityLog["status"], string> = {
    pending: "bg-amber-50 text-amber-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
    revision_requested: "bg-purple-50 text-purple-700",
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-[#10195c]">
      <SchoolNavigation />

      <div className="lg:pl-56">
        <SchoolHeader>
          <div className="flex min-w-0 items-center gap-2 text-xs font-medium text-slate-500">
            <Link
              href="/school/dashboard"
              className="transition-colors hover:text-blue-700"
            >
              School Dashboard
            </Link>
            <span>/</span>
            <Link
              href="/school/students"
              className="transition-colors hover:text-blue-700"
            >
              Students
            </Link>
            <span>/</span>
            <span className="font-semibold text-slate-800">
              {student?.name ||
                (isLoading ? "Loading student..." : "Student")}
            </span>
          </div>
        </SchoolHeader>

        <main className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
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

          {isLoading && !student && (
            <section className="mt-5 rounded-xl border border-slate-200 bg-white px-5 py-16 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-[#1729c7]" />
              <p className="mt-4 text-sm font-medium text-slate-600">
                Loading student profile...
              </p>
            </section>
          )}

          {!isLoading && studentError && !student && (
            <section
              role="alert"
              className="mt-5 rounded-xl border border-red-200 bg-red-50 p-5 shadow-sm"
            >
              <h1 className="text-base font-semibold text-red-800">
                Unable to load student profile
              </h1>
              <p className="mt-2 text-sm leading-6 text-red-700">
                {studentError}
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleRetry}
                  disabled={isLoading}
                  className="rounded-lg bg-red-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-red-800 disabled:opacity-60"
                >
                  Try again
                </button>

                <Link
                  href="/school/students"
                  className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-medium text-red-700 transition hover:bg-red-100"
                >
                  Back to Students
                </Link>
              </div>
            </section>
          )}

          {student && (
            <>
              {activitiesError && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-amber-800">
                        Activity history could not be loaded.
                      </p>
                      <p className="mt-1 text-xs text-amber-700">
                        {activitiesError}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRetry}
                      disabled={isLoading}
                      className="shrink-0 rounded-lg bg-amber-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-800 disabled:opacity-60"
                    >
                      {isLoading ? "Retrying..." : "Try again"}
                    </button>
                  </div>
                </div>
              )}

              {completionError && (
                <div
                  role="alert"
                  className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4"
                >
                  <p className="text-sm font-semibold text-amber-800">
                    Official SIWES completion data is unavailable.
                  </p>
                  <p className="mt-1 text-xs text-amber-700">
                    {completionError} Completion status and approved
                    progress cannot be confirmed until this data loads.
                  </p>
                  <button
                    type="button"
                    onClick={handleRetry}
                    disabled={isLoading}
                    className="mt-3 rounded-lg bg-amber-700 px-4 py-2 text-xs font-medium text-white transition hover:bg-amber-800 disabled:opacity-60"
                  >
                    {isLoading ? "Retrying..." : "Retry"}
                  </button>
                </div>
              )}

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
                            className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${engagementClasses}`}
                            title="Engagement status supplied by the backend"
                          >
                            {engagementLabel}
                          </span>
                        </div>

                        <p className="mt-1 text-sm text-slate-500">
                          {student.matricNumber}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {student.department}
                          {" | "}
                          {student.level}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ${
                          hasPlacement
                            ? "bg-green-50 text-green-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            hasPlacement
                              ? "bg-green-500"
                              : "bg-amber-500"
                          }`}
                        />
                        {placementLabel}
                      </span>

                      {completion && (
                        <span
                          className={`rounded-full px-3 py-1.5 text-xs font-medium ${
                            isCompleted
                              ? "bg-blue-50 text-blue-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isCompleted
                            ? "SIWES completed"
                            : "SIWES in progress"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* Overview cards */}
              <section className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Activities
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                    {activitiesError ? "N/A" : studentActivities.length}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Activity logs submitted
                  </p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Recorded hours
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                    {activitiesError ? "N/A" : totalRecordedHours}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    All submitted activity logs
                  </p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Approved activities
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-[#10195c]">
                    {activitiesError ? "N/A" : approvedActivities}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Approved activity logs
                  </p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Placement
                  </p>
                  <p className="mt-3 text-sm font-semibold text-[#10195c]">
                    {placementLabel}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {student.placementCompany || "No company assigned"}
                  </p>
                </article>
              </section>

              {/* Official completion progress */}
              <section
                className="mt-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                aria-labelledby="completion-heading"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2
                      id="completion-heading"
                      className="text-base font-semibold text-[#10195c]"
                    >
                      SIWES Completion Progress
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Official progress based on backend completion requirements
                      and approved activity records.
                    </p>
                  </div>

                  {completion && (
                    <span
                      className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${
                        isCompleted
                          ? "bg-green-50 text-green-700"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      {isCompleted ? "Requirements met" : "Requirements not yet met"}
                    </span>
                  )}
                </div>

                {completionError ? (
                  <p className="mt-5 rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
                    Completion progress is unavailable. The page will not
                    estimate official completion from submitted activity logs.
                  </p>
                ) : completion ? (
                  <div className="mt-6 grid gap-6 md:grid-cols-2">
                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-slate-500">
                            Approved training hours
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-[#10195c]">
                            {approvedHours.toLocaleString()}{" "}
                            <span className="text-sm font-normal text-slate-400">
                              / {minimumHours.toLocaleString()} hours
                            </span>
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[#1729c7]">
                          {Math.round(hoursProgress)}%
                        </span>
                      </div>

                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#1729c7] transition-all"
                          style={{ width: `${hoursProgress}%` }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-end justify-between gap-3">
                        <div>
                          <p className="text-xs font-medium text-slate-500">
                            Training weeks logged
                          </p>
                          <p className="mt-2 text-2xl font-semibold text-[#10195c]">
                            {weeksLogged}{" "}
                            <span className="text-sm font-normal text-slate-400">
                              / {minimumWeeks} weeks
                            </span>
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-[#1729c7]">
                          {Math.round(weeksProgress)}%
                        </span>
                      </div>

                      <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-[#1729c7] transition-all"
                          style={{ width: `${weeksProgress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="mt-5 text-sm text-slate-500">
                    Completion requirements have not loaded.
                  </p>
                )}

                <p className="mt-4 text-xs leading-5 text-slate-400">
                  Only approved activity entries count towards official
                  completion hours and weeks. Pending and revision-requested
                  entries are excluded by the backend.
                </p>

                {completion?.completion?.status === "PENDING_SCHOOL" && (
                  <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50/60 p-4 space-y-3">
                    <p className="text-sm font-semibold text-[#10195c]">
                      Supervisor signed off. Ready for school verification.
                    </p>
                    {verifyFeedback && (
                      <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                        {verifyFeedback}
                      </p>
                    )}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        type="button"
                        disabled={verifyBusy}
                        onClick={async () => {
                          if (!completion.completion?.id) return;
                          setVerifyBusy(true);
                          setVerifyFeedback(null);
                          try {
                            await verifyStudentCompletion(completion.completion.id, "APPROVE");
                            await loadData();
                          } catch (err) {
                            setVerifyFeedback(getSchoolApiErrorMessage(err));
                          } finally {
                            setVerifyBusy(false);
                          }
                        }}
                        className="rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                      >
                        {verifyBusy ? "Processing..." : "Verify SIWES Completion"}
                      </button>
                      <div className="flex flex-1 gap-2">
                        <input
                          type="text"
                          value={declineRemarks}
                          onChange={(e) => setDeclineRemarks(e.target.value)}
                          placeholder="Remarks if declining..."
                          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800"
                        />
                        <button
                          type="button"
                          disabled={verifyBusy || !declineRemarks.trim()}
                          onClick={async () => {
                            if (!completion.completion?.id || !declineRemarks.trim()) return;
                            setVerifyBusy(true);
                            setVerifyFeedback(null);
                            try {
                              await verifyStudentCompletion(completion.completion.id, "DECLINE", declineRemarks.trim());
                              setDeclineRemarks("");
                              await loadData();
                            } catch (err) {
                              setVerifyFeedback(getSchoolApiErrorMessage(err));
                            } finally {
                              setVerifyBusy(false);
                            }
                          }}
                          className="rounded-lg border border-red-300 bg-white px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {completion?.completion?.certificateReference && (
                  <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
                    Verified SIWES Experience Certificate Reference:{" "}
                    <span className="font-mono font-semibold">
                      {completion.completion.certificateReference}
                    </span>
                  </div>
                )}
              </section>

              {/* Monitoring and verification */}
              <section
                className="mt-5 grid gap-3 sm:grid-cols-3"
                aria-label="Student monitoring and verification status"
              >
                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Engagement status
                  </p>
                  <p className="mt-2 text-base font-semibold text-[#10195c]">
                    {engagementLabel}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Engagement status supplied by the backend.
                  </p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    SIWES completion
                  </p>
                  <p
                    className={`mt-2 text-base font-semibold ${
                      isCompleted ? "text-green-700" : "text-[#10195c]"
                    }`}
                  >
                    {completionError
                      ? "Status unavailable"
                      : completion
                        ? isCompleted
                          ? "Completed"
                          : "In progress"
                        : "Status unavailable"}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Confirmed using the backend completion requirements,
                    not placement status.
                  </p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-medium text-slate-500">
                    Profile verification
                  </p>
                  <p
                    className={`mt-2 text-base font-semibold ${
                      isVerified ? "text-green-700" : "text-[#10195c]"
                    }`}
                  >
                    {formatStatus(student.verificationStatus)}
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    {isVerified
                      ? "Student profile and clearance documents are approved."
                      : "Shows the backend verification status for this student."}
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
                      SIWES activity submitted by this student.
                    </p>
                  </div>

                  {activitiesError ? (
                    <div className="px-5 py-10 text-center sm:px-6">
                      <p className="text-sm font-medium text-amber-700">
                        Activity history is currently unavailable.
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Please try again when the activity service is available.
                      </p>
                    </div>
                  ) : studentActivities.length === 0 ? (
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
                        const statusLabel = formatStatus(
                          activityLog.status,
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
                                    className={`rounded-full px-2 py-1 text-[10px] font-medium ${statusClasses[activityLog.status]}`}
                                  >
                                    {statusLabel}
                                  </span>
                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                  {formatDate(activityLog.date)}
                                  {" | "}
                                  {activityLog.hoursWorked} hours
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
                                  {activityLog.skillsAcquired.map(
                                    (skill, index) => (
                                      <span
                                        key={`${skill}-${index}`}
                                        className="rounded-full bg-[#f3f4ff] px-2.5 py-1 text-[10px] font-medium text-[#4b55b5]"
                                      >
                                        {skill}
                                      </span>
                                    ),
                                  )}
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
                          School
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.schoolName || student.university || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Faculty
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.faculty || "N/A"}
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
                          Programme
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.programme || "N/A"}
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

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Email
                        </dt>
                        <dd className="mt-1 break-all text-sm font-medium text-slate-700">
                          {student.email || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Phone
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.phoneNumber || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Academic Session
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.academicSession || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          SIWES Session
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.siwesSession || "N/A"}
                        </dd>
                      </div>
                    </dl>
                  </section>

                  {/* Placement details */}
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
                        {placementLabel}
                      </span>
                    </div>

                    <dl className="mt-4 space-y-4">
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Company
                        </dt>
                        <dd className="mt-1 text-sm font-semibold text-[#10195c]">
                          {student.placementCompany || "No placement assigned"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Role / Position
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.placementTitle || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Placement Department
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.placementDepartment || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Location
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.placementLocation || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Work Mode
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {formatStatus(student.placementWorkMode)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Approval Status
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {formatStatus(student.placementApprovalStatus)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Start Date
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {formatDate(student.placementStartDate)}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          End Date
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {formatDate(student.placementEndDate)}
                        </dd>
                      </div>
                    </dl>

                    <Link
                      href="/school/placements"
                      className="mt-4 inline-flex text-xs font-medium text-[#1729c7] hover:underline"
                    >
                      View placements
                    </Link>
                  </section>

                  {/* Supervisor details */}
                  <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                    <h2 className="text-sm font-semibold text-[#10195c]">
                      Industry Supervisor
                    </h2>

                    <dl className="mt-4 space-y-4">
                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Full Name
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.supervisorName || "Not assigned"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Position
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.supervisorPosition || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Department
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.supervisorDepartment || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Email
                        </dt>
                        <dd className="mt-1 break-all text-sm font-medium text-slate-700">
                          {student.supervisorEmail || "N/A"}
                        </dd>
                      </div>

                      <div>
                        <dt className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Phone
                        </dt>
                        <dd className="mt-1 text-sm font-medium text-slate-700">
                          {student.supervisorPhone || "N/A"}
                        </dd>
                      </div>
                    </dl>
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
                      Review this student&apos;s activity submissions regularly
                      to keep track of SIWES participation and progress.
                    </p>
                    <Link
                      href="/school/activity-monitoring"
                      className="mt-4 inline-flex text-xs font-semibold text-[#1729c7] hover:underline"
                    >
                      Check activity
                    </Link>
                  </section>
                </aside>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
