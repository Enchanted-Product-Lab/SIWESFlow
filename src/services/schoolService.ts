import apiClient from './apiClient';
import { Student, ActivityLog } from '../types';
import { mockStudents, mockActivityLogs } from '../data/mock';

export function mapBackendStudentToStudent(s: any): Student {
  return {
    id: s.id || s.studentCode || `STU-${Math.random()}`,
    name: [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || s.name || s.studentCode || 'Student',
    matricNumber: s.matriculationNumber || s.matricNumber || s.studentCode || 'N/A',
    university: s.school?.name || s.university || 'National Open University of Nigeria',
    department: s.department || 'Computer Science',
    level: s.level ? (String(s.level).includes('Level') || String(s.level).includes('L') ? String(s.level) : `${s.level} Level`) : '300 Level',
    placementCompany: s.placement?.company?.name || s.placement?.title || s.company?.name || s.placementCompany || '',
    avatarUrl: s.avatarUrl,
  };
}

export function mapBackendActivityToActivityLog(a: any): ActivityLog {
  const rawStatus = String(a.status || 'pending').toLowerCase();
  let status: 'pending' | 'approved' | 'rejected' | 'revision_requested' = 'pending';
  if (rawStatus === 'approved') status = 'approved';
  else if (rawStatus === 'rejected') status = 'rejected';
  else if (rawStatus === 'revision_requested' || rawStatus === 'needs_revision') status = 'revision_requested';

  return {
    id: a.id || `LOG-${Math.random()}`,
    studentId: a.studentId || a.student?.id || '',
    date: typeof a.date === 'string' ? a.date.split('T')[0] : (a.date ? new Date(a.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]),
    title: a.title || 'Activity Entry',
    description: a.description || '',
    hoursWorked: Number(a.hoursWorked) || 0,
    skillsAcquired: Array.isArray(a.skillsUsed) ? a.skillsUsed : (Array.isArray(a.skillsAcquired) ? a.skillsAcquired : []),
    evidenceUrls: Array.isArray(a.evidenceUrls) ? a.evidenceUrls : (a.evidence ? [a.evidence] : []),
    status,
    supervisorFeedback: a.review?.comment || a.supervisorFeedback || a.comment,
  };
}

export async function fetchStudentsWithFallback(): Promise<Student[]> {
  try {
    const res = await apiClient.get('/students');
    const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    if (raw.length > 0) {
      return raw.map(mapBackendStudentToStudent);
    }
  } catch (_err) {
    // Graceful fallback to mock data
  }
  return mockStudents;
}

export async function fetchActivitiesWithFallback(): Promise<ActivityLog[]> {
  try {
    const res = await apiClient.get('/activities');
    const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    if (raw.length > 0) {
      return raw.map(mapBackendActivityToActivityLog);
    }
  } catch (_err) {
    // Graceful fallback to mock data
  }
  return mockActivityLogs;
}

export async function fetchPlacementsWithFallback(): Promise<any[]> {
  try {
    const res = await apiClient.get('/placements');
    const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    if (raw.length > 0) {
      return raw;
    }
  } catch (_err) {
    // Graceful fallback
  }
  return [];
}
