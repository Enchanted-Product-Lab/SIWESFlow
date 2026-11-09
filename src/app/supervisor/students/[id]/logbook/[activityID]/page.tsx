"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Calendar, Clock, FileText, Paperclip, Loader2 } from 'lucide-react';
import ReviewActionPanel, { ReviewActionPayload } from '../../../../../../components/supervisor/ReviewActionPanel';
import { getEvidenceUrl, type EvidenceMetadata, submitActivityReview } from '../../../../../../services/api';
import apiClient from '../../../../../../services/apiClient';

type UIActivityStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';

interface ActivityData {
  id: string;
  studentName: string;
  date: string;
  hours: number;
  department: string;
  description: string;
  learned: string;
  status: UIActivityStatus;
  evidence: EvidenceMetadata[];
}

function EvidenceViewer({ evidence }: { evidence: EvidenceMetadata }) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    getEvidenceUrl(evidence.documentId)
      .then((res) => {
        if (isMounted) {
          setUrl(res.url);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Evidence fetch failed:", err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      });

    return () => { isMounted = false; };
  }, [evidence.documentId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 bg-slate-100 text-slate-500 px-4 py-2 rounded-lg text-sm font-medium animate-pulse w-fit">
        <Paperclip size={18} /> Loading secure link...
      </div>
    );
  }

  if (error || !url) {
    return (
      <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-4 py-2 rounded-lg text-sm font-medium w-fit">
        <Paperclip size={18} /> Failed to load evidence
      </div>
    );
  }

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2 text-siwes-blue hover:text-blue-800 bg-blue-50 px-4 py-2 rounded-lg font-medium transition-colors"
    >
      <Paperclip size={18} />
      {evidence.fileName} <span className="text-slate-400 text-xs font-normal">
        ({(evidence.fileSizeBytes / 1024 / 1024).toFixed(2)} MB)
      </span>
    </a>
  );
}

export default function ActivityReviewPage() {
  const params = useParams();
  const studentId = params?.id as string;
  const activityId = params?.activityID as string;
  
  const [entry, setEntry] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [actRes, studentRes] = await Promise.allSettled([
          apiClient.get(`/activities/${activityId}`),
          apiClient.get(`/students/${studentId}`)
        ]);

        if (actRes.status === 'fulfilled' && actRes.value.data) {
          const act = actRes.value.data;
          const student = studentRes.status === 'fulfilled' ? studentRes.value.data : null;
          const userObj = student?.user || {};
          const sName = userObj.name || (userObj.firstName ? `${userObj.firstName} ${userObj.lastName}`.trim() : 'Student');

          setEntry({
            id: act.id,
            studentName: sName,
            date: act.date ? new Date(act.date).toISOString().split('T')[0] : 'N/A',
            hours: Number(act.hoursWorked) || 0,
            department: student?.department || 'SIWES Program',
            description: act.description || '',
            learned: act.whatILearned || 'None specified',
            status: (act.status as UIActivityStatus) || 'PENDING',
            evidence: Array.isArray(act.evidence) ? act.evidence : []
          });
        }
      } catch (err) {
        console.error('Failed to load entry:', err);
      } finally {
        setLoading(false);
      }
    }

    if (activityId) {
      loadData();
    }
  }, [activityId, studentId]);

  const handleReviewSubmission = async (payload: ReviewActionPayload) => {
    try {
      await submitActivityReview({
        activityId: payload.activityId,
        action: payload.action,
        feedback: payload.feedback,
        rating: payload.rating
      });
      setEntry(prev => prev ? ({ ...prev, status: payload.action }) : null);
      alert(`Review submitted successfully! Action: ${payload.action}`);
    } catch (err) {
      console.error('Failed to submit review:', err);
      alert('Error submitting review. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500">
        <Loader2 className="animate-spin mr-2" size={24} />
        <span>Loading activity...</span>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-600">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Activity Not Found</h2>
        <Link href={`/supervisor/students/${studentId}`} className="text-siwes-blue hover:underline">Back to Student</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <Link 
            href={`/supervisor/students/${studentId}`} 
            className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-siwes-blue mb-4 transition-colors"
          >
            <ArrowLeft size={16} className="mr-1" /> Back to Logbook
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Activity Review</h1>
              <p className="text-slate-600 mt-1 text-sm">
                Log entry by <span className="font-semibold text-slate-900">{entry.studentName}</span>
              </p>
            </div>
            <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-sm font-bold uppercase tracking-wider">
              {entry.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8 space-y-6">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6">
          <div className="flex flex-wrap gap-6 border-b border-slate-100 pb-6">
            <div className="flex items-center gap-2 text-slate-700">
              <Calendar size={18} className="text-slate-400" />
              <span className="font-medium">{entry.date}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <Clock size={18} className="text-slate-400" />
              <span className="font-medium">{entry.hours} Hours Logged</span>
            </div>
            <div className="flex items-center gap-2 text-slate-700">
              <FileText size={18} className="text-slate-400" />
              <span className="font-medium">{entry.department}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Work Description</h3>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {entry.description}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Key Learnings</h3>
            <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100">
              {entry.learned}
            </p>
          </div>

          {entry.evidence && entry.evidence.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">Attached Evidence</h3>
              <div className="flex flex-wrap gap-3">
                {entry.evidence.map((item) => (
                  <EvidenceViewer key={item.documentId} evidence={item} />
                ))}
              </div>
            </div>
          )}
        </div>

        <ReviewActionPanel 
          activityId={entry.id}
          studentName={entry.studentName}
          currentStatus={entry.status} 
          onSubmitReview={handleReviewSubmission}
        />
      </main>
    </div>
  );
}
