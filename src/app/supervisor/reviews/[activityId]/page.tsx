import React from 'react';
import Link from 'next/link';
import { mockActivityLogs, mockStudents } from '../../../../data/mock';
import { ActivityLog, Student } from '../../../../types';
import EvidenceViewer from '../../../../components/supervisor/EvidenceViewer';
import FeedbackForm from '../../../../components/supervisor/FeedbackForm';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';

export default async function ActivityReviewPage({ 
  params 
}: { 
  params: Promise<{ activityId: string }> 
}) {
  const { activityId } = await params;

  // 1. Resolve alias or exact match
  let normalizedId = activityId;
  if (activityId.toLowerCase() === 'act-1') normalizedId = 'LOG-101';
  if (activityId.toLowerCase() === 'act-2') normalizedId = 'LOG-102';
  if (activityId.toLowerCase() === 'act-3') normalizedId = 'LOG-103';

  // 2. Lookup in mock logs or generate populated fallback
  const foundLog = mockActivityLogs.find(l => l.id.toLowerCase() === normalizedId.toLowerCase());
  
  const log: ActivityLog = foundLog || {
    id: activityId,
    studentId: "STU-001",
    date: new Date().toISOString().split('T')[0],
    title: "Full-Stack Feature Implementation & API Review",
    description: "Implemented reactive student dashboard, verification endpoints, and integrated supervisor feedback loop.",
    hoursWorked: 8,
    skillsAcquired: ["Next.js", "TypeScript", "Tailwind CSS", "REST API"],
    evidenceUrls: ["/mock-evidence-1.jpg"],
    status: "pending",
  };

  const student: Student = mockStudents.find(s => s.id === log.studentId) || mockStudents[0];

  return (
    <div className="min-h-screen bg-slate-50 p-6 sm:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        <Link 
          href="/supervisor/dashboard" 
          className="text-teal-600 hover:text-teal-700 font-medium mb-6 inline-flex items-center gap-1.5 transition-colors text-sm"
        >
          <ArrowLeft size={16} /> Back to Supervisor Dashboard
        </Link>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Submission Details */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block mb-1">
                    Entry ID: {log.id}
                  </span>
                  <h1 className="text-2xl font-bold text-slate-900">{log.title}</h1>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold self-start sm:self-auto ${
                  log.status === 'approved' 
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {log.status.toUpperCase()}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                <div className="flex items-center gap-2 text-slate-600">
                  <Calendar size={16} className="text-slate-400" />
                  <span><strong>Date:</strong> {log.date}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock size={16} className="text-slate-400" />
                  <span><strong>Hours Logged:</strong> {log.hoursWorked} hrs</span>
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description of Work</h3>
                <p className="text-slate-700 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {log.description}
                </p>
              </div>

              <div className="mb-8">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Skills Applied</h3>
                <div className="flex flex-wrap gap-2">
                  {log.skillsAcquired.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium border border-slate-200">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Evidence Viewer Section */}
              <div className="pt-6 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Evidence Attached</h3>
                <EvidenceViewer urls={log.evidenceUrls} />
              </div>

            </div>
          </div>

          {/* Right Column: Student Info & Actions */}
          <div className="space-y-6">
            
            {/* Student Context Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
                Student Profile
              </h3>
              <div className="space-y-3 text-sm">
                <p className="text-slate-700"><strong className="text-slate-900">Name:</strong> {student.name}</p>
                <p className="text-slate-700"><strong className="text-slate-900">Matric No:</strong> {student.matricNumber}</p>
                <p className="text-slate-700"><strong className="text-slate-900">Level:</strong> {student.level}</p>
                <p className="text-slate-700"><strong className="text-slate-900">Institution:</strong> {student.university}</p>
                <p className="text-slate-700"><strong className="text-slate-900">Company:</strong> {student.placementCompany}</p>
              </div>
            </div>

            {/* Supervisor Action Card (Client Component) */}
            <FeedbackForm activityId={activityId} />

          </div>
        </div>
      </div>
    </div>
  );
}
