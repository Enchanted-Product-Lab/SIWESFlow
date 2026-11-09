"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, FileText } from 'lucide-react';
import ReviewActionPanel from '../../../../../../components/supervisor/ReviewActionPanel';
import EvidenceViewer, { EvidenceMetadata } from '../../../../../../components/supervisor/EvidenceViewer';

type UIActivityStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

interface ReviewActionPayload {
  action: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  comment?: string;
  rating?: number;
}

const mockEntry = {
  id: 'act_101',
  studentName: 'David Ibrahim',
  date: '2026-10-12',
  hours: 8,
  department: 'Software Engineering',
  description: 'Implemented the user authentication flow using NextAuth.js.',
  learned: 'Gained a deeper understanding of JWT session management.',
  status: 'PENDING' as UIActivityStatus,
  submittedAt: '2026-10-12T14:30:00Z',
  evidence: [
    {
      documentId: 'doc_99283',
      fileName: 'auth_flow_diagram.pdf',
      fileFormat: 'application/pdf',
      fileSizeBytes: 1048576,
      uploadedAt: '2026-10-12T14:30:00Z'
    }
  ] as EvidenceMetadata[]
};

export default function ActivityReviewPage() {
  const params = useParams();
  const router = useRouter(); 
  
  const [activityStatus, setActivityStatus] = useState<UIActivityStatus>(mockEntry.status);

  const handleReviewSubmission = (payload: ReviewActionPayload) => {
    console.log('Sprint 1 Mock - Payload ready for Backend:', payload);
    setActivityStatus(payload.action);
    alert(`Review submitted successfully! Action: ${payload.action}`);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <Link 
            href={`/supervisor/students/${params.id}`} 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-teal-600 mb-4 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Logbook
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Activity Review</h1>
              <p className="text-slate-600 mt-1 text-sm">
                Log entry by <span className="font-semibold text-slate-900">{mockEntry.studentName}</span>
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-bold uppercase tracking-wider">
              {activityStatus.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap gap-6 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar size={18} className="text-slate-400" />
              <span className="font-medium">{mockEntry.date}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock size={18} className="text-slate-400" />
              <span className="font-medium">{mockEntry.hours} Hours Logged</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <FileText size={18} className="text-slate-400" />
              <span className="font-medium">{mockEntry.department}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Work Description</h3>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {mockEntry.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Key Learnings</h3>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {mockEntry.learned}
            </p>
          </div>

          {mockEntry.evidence && mockEntry.evidence.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Evidence Attached</h3>
              <EvidenceViewer attachments={mockEntry.evidence} />
            </div>
          )}
        </div>

        <ReviewActionPanel 
          activityId={mockEntry.id}
          studentName={mockEntry.studentName}
          currentStatus={activityStatus} 
          onSubmitReview={handleReviewSubmission}
        />
      </main>
    </div>
  );
}