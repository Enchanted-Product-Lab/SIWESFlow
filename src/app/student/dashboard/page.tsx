"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StudentLayout from "@/components/student/StudentLayout";
import apiClient from "@/services/apiClient";
import { 
  Briefcase, BookOpen, LineChart, MapPin, 
  Wifi, ChevronRight, CheckCircle2, ArrowUpRight 
} from "lucide-react";

export default function StudentDashboardPage() {
  const [studentName, setStudentName] = useState("Student");
  const [stats, setStats] = useState({
    activePlacements: 0,
    logbookEntries: 0,
    hoursWorked: 0,
    durationPercentage: 0,
    placementCompany: "No Placement Assigned",
    placementRole: "Awaiting Placement",
    placementLocation: "Not Specified",
    placementMode: "N/A",
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const profileRes = await apiClient.get("/students/me");
        const s = profileRes.data;
        if (s?.firstName) {
          setStudentName(s.firstName);
        } else if (s?.user?.name) {
          setStudentName(s.user.name.split(" ")[0]);
        } else if (s?.fullName) {
          setStudentName(s.fullName.split(" ")[0]);
        }
      } catch {
        if (typeof window !== "undefined") {
          const email = localStorage.getItem("registered_email");
          if (email) {
            const prefix = email.split("@")[0];
            setStudentName(prefix.charAt(0).toUpperCase() + prefix.slice(1));
          }
        }
      }

      try {
        const actRes = await apiClient.get("/activities");
        const actList = Array.isArray(actRes.data) ? actRes.data : (Array.isArray(actRes.data?.data) ? actRes.data.data : []);
        const hours = actList.reduce((sum: number, a: { hoursWorked?: string | number }) => sum + (Number(a.hoursWorked) || 0), 0);
        const pct = actList.length > 0 ? Math.min(100, Math.round((hours / 480) * 100)) : 0;
        setStats((prev) => ({
          ...prev,
          logbookEntries: actList.length,
          hoursWorked: hours,
          durationPercentage: pct,
        }));
      } catch {
        // Safe empty state
      }

      try {
        const placeRes = await apiClient.get("/placements");
        const placeList = Array.isArray(placeRes.data) ? placeRes.data : (Array.isArray(placeRes.data?.data) ? placeRes.data.data : []);
        if (placeList.length > 0) {
          const first = placeList[0];
          setStats((prev) => ({
            ...prev,
            activePlacements: placeList.filter((p: any) => p.status === 'ACTIVE' || p.status === 'APPROVED' || !p.status).length,
            placementCompany: first.company?.name || first.companyName || "Assigned Company",
            placementRole: first.title || first.role || "SIWES Intern",
            placementLocation: first.location || "On-site",
            placementMode: first.workArrangement || first.mode || "Standard",
          }));
        }
      } catch {
        // Safe empty state
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <StudentLayout>
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Greeting */}
          <div>
            <h1 className="text-3xl font-bold text-[#0015A4] mb-1">
              Good morning, {studentName}
            </h1>
            <p className="text-slate-600 text-sm">Here is your SIWES journey at a glance</p>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all">
              <div className="h-10 w-10 bg-blue-50 text-[#0015A4] rounded-lg flex items-center justify-center mb-4">
                <Briefcase className="h-5 w-5" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.activePlacements}</h3>
              <p className="text-slate-600 text-sm font-medium mb-4">Active Placement</p>
              <Link href="/student/placement" className="text-sm text-[#0015A4] font-medium hover:underline inline-flex items-center gap-1">
                View Details <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all">
              <div className="h-10 w-10 bg-blue-50 text-[#0015A4] rounded-lg flex items-center justify-center mb-4">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.logbookEntries}</h3>
              <p className="text-slate-600 text-sm font-medium mb-4">Logbook Entries</p>
              <Link href="/student/logbook" className="text-sm text-[#0015A4] font-medium hover:underline inline-flex items-center gap-1">
                View Details <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between hover:border-slate-200 transition-all">
              <div className="h-10 w-10 bg-blue-50 text-[#0015A4] rounded-lg flex items-center justify-center mb-4">
                <LineChart className="h-5 w-5" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-1">{stats.durationPercentage}%</h3>
              <p className="text-slate-600 text-sm font-medium mb-4">SIWES Duration</p>
              <Link href="/student/progress" className="text-sm text-[#0015A4] font-medium hover:underline inline-flex items-center gap-1">
                View Details <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>

          {/* Current Placement Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900">Current Placement</h2>
              <Link href="/student/placement" className="text-sm text-[#0015A4] font-medium hover:underline">
                View all
              </Link>
            </div>
            
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 bg-indigo-50 text-[#0015A4] rounded-xl flex items-center justify-center shrink-0">
                <Briefcase className="h-7 w-7" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{stats.placementCompany}</h3>
                <p className="text-sm text-slate-500 mb-3">{stats.placementRole}</p>
                
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 text-slate-400" />
                    {stats.placementLocation}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-4 w-4 text-slate-400" />
                    {stats.placementMode}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Action Shortcuts */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/student/logbook"
              className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0015A4] transition-colors">
                  Log Today&apos;s Training
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Submit daily activities for supervisor approval</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#0015A4] group-hover:translate-x-1 transition-all" />
            </Link>

            <Link
              href="/student/documents/upload"
              className="p-5 rounded-2xl bg-white border border-slate-100 hover:border-slate-300 transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#0015A4] transition-colors">
                  Upload SIWES Documents
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">Submit acceptance letter or logbook extract</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-[#0015A4] group-hover:translate-x-1 transition-all" />
            </Link>
          </div>

        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Progress Widget */}
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <h3 className="text-[#0015A4] font-medium mb-6">Your Progress</h3>
            
            {/* Circular Progress Ring */}
            <div className="relative h-32 w-32 mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                <circle 
                  cx="50" cy="50" r="40" 
                  stroke="#0015A4" 
                  strokeWidth="8" 
                  fill="none" 
                  strokeDasharray="251.2" 
                  strokeDashoffset={251.2 - (251.2 * (stats.durationPercentage / 100))} 
                  strokeLinecap="round" 
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xl font-bold text-slate-900">{stats.durationPercentage}%</span>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-6 leading-relaxed">
              Complete your logbook and get closer to your SIWES completion
            </p>
            <Link 
              href="/student/progress"
              className="w-full py-2.5 px-4 bg-indigo-50 text-[#0015A4] rounded-lg text-sm font-medium border border-[#0015A4]/20 hover:bg-indigo-100 transition-colors inline-block text-center"
            >
              View progress
            </Link>
          </div>

          {/* Motivation Widget */}
          <div className="bg-[#EEF2FF] p-6 rounded-2xl border border-indigo-100">
            <h3 className="text-[#0015A4] font-bold text-lg mb-2">Keep going!</h3>
            <p className="text-slate-700 text-sm leading-relaxed">
              You are doing great. Every logged day brings you closer to your SIWES certification.
            </p>
          </div>

        </div>
      </div>
    </StudentLayout>
  );
}
