"use client";

import React, { use } from 'react';
import Link from 'next/link';
import { mockStudents, mockActivityLogs } from '../../../../../data/mock';
import { Calendar, Clock, CheckCircle, XCircle, ArrowLeft, MessageSquare, Briefcase } from 'lucide-react';

export default function LogbookReviewPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = use(params);
  
  const student = mockStudents.find((s) => s.id === id);
  const logs = mockActivityLogs.filter((log) => log.studentId === id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
      {/* Header Section */}
      <header className="bg-white border-b border-slate-200 px-6 py-6 sticky top-0 z-10 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <Link href="/supervisor/students" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to My Students
          </Link>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{student.name}&apos;s Logbook</h1>
              <p className="text-slate-600 mt-1 flex items-center gap-2 text-sm">
                <Briefcase size={14} />
                {student.placementCompany} • {student.department}
              </p>
            </div>
            <div className="bg-slate-100 px-4 py-2 rounded-lg border border-slate-200 text-sm font-medium text-slate-700">
              Total Hours: <span className="text-siwes-blue font-bold ml-1">{logs.reduce((acc, log) => acc + log.hoursWorked, 0)} hrs</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content: Log Timeline */}
      <main className="max-w-4xl mx-auto px-6 mt-8">
        {logs.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
            No activity logs submitted yet.
          </div>
        ) : (
          <div className="space-y-6">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row">
                
                {/* Log Details */}
                <div className="p-6 flex-1 border-b md:border-b-0 md:border-r border-slate-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                      <Calendar size={12} className="mr-1" /> {log.date}
                    </span>
                    <span className="inline-flex items-center text-xs font-semibold text-slate-500">
                      <Clock size={12} className="mr-1" /> {log.hoursWorked} Hours
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 mb-2">{log.title}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-4">{log.description}</p>
                  
                  {log.skillsAcquired.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {log.skillsAcquired.map((skill, index) => (
                        <span key={index} className="text-xs font-medium bg-blue-50 text-siwes-blue px-2 py-1 rounded-md border border-blue-100">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Approval/Feedback Panel */}
                <div className="p-6 md:w-72 bg-slate-50 flex flex-col justify-center">
                  {log.status === 'approved' ? (
                    <div className="text-center">
                      <div className="inline-flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-full text-emerald-600 mb-3">
                        <CheckCircle size={24} />
                      </div>
                      <p className="font-semibold text-emerald-800">Log Approved</p>
                      {log.supervisorFeedback && (
                        <p className="text-xs text-slate-600 mt-2 italic bg-white p-2 rounded border border-slate-200">
                          &quot;{log.supervisorFeedback}&quot;
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                        <MessageSquare size={12} /> Supervisor Feedback
                      </label>
                      <textarea 
                        className="w-full text-sm border border-slate-300 rounded-lg p-2 focus:ring-2 focus:ring-siwes-blue focus:outline-none resize-none bg-white text-slate-900" 
                        rows={3} 
                        placeholder="Add notes before approving..."
                      ></textarea>
                      <div className="flex gap-2 mt-1">
                        <button 
                          onClick={() => alert("Log Approved! Backend API integration pending.")}
                          className="flex-1 bg-siwes-blue hover:bg-blue-800 text-white font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <CheckCircle size={16} /> Approve
                        </button>
                        <button 
                          onClick={() => alert("Rejection flow triggered! Backend API integration pending.")}
                          className="flex-1 bg-white hover:bg-rose-50 text-rose-600 border border-slate-300 hover:border-rose-200 font-medium py-2 rounded-lg text-sm transition-colors flex items-center justify-center gap-1 shadow-sm"
                        >
                          <XCircle size={16} /> Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}