"use client";

import React, { useState, useEffect, use } from 'react';
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
import apiClient from '../../../../services/apiClient';
import { submitActivityReview } from '../../../../services/api';

type ActivityStatus = 'PENDING' | 'APPROVED' | 'NEEDS_REVISION' | 'REJECTED';

interface ActivityDetail {
  id: string;
  studentId?: string;
  studentName?: string;
  studentMatric?: string;
  department?: string;
  date: string;
  title: string;
  category: string;
  hoursWorked: number;
  skillsUsed: string[];
  description: string;
  whatILearned: string;
  challenges: string;
  status: ActivityStatus;
  evidence?: Array<{
    id: string;
    fileUrl: string;
    fileType: string;
    fileName: string;
    fileSizeMB: number;
  }>;
}

export default function ActivityReviewPage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params);
  const [activity, setActivity] = useState<ActivityDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const fetchActivity = async () => {
    try {
      const res = await apiClient.get(`/activities/${id}`);
      const data = res.data;
      if (data) {
        const studentObj = data.student || {};
        const userObj = studentObj.user || {};
        setActivity({
          id: data.id,
          studentId: data.studentId || studentObj.id,
          studentName: userObj.name || (userObj.firstName ? `${userObj.firstName} ${userObj.lastName}`.trim() : 'Student'),
          studentMatric: studentObj.matriculationNumber || 'N/A',
          department: studentObj.department || 'SIWES Program',
          date: data.date ? new Date(data.date).toISOString().split('T')[0] : 'N/A',
          title: data.title || 'Untitled Activity',
          category: data.category || 'General',
          hoursWorked: Number(data.hoursWorked) || 0,
          skillsUsed: Array.isArray(data.skillsUsed) ? data.skillsUsed : [],
          description: data.description || '',
          whatILearned: data.whatILearned || 'None specified',
          challenges: data.challenges || 'None reported',
          status: (data.status as ActivityStatus) || 'PENDING',
          evidence: Array.isArray(data.evidence) ? data.evidence : []
        });
      }
    } catch (err) {
      console.error('Failed to load activity:', err);
      setActivity(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, [id]);

  const handleReviewSubmit = async (action: ActivityStatus) => {
    if ((action === 'NEEDS_REVISION' || action === 'REJECTED') && !comment.trim()) {
      alert("Please provide a comment explaining the decision.");
      return;
    }

    setIsSubmitting(true);

    try {
      await submitActivityReview({
        activityId: id,
        action: action === 'APPROVED' ? 'APPROVED' : 'NEEDS_REVISION',
        feedback: comment.trim() || (action === 'APPROVED' ? 'Approved' : 'Needs revision'),
        rating: rating > 0 ? rating : undefined
      });

      setActivity((prev) => prev ? ({ ...prev, status: action }) : null);
      setActionSuccess(`Activity marked as ${action.replace('_', ' ')} successfully.`);
    } catch (err) {
      console.error('Review submission failed:', err);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span>Loading activity details...</span>
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Activity Not Found</h2>
        <Link href="/supervisor/dashboard" className="text-siwes-blue hover:underline">Return to Dashboard</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-5xl mx-auto space-y-6">
        
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
          
          <div className="lg:col-span-2 space-y-6">
            
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
                  {activity.skillsUsed.length > 0 ? (
                    activity.skillsUsed.map((skill, idx) => (
                      <span key={idx} className="bg-slate-100 text-slate-700 text-xs font-medium px-2.5 py-1 rounded-md">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">None specified</span>
                  )}
                </div>
              </div>
            </div>

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

          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Student Profile</h3>
              <div>
                <p className="text-base font-bold text-slate-900">{activity.studentName}</p>
                <p className="text-xs text-slate-500">{activity.studentMatric}</p>
                <p className="text-xs text-slate-500 mt-0.5">{activity.department}</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Supervisor Assessment</h3>

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
