"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, User, Briefcase, BookOpen, 
  LineChart, FileText, Bell, ChevronDown, 
  Menu, X, LogOut, UploadCloud
} from "lucide-react";
import apiClient from "@/services/apiClient";

interface StudentLayoutProps {
  children: React.ReactNode;
}

interface StudentUser {
  firstName?: string;
  lastName?: string;
  fullName?: string;
  matriculationNumber?: string;
}

export default function StudentLayout({ children }: StudentLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [student, setStudent] = useState<StudentUser>({
    firstName: "Student",
    lastName: "User",
    fullName: "Student User",
    matriculationNumber: "SF-2026",
  });

  useEffect(() => {
    // Attempt to load student profile for real initials and name
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/students/me");
        if (response.data) {
          const data = response.data;
          setStudent({
            firstName: data.firstName || "Student",
            lastName: data.lastName || "User",
            fullName: `${data.firstName || "Student"} ${data.lastName || "User"}`.trim(),
            matriculationNumber: data.matriculationNumber || "SF-2026",
          });
        }
      } catch {
        // Fallback to localStorage email or mock default
        if (typeof window !== "undefined") {
          const savedEmail = localStorage.getItem("registered_email");
          if (savedEmail) {
            const prefix = savedEmail.split("@")[0];
            setStudent((prev) => ({
              ...prev,
              firstName: prefix.charAt(0).toUpperCase() + prefix.slice(1),
              fullName: prefix.charAt(0).toUpperCase() + prefix.slice(1),
            }));
          }
        }
      }
    };

    fetchProfile();
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("siwesflow_token");
      localStorage.removeItem("registered_email");
    }
    router.push("/auth/login");
  };

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/student/dashboard" },
    { name: "My Profile", icon: User, href: "/student/profile" },
    { name: "Placement", icon: Briefcase, href: "/student/placement" },
    { name: "Logbook", icon: BookOpen, href: "/student/logbook" },
    { name: "Progress", icon: LineChart, href: "/student/progress" },
    { name: "Documents", icon: FileText, href: "/student/documents" },
  ];

  const initials = `${student.firstName?.[0] || "S"}${student.lastName?.[0] || "U"}`.toUpperCase();

  return (
    <div className="flex h-screen bg-[#F8F9FB] font-sans overflow-hidden">
      
      {/* Sidebar - Desktop Only */}
      <aside className="w-64 bg-[#04104B] text-white flex flex-col hidden md:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-blue-900/30">
          <Link href="/student/dashboard" className="flex items-center">
            <Image 
              src="/siwesflow_logo.png" 
              alt="SIWESFlow" 
              width={160} 
              height={40} 
              className="h-8 w-auto object-contain brightness-0 invert" 
              priority 
            />
          </Link>
        </div>
        <nav className="flex-1 py-6 flex flex-col gap-1.5 px-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                  isActive 
                    ? "bg-[#0015A4] text-white shadow-sm" 
                    : "text-slate-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Upload quick CTA */}
        <div className="p-4 border-t border-blue-950/40">
          <Link
            href="/student/documents/upload"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 bg-white/10 hover:bg-white/15 text-white rounded-lg text-xs font-semibold transition-colors"
          >
            <UploadCloud className="h-4 w-4" />
            Upload Document
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 bg-[#04104B] text-white flex flex-col h-full z-10 p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-6 border-b border-blue-900/40">
              <Image 
                src="/siwesflow_logo.png" 
                alt="SIWESFlow" 
                width={140} 
                height={35} 
                className="h-7 w-auto object-contain brightness-0 invert" 
              />
              <button 
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 py-6 flex flex-col gap-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3.5 px-4 py-3 rounded-xl transition-all font-medium text-sm ${
                      isActive 
                        ? "bg-[#0015A4] text-white" 
                        : "text-slate-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-rose-300 hover:bg-rose-500/10 rounded-xl text-sm font-medium mt-auto"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      )}

      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 sm:px-8 shrink-0">
          
          {/* Mobile Logo & Hamburger */}
          <div className="flex items-center gap-3 md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="text-slate-600 hover:text-slate-900 p-1.5 rounded-lg hover:bg-slate-100"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Image
              src="/siwesflow_dark.png"
              alt="SIWESFlow"
              width={130}
              height={32}
              className="h-6 w-auto object-contain"
              priority
            />
          </div>

          <div className="hidden md:block flex-1"></div> 

          {/* User actions */}
          <div className="flex items-center gap-5">
            <button 
              aria-label="Notifications"
              className="text-slate-500 hover:text-slate-700 relative p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-rose-500 rounded-full"></span>
            </button>

            {/* Profile Pill & Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 pl-4 border-l border-slate-200 text-left focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-[#04104B] text-white flex items-center justify-center font-semibold text-xs tracking-wider">
                  {initials}
                </div>
                <div className="hidden sm:block">
                  <p className="text-sm font-semibold text-slate-900 leading-tight">
                    {student.fullName || "Student"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {student.matriculationNumber || "Student"}
                  </p>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400 ml-1" />
              </button>

              {dropdownOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-20" 
                    onClick={() => setDropdownOpen(false)} 
                  />
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-30 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{student.fullName}</p>
                    </div>
                    <Link
                      href="/student/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <User className="h-4 w-4 text-slate-400" />
                      My Profile
                    </Link>
                    <Link
                      href="/student/documents/upload"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 font-medium"
                    >
                      <UploadCloud className="h-4 w-4 text-slate-400" />
                      Upload Document
                    </Link>
                    <div className="border-t border-slate-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-2.5 w-full text-left px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 font-medium"
                    >
                      <LogOut className="h-4 w-4 text-rose-500" />
                      Sign Out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard / View Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
