"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu } from 'lucide-react';
import DashboardMetrics from '../../../components/supervisor/DashboardMetrics';
import RecentActivityTable from '../../../components/supervisor/RecentActivityTable';
import { mockStudents, mockActivityLogs } from '../../../data/mock';
import apiClient from '../../../services/apiClient';

export default function SupervisorDashboard() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [logs, setLogs] = useState(mockActivityLogs);
  const [students, setStudents] = useState(mockStudents);

  useEffect(() => {
    async function loadData() {
      try {
        const [actRes, stuRes] = await Promise.allSettled([
          apiClient.get('/activities'),
          apiClient.get('/students'),
        ]);
        if (actRes.status === 'fulfilled' && Array.isArray(actRes.value.data) && actRes.value.data.length > 0) {
          setLogs(actRes.value.data);
        }
        if (stuRes.status === 'fulfilled') {
          const list = Array.isArray(stuRes.value.data) ? stuRes.value.data : stuRes.value.data?.students;
          if (Array.isArray(list) && list.length > 0) {
            setStudents(list);
          }
        }
      } catch {
        // Fall back cleanly to mock fixtures if unauthenticated or offline
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-8 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Cohort Overview</h1>
          <p className="text-slate-600 mt-2 text-sm md:text-base">
            Track engagement, monitor hours, and manage your assigned SIWES students.
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        
        {/* Mobile-Only Header */}
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <Link href="/supervisor" className="text-slate-900 text-xl font-bold tracking-wide hover:opacity-80 transition-opacity">
            SIWES<span className="text-teal-500">Flow</span>
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 text-slate-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
            aria-label="Toggle Menu"
          >
            <Menu size={24} />
          </button>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Supervisor Overview</h1>
            <p className="text-slate-600 text-sm mt-1">Manage your assigned students and review pending logs.</p>
          </div>
          
          <DashboardMetrics />
          
          <div className="overflow-x-auto w-full mt-2 rounded-xl shadow-sm border border-slate-200 bg-white">
            <RecentActivityTable logs={logs} students={students} />
          </div>
        </div>
      </main>
    </div>
  );
}