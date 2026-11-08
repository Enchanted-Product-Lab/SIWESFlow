"use client";

import React from 'react';
import { AlertTriangle, Clock, Activity, Flag } from 'lucide-react';

interface StudentProgressProps {
  studentName: string;
  matricNumber: string;
  weeksCompleted: number;
  totalWeeks: number;
  hoursLogged: number;
  status: 'Active' | 'At-Risk' | 'Inactive';
}

export default function StudentProgressMonitor({
  studentName,
  matricNumber,
  weeksCompleted,
  totalWeeks,
  hoursLogged,
  status
}: StudentProgressProps) {
  const progressPercentage = Math.round((weeksCompleted / totalWeeks) * 100);
  
  const statusConfig = {
    'Active': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'At-Risk': 'bg-amber-100 text-amber-800 border-amber-200',
    'Inactive': 'bg-red-100 text-red-800 border-red-200'
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm w-full max-w-2xl">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{studentName}</h3>
          <p className="text-sm text-slate-500 font-mono">{matricNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig[status]}`}>
            {status}
          </span>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-red-50 text-red-700 hover:bg-red-100 rounded-md text-sm font-medium transition-colors border border-red-100">
            <Flag size={14} />
            Flag Student
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium text-slate-700">SIWES Duration</span>
          <span className="text-slate-500">Week {weeksCompleted} of {totalWeeks} ({progressPercentage}%)</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div 
            className="bg-siwes-blue h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Engagement Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-4">
          <div className="p-2 bg-blue-100 text-siwes-blue rounded-lg">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Hours</p>
            <p className="text-lg font-bold text-slate-900">{hoursLogged} hrs</p>
          </div>
        </div>

        <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 flex items-center gap-4">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Pending Approvals</p>
            <p className="text-lg font-bold text-slate-900">4 Logs</p>
          </div>
        </div>
      </div>

      {status === 'At-Risk' && (
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
          <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
          <p className="text-sm text-amber-800">
            <strong>Warning:</strong> This student has not submitted a daily activity log in 3 days. Consider initiating a review or flagging their account.
          </p>
        </div>
      )}
    </div>
  );
}