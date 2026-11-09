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
    lastName: "",
    fullName: "Student",
    matriculationNumber: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await apiClient.get("/students/me");
        if (response.data) {
          const data = response.data;
          const u = data.user || {};
          const fName = data.firstName || u.firstName || (u.name ? u.name.split(" ")[0] : "Student");
          const lName = data.lastName || u.lastName || (u.name ? u.name.split(" ").slice(1).join(" ") : "");
          setStudent({
            firstName: fName,
            lastName: lName,
            fullName: `${fName} ${lName}`.trim(),
            matriculationNumber: data.matriculationNumber || data.matricNumber || "",
          });
        }
      } catch {
        if (typeof window !== "undefined") {
          const savedEmail = localStorage.getItem("registered_email");
          if (savedEmail) {
            const prefix = savedEmail.split("@")[0];
            const cleanName = prefix.charAt(0).toUpperCase() + prefix.slice(1);
            setStudent({
              firstName: cleanName,
              lastName: "",
              fullName: cleanName,
              matriculationNumber: "",
            });
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

  const initials = `${student.firstName?.[0] || "S"}${student.lastName?.[0] || ""}`.toUpperCase();

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
              className="h-9 w-auto brightness-0 invert"
              priority
            />
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                  isActive
                    ? "bg-[#0015A4] text-white shadow-sm font-semibold"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-white" : "text-slate-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Card at bottom of sidebar */}
        <div className="p-4 border-t border-blue-900/30">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
            <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-sm shrink-0">
              {initials}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold truncate text-white">{student.fullName}</p>
              <p className="text-[11px] text-slate-400 font-mono truncate">{student.matriculationNumber || "SIWES Student"}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-8 shrink-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Industrial Training System</p>
              <h2 className="text-base font-bold text-slate-800">Student Portal</h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/student/documents/upload"
              className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#0015A4] bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
            >
              <UploadCloud size={16} />
              Quick Upload
            </Link>

            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 p-1.5 rounded-xl hover:bg-slate-50 transition-colors focus:outline-none"
              >
                <div className="h-9 w-9 rounded-full bg-[#0015A4] text-white flex items-center justify-center text-xs font-bold">
                  {initials}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-bold text-slate-800">{student.fullName}</p>
                  <p className="text-[10px] text-slate-400">Student</p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-30 animate-in fade-in">
                  <Link
                    href="/student/profile"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    View Profile
                  </Link>
                  <Link
                    href="/student/progress"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Training Progress
                  </Link>
                  <div className="border-t border-slate-100 my-1" />
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut size={14} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Slide-over Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm">
            <div className="fixed inset-y-0 left-0 w-64 bg-[#04104B] text-white flex flex-col p-4 shadow-xl">
              <div className="flex items-center justify-between pb-6 border-b border-blue-900/30">
                <Image 
                  src="/siwesflow_logo.png" 
                  alt="SIWESFlow" 
                  width={140} 
                  height={35} 
                  className="brightness-0 invert"
                />
                <button onClick={() => setMobileMenuOpen(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <nav className="flex-1 py-6 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center px-4 py-3 text-sm font-medium rounded-xl ${
                        isActive
                          ? "bg-[#0015A4] text-white font-semibold"
                          : "text-slate-300 hover:bg-white/10"
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>

              <button
                onClick={handleLogout}
                className="w-full py-3 px-4 bg-rose-600/20 text-rose-300 rounded-xl text-sm font-semibold flex items-center gap-2 justify-center"
              >
                <LogOut size={16} />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
