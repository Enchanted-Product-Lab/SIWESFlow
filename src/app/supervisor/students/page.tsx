"use client";

import React from 'react';
import AssignedStudentTable, { AssignedStudent } from '../../../components/supervisor/AssignedStudentTable';
import { mockStudents, mockActivityLogs } from '../../../data/mock';

export default function StudentsPage() {
  // Transform mock data to fit the table's expected interface
  const tableData: AssignedStudent[] = mockStudents.map((student) => {
    // Get all logs for this specific student
    const studentLogs = mockActivityLogs.filter((log) => log.studentId === student.id);
    
    // Find the most recent log date
    const latestLog = studentLogs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
    
    // Calculate metrics for status determination
    const hasPendingLogs = studentLogs.some((log) => log.status === 'pending');
    const hasApprovedHours = studentLogs.some((log) => log.status === 'approved' && log.hoursWorked > 0);

    // FIX: Explicitly type the union so TypeScript doesn't widen it to a generic 'string'
    let currentStatus: "Active" | "Pending Review" | "At Risk" = 'Active';
    
    if (hasPendingLogs) {
      currentStatus = 'Pending Review'; 
    } else if (!hasApprovedHours) {
      currentStatus = 'At Risk'; 
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
    <div className="w-full font-sans">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Students</h1>
        <p className="text-slate-600 text-sm mt-1">Manage and review your assigned cohort.</p>
      </div>
      
      {/* Renders your existing table component with the enriched data */}
      <AssignedStudentTable students={tableData} />
    </div>
  );
}