
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import SchoolNavigation from "@/components/shared/SchoolNavigation";
import SchoolHeader from "@/components/shared/SchoolHeader";
import { Student } from "@/types";
import {
  fetchPaginatedVerifications,
  fetchStudentsWithFallback,
  fetchVerificationById,
  getSchoolApiErrorMessage,
  type VerificationDetail,
  type VerificationRecord,
  type VerificationStatus,
} from "@/services/schoolService";

type VerificationFilter = "ALL" | VerificationStatus;

type VerificationCounts = {
  SUBMITTED: number | null;
  UNDER_REVIEW: number | null;
  VERIFIED: number | null;
  REJECTED: number | null;
};

const PAGE_SIZE = 20;

const EMPTY_COUNTS: VerificationCounts = {
  SUBMITTED: null,
  UNDER_REVIEW: null,
  VERIFIED: null,
  REJECTED: null,
};

function formatDate(value?: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function statusClasses(status: string) {
  switch (status) {
    case "SUBMITTED":
      return "bg-blue-50 text-blue-700";
    case "UNDER_REVIEW":
      return "bg-amber-50 text-amber-700";
    case "VERIFIED":
      return "bg-emerald-50 text-emerald-700";
    case "REJECTED":
      return "bg-red-50 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
}

export default function SchoolVerificationsPage() {
  const [verifications, setVerifications] = useState<VerificationRecord[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [counts, setCounts] = useState<VerificationCounts>(EMPTY_COUNTS);
  const [failedStatuses, setFailedStatuses] = useState<VerificationStatus[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<VerificationFilter>("ALL");
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [selectedRecord, setSelectedRecord] =
    useState<VerificationRecord | null>(null);
  const [selectedDetail, setSelectedDetail] =
    useState<VerificationDetail | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isDocumentLoading, setIsDocumentLoading] = useState(false);
  const [documentError, setDocumentError] = useState("");

  const loadRequestId = useRef(0);
  const detailRequestId = useRef(0);

  const loadData = useCallback(async () => {
    const requestId = ++loadRequestId.current;

    setIsLoading(true);
    setLoadError("");

    const [
      submittedResult,
      underReviewResult,
      verifiedResult,
      rejectedResult,
      studentsResult,
    ] = await Promise.allSettled([
      fetchPaginatedVerifications({
        entityType: "STUDENT",
        status: "SUBMITTED",
        page,
        pageSize: PAGE_SIZE,
      }),
      fetchPaginatedVerifications({
        entityType: "STUDENT",
        status: "UNDER_REVIEW",
        page,
        pageSize: PAGE_SIZE,
      }),
      fetchPaginatedVerifications({
        entityType: "STUDENT",
        status: "VERIFIED",
        page,
        pageSize: PAGE_SIZE,
      }),
      fetchPaginatedVerifications({
        entityType: "STUDENT",
        status: "REJECTED",
        page,
        pageSize: PAGE_SIZE,
      }),
      fetchStudentsWithFallback(),
    ]);

    // Ignore an older request if a newer refresh or page request has started.
    if (requestId !== loadRequestId.current) return;

    const statusResults = [
      { status: "SUBMITTED" as const, result: submittedResult },
      { status: "UNDER_REVIEW" as const, result: underReviewResult },
      { status: "VERIFIED" as const, result: verifiedResult },
      { status: "REJECTED" as const, result: rejectedResult },
    ];

    const records = statusResults.flatMap(({ result }) =>
      result.status === "fulfilled" ? result.value.data : [],
    );

    setVerifications(records);

    setCounts({
      SUBMITTED:
        submittedResult.status === "fulfilled"
          ? submittedResult.value.total
          : null,
      UNDER_REVIEW:
        underReviewResult.status === "fulfilled"
          ? underReviewResult.value.total
          : null,
      VERIFIED:
        verifiedResult.status === "fulfilled"
          ? verifiedResult.value.total
          : null,
      REJECTED:
        rejectedResult.status === "fulfilled"
          ? rejectedResult.value.total
          : null,
    });

    const failed = statusResults
      .filter(({ result }) => result.status === "rejected")
      .map(({ status }) => status);

    setFailedStatuses(failed);

    if (studentsResult.status === "fulfilled") {
      setStudents(studentsResult.value);
    } else {
      setStudents([]);
    }

    const errors: string[] = [];

    if (failed.length > 0) {
      errors.push(
        "Some verification categories could not be loaded. Their totals are unavailable, and the displayed records may be incomplete.",
      );
    }

    if (studentsResult.status === "rejected") {
      errors.push(
        "Student details could not be loaded. Student names and matriculation numbers may be unavailable.",
      );
    }

    setLoadError(errors.join(" "));

    setIsLoading(false);
  }, [page]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void loadData();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [loadData]);

  const studentById = useMemo(() => {
    return new Map(students.map((student) => [student.id, student]));
  }, [students]);

  const hasStatusErrors = failedStatuses.length > 0;

  const totalRecords = hasStatusErrors
    ? null
    : counts.SUBMITTED! +
      counts.UNDER_REVIEW! +
      counts.VERIFIED! +
      counts.REJECTED!;

  // Each status has its own backend pagination.
  // The All statuses view combines the current page from each category.
  const totalPages = Math.max(
    1,
    ...Object.values(counts)
      .filter((count): count is number => count !== null)
      .map((count) => Math.ceil(count / PAGE_SIZE)),
  );

  const filteredVerifications = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return verifications
      .filter((record) => {
        if (
          statusFilter !== "ALL" &&
          record.status !== statusFilter
        ) {
          return false;
        }

        if (!normalizedSearch) return true;

        const student = studentById.get(record.entityId);

        const searchableValues = [
          record.id,
          record.entityId,
          record.status,
          record.notes,
          student?.name,
          student?.matricNumber,
          student?.department,
        ];

        return searchableValues.some((value) =>
          String(value ?? "")
            .toLowerCase()
            .includes(normalizedSearch),
        );
      })
      .sort((a, b) => {
        const dateA = a.submittedAt
          ? new Date(a.submittedAt).getTime()
          : 0;
        const dateB = b.submittedAt
          ? new Date(b.submittedAt).getTime()
          : 0;

        return dateB - dateA;
      });
  }, [verifications, search, statusFilter, studentById]);

  const handleViewDocuments = async (record: VerificationRecord) => {
    const requestId = ++detailRequestId.current;

    setSelectedRecord(record);
    setSelectedDetail(null);
    setDocumentError("");
    setIsDetailsOpen(true);
    setIsDocumentLoading(true);

    try {
      const detail = await fetchVerificationById(record.id);

      if (requestId !== detailRequestId.current) return;

      setSelectedDetail(detail);
    } catch (error) {
      if (requestId !== detailRequestId.current) return;

      setDocumentError(getSchoolApiErrorMessage(error));
    } finally {
      if (requestId === detailRequestId.current) {
        setIsDocumentLoading(false);
      }
    }
  };

  const closeDetails = () => {
    // Prevent an outstanding document request from updating a closed modal.
    detailRequestId.current += 1;

    setIsDetailsOpen(false);
    setSelectedRecord(null);
    setSelectedDetail(null);
    setDocumentError("");
    setIsDocumentLoading(false);
  };

  const handlePreviousPage = () => {
    setPage((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    setPage((current) => Math.min(totalPages, current + 1));
  };

  const studentForSelectedRecord = selectedRecord
    ? studentById.get(selectedRecord.entityId)
    : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <SchoolNavigation />

      <div className="md:pl-64">
        <SchoolHeader />

        <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="mb-6">
            <p className="text-sm font-medium text-blue-700">
              School dashboard
            </p>
            <h1 className="mt-1 text-2xl font-bold text-gray-900">
              Student Verifications
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Monitor student verification submissions and review their
              submitted documents.
            </p>
          </div>

          {loadError && (
            <div
              role="alert"
              className="mb-5 flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <p className="text-sm text-amber-800">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadData()}
                disabled={isLoading}
                className="shrink-0 rounded-md border border-amber-300 px-3 py-2 text-sm font-medium text-amber-800 hover:bg-amber-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Retry
              </button>
            </div>
          )}

          <section
            aria-label="Verification summary"
            className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5"
          >
            <SummaryCard
              label="Total records"
              value={totalRecords}
              accent="border-l-gray-500"
              isLoading={isLoading}
            />
            <SummaryCard
              label="Submitted"
              value={counts.SUBMITTED}
              accent="border-l-blue-500"
              isLoading={isLoading}
            />
            <SummaryCard
              label="Under review"
              value={counts.UNDER_REVIEW}
              accent="border-l-amber-500"
              isLoading={isLoading}
            />
            <SummaryCard
              label="Verified"
              value={counts.VERIFIED}
              accent="border-l-emerald-500"
              isLoading={isLoading}
            />
            <SummaryCard
              label="Rejected"
              value={counts.REJECTED}
              accent="border-l-red-500"
              isLoading={isLoading}
            />
          </section>

          <section className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-gray-200 p-4 sm:p-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="font-semibold text-gray-900">
                  Verification records
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  Search and filter records on the current page.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search student or verification ID..."
                  aria-label="Search current page verification records"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:w-72"
                />

                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(
                      event.target.value as VerificationFilter,
                    );
                    setPage(1);
                  }}
                  aria-label="Filter by verification status"
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                >
                  <option value="ALL">All statuses</option>
                  <option value="SUBMITTED">Submitted</option>
                  <option value="UNDER_REVIEW">Under review</option>
                  <option value="VERIFIED">Verified</option>
                  <option value="REJECTED">Rejected</option>
                </select>

                <button
                  type="button"
                  onClick={() => void loadData()}
                  disabled={isLoading}
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isLoading ? "Refreshing..." : "Refresh records"}
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex min-h-64 items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                  <p className="mt-3 text-sm text-gray-500">
                    Loading verification records...
                  </p>
                </div>
              </div>
            ) : filteredVerifications.length === 0 ? (
              <div className="px-5 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.7"
                    className="h-6 w-6"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2Z"
                    />
                  </svg>
                </div>
                <h3 className="mt-4 font-semibold text-gray-900">
                  {hasStatusErrors
                    ? "Verification records could not be fully loaded"
                    : totalRecords === 0
                      ? "No verification records yet"
                      : "No matching records on this page"}
                </h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
                  {hasStatusErrors
                    ? "Some verification categories are unavailable. Please retry to load the records."
                    : totalRecords === 0
                      ? "Student verification submissions will appear here when they are received."
                      : "Try changing your search or status filter, or move to another page."}
                </p>
              </div>
            ) : (
              <>
                <div className="hidden overflow-x-auto md:block">
                  <table className="w-full min-w-[850px] text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                      <tr>
                        <th className="px-5 py-4 font-semibold">Student</th>
                        <th className="px-5 py-4 font-semibold">
                          Verification ID
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Submitted
                        </th>
                        <th className="px-5 py-4 font-semibold">
                          Reviewed
                        </th>
                        <th className="px-5 py-4 font-semibold">Status</th>
                        <th className="px-5 py-4 text-right font-semibold">
                          Documents
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {filteredVerifications.map((record) => {
                        const student = studentById.get(record.entityId);

                        return (
                          <tr key={record.id} className="hover:bg-gray-50">
                            <td className="px-5 py-4">
                              <p className="font-medium text-gray-900">
                                {student?.name || "Student details unavailable"}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {student?.matricNumber || record.entityId}
                              </p>
                            </td>
                            <td className="px-5 py-4 font-mono text-xs text-gray-600">
                              {record.id}
                            </td>
                            <td className="px-5 py-4 text-gray-600">
                              {formatDate(record.submittedAt)}
                            </td>
                            <td className="px-5 py-4 text-gray-600">
                              {formatDate(record.reviewedAt)}
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge status={record.status} />
                            </td>
                            <td className="px-5 py-4 text-right">
                              <button
                                type="button"
                                onClick={() => void handleViewDocuments(record)}
                                disabled={isDocumentLoading}
                                className="rounded-md border border-blue-200 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                View documents
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="divide-y divide-gray-100 md:hidden">
                  {filteredVerifications.map((record) => {
                    const student = studentById.get(record.entityId);

                    return (
                      <article key={record.id} className="space-y-3 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <h3 className="truncate font-semibold text-gray-900">
                              {student?.name || "Student details unavailable"}
                            </h3>
                            <p className="mt-1 break-all text-xs text-gray-500">
                              {student?.matricNumber || record.entityId}
                            </p>
                          </div>
                          <StatusBadge status={record.status} />
                        </div>

                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div>
                            <p className="text-gray-500">Submitted</p>
                            <p className="mt-1 font-medium text-gray-800">
                              {formatDate(record.submittedAt)}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Reviewed</p>
                            <p className="mt-1 font-medium text-gray-800">
                              {formatDate(record.reviewedAt)}
                            </p>
                          </div>
                        </div>

                        <p className="break-all font-mono text-xs text-gray-500">
                          ID: {record.id}
                        </p>

                        <button
                          type="button"
                          onClick={() => void handleViewDocuments(record)}
                          disabled={isDocumentLoading}
                          className="w-full rounded-md border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          View documents
                        </button>
                      </article>
                    );
                  })}
                </div>
              </>
            )}

            <div className="flex flex-col gap-3 border-t border-gray-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
              <p className="text-xs text-gray-500">
                Showing {filteredVerifications.length} of {verifications.length}{" "}
                records on this page ·{" "}
                {totalRecords === null
                  ? "total unavailable"
                  : `${totalRecords.toLocaleString()} total records`}
              </p>

              <div className="flex items-center justify-between gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={handlePreviousPage}
                  disabled={page <= 1 || isLoading}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="whitespace-nowrap text-sm text-gray-600">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={handleNextPage}
                  disabled={
                    page >= totalPages ||
                    isLoading ||
                    hasStatusErrors
                  }
                  title={
                    hasStatusErrors
                      ? "Retry loading all verification categories before continuing"
                      : undefined
                  }
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          </section>
        </main>
      </div>

      {isDetailsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDetails();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="verification-detail-title"
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:rounded-2xl"
          >
            <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4">
              <div>
                <h2
                  id="verification-detail-title"
                  className="font-semibold text-gray-900"
                >
                  Verification documents
                </h2>
                <p className="mt-1 text-xs text-gray-500">
                  {studentForSelectedRecord?.name ||
                    "Student details unavailable"}
                </p>
              </div>
              <button
                type="button"
                onClick={closeDetails}
                aria-label="Close verification details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m6 6 12 12M18 6 6 18"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-5 p-5">
              {selectedRecord && (
                <div className="rounded-lg bg-gray-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-xs font-medium text-gray-500">
                      Verification status
                    </span>
                    <StatusBadge status={selectedRecord.status} />
                  </div>
                  <p className="mt-3 break-all font-mono text-xs text-gray-600">
                    {selectedRecord.id}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-gray-500">Submitted</p>
                      <p className="mt-1 font-medium text-gray-800">
                        {formatDate(selectedRecord.submittedAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reviewed</p>
                      <p className="mt-1 font-medium text-gray-800">
                        {formatDate(selectedRecord.reviewedAt)}
                      </p>
                    </div>
                  </div>
                  {selectedRecord.notes && (
                    <div className="mt-4 border-t border-gray-200 pt-3">
                      <p className="text-xs text-gray-500">Review notes</p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-gray-700">
                        {selectedRecord.notes}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {isDocumentLoading ? (
                <div className="flex min-h-32 items-center justify-center">
                  <div className="text-center">
                    <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                    <p className="mt-3 text-sm text-gray-500">
                      Loading document details...
                    </p>
                  </div>
                </div>
              ) : documentError ? (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-4"
                >
                  <p className="text-sm text-red-700">{documentError}</p>
                  {selectedRecord && (
                    <button
                      type="button"
                      onClick={() => void handleViewDocuments(selectedRecord)}
                      className="mt-3 text-sm font-semibold text-red-700 underline"
                    >
                      Try again
                    </button>
                  )}
                </div>
              ) : selectedDetail ? (
                <div>
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900">
                      Submitted files
                    </h3>
                    <span className="text-xs text-gray-500">
                      {selectedDetail.documents.length}{" "}
                      {selectedDetail.documents.length === 1
                        ? "document"
                        : "documents"}
                    </span>
                  </div>

                  {selectedDetail.documents.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-gray-300 px-4 py-8 text-center">
                      <p className="text-sm text-gray-600">
                        No documents are attached to this verification record.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {selectedDetail.documents.map((document) => (
                        <div
                          key={document.id}
                          className="flex flex-col gap-3 rounded-lg border border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between"
                        >
                          <div className="flex min-w-0 items-start gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                              <svg
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.7"
                                className="h-5 w-5"
                                aria-hidden="true"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M14 2v6h6M8 13h8M8 17h8"
                                />
                              </svg>
                            </div>
                            <div className="min-w-0">
                              <p className="break-words text-sm font-medium text-gray-900">
                                {document.filename}
                              </p>
                              <p className="mt-1 text-xs text-gray-500">
                                {formatStatus(document.documentType)}
                              </p>
                              <p className="mt-1 break-all font-mono text-[11px] text-gray-400">
                                {document.id}
                              </p>
                            </div>
                          </div>
                          <span
                            className={`inline-flex w-fit shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${statusClasses(
                              document.verificationStatus,
                            )}`}
                          >
                            {formatStatus(document.verificationStatus)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <div className="border-t border-gray-200 px-5 py-4 text-right">
              <button
                type="button"
                onClick={closeDetails}
                className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent,
  isLoading,
}: {
  label: string;
  value: number | null;
  accent: string;
  isLoading: boolean;
}) {
  return (
    <div
      className={`rounded-xl border border-gray-200 border-l-4 ${accent} bg-white p-4 shadow-sm`}
    >
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tabular-nums text-gray-900">
        {isLoading || value === null ? "—" : value.toLocaleString()}
      </p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses(
        status,
      )}`}
    >
      {formatStatus(status)}
    </span>
  );
}
