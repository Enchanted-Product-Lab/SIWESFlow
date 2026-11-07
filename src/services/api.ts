// src/services/api.ts

export type LogStatus = 'PENDING' | 'SUBMITTED' | 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';

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

// Paginated response list schema (No {success} wrapper per Ajibola's backend spec)
export interface PaginatedList<T> {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
}

export interface ReviewSubmissionPayload {
  activityId: string;
  action: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  feedback: string;
  rating?: number;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

// ---------------------------------------------------------
// API ENDPOINTS
// ---------------------------------------------------------

/**
 * Fetch all pending logs for the supervisor
 * Endpoint: GET /api/activities?status=SUBMITTED
 */
export async function getPendingActivities(supervisorId: string): Promise<PaginatedList<ActivityLogEntry>> {
  const res = await fetch(`${BASE_URL}/activities?status=SUBMITTED`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  });

  if (!res.ok) throw new Error("Failed to fetch pending activities");
  return res.json();
}

/**
 * Submit supervisor assessment
 * Endpoint: POST /api/activities/:id/review
 */
export async function submitActivityReview(payload: ReviewSubmissionPayload): Promise<{ message: string }> {
  const res = await fetch(`${BASE_URL}/activities/${payload.activityId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!res.ok) throw new Error("Failed to submit review");
  return res.json();
}

/**
 * Evidence URL Fetcher
 * Endpoint: GET /documents/:id/url (Hits root domain directly, bypassing the /api prefix)
 * CRITICAL: DO NOT CACHE - URL expires in 300 seconds.
 */
export async function getEvidenceUrl(documentId: string): Promise<{ url: string }> {
  const rootUrl = process.env.NEXT_PUBLIC_ROOT_URL || 'http://localhost:8000';
  const res = await fetch(`${rootUrl}/documents/${documentId}/url`, {
    cache: 'no-store'
  });

  if (!res.ok) throw new Error("Failed to fetch evidence URL");
  return res.json();
}

/**
 * Fetch single logbook entry detail by ID
 * Endpoint: GET /api/activities/:id
 */
export async function getActivityById(activityId: string): Promise<ActivityLogEntry | null> {
  const res = await fetch(`${BASE_URL}/activities/${activityId}`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  });

  if (!res.ok) throw new Error("Failed to fetch activity entry");
  return res.json();
}

/**
 * Fetch supervisor dashboard metrics
 * Endpoint: GET /api/supervisors/me/metrics
 */
export async function getSupervisorMetrics(): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${BASE_URL}/supervisors/me/metrics`, {
    headers: { 'Content-Type': 'application/json' },
    cache: 'no-store'
  });

  if (!res.ok) throw new Error("Failed to fetch supervisor metrics");
  return res.json();
}