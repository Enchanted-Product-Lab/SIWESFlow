"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, Lock, User, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import apiClient from '../../../services/apiClient';

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({ 
    fullName: '',
    email: '', 
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic frontend validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      setIsLoading(false);
      return;
    }
    
    if (formData.password.length < 12) {
      setError('Password must be at least 12 characters long.');
      setIsLoading(false);
      return;
    }

    try {
      if (formData.fullName && typeof window !== 'undefined') {
        localStorage.setItem('siwesflow_pending_name', formData.fullName);
      }

      // Live API call to the backend staging server
      await apiClient.post('/auth/register', {
        email: formData.email,
        password: formData.password,
      });

      // If the request succeeds without throwing an error, trigger the success screen
      setIsSuccess(true);

    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Registration failed. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during registration.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      
      {/* Left Column - Branding Banner (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0015A4] text-white flex-col justify-between relative overflow-hidden px-12 pt-12">
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-blue-900/50 to-transparent z-0"></div>
        
        <div className="z-10">
          <div className="flex items-center gap-3">
            <Image 
              src="/siwesflow_logo.png" 
              alt="SIWESFlow" 
              width={240} 
              height={75} 
              className="h-auto w-[240px] object-contain" 
              priority 
            />
          </div>

          <div className="mt-20">
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Kickstart<br />
              your career<br />
              today.
            </h2>
            <p className="text-lg text-white max-w-sm leading-relaxed">
              Join thousands of students securing verified industrial training placements.
            </p>
          </div>
        </div>

        {/* Student Image & Footer */}
        <div className="z-1 mt-auto relative">
          <div className="h-64 w-full relative mt-8">
            <Image 
              src="/login-image.png" 
              alt="SIWESFlow Student" 
              width={400} 
              height={400} 
              className="absolute bottom-0 left-0 w-full h-auto object-contain object-bottom opacity-90" 
              priority 
            />
          </div>
          <div className="pb-8 pt-4 border-t border-blue-800/50 relative z-20">
            <p className="text-xs text-blue-100">Powered by Enchanted Digital Academy</p>
          </div>
        </div>
      </div>

      {/* Right Column - Register Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md">
          
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="flex justify-center">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900">Check your email</h2>
              <p className="text-slate-600 leading-relaxed">
                We&apos;ve sent a verification link to <span className="font-semibold text-slate-900">{formData.email}</span>. 
                Please click the link to verify your account and continue your onboarding.
              </p>
              <Link 
                href="/auth/login"
                className="inline-block mt-4 w-full py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
              >
                Back to Login
              </Link>
            </div>
          ) : (
            <>
              <div className="mb-10">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Create an account</h2>
                <p className="text-slate-500">Sign up to start your SIWES journey.</p>
              </div>

              <form className="space-y-5" onSubmit={handleRegister}>
                {error && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="fullName" className="block text-sm font-medium text-slate-700">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleChange}
                      className="block w-full pl-11 py-3 text-sm border text-slate-700 border-slate-300 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors"
                      placeholder="e.g. David Ibrahim"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full text-slate-600 pl-11 py-3 text-sm border border-slate-300 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-slate-700">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-11 pr-11 py-3 text-sm border border-slate-300 rounded-lg text-slate-600 focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors"
                      placeholder="Create a password (min. 12 chars)"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      ) : (
                        <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="block w-full pl-11 py-3 text-sm border text-slate-700 border-slate-300 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors"
                      placeholder="Confirm your password"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0015A4] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0015A4] transition-colors disabled:opacity-70 mt-4"
                >
                  {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Create Account'}
                </button>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white text-slate-400 font-medium">or</span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    className="w-full flex justify-center items-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>
                </div>
              </div>

              <p className="mt-8 text-center text-sm text-slate-600">
                Already have an account?{' '}
                <Link className="font-medium text-[#0015A4] hover:underline" href="/auth/login">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
