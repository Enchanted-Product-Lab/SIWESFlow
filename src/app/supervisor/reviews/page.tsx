"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileSignature, Calendar, Clock, AlertCircle, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';
import apiClient from '../../../services/apiClient';

interface PendingReviewItem {
  id: string;
  studentId: string;
  studentName: string;
  matric: string;
  title: string;
  date: string;
  hoursWorked: number;
}

export default function PendingReviewsPage() {
  const [reviews, setReviews] = useState<PendingReviewItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPendingReviews() {
      try {
        const [actRes, stuRes] = await Promise.allSettled([
          apiClient.get('/activities?status=PENDING'),
          apiClient.get('/students'),
        ]);

        const rawActs = actRes.status === 'fulfilled' ? actRes.value.data : null;
        const actList: any[] = Array.isArray(rawActs) ? rawActs : (Array.isArray(rawActs?.data) ? rawActs.data : []);

        const rawStus = stuRes.status === 'fulfilled' ? stuRes.value.data : null;
        const stuList: any[] = Array.isArray(rawStus) ? rawStus : (Array.isArray(rawStus?.data) ? rawStus.data : (Array.isArray(rawStus?.students) ? rawStus.students : []));

        const studentMap = new Map<string, { name: string; matric: string }>();
        stuList.forEach((s: any) => {
          const name = [s.firstName, s.lastName].filter(Boolean).join(' ').trim() || s.name || s.studentCode || 'Student';
          const matric = s.matriculationNumber || s.matricNumber || s.studentCode || 'N/A';
          studentMap.set(s.id, { name, matric });
        });

        const mapped: PendingReviewItem[] = actList.map((a: any) => {
          const sInfo = studentMap.get(a.studentId) || {
            name: a.student ? [a.student.firstName, a.student.lastName].filter(Boolean).join(' ') : 'Student',
            matric: a.student?.matriculationNumber || 'N/A',
          };
          return {
            id: a.id,
            studentId: a.studentId,
            studentName: sInfo.name,
            matric: sInfo.matric,
            title: a.title || 'Activity Log Entry',
            date: typeof a.date === 'string' ? a.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
            hoursWorked: Number(a.hoursWorked) || 0,
          };
        });

        setReviews(mapped);
      } catch (err) {
        console.error('Failed to load pending reviews:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPendingReviews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
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
            {loading ? (
              'Checking for pending reviews...'
            ) : (
              <>
                You have <span className="font-bold text-slate-900">{reviews.length}</span> logbook entries waiting for your approval.
              </>
            )}
          </p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 mt-8">
        {loading ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-teal-600 h-8 w-8 mb-3" />
            <p className="text-slate-500 text-sm">Loading pending activities...</p>
          </div>
        ) : reviews.length === 0 ? (
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
              {reviews.map((review) => (
                <div key={review.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
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
