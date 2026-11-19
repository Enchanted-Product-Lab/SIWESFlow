
import apiClient from "./apiClient";
import axios from "axios";
import {
  Student,
  ActivityLog,
  ActivityStatus,
  EngagementStatus,
} from "../types";

type BackendRecord = Record<string, unknown>;

export type VerificationEntityType =
  | "STUDENT"
  | "SUPERVISOR"
  | "SCHOOL"
  | "COMPANY";

export type VerificationStatus =
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "REJECTED";

export interface VerificationDocument {
  id: string;
  documentType: string;
  filename: string;
  verificationStatus: string;
}

export interface VerificationRecord {
  id: string;
  entityType: VerificationEntityType | string;
  entityId: string;
  status: VerificationStatus | string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedById?: string;
  notes?: string;
}

export interface SchoolDashboardMetrics {
  asOf: string;
  totalStudents: number;
  placedStudents: number;
  unplacedStudents: number;
  completedStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  inactiveStudents: number;
  placementCoverage: number;
}

export interface VerificationDetail extends VerificationRecord {
  documents: VerificationDocument[];
}

export interface VerificationQuery {
  entityType?: VerificationEntityType;
  status?: VerificationStatus;
  page?: number;
  pageSize?: number;
}

export interface PaginatedVerificationResult {
  data: VerificationRecord[];
  page: number;
  pageSize: number;
  total: number;
}

/** Additional fields returned by GET /students/:id. */
export interface SchoolStudent extends Student {
  email?: string;
  phoneNumber?: string;
  faculty?: string;
  programme?: string;
  academicSession?: string;
  siwesSession?: string;
  schoolName?: string;
  placementTitle?: string;
  placementDepartment?: string;
  placementLocation?: string;
  placementWorkMode?: string;
  placementApprovalStatus?: string;
  placementStartDate?: string;
  placementEndDate?: string;
  supervisorName?: string;
  supervisorEmail?: string;
  supervisorPhone?: string;
  supervisorPosition?: string;
  supervisorDepartment?: string;
  passportPhotoUrl?: string;
}

/** Authoritative completion information from the backend. */
export interface StudentCompletion {
  requirements: {
    totalHours: number;
    minHours: number;
    weeksLogged: number;
    minWeeks: number;
    met: boolean;
  };
}

export interface VerificationDetail extends VerificationRecord {
  documents: VerificationDocument[];
}

function isRecord(value: unknown): value is BackendRecord {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
  );
}

function getRecord(value: unknown): BackendRecord {
  return isRecord(value) ? value : {};
}

function getString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function getNestedRecord(
  record: BackendRecord,
  key: string,
): BackendRecord {
  return getRecord(record[key]);
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string => typeof item === "string",
      )
    : [];
}

/** Handles both direct arrays and paginated { data: [] } responses. */
function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

/** Unwraps common API response shapes without discarding the record. */
function unwrapRecord(data: unknown): BackendRecord {
  let result = getRecord(data);

  if (isRecord(result.data)) {
    result = result.data;
  }

  return result;
}

function getEngagementStatus(
  value: unknown,
): EngagementStatus | undefined {
  const status = getString(value).toUpperCase();

  if (
    status === "ACTIVE" ||
    status === "AT_RISK" ||
    status === "INACTIVE"
  ) {
    return status;
  }

  return undefined;
}

function formatLevel(value: unknown): string {
  const level = getString(value);

  if (!level) return "N/A";

  if (
    level.toLowerCase().includes("level") ||
    /^l\d+/i.test(level)
  ) {
    return level;
  }

  return `${level} Level`;
}

export function mapBackendStudentToStudent(
  input: unknown,
): SchoolStudent {
  const s = getRecord(input);

  const school = getNestedRecord(s, "school");
  const placement = getNestedRecord(s, "placement");
  const company = getNestedRecord(placement, "company");
  const supervisor = getNestedRecord(s, "supervisor");

  const firstName = getString(s.firstName);
  const middleName = getString(s.middleName);
  const lastName = getString(s.lastName);
  const studentCode = getString(s.studentCode);

  const fullName =
    [firstName, middleName, lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    getString(s.name) ||
    studentCode ||
    "Student";

  return {
    id: getString(s.id) || studentCode,
    name: fullName,

    matricNumber:
      getString(s.matriculationNumber) ||
      getString(s.matricNumber) ||
      studentCode ||
      "N/A",

    university:
      getString(school.name) ||
      getString(s.university) ||
      "N/A",

    schoolName:
      getString(school.name) || undefined,

    department: getString(s.department, "N/A"),
    level: formatLevel(s.level),

    placementCompany:
      getString(company.name) ||
      getString(s.placementCompany),

    engagementStatus: getEngagementStatus(
      s.engagementStatus,
    ),

    placementStatus:
      getString(s.placementStatus).toUpperCase() ||
      undefined,

    verificationStatus:
      getString(s.verificationStatus).toUpperCase() ||
      undefined,

    avatarUrl:
      getString(s.avatarUrl) ||
      getString(s.passportPhotoUrl) ||
      undefined,

    email: getString(s.email) || undefined,
    phoneNumber: getString(s.phoneNumber) || undefined,

    faculty: getString(s.faculty) || undefined,
    programme: getString(s.programme) || undefined,

    academicSession:
      getString(s.academicSession) || undefined,

    siwesSession:
      getString(s.siwesSession) || undefined,

    placementTitle:
      getString(placement.title) || undefined,

    placementDepartment:
      getString(placement.department) || undefined,

    placementLocation:
      getString(placement.location) || undefined,

    placementWorkMode:
      getString(placement.workMode) || undefined,

    placementApprovalStatus:
      getString(placement.approvalStatus).toUpperCase() ||
      undefined,

    placementStartDate:
      getString(placement.startDate) || undefined,

    placementEndDate:
      getString(placement.endDate) || undefined,

    supervisorName:
      getString(supervisor.fullName) || undefined,

    supervisorEmail:
      getString(supervisor.email) || undefined,

    supervisorPhone:
      getString(supervisor.phone) || undefined,

    supervisorPosition:
      getString(supervisor.position) || undefined,

    supervisorDepartment:
      getString(supervisor.department) || undefined,

    passportPhotoUrl:
      getString(s.passportPhotoUrl) || undefined,
  };
}

/**
 * Fetch aggregated school dashboard metrics.
 */
export async function fetchSchoolDashboardMetrics(): Promise<SchoolDashboardMetrics> {
  const response = await apiClient.get<SchoolDashboardMetrics>(
    "/schools/me/dashboard-metrics",
  );

  return response.data;
}

export function mapBackendActivityToActivityLog(
  input: unknown,
): ActivityLog {
  const a = getRecord(input);
  const student = getNestedRecord(a, "student");
  const review = getNestedRecord(a, "review");

  const rawStatus = getString(a.status, "pending").toLowerCase();

  let status: ActivityStatus = "pending";

  if (rawStatus === "approved") status = "approved";
  else if (rawStatus === "rejected") status = "rejected";
  else if (
    rawStatus === "revision_requested" ||
    rawStatus === "needs_revision"
  ) {
    status = "revision_requested";
  }

  const rawDate = a.date;
  let date = "";

  if (typeof rawDate === "string") {
    date = rawDate.split("T")[0];
  } else if (
    rawDate instanceof Date ||
    typeof rawDate === "number"
  ) {
    const parsedDate = new Date(rawDate);

    if (!Number.isNaN(parsedDate.getTime())) {
      date = parsedDate.toISOString().split("T")[0];
    }
  }

  const evidence = getString(a.evidence);
  const skillsUsed = getStringArray(a.skillsUsed);
  const evidenceUrls = getStringArray(a.evidenceUrls);

  return {
    id: getString(a.id),
    studentId:
      getString(a.studentId) ||
      getString(student.id),
    date,
    title: getString(a.title, "Activity Entry"),
    description: getString(a.description),
    hoursWorked: Number(a.hoursWorked) || 0,
    skillsAcquired:
      skillsUsed.length > 0
        ? skillsUsed
        : getStringArray(a.skillsAcquired),
    evidenceUrls:
      evidenceUrls.length > 0
        ? evidenceUrls
        : evidence
          ? [evidence]
          : [],
    status,
    supervisorFeedback:
      getString(review.comment) ||
      getString(a.supervisorFeedback) ||
      getString(a.comment) ||
      undefined,
  };
}

export function mapBackendVerificationToRecord(
  input: unknown,
): VerificationRecord {
  const verification = getRecord(input);

  return {
    id: getString(verification.id),
    entityType: getString(verification.entityType),
    entityId: getString(verification.entityId),
    status: getString(verification.status),
    submittedAt:
      getString(verification.submittedAt) || undefined,
    reviewedAt:
      getString(verification.reviewedAt) || undefined,
    reviewedById:
      getString(verification.reviewedById) || undefined,
    notes: getString(verification.notes) || undefined,
  };
}

function mapBackendVerificationDocument(
  input: unknown,
): VerificationDocument {
  const document = getRecord(input);

  return {
    id: getString(document.id),
    documentType: getString(
      document.documentType,
      "Document",
    ),
    filename: getString(
      document.filename,
      "Unnamed document",
    ),
    verificationStatus: getString(
      document.verificationStatus,
      "UNKNOWN",
    ),
  };
}

export function mapBackendVerificationDetail(
  input: unknown,
): VerificationDetail {
  const verification = unwrapRecord(input);

  return {
    ...mapBackendVerificationToRecord(verification),
    documents: Array.isArray(verification.documents)
      ? verification.documents.map(
          mapBackendVerificationDocument,
        )
      : [],
  };
}

export function getSchoolApiErrorMessage(
  error: unknown,
): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) {
      return "Your session is missing or has expired. Please log in with a school coordinator account.";
    }

    if (status === 403) {
      return "You do not have permission to access this school data.";
    }

    if (status === 404) {
      return "The requested API endpoint could not be found. Please confirm the endpoint with the backend team.";
    }

    if (status && status >= 500) {
      return "The server encountered an error. Please try again later.";
    }

    if (!error.response) {
      return "Unable to connect to the server. Check your internet connection and try again.";
    }
  }

  return "Something went wrong while loading school data. Please try again.";
}

export async function fetchStudentsWithFallback(): Promise<Student[]> {
  const res = await apiClient.get("/students");

  return extractArray(res.data).map(
    mapBackendStudentToStudent,
  );
}

export async function fetchStudentById(
  id: string,
): Promise<SchoolStudent> {
  const res = await apiClient.get(
    `/students/${encodeURIComponent(id)}`,
  );

  const student = unwrapRecord(res.data);

  if (!student.id && !student.studentCode) {
    throw new Error(`Student ${id} was not found.`);
  }

  return mapBackendStudentToStudent(student);
}

/**
 * Fetch the authoritative SIWES completion requirements
 * for a student. Do not infer completion from placementStatus.
 */
export async function fetchStudentCompletion(
  studentId: string,
): Promise<StudentCompletion> {
  const res = await apiClient.get(
    `/completions/students/${encodeURIComponent(studentId)}`,
  );

  const response = unwrapRecord(res.data);
  const requirements = getNestedRecord(
    response,
    "requirements",
  );

  return {
    requirements: {
      totalHours: Number(requirements.totalHours) || 0,
      minHours: Number(requirements.minHours) || 480,
      weeksLogged: Number(requirements.weeksLogged) || 0,
      minWeeks: Number(requirements.minWeeks) || 12,
      met: requirements.met === true,
    },
  };
}

export async function fetchActivitiesWithFallback(): Promise<ActivityLog[]> {
  const res = await apiClient.get("/activities");

  return extractArray(res.data).map(
    mapBackendActivityToActivityLog,
  );
}

export async function fetchStudentActivities(
  studentId: string,
): Promise<ActivityLog[]> {
  const res = await apiClient.get("/activities", {
    params: { studentId },
  });

  return extractArray(res.data).map(
    mapBackendActivityToActivityLog,
  );
}

export async function fetchPlacementsWithFallback(): Promise<unknown[]> {
  const res = await apiClient.get("/placements");

  return extractArray(res.data);
}

/**
 * Fetch verification records with pagination metadata.
 */
export async function fetchPaginatedVerifications(
  query: VerificationQuery = {},
): Promise<PaginatedVerificationResult> {
  const res = await apiClient.get("/verifications/queue", {
    params: query,
  });

  const response = getRecord(res.data);
  const records = extractArray(res.data);

  return {
    data: records.map(mapBackendVerificationToRecord),
    page:
      typeof response.page === "number"
        ? response.page
        : 1,
    pageSize:
      typeof response.pageSize === "number"
        ? response.pageSize
        : 20,
    total:
      typeof response.total === "number"
        ? response.total
        : records.length,
  };
}

/**
 * Backward-compatible verification fetcher.
 */
export async function fetchVerifications(
  query: VerificationQuery = {},
): Promise<VerificationRecord[]> {
  const result = await fetchPaginatedVerifications(query);

  return result.data;
}

/**
 * Fetch the full details and associated documents
 * for one verification.
 */
export async function fetchVerificationById(
  id: string,
): Promise<VerificationDetail> {
  const res = await apiClient.get(
    `/verifications/${encodeURIComponent(id)}`,
  );

  return mapBackendVerificationDetail(res.data);
}

/**
 * Fetch the student verification queue.
 */
export async function fetchStudentVerificationQueue(): Promise<
  VerificationRecord[]
> {
  return fetchVerifications({
    entityType: "STUDENT",
  });
}

/**
 * Fetch verified student verification records.
 */
export async function fetchVerifiedStudentVerifications(): Promise<
  VerificationRecord[]
> {
  return fetchVerifications({
    entityType: "STUDENT",
    status: "VERIFIED",
  });
}
