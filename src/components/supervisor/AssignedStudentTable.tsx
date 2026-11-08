"use client";

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Eye, FileText, AlertCircle, Search, Filter, Inbox } from 'lucide-react';

export interface AssignedStudent {
  id: string;
  name: string;
  department: string;
  level: string;
  status: 'Active' | 'Pending Review' | 'At Risk';
  lastLogDate: string;
}

interface AssignedStudentTableProps {
  students: AssignedStudent[];
}

export default function AssignedStudentTable({ students }: AssignedStudentTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  // Memoize filtered results so we don't recalculate on every render
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            student.department.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || student.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [students, searchQuery, statusFilter]);

  const getStatusBadge = (status: AssignedStudent['status']) => {
    switch (status) {
      case 'Active':
        return <span className="px-2.5 py-1 text-xs font-medium bg-teal-50 text-teal-700 rounded-full border border-teal-100">Active</span>;
      case 'Pending Review':
        return <span className="px-2.5 py-1 text-xs font-medium bg-amber-50 text-amber-700 rounded-full border border-amber-100">Pending</span>;
      case 'At Risk':
        return <span className="px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-700 rounded-full border border-rose-100 flex items-center gap-1 w-fit"><AlertCircle size={12} /> At Risk</span>;
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
      {/* Table Header & Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50 space-y-4 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-800">Assigned Students</h2>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border border-slate-200 text-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-full sm:w-64"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-9 pr-8 py-2 text-sm border text-slate-500 border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 appearance-none bg-white cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Pending Review">Pending Review</option>
              <option value="At Risk">At Risk</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
              <th scope="col" className="px-6 py-4 font-semibold">Student Details</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4 font-semibold">Last Log</th>
              <th scope="col" className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">{student.name}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{student.department} • {student.level}</p>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(student.status)}</td>
                  <td className="px-6 py-4 text-sm text-slate-600 font-medium">{student.lastLogDate}</td>
                  <td className="px-6 py-4 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link 
                      href={`/supervisor/students/${student.id}`}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors" 
                      aria-label={`View ${student.name}'s profile`}
                    >
                      <Eye size={18} />
                    </Link>
                    <Link 
                      href={`/supervisor/students/${student.id}/logbook`}
                      className="p-2 text-slate-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors" 
                      aria-label={`Review ${student.name}'s logbook`}
                    >
                      <FileText size={18} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center text-slate-400">
                    <Inbox size={40} className="mb-3 opacity-50" />
                    <p className="text-slate-700 font-medium">No students found</p>
                    <p className="text-sm mt-1">Adjust your search or filter criteria.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}