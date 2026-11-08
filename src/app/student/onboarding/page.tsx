"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { User, Phone, BookOpen, Building2, GraduationCap, Calendar, Loader2 } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import axios from 'axios';

export default function StudentOnboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Updated data model to include all fields from the mockup + PRD requirements
  const [formData, setFormData] = useState({
    fullName: '',
    matricNumber: '',
    phoneNumber: '',
    department: '',
    level: '300',
    siwesStartDate: '',
    siwesEndDate: ''
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedName = localStorage.getItem('siwesflow_pending_name');
      if (savedName) {
        setFormData((prev) => ({ ...prev, fullName: savedName }));
      }
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleNext = () => {
    if (!formData.fullName || !formData.matricNumber || !formData.phoneNumber) {
      setError('Please fill in all details to continue.');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.department || !formData.siwesStartDate || !formData.siwesEndDate) {
      setError('Please provide the remaining details.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Send the completed profile data to the backend
      await apiClient.put('/student/profile', formData);
      
      // Once onboarding is saved, route them to the document upload step
      router.push('/student/documents/upload');
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to save profile. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Header */}
      <header className="w-full bg-white border-b border-slate-200 py-4 px-6 sm:px-12 flex items-center shadow-sm">
        <Image 
          src="/siwesflow_dark.png" 
          alt="SIWESFlow" 
          width={180} 
          height={50} 
          className="h-10 w-auto object-contain" 
          priority 
        />
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-center p-6 sm:p-12 md:p-16 gap-12 lg:gap-24">
        
        {/* Left Column - Form Area */}
        <div className="w-full md:w-1/2 max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-[#0015A4] mb-3">
              {step === 1 ? 'Welcome to SIWESFlow!' : 'Almost done!'}
            </h1>
            <p className="text-slate-400 text-lg">
              {step === 1 ? "Let's get you setup." : "Just a few more academic details."}
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
            
            {/* Step 1 Fields (Matching the Mockup) */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-left-4 duration-500">
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#0015A4]">Full Name</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-300" />
                    </div>
                    <input
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors bg-white outline-none"
                      placeholder="enter your full name"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#0015A4]">Matric Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <BookOpen className="h-5 w-5 text-slate-300" />
                    </div>
                    <input
                      name="matricNumber"
                      type="text"
                      required
                      value={formData.matricNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors bg-white outline-none"
                      placeholder="enter your matric number"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#0015A4]">Phone Number</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-5 w-5 text-slate-300" />
                    </div>
                    <input
                      name="phoneNumber"
                      type="tel"
                      required
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors bg-white outline-none"
                      placeholder="enter your phone number"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full mt-8 flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0015A4] hover:bg-blue-900 transition-colors"
                >
                  Continue
                </button>
              </div>
            )}

            {/* Step 2 Fields (SIWES & Department) */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
                
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#0015A4]">Department</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building2 className="h-5 w-5 text-slate-300" />
                    </div>
                    <input
                      name="department"
                      type="text"
                      required
                      value={formData.department}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors bg-white outline-none"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-[#0015A4]">Level</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <GraduationCap className="h-5 w-5 text-slate-300" />
                    </div>
                    <select
                      name="level"
                      value={formData.level}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors bg-white outline-none appearance-none"
                    >
                      <option value="200">200 Level (ND)</option>
                      <option value="300">300 Level (Degree)</option>
                      <option value="400">400 Level</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#0015A4]">Start Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-slate-300" />
                      </div>
                      <input
                        name="siwesStartDate"
                        type="date"
                        required
                        value={formData.siwesStartDate}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-2 py-3 text-sm border border-slate-200 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors bg-white outline-none text-slate-600"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-[#0015A4]">End Date</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-slate-300" />
                      </div>
                      <input
                        name="siwesEndDate"
                        type="date"
                        required
                        value={formData.siwesEndDate}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-2 py-3 text-sm border border-slate-200 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors bg-white outline-none text-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 mt-8 pt-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="w-1/3 py-3.5 px-4 border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-2/3 flex justify-center items-center py-3.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0015A4] hover:bg-blue-900 transition-colors disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Save & Continue'}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>

        {/* Right Column - Highlight Box (Matching Mockup) */}
        <div className="hidden md:flex w-full md:w-1/2 min-h-[450px] bg-[#EEF2FF] rounded-2xl p-12 lg:p-16 flex-col justify-center shadow-inner border border-[#E0E7FF]">
          <h2 className="text-[#0015A4] text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight">
            Join 500+<br />
            students<br />
            managing<br />
            their SIWES<br />
            Journey
          </h2>
        </div>

      </main>
    </div>
  );
}
