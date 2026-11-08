"use client";

import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Flag, 
  Star, 
  FileText, 
  Clock, 
  Calendar, 
  ArrowLeft,
  Loader2,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

// 1. Define the status type
type ActivityStatus = 'PENDING' | 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';

// Mock activity data for Sprint 1
const mockActivity = {
  id: "act-101",
  studentId: "std-882",
  studentName: "Francess Okafor",
  studentMatric: "NOU192837412",
  department: "Computer Science",
  date: "2026-10-14",
  title: "Implemented Next.js App Router Auth Gateway & Supabase Hooks",
  category: "Frontend Development",
  hoursWorked: 8,
  skillsUsed: ["Next.js 15", "TypeScript", "Tailwind CSS", "Supabase Auth"],
  description: "Constructed standard split-screen layout for authentication pages. Configured middleware guards and JWT persistence logic.",
  whatILearned: "Understood async route params handling in Next.js 15 and server context resolution during middleware execution.",
  challenges: "Faced transient hydration warnings when reading auth state from localStorage before layout render.",
  // 2. Cast status as ActivityStatus instead of const
  status: "PENDING" as ActivityStatus,
  evidence: [
    {
      id: "doc-1",
      fileUrl: "/mock-evidence.png",
      fileType: "image/jpeg" as const,
      fileName: "auth_gateway_screenshot.jpg",
      fileSizeMB: 1.8
    }
  ]
};

export default function ActivityReviewPage() {
  const [activity, setActivity] = useState(mockActivity);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [flagReason, setFlagReason] = useState('');
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const handleReviewSubmit = async (action: ActivityStatus) => {
    if ((action === 'NEEDS_REVISION' || action === 'REJECTED') && !comment.trim()) {
      alert("Please provide a comment explaining the decision.");
      return;
    }

    setIsSubmitting(true);

    try {
      // Mock API latency
      await new Promise((res) => setTimeout(res, 800));

      setActivity((prev) => ({
        ...prev,
        status: action,
        supervisorFeedback: {
          comment,
          rating,
          reviewedAt: new Date().toISOString(),
          actionTaken: action
        }
      }));

      setActionSuccess(`Activity marked as ${action.replace('_', ' ')} successfully.`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between">
          <Link 
            href="/supervisor/dashboard" 
            className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-[#0015A4] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <button
            onClick={() => setShowFlagModal(true)}
            className="inline-flex items-center text-xs font-semibold text-rose-600 hover:text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Flag className="w-3.5 h-3.5 mr-1.5" />
            Flag Student
          </button>
        </div>

        {actionSuccess && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-medium">
            {actionSuccess}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Activity Details (2 Cols) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Header Card */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <span className="inline-block text-xs font-semibold uppercase tracking-wider text-[#0015A4] bg-blue-50 px-2.5 py-1 rounded-md mb-2">
                    {activity.category}
                  </span>
                  <h1 className="text-xl font-bold text-slate-900">{activity.title}</h1>
                </div>
                <StatusBadge status={activity.status} />
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1 text-slate-400" />
                  {activity.date}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1 text-slate-400" />
                  {activity.hoursWorked} Hours Logged
                </div>
              </div>
            </div>

            {/* Core Work Breakdown */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Tasks & Activities</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{activity.description}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Key Learning Outcomes</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{activity.whatILearned}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Challenges Encountered</h3>
                <p className="text-sm text-slate-700 leading-relaxed">{activity.challenges}</p>
              </div>

              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Skills Utilized</h3>
                <div className="flex flex-wrap gap-2 mt-1">
                  {activity.skillsUsed.map((skill, idx) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Evidence & Attachments */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Submitted Evidence</h3>
              {activity.evidence && activity.evidence.length > 0 ? (
                <div className="space-y-3">
                  {activity.evidence.map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-xl bg-slate-50">
                      <div className="flex items-center space-x-3">
                        <FileText className="w-5 h-5 text-[#0015A4]" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{file.fileName}</p>
                          <p className="text-xs text-slate-400">{file.fileSizeMB} MB • {file.fileType}</p>
                        </div>
                      </div>
                      <a 
                        href={file.fileUrl} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="text-xs font-semibold text-[#0015A4] hover:underline flex items-center"
                      >
                        View File <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400 italic">No evidence uploaded for this entry.</p>
              )}
            </div>

          </div>

          {/* Right Column - Review Actions Panel */}
          <div className="space-y-6">
            
            {/* Student Context Card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Profile</h3>
              <div>
                <p className="text-base font-bold text-slate-900">{activity.studentName}</p>
                <p className="text-xs text-slate-500">{activity.studentMatric}</p>
                <p className="text-xs text-slate-500 mt-0.5">{activity.department}</p>
              </div>
            </div>

            {/* Review Action Controls */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Supervisor Assessment</h3>

              {/* Rating Selector */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Rating (Optional)</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="p-1 text-amber-400 focus:outline-none"
                    >
                      <Star 
                        className={`w-5 h-5 ${
                          star <= (hoveredRating || rating) ? 'fill-amber-400' : 'text-slate-200'
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback Comment */}
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1.5">Feedback / Comments</label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Provide guidance or state reasons for corrections..."
                  className="w-full text-sm p-3 border border-slate-200 rounded-xl focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => handleReviewSubmit('APPROVED')}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <> <CheckCircle2 className="w-4 h-4 mr-2" /> Approve Activity </>}
                </button>

                <button
                  onClick={() => handleReviewSubmit('NEEDS_REVISION')}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white font-medium text-sm rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <> <AlertTriangle className="w-4 h-4 mr-2" /> Request Correction </>}
                </button>

                <button
                  onClick={() => handleReviewSubmit('REJECTED')}
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white font-medium text-sm rounded-xl flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <> <XCircle className="w-4 h-4 mr-2" /> Reject Entry </>}
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ActivityStatus }) {
  const styles = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    NEEDS_REVISION: "bg-blue-50 text-blue-700 border-blue-200",
    REJECTED: "bg-rose-50 text-rose-700 border-rose-200",
  };

  return (
    <span className={`text-xs font-semibold border px-3 py-1 rounded-full ${styles[status]}`}>
      {status.replace('_', ' ')}
    </span>
  );
}