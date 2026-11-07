"use client";

import React, { useState } from 'react';
import { CheckCircle, XCircle, AlertCircle, MessageSquare, Star } from 'lucide-react';

// 1. Updated to match the new UPPERCASE backend specs
export interface ReviewActionPayload {
  activityId: string;
  action: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  feedback: string;
  rating?: number;
}

interface ReviewActionPanelProps {
  activityId: string;
  studentName: string;
  currentStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION';
  onSubmitReview: (payload: ReviewActionPayload) => void; 
}

export default function ReviewActionPanel({ 
  activityId, 
  studentName, 
  currentStatus,
  onSubmitReview 
}: ReviewActionPanelProps) {
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAction = (actionType: 'APPROVED' | 'REJECTED' | 'NEEDS_REVISION') => {
    if ((actionType === 'REJECTED' || actionType === 'NEEDS_REVISION') && !feedback.trim()) {
      alert('Feedback is required for rejections or correction requests.');
      return;
    }

    setIsSubmitting(true);
    
    // 2. Build the payload to perfectly match the interface
    const payload: ReviewActionPayload = {
      activityId,
      action: actionType,
      feedback,
      ...(actionType === 'APPROVED' && rating > 0 ? { rating } : {})
    };

    setTimeout(() => {
      onSubmitReview(payload);
      setIsSubmitting(false);
    }, 800);
  };

  if (currentStatus !== 'PENDING') {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center">
        <p className="text-slate-600 font-medium">
          This activity has already been reviewed (Status: <span className="uppercase">{currentStatus.replace('_', ' ')}</span>).
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center gap-2">
        <MessageSquare size={18} className="text-siwes-blue" />
        <h3 className="text-lg font-bold text-slate-900">Supervisor Evaluation</h3>
      </div>

      <div className="p-6 space-y-6">
        {/* Rating Section */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">Performance Rating</label>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="p-1 transition-transform hover:scale-110 focus:outline-none"
              >
                <Star 
                  size={28} 
                  className={`transition-colors ${
                    star <= (hoveredRating || rating) 
                      ? 'fill-amber-400 text-amber-400' 
                      : 'fill-slate-100 text-slate-300'
                  }`} 
                />
              </button>
            ))}
            <span className="ml-3 text-sm text-slate-500 font-medium">
              {rating > 0 ? `${rating} / 5 Stars` : 'Select rating'}
            </span>
          </div>
        </div>

        {/* Feedback Box */}
        <div>
          <label className="block text-sm font-bold text-slate-700 mb-2">
            Constructive Feedback <span className="text-slate-400 font-normal">(Required for revisions)</span>
          </label>
          <textarea
            rows={4}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={`Leave comments for ${studentName} regarding this logbook entry...`}
            className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-siwes-blue focus:border-siwes-blue outline-none transition-all resize-none"
          />
        </div>

        {/* Action Buttons */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => handleAction('APPROVED')}
            disabled={isSubmitting || rating === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            <CheckCircle size={18} /> Approve Log
          </button>
          
          <button
            onClick={() => handleAction('NEEDS_REVISION')}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            <AlertCircle size={18} /> Request Correction
          </button>

          <button
            onClick={() => handleAction('REJECTED')}
            disabled={isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50"
          >
            <XCircle size={18} /> Reject Completely
          </button>
        </div>
      </div>
    </div>
  );
}