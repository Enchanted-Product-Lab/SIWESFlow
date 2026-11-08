import React from 'react';
import Link from 'next/link';
import { mockStudents } from '../../../../data/mock';
import { ArrowLeft, User, Building, FileText } from 'lucide-react';
import StudentProgressMonitor from '../../../../components/supervisor/StudentProgressMonitor';
import ReviewActions from '../../../../components/supervisor/ReviewActions';

export default async function StudentDetails({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  // Fetch the specific student from the mock database
  const student = mockStudents.find((s) => s.id === id);

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Student Not Found</h2>
        <Link href="/supervisor/students" className="text-siwes-blue hover:underline">Return to Roster</Link>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-6 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <Link href="/supervisor/students" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-siwes-blue mb-4 transition-colors">
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
            <Link 
              href={`/supervisor/students/${student.id}/logbook`}
              className="bg-siwes-blue hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
            >
              Review Full Logbook
            </Link>
            <Link 
    href={`/supervisor/students/${student.id}/completion`}
    className="bg-siwes-blue hover:bg-blue-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
  >
    Verify Completion
  </Link>
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
              weeksCompleted={8}
              totalWeeks={24}
              hoursLogged={320}
              status="At-Risk"
            />

            {/* Pending Logs Section */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <FileText size={20} className="text-slate-400" />
                  Pending Logbook Review
                </h3>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-semibold">
                  Recent Submission
                </span>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-100 mb-6">
                <h4 className="font-semibold text-slate-800 mb-2">Frontend Component Integration</h4>
                <p className="text-sm text-slate-600 leading-relaxed mb-4">
                  Completed the integration of the supervisor dashboard metrics. Connected the Next.js App Router to the database schemas to ensure real-time UI updates for student monitoring.
                </p>
                <div className="flex gap-2">
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-500">React</span>
                  <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-medium text-slate-500">Next.js</span>
                </div>
              </div>

              <ReviewActions logId={`log_${student.id}`} />
            </div>
          </div>

          {/* Right Column: Academic & Placement Details */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <User size={16} className="text-siwes-blue"/> Academic Profile
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
                <Building size={16} className="text-siwes-blue"/> Placement Details
              </h2>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Assigned Company</p>
                  <p className="font-medium text-slate-900">{student.placementCompany}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">Role / Unit</p>
                  <p className="font-medium text-slate-900">IT Trainee</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}