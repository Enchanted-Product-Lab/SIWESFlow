import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, User, Building, FileText } from 'lucide-react';
import StudentProgressMonitor from '../../../../components/supervisor/StudentProgressMonitor';
import ReviewActions from '../../../../components/supervisor/ReviewActions';
import apiClient from '../../../../services/apiClient';
import { mapBackendStudentToStudent, mapBackendActivityToActivityLog } from '../../../../services/schoolService';
import { Student, ActivityLog } from '../../../../types';

export default async function StudentDetails({ 
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
  } catch (err) {
    // not found handled below
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

  const totalHours = activities
    .filter(a => a.status === 'approved')
    .reduce((sum, a) => sum + (Number(a.hoursWorked) || 0), 0);
  
  const pendingLogs = activities.filter(a => a.status === 'pending');
  const recentPending = pendingLogs[0];
  const weeksCompleted = Math.min(24, Math.max(1, Math.round(totalHours / 40)));
  const progressStatus: 'Active' | 'At-Risk' | 'Inactive' = totalHours > 0 ? 'Active' : 'At-Risk';

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Link href="/supervisor/students" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to My Students
          </Link>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{student.name}</h1>
              <p className="text-slate-600 mt-1 flex items-center gap-2 text-sm">
                <span className="font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs">{student.id}</span>
                • {student.matricNumber || student.id}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link 
                href={`/supervisor/students/${student.id}/logbook`}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Review Full Logbook
              </Link>
              <Link 
                href={`/supervisor/students/${student.id}/completion`}
                className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
              >
                Verify Completion
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Progress Monitor & Pending Actions */}
          <div className="lg:col-span-2 space-y-8">
            <StudentProgressMonitor 
              studentName={student.name}
              matricNumber={student.matricNumber || student.id}
              weeksCompleted={weeksCompleted}
              totalWeeks={24}
              hoursLogged={totalHours}
              status={progressStatus}
            />

            {/* Pending Logs Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-slate-400" />
                  Pending Logbook Review
                </h3>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                  {pendingLogs.length} Pending
                </span>
              </div>
              
              {recentPending ? (
                <div>
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                    <h4 className="font-semibold text-slate-800 mb-2">{recentPending.title}</h4>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4">
                      {recentPending.description || "No description provided."}
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      {recentPending.skillsAcquired.map(skill => (
                        <span key={skill} className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-500">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <ReviewActions logId={recentPending.id} />
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No activities currently awaiting review for this student.
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Academic & Placement Details */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} className="text-teal-600"/> Academic Profile
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">University</p>
                  <p className="font-medium text-slate-900">{student.university || "National Open University"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Department</p>
                  <p className="font-medium text-slate-900">{student.department}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Level</p>
                  <p className="font-medium text-slate-900">{student.level}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Building size={16} className="text-teal-600"/> Placement Details
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Assigned Company</p>
                  <p className="font-medium text-slate-900">{student.placementCompany || "Company Attachment"}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Role / Unit</p>
                  <p className="font-medium text-slate-900">SIWES Intern</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
