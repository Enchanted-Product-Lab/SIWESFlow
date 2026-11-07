"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LayoutDashboard, User, Briefcase, BookOpen, 
  LineChart, FileText, Bell, ChevronDown, 
  MapPin, Wifi, Menu
} from 'lucide-react';

export default function StudentDashboardShell() {
  const navItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: true, href: '/student/dashboard' },
    { name: 'My Profile', icon: User, active: false, href: '/student/profile' },
    { name: 'Placement', icon: Briefcase, active: false, href: '/student/placement' },
    { name: 'Logbook', icon: BookOpen, active: false, href: '/student/logbook' },
    { name: 'Progress', icon: LineChart, active: false, href: '/student/progress' },
    { name: 'Documents', icon: FileText, active: false, href: '/student/documents' },
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans overflow-hidden">
      
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 bg-[#04104B] text-white flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-blue-900/30">
          <Image 
            src="/siwesflow_logo.png" 
            alt="SIWESFlow" 
            width={160} 
            height={40} 
            className="h-8 w-auto object-contain brightness-0 invert" 
            priority 
          />
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-2 px-4">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                item.active 
                  ? 'bg-[#0015A4] text-white' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0">
          
          {/* Mobile Logo & Menu (Hidden on Desktop) */}
          <div className="flex-1 flex md:hidden items-center gap-4">
            <button className="text-slate-500 hover:text-slate-900">
              <Menu className="h-6 w-6" />
            </button>
            <Image
              src="/siwesflow_dark.png"
              alt="SIWESFlow"
              width={140}
              height={36}
              className="h-7 w-auto object-contain"
              priority
            />
          </div>

          {/* Desktop Spacer */}
          <div className="hidden md:block flex-1"></div> 

          <div className="flex items-center gap-6">
            <button className="text-slate-500 hover:text-slate-700 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-rose-500 rounded-full"></span>
            </button>
            <div className="flex items-center gap-3 cursor-pointer pl-4 border-l border-slate-200">
              <div className="h-9 w-9 rounded-full bg-[#04104B] text-white flex items-center justify-center font-semibold text-sm">
                LS
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-900 leading-tight">Ladele Simi</p>
                <p className="text-xs text-slate-500">Student</p>
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left Column (Spans 2/3 on large screens) */}
            <div className="lg:col-span-2 space-y-8">
              
              {/* Greeting */}
              <div>
                <h1 className="text-3xl font-bold text-[#0015A4] mb-2 decoration-[#0015A4]">
                  Good morning, Ladele
                </h1>
                <p className="text-slate-600 text-sm lg:text-base">Here&apos;s your SIWES journey at a glance</p>
              </div>

              {/* Stats Cards Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="h-10 w-10 bg-blue-50 text-[#0015A4] rounded-lg flex items-center justify-center mb-4">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">1</h3>
                  <p className="text-slate-600 text-sm font-medium mb-4">Active Placements</p>
                  <Link href="#" className="text-sm text-[#0015A4] font-medium hover:underline">View Details</Link>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="h-10 w-10 bg-blue-50 text-[#0015A4] rounded-lg flex items-center justify-center mb-4">
                    <BookOpen className="h-5 w-5" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">3</h3>
                  <p className="text-slate-600 text-sm font-medium mb-4">Logbook Entries</p>
                  <Link href="#" className="text-sm text-[#0015A4] font-medium hover:underline">View Details</Link>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
                  <div className="h-10 w-10 bg-blue-50 text-[#0015A4] rounded-lg flex items-center justify-center mb-4">
                    <LineChart className="h-5 w-5" />
                  </div>
                  <h3 className="text-3xl font-bold text-slate-900 mb-1">40%</h3>
                  <p className="text-slate-600 text-sm font-medium mb-4">SIWES Duration</p>
                  <Link href="#" className="text-sm text-[#0015A4] font-medium hover:underline">View Details</Link>
                </div>
              </div>

              {/* Current Placement Section */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-slate-900">Current Placement</h2>
                  <Link href="#" className="text-sm text-[#0015A4] font-medium hover:underline">View all</Link>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 bg-indigo-50 text-indigo-900 rounded-xl flex items-center justify-center shrink-0">
                    <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2L2 7l10 5 10-5-10-5zm0 7.5l-6-3v7.5l6 3 6-3v-7.5l-6 3z"/>
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">TechNova Solutions</h3>
                    <p className="text-sm text-slate-500 mb-3">Frontend Development Intern</p>
                    
                    <div className="flex items-center gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4 text-slate-400" />
                        Lagos, Nigeria
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Wifi className="h-4 w-4 text-slate-400" />
                        Remote
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column (Spans 1/3 on large screens) */}
            <div className="space-y-6">
              
              {/* Progress Widget */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center text-center">
                <h3 className="text-[#0015A4] font-medium mb-6">Your Progress</h3>
                
                {/* Circular Progress Ring */}
                <div className="relative h-32 w-32 mb-6">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Circle */}
                    <circle cx="50" cy="50" r="40" stroke="#E2E8F0" strokeWidth="8" fill="none" />
                    {/* Progress Circle (60%) */}
                    <circle 
                      cx="50" cy="50" r="40" 
                      stroke="#0015A4" 
                      strokeWidth="8" 
                      fill="none" 
                      strokeDasharray="251.2" 
                      strokeDashoffset={251.2 - (251.2 * 0.6)} 
                      strokeLinecap="round" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-slate-900">60%</span>
                  </div>
                </div>

                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  Complete your logbook and get closer to your SIWES completion
                </p>
                <button className="w-full py-2.5 px-4 bg-indigo-50 text-[#0015A4] rounded-lg text-sm font-medium border border-[#0015A4]/20 hover:bg-indigo-100 transition-colors">
                  View progress
                </button>
              </div>

              {/* Motivation Widget */}
              <div className="bg-[#EEF2FF] p-6 rounded-2xl border border-indigo-100">
                <h3 className="text-[#0015A4] font-bold text-lg mb-2">Keep going!</h3>
                <p className="text-slate-700 text-sm leading-relaxed">
                  you&apos;re doing great. Every step brings you closer to your goals
                </p>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}