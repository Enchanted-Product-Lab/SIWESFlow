"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import apiClient from "@/services/apiClient";

type GuardStatus = "checking" | "allowed" | "denied" | "error";

interface RoleRouteGuardProps {
  allowedRole: "STUDENT" | "SUPERVISOR" | "SCHOOL_COORDINATOR" | "COMPANY_ADMIN" | "PLATFORM_ADMIN";
  portalLabel: string;
  fallbackPath?: string;
  children: React.ReactNode;
}

export default function RoleRouteGuard({
  allowedRole,
  portalLabel,
  fallbackPath,
  children,
}: RoleRouteGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<GuardStatus>("checking");
  const [attempt, setAttempt] = useState(0);

  const verifyAccess = useCallback(async () => {
    const token = localStorage.getItem("siwesflow_token");

    if (!token) {
      router.replace("/auth/login");
      return;
    }

    setStatus("checking");

    let tokenRole: string | null = null;
    try {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(
          atob(parts[1].replace(/-/g, "+").replace(/_/g, "/"))
        );
        tokenRole = payload.role ?? null;
      }
    } catch {
      // ignore parse errors and rely on server check
    }

    if (tokenRole && tokenRole !== allowedRole) {
      setStatus("denied");
      return;
    }

    try {
      const response = await apiClient.get("/auth/me");
      const user = response.data?.data ?? response.data;

      if (user?.role === allowedRole) {
        setStatus("allowed");
      } else {
        setStatus("denied");
      }
    } catch (error: unknown) {
      const statusCode =
        (error as { response?: { status?: number } })?.response?.status;

      if (statusCode === 401) {
        localStorage.removeItem("siwesflow_token");
        router.replace("/auth/login");
        return;
      }

      if (statusCode === 403) {
        setStatus("denied");
        return;
      }

      if (statusCode === 404 && fallbackPath) {
        try {
          await apiClient.get(fallbackPath);
          setStatus("allowed");
          return;
        } catch (fallbackErr: unknown) {
          const fallbackStatus = (
            fallbackErr as { response?: { status?: number } }
          )?.response?.status;
          if (fallbackStatus === 401) {
            localStorage.removeItem("siwesflow_token");
            router.replace("/auth/login");
            return;
          }
          if (fallbackStatus === 403) {
            setStatus("denied");
            return;
          }
        }
      }

      if (tokenRole === allowedRole) {
        setStatus("allowed");
        return;
      }

      setStatus("error");
    }
  }, [allowedRole, fallbackPath, router]);

  useEffect(() => {
    void verifyAccess();
  }, [verifyAccess, attempt]);

  const handleLogout = () => {
    localStorage.removeItem("siwesflow_token");
    router.replace("/auth/login");
  };

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-700" />
          <p className="text-sm font-medium text-slate-600">
            Verifying {portalLabel} access...
          </p>
        </div>
      </div>
    );
  }

  if (status === "denied") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-xl font-bold text-slate-900">
            Access denied
          </h1>
          <p className="mb-6 text-sm leading-6 text-slate-600">
            This area is restricted to authorized {portalLabel} accounts.
            Your account does not have the required permission.
          </p>
          <button
            onClick={handleLogout}
            className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Return to login
          </button>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-3 text-xl font-bold text-slate-900">
            Unable to verify access
          </h1>
          <p className="mb-6 text-sm leading-6 text-slate-600">
            We could not reach the authentication service. Check your
            connection and try again.
          </p>
          <button
            onClick={() => setAttempt((current) => current + 1)}
            className="rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
