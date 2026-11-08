"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import apiClient from '../../../services/apiClient';
import axios from 'axios';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Missing verification token. Please check your email link.');
      return;
    }

    let isMounted = true;

    async function verify() {
      try {
        await apiClient.post('/auth/verify-email', { token });
        if (isMounted) {
          setStatus('success');
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        setStatus('error');
        if (axios.isAxiosError(err)) {
          setErrorMessage(err.response?.data?.error || err.response?.data?.message || 'Verification link is invalid or has expired.');
        } else {
          setErrorMessage('Unable to verify email. Please try again.');
        }
      }
    }

    verify();

    return () => {
      isMounted = false;
    };
  }, [token]);

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
      {status === 'loading' && (
        <div className="py-12 space-y-4">
          <Loader2 className="h-12 w-12 text-[#0015A4] animate-spin mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Verifying your email...</h2>
          <p className="text-sm text-slate-500">Please wait while we confirm your account.</p>
        </div>
      )}

      {status === 'success' && (
        <div className="py-8 space-y-6">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Email Verified!</h2>
            <p className="mt-2 text-sm text-slate-600">
              Your email has been successfully verified. You can now log in and complete your onboarding.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="inline-block w-full py-3 px-4 rounded-lg bg-[#0015A4] text-white font-medium hover:bg-blue-900 transition-colors"
          >
            Continue to Login
          </Link>
        </div>
      )}

      {status === 'error' && (
        <div className="py-8 space-y-6">
          <XCircle className="h-16 w-16 text-rose-500 mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Verification Failed</h2>
            <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>
          </div>
          <Link
            href="/auth/login"
            className="inline-block w-full py-3 px-4 rounded-lg border border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
          >
            Back to Login
          </Link>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="mb-8">
        <Image
          src="/siwesflow_dark.png"
          alt="SIWESFlow"
          width={180}
          height={50}
          className="h-10 w-auto object-contain"
          priority
        />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <Loader2 className="h-10 w-10 text-[#0015A4] animate-spin mx-auto" />
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
