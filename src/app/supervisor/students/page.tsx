"use client";

import Link from 'next/link';
import Image from 'next/image';
import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../../../components/supervisor/Sidebar';
import AssignedStudentTable, { AssignedStudent } from '../../../components/supervisor/AssignedStudentTable';
import { mockStudents, mockActivityLogs } from '../../../data/mock';

export default function StudentsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Transform mock data to fit the table's expected interface
  const tableData: AssignedStudent[] = mockStudents.map((student) => {
    // Get all logs for this specific student
    const studentLogs = mockActivityLogs.filter((log) => log.studentId === student.id);
    
    // Find the most recent log date
    const latestLog = studentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    // Calculate metrics for status determination
    const hasPendingLogs = studentLogs.some((log) => log.status === 'pending');
    const hasApprovedHours = studentLogs.some((log) => log.status === 'approved' && log.hoursWorked > 0);

    // CORRECTED PRIORITY: Pending Review > At Risk > Active
    let currentStatus = 'Active';
    if (hasPendingLogs) {
      currentStatus = 'Pending Review'; // Top priority: requires supervisor action
    } else if (!hasApprovedHours) {
      currentStatus = 'At Risk'; // Secondary: no pending logs AND no approved hours
    }

    return {
      id: student.id,
      name: student.name,
      department: student.department,
      level: student.level,
      status: currentStatus,
      lastLogDate: latestLog ? latestLog.date : 'No logs yet',
    };
  });

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans overflow-hidden">
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-30 transform md:relative md:translate-x-0 transition-transform duration-300 ease-in-out flex-shrink-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <Sidebar />
      </div>

      <main className="flex-1 flex flex-col h-screen overflow-y-auto w-full">
        <div className="md:hidden bg-siwes-blue border-b border-blue-900 px-4 py-3 flex items-center justify-between sticky top-0 z-10 shadow-sm">
          <Link href="/supervisor/dashboard" className="transition-opacity hover:opacity-80">
            <Image 
              src="/SIWESFlow_logo.png" 
              alt="SIWESFlow Logo" 
              width={140} 
              height={40} 
              className="object-contain brightness-0 invert" 
              priority
            />
          </Link>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -mr-2 text-white hover:bg-blue-800/50 rounded-lg transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>

        <div className="p-4 md:p-8 w-full max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Students</h1>
            <p className="text-slate-600 text-sm mt-1">Manage and review your assigned cohort.</p>
          </div>
          
          {/* Renders your existing table component with the enriched data */}
          <AssignedStudentTable students={tableData} />
        </div>
      </main>
    </div>
  );
}