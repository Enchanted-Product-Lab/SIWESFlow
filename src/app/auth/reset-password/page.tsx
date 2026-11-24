"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { Lock, Eye, EyeOff, CheckCircle2, Loader2 } from "lucide-react";
import axios from "axios";
import apiClient from "@/services/apiClient";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing from the link.");
      return;
    }
    if (password.length < 12) {
      setError("Password must be at least 12 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      await apiClient.post("/auth/reset-password", { token, password });
      setDone(true);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || "Invalid or expired reset link.");
      } else {
        setError("Unable to reset password. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (done) {
    return (
      <div className="text-center space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Password updated</h1>
        <p className="text-sm text-slate-600">
          Your password has been reset and existing sessions were signed out. You can now log in with your new password.
        </p>
        <Link
          href="/auth/login"
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#0015A4] hover:bg-blue-900 transition-colors"
        >
          Go to login
        </Link>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-slate-900 mb-2">Set a new password</h1>
      <p className="text-sm text-slate-600 mb-6">
        Choose a strong password of at least 12 characters.
      </p>

      {error && (
        <div className="mb-5 p-3.5 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            New password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              required
              minLength={12}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="block w-full pl-11 pr-11 py-3 text-sm border text-slate-700 border-slate-300 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4]"
              placeholder="Minimum 12 characters"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5 text-slate-400" />
              ) : (
                <Eye className="h-5 w-5 text-slate-400" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Confirm new password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              required
              minLength={12}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="block w-full pl-11 pr-3 py-3 text-sm border text-slate-700 border-slate-300 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4]"
              placeholder="Re-enter new password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center items-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-[#0015A4] hover:bg-blue-900 transition-colors disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="animate-spin h-5 w-5" /> : "Reset password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
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
        <Suspense fallback={<div className="text-center text-sm text-slate-500 py-6">Loading...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
