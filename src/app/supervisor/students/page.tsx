"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState, useEffect } from 'react';
import { Menu, Loader2 } from 'lucide-react';
import Sidebar from '../../../components/supervisor/Sidebar';
import AssignedStudentTable, { AssignedStudent } from '../../../components/supervisor/AssignedStudentTable';
import apiClient from '../../../services/apiClient';

export default function StudentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [tableData, setTableData] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAssignedStudents() {
      try {
        const [stuRes, actRes] = await Promise.allSettled([
          apiClient.get('/students'),
          apiClient.get('/activities'),
        ]);

        const rawStus = stuRes.status === 'fulfilled' ? stuRes.value.data : null;
        const stuList: any[] = Array.isArray(rawStus) ? rawStus : (Array.isArray(rawStus?.data) ? rawStus.data : (Array.isArray(rawStus?.students) ? rawStus.students : []));

        const rawActs = actRes.status === 'fulfilled' ? actRes.value.data : null;
        const actList: any[] = Array.isArray(rawActs) ? rawActs : (Array.isArray(rawActs?.data) ? rawActs.data : []);

        const mapped: AssignedStudent[] = stuList.map((student: any) => {
          const studentLogs = actList.filter((log: any) => log.studentId === student.id);
          const latestLog = [...studentLogs].sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

          const hasPendingLogs = studentLogs.some((log: any) => String(log.status).toLowerCase() === 'pending');
          const hasApprovedHours = studentLogs.some((log: any) => String(log.status).toLowerCase() === 'approved' && Number(log.hoursWorked) > 0);

          let currentStatus: 'Active' | 'Pending Review' | 'At Risk' = 'Active';
          if (hasPendingLogs) {
            currentStatus = 'Pending Review';
          } else if (!hasApprovedHours && studentLogs.length === 0) {
            currentStatus = 'At Risk';
          }

          const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim() || student.name || student.studentCode || 'Student';

          return {
            id: student.id,
            name: fullName,
            department: student.department || 'General',
            level: student.level ? String(student.level) : '300',
            status: currentStatus,
            lastLogDate: latestLog?.date ? String(latestLog.date).slice(0, 10) : 'No logs yet',
          };
        });

        setTableData(mapped);
      } catch (err) {
        console.error('Failed to load assigned students:', err);
      } finally {
        setLoading(false);
      }
    }

    loadAssignedStudents();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div 
        className={`fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <Link href="/supervisor/dashboard" className="text-slate-900 text-xl font-bold tracking-wide hover:opacity-80 transition-opacity">
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

        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Assigned Students</h1>
              <p className="text-slate-500 text-sm mt-1">Manage and track students currently under your supervision.</p>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center">
              <Loader2 className="animate-spin text-teal-600 h-8 w-8 mb-3" />
              <p className="text-slate-500 text-sm">Loading assigned students...</p>
            </div>
          ) : tableData.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center flex flex-col items-center">
              <p className="text-slate-500 text-sm">No assigned students found on your roster.</p>
            </div>
          ) : (
            <AssignedStudentTable students={tableData} />
          )}
        </div>
      </main>
    </div>
  );
}
