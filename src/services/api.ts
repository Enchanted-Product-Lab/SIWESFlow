// src/services/api.ts
import apiClient from "./apiClient";

export type LogStatus = "PENDING" | "APPROVED" | "NEEDS_REVISION" | "REJECTED";

export interface EvidenceMetadata {
  documentId: string;
  fileName: string;
  fileFormat: string;
  fileSizeBytes: number;
  uploadedAt: string;
}

export interface ActivityLogEntry {
  id: string;
  studentName: string;
  date: string;
  hours: number;
  department: string;
  description: string;
  learned: string;
  status: LogStatus;
  submittedAt: string;
  evidence: EvidenceMetadata[];
}

export interface PaginatedList<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ReviewSubmissionPayload {
  activityId: string;
  status?: "APPROVED" | "NEEDS_REVISION";
  action?: "APPROVED" | "NEEDS_REVISION";
  comment?: string;
  feedback?: string;
  rating?: number;
}

/**
 * Fetch all pending logs for the supervisor.
 * Backend enum requires PENDING. Uses apiClient with automatic Bearer token.
 */
export async function getPendingActivities(
  _supervisorId?: string,
): Promise<PaginatedList<ActivityLogEntry>> {
  const res = await apiClient.get<PaginatedList<ActivityLogEntry>>("/activities?status=PENDING");
  return res.data;
}

/**
 * Submit supervisor assessment.
 * Maps incoming action/feedback to backend { status, comment, rating } contract.
 * Strictly uses APPROVED or NEEDS_REVISION per TRD §5.1.
 * Uses apiClient with automatic Bearer token.
 */
export async function submitActivityReview(
  payload: ReviewSubmissionPayload,
): Promise<{ message: string }> {
  const rawStatus = payload.status || payload.action;
  const status = rawStatus === "APPROVED" ? "APPROVED" : "NEEDS_REVISION";
  const comment = payload.comment ?? payload.feedback;

  const res = await apiClient.patch<{ message: string }>(
    `/activities/${payload.activityId}/review`,
    {
      status,
      ...(comment ? { comment } : {}),
      ...(payload.rating ? { rating: payload.rating } : {}),
    },
  );
  return res.data;
}

/**
 * Evidence URL Fetcher
 * Hits /documents/:id/url to retrieve a signed download URL.
 */
export async function getEvidenceUrl(documentId: string): Promise<{ url: string }> {
  const res = await apiClient.get<{ url: string }>(`/documents/${documentId}/url`);
  return res.data;
}

/**
 * Fetch single logbook entry detail by ID
 */
export async function getActivityById(activityId: string): Promise<ActivityLogEntry | null> {
  const res = await apiClient.get<ActivityLogEntry>(`/activities/${activityId}`);
  return res.data;
}

/**
 * Fetch supervisor dashboard metrics
 */
export async function getSupervisorMetrics(): Promise<Record<string, unknown> | null> {
  const res = await apiClient.get<Record<string, unknown>>("/supervisors/me/metrics");
  return res.data;
}