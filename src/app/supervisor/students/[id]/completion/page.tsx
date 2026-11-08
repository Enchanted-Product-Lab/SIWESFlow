import React from 'react';
import Link from 'next/link';
import { mockStudents, mockActivityLogs } from '../../../../../data/mock';
import { ArrowLeft } from 'lucide-react';
import CompletionVerification from '../../../../../components/supervisor/CompletionVerification';

export default async function CompletionPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params;
  
  const student = mockStudents.find((s) => s.id === id);
  // Calculate total hours from mock logs
  const studentLogs = mockActivityLogs.filter((log) => log.studentId === id && log.status === 'approved');
  const totalHours = studentLogs.reduce((acc, log) => acc + log.hoursWorked, 0);

  if (!student) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-slate-600">Student not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-12 font-sans">
      <header className="bg-white border-b border-slate-200 px-6 py-6 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <Link href={`/supervisor/students/${student.id}`} className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-siwes-blue mb-4 transition-colors">
            <ArrowLeft size={16} className="mr-1" /> Back to Student Profile
          </Link>
          
          <h1 className="text-2xl font-bold text-slate-900">Program Completion Sign-Off</h1>
          <p className="text-slate-600 mt-1 text-sm">
            Final evaluation for <span className="font-semibold text-slate-900">{student.name}</span>
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 mt-8">
        {/* Mount the component we just built */}
        <CompletionVerification 
          studentName={student.name}
          matricNumber={student.matricNumber || student.id}
          totalHoursLogged={totalHours > 0 ? totalHours : 960} // Forcing 960 for UI testing if mock data is low
        />
      </main>
    </div>
  );
}