"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Sprint 1 Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (formData.email && formData.password) {
        localStorage.setItem('siwesflow_auth_token', 'mock_jwt_token_12345');
        router.push('/student/dashboard');
      } else {
        throw new Error('Please enter your credentials.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex font-sans bg-white">
      
      {/* Left Column - Branding Banner (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-5/12 bg-[#0015A4] text-white flex-col justify-between relative overflow-hidden px-12 pt-12">
        {/* Abstract Background Shapes (Optional CSS decoration based on mockup) */}
        <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-blue-900/50 to-transparent z-0"></div>
        
        <div className="z-10">
          <div className="flex items-center gap-3">
            {/* Logo Icon SVG */}
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
              Your<br />
              SIWES journey<br />
              starts here.
            </h2>
            <p className="text-lg text-white max-w-sm leading-relaxed">
              Get matched with the right opportunities, build your skills and gain real-world experience.
            </p>
          </div>
        </div>

        {/* Student Image & Footer */}
        <div className="z-1 mt-auto relative">
          {/* REPLACE this src with your actual student asset from the public folder (e.g., "/student-hero.png") */}
          <div className="h-64 w-full relative mt-8">
           <div className="h-96 w-full relative mt-8">
  <Image
    src="/login-image.png"
    alt="SIWESFlow"
    width={400}
    height={400}
    className="absolute bottom-0 left-0 w-full h-auto object-contain object-bottom"
    priority
  />
</div>
          </div>
          <div className="pb-8 pt-4 border-t border-blue-800/50 relative z-20">
            <p className="text-xs text-blue-100">Powered by Enchanted Digital Academy</p>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="w-full lg:w-7/12 flex items-center justify-center p-8 sm:p-12 lg:p-24">
        <div className="w-full max-w-md">
          
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">Welcome back,</h2>
            <p className="text-slate-500">Log in to continue your SIWES journey.</p>
          </div>

          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email or Matric number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="text"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full pl-11 py-3 text-sm border border-slate-300 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors"
                  placeholder="e.g you@example.com"
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
                  className="block w-full pl-11 pr-11 py-3 text-sm border border-slate-300 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] transition-colors"
                  placeholder="enter your password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-slate-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#0015A4] border-slate-300 rounded focus:ring-[#0015A4]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0015A4] hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0015A4] transition-colors disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Log in'}
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
                {/* Google Icon SVG */}
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
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-[#0015A4] hover:underline">
              Sign up
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}