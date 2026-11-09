import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CompletionVerification from '../../../../../components/supervisor/CompletionVerification';
import apiClient from '../../../../../services/apiClient';
import { mapBackendStudentToStudent, mapBackendActivityToActivityLog } from '../../../../../services/schoolService';
import { Student, ActivityLog } from '../../../../../types';

export default async function CompletionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  let student: Student | null = null;
  let activities: ActivityLog[] = [];

  try {
    const res = await apiClient.get(`/students/${id}`);
    if (res.data) {
      student = mapBackendStudentToStudent(res.data);
    }
  } catch {
    student = null;
  }

  if (!student) {
    notFound();
  }

  try {
    const actRes = await apiClient.get(`/activities?studentId=${id}`);
    const raw = Array.isArray(actRes.data) ? actRes.data : (Array.isArray(actRes.data?.data) ? actRes.data.data : []);
    activities = raw.map(mapBackendActivityToActivityLog);
  } catch {
    activities = [];
  }

  const studentLogs = activities.filter((log) => log.status === 'approved');
  const totalHours = studentLogs.reduce((acc, log) => acc + (Number(log.hoursWorked) || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <Link href={`/supervisor/students/${student.id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-siwes-blue mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Student Profile
          </Link>
          
          <h1 className="text-2xl font-bold text-slate-900">Program Completion Sign-Off</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Final evaluation for <span className="font-semibold text-slate-900">{student.name}</span>
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        <CompletionVerification 
          studentName={student.name}
          matricNumber={student.matricNumber || student.id}
          totalHoursLogged={totalHours}
        />
      </main>
    </div>
  );
}
