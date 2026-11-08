import React from 'react';
import Link from 'next/link';
import { mockActivityLogs, mockStudents } from '../../../data/mock';
import { FileSignature, Calendar, Clock, AlertCircle, ChevronRight, ArrowLeft } from 'lucide-react';

export default function PendingReviewsPage() {
  // 1. Filter for all pending logs
  const pendingLogs = mockActivityLogs.filter(log => log.status === 'pending');

  // 2. Map student names to the logs for display
  const pendingReviewsWithStudents = pendingLogs.map(log => {
    const student = mockStudents.find(s => s.id === log.studentId);
    return { ...log, studentName: student?.name || 'Unknown Student', matric: student?.matricNumber };
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-8 shadow-sm">
        <div className="max-w-5xl mx-auto">
          <Link 
            href="/supervisor/dashboard"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 mb-3 transition-colors"
          >
            <ArrowLeft size={14} /> Back to Supervisor Dashboard
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-rose-100 p-2 rounded-lg text-rose-600">
              <FileSignature size={24} />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Pending Reviews</h1>
          </div>
          <p className="text-slate-600">
            You have <span className="font-bold text-slate-900">{pendingLogs.length}</span> logbook entries waiting for your approval.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-6 mt-8">
        {pendingReviewsWithStudents.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center">
            <div className="bg-teal-50 p-4 rounded-full text-teal-600 mb-4">
              <FileSignature size={32} />
            </div>
            <h2 className="text-lg font-bold text-slate-900">All Caught Up!</h2>
            <p className="text-slate-500 mt-1">There are no pending logbook entries to review.</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="divide-y divide-slate-100">
              {pendingReviewsWithStudents.map((review) => (
                <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
                  
                  {/* Left: Student & Log Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{review.studentName}</h3>
                      <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {review.matric}
                      </span>
                      <span className="flex items-center text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full ml-2">
                        <AlertCircle size={12} className="mr-1" /> Action Required
                      </span>
                    </div>
                    
                    <p className="text-slate-700 font-medium text-sm mb-2">{review.title}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} /> {review.date}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={14} /> {review.hoursWorked} hours logged
                      </span>
                    </div>
                  </div>

                  {/* Right: Action Button */}
                  <div className="flex items-center gap-3">
                    <Link 
                      href={`/supervisor/reviews/${review.id}`}
                      className="inline-flex items-center justify-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shrink-0"
                    >
                      Review Entry <ChevronRight size={16} />
                    </Link>
                  </div>
                  
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
