"use client";

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import AssignedStudentTable, { AssignedStudent } from '../../../components/supervisor/AssignedStudentTable';
import apiClient from '../../../services/apiClient';

// Define strict interfaces for the expected raw backend data
interface RawStudentData {
  id: string | number;
  firstName?: string;
  lastName?: string;
  name?: string;
  studentCode?: string;
  department?: string;
  level?: string | number;
}

interface RawActivityData {
  studentId: string | number;
  date: string;
  status: string;
  hoursWorked: string | number;
}

export default function StudentsPage() {
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
        // Strictly type the fallback extraction
        const stuList: RawStudentData[] = Array.isArray(rawStus) 
          ? rawStus 
          : (Array.isArray(rawStus?.data) ? rawStus.data : (Array.isArray(rawStus?.students) ? rawStus.students : []));

        const rawActs = actRes.status === 'fulfilled' ? actRes.value.data : null;
        // Strictly type the fallback extraction
        const actList: RawActivityData[] = Array.isArray(rawActs) 
          ? rawActs 
          : (Array.isArray(rawActs?.data) ? rawActs.data : []);

        const mapped: AssignedStudent[] = stuList.map((student: RawStudentData) => {
          const studentLogs = actList.filter((log: RawActivityData) => log.studentId === student.id);
          
          const latestLog = [...studentLogs].sort((a: RawActivityData, b: RawActivityData) => 
            new Date(b.date).getTime() - new Date(a.date).getTime()
          )[0];

          const hasPendingLogs = studentLogs.some((log: RawActivityData) => 
            String(log.status).toLowerCase() === 'pending'
          );
          
          const hasApprovedHours = studentLogs.some((log: RawActivityData) => 
            String(log.status).toLowerCase() === 'approved' && Number(log.hoursWorked) > 0
          );

          // Retained your strict TypeScript union type fix
          let currentStatus: 'Active' | 'Pending Review' | 'At Risk' = 'Active';
          if (hasPendingLogs) {
            currentStatus = 'Pending Review';
          } else if (!hasApprovedHours && studentLogs.length === 0) {
            currentStatus = 'At Risk';
          }

          const fullName = [student.firstName, student.lastName].filter(Boolean).join(' ').trim() 
            || student.name 
            || student.studentCode 
            || 'Student';

          return {
            id: String(student.id),
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
    <div className="w-full font-sans">
      <div className="mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-slate-900">My Students</h1>
        <p className="text-slate-600 text-sm mt-1">Manage and track students currently under your supervision.</p>
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
  );
}