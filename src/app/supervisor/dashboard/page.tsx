"use client";

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../../../components/supervisor/Sidebar';
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
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      
      {/* 1. Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* 2. The Sidebar (Off-canvas on mobile, fixed on desktop) */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      {/* 3. Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        
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
