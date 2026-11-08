"use client";

import React, { useState } from 'react';
import { Award, FileText, CheckCircle, AlertTriangle, FileSignature } from 'lucide-react';

interface CompletionVerificationProps {
  studentName: string;
  matricNumber: string;
  totalHoursLogged: number;
  requiredHours?: number;
}

export default function CompletionVerification({
  studentName,
  matricNumber,
  totalHoursLogged,
  requiredHours = 960 // Standard 24 weeks * 40 hours
}: CompletionVerificationProps) {
  const [finalGrade, setFinalGrade] = useState('');
  const [comments, setComments] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEligible = totalHoursLogged >= requiredHours;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      alert(`Completion verified for ${studentName}. Final Grade: ${finalGrade}`);
    }, 1500);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="border-b border-slate-200 bg-slate-50 p-6 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Award className="text-siwes-blue" size={24} />
            Final SIWES Evaluation
          </h2>
          <p className="text-sm text-slate-500 mt-1">Official supervisor sign-off and grading</p>
        </div>
        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold flex items-center gap-1 border ${
          isEligible ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
        }`}>
          {isEligible ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
          {isEligible ? 'Eligible for Completion' : 'Incomplete Hours'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-8">
        {/* Analytics Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-100">
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Student</p>
            <p className="font-medium text-slate-900">{studentName}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Matric No.</p>
            <p className="font-medium text-slate-900 font-mono text-sm">{matricNumber}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Hours Logged</p>
            <p className={`font-bold ${isEligible ? 'text-emerald-600' : 'text-amber-600'}`}>
              {totalHoursLogged} / {requiredHours}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">Logbook Status</p>
            <p className="font-medium text-slate-900">100% Reviewed</p>
          </div>
        </div>

        {/* Grading Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Final Performance Grade</label>
            <select 
              required
              value={finalGrade}
              onChange={(e) => setFinalGrade(e.target.value)}
              className="w-full md:w-1/2 p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-siwes-blue focus:border-siwes-blue outline-none bg-white transition-all text-slate-700"
            >
              <option value="" disabled>Select a grade...</option>
              <option value="A">A (Excellent - 70% and above)</option>
              <option value="B">B (Very Good - 60% to 69%)</option>
              <option value="C">C (Good - 50% to 59%)</option>
              <option value="D">D (Pass - 45% to 49%)</option>
              <option value="F">F (Fail - Below 45%)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
              <FileText size={16} className="text-slate-700" />
              Supervisor&apos;s General Assessment
            </label>
            <textarea 
              required
              rows={4}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide a detailed evaluation of the student's technical skills, punctuality, and professional growth during the internship..."
              className="w-full p-3 border border-slate-300 text-slate-700 rounded-lg focus:ring-2 focus:ring-siwes-blue focus:border-siwes-blue outline-none bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Verification Checkbox & Submit */}
        <div className="pt-6 border-t border-slate-200">
          <label className="flex items-start gap-3 cursor-pointer group mb-6">
            <div className="relative flex items-center justify-center mt-0.5">
              <input 
                type="checkbox" 
                required
                checked={isVerified}
                onChange={(e) => setIsVerified(e.target.checked)}
                className="peer appearance-none w-5 h-5 border-2 border-slate-300 rounded focus:ring-2 focus:ring-siwes-blue focus:ring-offset-2 checked:bg-siwes-blue checked:border-siwes-blue transition-all"
              />
              <CheckCircle size={14} className="text-white absolute opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
            </div>
            <span className="text-sm text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
              I certify that this student has satisfactorily completed the required industrial training under my supervision, and the final grade and comments provided accurately reflect their performance.
            </span>
          </label>

          <button 
            type="submit" 
            disabled={!isEligible || !isVerified || isSubmitting}
            className="w-full md:w-auto flex items-center justify-center gap-2 bg-siwes-blue hover:bg-blue-800 text-white font-bold py-3 px-8 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          >
            {isSubmitting ? (
              <span className="flex items-center gap-2">Processing...</span>
            ) : (
              <><FileSignature size={18} /> Submit Official Verification</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}