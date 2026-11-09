"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, UserCheck } from 'lucide-react';
import DashboardMetrics from '../../../components/supervisor/DashboardMetrics';
import RecentActivityTable from '../../../components/supervisor/RecentActivityTable';
import apiClient from '../../../services/apiClient';

// Automatically extract the exact types that RecentActivityTable expects!
// This guarantees a perfect type match without manually duplicating the interfaces.
type ActivityLog = React.ComponentProps<typeof RecentActivityTable>['logs'][0];
type Student = React.ComponentProps<typeof RecentActivityTable>['students'][0];

export default function SupervisorDashboard() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const [actRes, stuRes] = await Promise.allSettled([
          apiClient.get('/activities'),
          apiClient.get('/students'),
        ]);

        if (actRes.status === 'fulfilled') {
          // Strictly type the response to match ActivityLog
          const rawAct = actRes.value.data as ActivityLog[] | { data: ActivityLog[] };
          const listAct = Array.isArray(rawAct) 
            ? rawAct 
            : (rawAct && 'data' in rawAct && Array.isArray(rawAct.data) ? rawAct.data : []);
          
          setLogs(listAct);
        }

        if (stuRes.status === 'fulfilled') {
          // Strictly type the response to match Student
          const rawStu = stuRes.value.data as Student[] | { data: Student[] } | { students: Student[] };
          const listStu = Array.isArray(rawStu) 
            ? rawStu 
            : (rawStu && 'data' in rawStu && Array.isArray(rawStu.data) 
                ? rawStu.data 
                : (rawStu && 'students' in rawStu && Array.isArray(rawStu.students) ? rawStu.students : []));
          
          setStudents(listStu);
        }
      } catch (err) {
        console.error('Failed to load supervisor dashboard data:', err);
      }
    }
    
    loadData();
  }, []);

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Cohort Overview</h1>
        <p className="text-slate-600 mt-1 text-sm md:text-base">
          Track engagement, monitor hours, and manage your assigned SIWES students.
        </p>
      </div>

      {/* Metrics Grid Component */}
      <div>
        <DashboardMetrics />
      </div>

      {/* Quick Action Navigation Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Student Final Evaluations & Logbooks</h3>
          <p className="text-xs text-slate-500 mt-0.5">Jump directly to individual student logbooks or execute final SIWES sign-offs.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <Link 
            href="/supervisor/students/STU-001"
            className="px-4 py-2 border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-medium transition-colors inline-flex items-center gap-2"
          >
            <BookOpen size={16} /> View Student Logbook
          </Link>
          
          <Link 
            href="/supervisor/students/STU-001/completion"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-colors inline-flex items-center gap-2 shadow-sm"
          >
            <UserCheck size={16} /> Final Sign-off Page
          </Link>
        </div>
      </div>

      {/* Activity Submissions Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Recent Activity Submissions</h3>
        </div>
        <div className="overflow-x-auto w-full">
          <RecentActivityTable logs={logs} students={students} />
        </div>
      </div>

    </div>
  );
}