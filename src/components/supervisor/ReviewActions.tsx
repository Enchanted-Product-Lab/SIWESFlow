"use client";

import React, { useState } from 'react';
import { Check, AlertCircle, Loader2 } from 'lucide-react';

export default function ReviewActions({
  logId,
  onReview,
}: {
  logId: string;
  onReview?: (action: 'approved' | 'needs_revision') => void;
}) {
  const [status, setStatus] = useState<'pending' | 'approved' | 'needs_revision'>('pending');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleReview = async (action: 'approved' | 'needs_revision') => {
    setIsProcessing(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    setStatus(action);
    setIsProcessing(false);
    onReview?.(action);
  };

  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
        <Check size={16} /> Approved
      </span>
    );
  }

  if (status === 'needs_revision') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 text-sm font-medium border border-amber-200">
        <AlertCircle size={16} /> Needs Revision
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 justify-end">
      <button
        onClick={() => handleReview('needs_revision')}
        disabled={isProcessing}
        className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-50"
        title="Request Revision"
        aria-label="Request Revision"
      >
        <AlertCircle size={18} />
      </button>
      <button
        onClick={() => handleReview('approved')}
        disabled={isProcessing}
        className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-colors disabled:opacity-70 shadow-sm"
      >
        {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
        Approve
      </button>
    </div>
  );
}
