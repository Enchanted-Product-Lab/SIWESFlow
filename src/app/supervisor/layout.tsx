"use client";

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import SupervisorNavigation from '@/components/supervisor/SupervisorNavigation';
import Image from 'next/image';

export default function SupervisorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans">
      
      {/* 1. Mobile Top Header (Visible only on screens smaller than lg) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-[#07145c] text-white flex items-center justify-between px-4 z-50">
        <Image
          src="/favicon.png"
          alt="SIWESFlow"
          width={130}
          height={40}
          className="h-auto w-[130px] object-contain"
          priority
        />
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 -mr-2 hover:bg-white/10 rounded-lg transition-colors"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* 2. Mobile Backdrop Overlay (Click outside to close) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* 3. Sidebar Drawer */}
      <div 
        className={`
          fixed inset-y-0 left-0 z-50 w-64 lg:w-56 shrink-0 
          transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 lg:static
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <SupervisorNavigation />
      </div>

      {/* 4. Main Content Area */}
      {/* Added pt-16 on mobile to push content below the fixed header */}
      <main className="flex-1 w-full overflow-y-auto pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
      
    </div>
  );
}