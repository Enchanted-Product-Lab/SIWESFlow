
import apiClient from './apiClient';
import axios from 'axios';
import { Student, ActivityLog, ActivityStatus } from '../types';

type BackendRecord = Record<string, unknown>;

function isRecord(value: unknown): value is BackendRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getRecord(value: unknown): BackendRecord {
  return isRecord(value) ? value : {};
}

function getString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function getNestedRecord(
  record: BackendRecord,
  key: string,
): BackendRecord {
  return getRecord(record[key]);
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function extractArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;

  if (isRecord(data) && Array.isArray(data.data)) {
    return data.data;
  }

  return [];
}

export function mapBackendStudentToStudent(
  input: unknown,
): Student {
  const s = getRecord(input);
  const school = getNestedRecord(s, 'school');
  const placement = getNestedRecord(s, 'placement');
  const placementCompany = getNestedRecord(placement, 'company');
  const company = getNestedRecord(s, 'company');

  const firstName = getString(s.firstName);
  const lastName = getString(s.lastName);
  const studentCode = getString(s.studentCode);

  const fullName =
    [firstName, lastName].filter(Boolean).join(' ').trim() ||
    getString(s.name) ||
    studentCode ||
    'Student';

  const rawLevel = s.level;
  const level = rawLevel
    ? String(rawLevel).includes('Level') || String(rawLevel).includes('L')
      ? String(rawLevel)
      : `${rawLevel} Level`
    : '300 Level';

  return {
    id: getString(s.id) || studentCode,
    name: fullName,
    matricNumber:
      getString(s.matriculationNumber) ||
      getString(s.matricNumber) ||
      studentCode ||
      'N/A',
    university:
      getString(school.name) ||
      getString(s.university) ||
      'SIWES Institution',
    department: getString(s.department, 'General'),
    level,
    placementCompany:
      getString(placementCompany.name) ||
      getString(placement.title) ||
      getString(company.name) ||
      getString(s.placementCompany),
    avatarUrl: getString(s.avatarUrl) || undefined,
  };
}

export function mapBackendActivityToActivityLog(
  input: unknown,
): ActivityLog {
  const a = getRecord(input);
  const student = getNestedRecord(a, 'student');
  const review = getNestedRecord(a, 'review');

  const rawStatus = getString(a.status, 'pending').toLowerCase();

  let status: ActivityStatus = 'pending';

  if (rawStatus === 'approved') status = 'approved';
  else if (rawStatus === 'rejected') status = 'rejected';
  else if (
    rawStatus === 'revision_requested' ||
    rawStatus === 'needs_revision'
  ) {
    status = 'revision_requested';
  }

  const rawDate = a.date;
  let date = new Date().toISOString().split('T')[0];

  if (typeof rawDate === 'string') {
    date = rawDate.split('T')[0];
  } else if (rawDate instanceof Date || typeof rawDate === 'number') {
    const parsedDate = new Date(rawDate);

    if (!Number.isNaN(parsedDate.getTime())) {
      date = parsedDate.toISOString().split('T')[0];
    }
  }

  const evidence = getString(a.evidence);

  return {
    id: getString(a.id),
    studentId:
      getString(a.studentId) ||
      getString(student.id),
    date,
    title: getString(a.title, 'Activity Entry'),
    description: getString(a.description),
    hoursWorked: Number(a.hoursWorked) || 0,
    skillsAcquired:
      getStringArray(a.skillsUsed).length > 0
        ? getStringArray(a.skillsUsed)
        : getStringArray(a.skillsAcquired),
    evidenceUrls:
      getStringArray(a.evidenceUrls).length > 0
        ? getStringArray(a.evidenceUrls)
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

export function getSchoolApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;

    if (status === 401) {
      return 'Your session is missing or has expired. Please log in with a school coordinator account.';
    }

    if (status === 403) {
      return 'You do not have permission to access this school data.';
    }

    if (status === 404) {
      return 'The requested API endpoint could not be found. Please confirm the endpoint with the backend team.';
    }

    if (status && status >= 500) {
      return 'The server encountered an error. Please try again later.';
    }

    if (!error.response) {
      return 'Unable to connect to the server. Check your internet connection and try again.';
    }
  }

  return 'Something went wrong while loading school data. Please try again.';
}

export async function fetchStudentsWithFallback(): Promise<Student[]> {
  const res = await apiClient.get('/students');
  return extractArray(res.data).map(mapBackendStudentToStudent);
}

export async function fetchStudentById(id: string): Promise<Student> {
  const res = await apiClient.get(`/students/${id}`);

  if (!res.data) {
    throw new Error(`Student ${id} was not found.`);
  }

  return mapBackendStudentToStudent(res.data);
}

export async function fetchActivitiesWithFallback(): Promise<ActivityLog[]> {
  const res = await apiClient.get('/activities');
  return extractArray(res.data).map(mapBackendActivityToActivityLog);
}

export async function fetchStudentActivities(
  studentId: string,
): Promise<ActivityLog[]> {
  const res = await apiClient.get(
    `/activities?studentId=${encodeURIComponent(studentId)}`,
  );

  return extractArray(res.data).map(mapBackendActivityToActivityLog);
}

export async function fetchPlacementsWithFallback(): Promise<unknown[]> {
  const res = await apiClient.get('/placements');
  return extractArray(res.data);
}