"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Mail, ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import apiClient from "@/services/apiClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/auth/forgot-password", { email: email.trim() });
      setSubmitted(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Unable to send reset link. Please try again.");
      } else {
        setError("Unable to send reset link. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 font-sans">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
        <div className="mb-6 flex justify-center">
          <Image
            src="/siwesflow_dark.png"
            alt="SIWESFlow"
            width={160}
            height={48}
            className="h-10 w-auto object-contain"
            priority
          />
        </div>

        {submitted ? (
          <div className="text-center space-y-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">Check your email</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              If an account exists for <span className="font-medium text-slate-800">{email}</span>, we have sent a password reset link that expires in 1 hour.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#0015A4] hover:bg-blue-900 transition-colors"
            >
              Return to login
            </Link>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-bold text-slate-900 mb-2">Forgot password?</h1>
            <p className="text-sm text-slate-600 mb-6">
              Enter your registered email address and we will send you a link to reset your password.
            </p>

            {error && (
              <div className="mb-5 p-3.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                  Email address
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-11 pr-3 py-3 text-sm border text-slate-700 border-slate-300 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4]"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#0015A4] hover:bg-blue-900 transition-colors disabled:opacity-70"
              >
                {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Send reset link"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0015A4]"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to login
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
