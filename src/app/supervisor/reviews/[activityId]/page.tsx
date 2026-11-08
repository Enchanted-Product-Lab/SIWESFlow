import React from 'react';
import Link from 'next/link';
import { mockActivityLogs, mockStudents } from '../../../../data/mock';
import EvidenceViewer from '../../../../components/supervisor/EvidenceViewer';
import FeedbackForm from '../../../../components/supervisor/FeedbackForm';

export default async function ActivityReviewPage({ 
  params 
}: { 
  params: Promise<{ activityId: string }> 
}) {
  const { activityId } = await params;

  // 1. Fetch the specific log and the associated student
  const log = mockActivityLogs.find(l => l.id === activityId);
  const student = log ? mockStudents.find(s => s.id === log.studentId) : null;

  // 2. Handle the case where a log isn't found
  if (!log || !student) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-sans">
        <h2 className="text-xl font-bold text-slate-900">Submission Not Found</h2>
        <Link href="/supervisor/dashboard" className="text-teal-600 mt-4 hover:underline">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // 3. Render the full review interface
  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans">
      <Link 
        href="/supervisor/dashboard" 
        className="text-teal-600 hover:text-teal-700 font-medium mb-6 inline-block transition-colors"
      >
        &larr; Back to Dashboard
      </Link>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Submission Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-2xl font-bold text-slate-900">{log.title}</h1>
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">
                {log.status.toUpperCase()}
              </span>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm text-slate-600">
              <div><strong className="text-slate-900">Date:</strong> {log.date}</div>
              <div><strong className="text-slate-900">Hours Logged:</strong> {log.hoursWorked} hrs</div>
            </div>

            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Description of Work</h3>
              <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
                {log.description}
              </p>
            </div>

            <div className="mb-8">
              <h3 className="text-sm font-bold text-slate-900 mb-2">Skills Applied</h3>
              <div className="flex flex-wrap gap-2">
                {log.skillsAcquired.map(skill => (
                  <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-md text-sm border border-slate-200">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Evidence Viewer Section */}
            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-4">Evidence Attached</h3>
              <EvidenceViewer urls={log.evidenceUrls} />
            </div>

          </div>
        </div>

        {/* Right Column: Student Info & Actions */}
        <div className="space-y-6">
          
          {/* Student Context Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Student Profile</h3>
            <div className="space-y-3 text-sm">
              <p className="text-slate-700"><strong className="text-slate-900">Name:</strong> {student.name}</p>
              <p className="text-slate-700"><strong className="text-slate-900">Matric No:</strong> {student.matricNumber}</p>
              <p className="text-slate-700"><strong className="text-slate-900">Level:</strong> {student.level}</p>
              <p className="text-slate-700"><strong className="text-slate-900">Institution:</strong> {student.university}</p>
            </div>
          </div>

          {/* Supervisor Action Card (Client Component) */}
          <FeedbackForm activityId={activityId} />

        </div>
      </div>
    </div>
  );
}
