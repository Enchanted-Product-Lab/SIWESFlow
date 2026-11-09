import apiClient from './apiClient';
import { Student, ActivityLog } from '../types';

export function mapBackendStudentToStudent(s: any): Student {
  const firstName = s.firstName || '';
  const lastName = s.lastName || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim() || s.name || s.studentCode || 'Student';

  return {
    id: s.id || s.studentCode || '',
    name: fullName,
    matricNumber: s.matriculationNumber || s.matricNumber || s.studentCode || 'N/A',
    university: s.school?.name || s.university || 'SIWES Institution',
    department: s.department || 'General',
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
    id: a.id || '',
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
    return raw.map(mapBackendStudentToStudent);
  } catch (err) {
    console.error('Error fetching students:', err);
    return [];
  }
}

export async function fetchStudentById(id: string): Promise<Student | null> {
  try {
    const res = await apiClient.get(`/students/${id}`);
    if (res.data) {
      return mapBackendStudentToStudent(res.data);
    }
  } catch (err) {
    console.error(`Error fetching student ${id}:`, err);
  }
  return null;
}

export async function fetchActivitiesWithFallback(): Promise<ActivityLog[]> {
  try {
    const res = await apiClient.get('/activities');
    const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    return raw.map(mapBackendActivityToActivityLog);
  } catch (err) {
    console.error('Error fetching activities:', err);
    return [];
  }
}

export async function fetchStudentActivities(studentId: string): Promise<ActivityLog[]> {
  try {
    const res = await apiClient.get(`/activities?studentId=${studentId}`);
    const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    return raw.map(mapBackendActivityToActivityLog);
  } catch (err) {
    console.error(`Error fetching activities for student ${studentId}:`, err);
    return [];
  }
}

export async function fetchPlacementsWithFallback(): Promise<any[]> {
  try {
    const res = await apiClient.get('/placements');
    const raw = Array.isArray(res.data) ? res.data : (Array.isArray(res.data?.data) ? res.data.data : []);
    return raw;
  } catch (err) {
    console.error('Error fetching placements:', err);
    return [];
  }
}
