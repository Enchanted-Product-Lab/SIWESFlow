"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  KeyRound,
  CreditCard,
  CheckCircle2,
  XCircle,
  LogOut,
  Loader2,
} from "lucide-react";
import apiClient from "@/services/apiClient";

interface VerificationItem {
  id: string;
  entityType: string;
  entityId: string;
  status: string;
  submittedAt: string;
  notes?: string | null;
}

interface PaymentItem {
  id: string;
  companyId: string;
  amountKobo: number;
  reference: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [verifications, setVerifications] = useState<VerificationItem[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [entityFilter, setEntityFilter] = useState<string>("");
  const [rejectReasonMap, setRejectReasonMap] = useState<Record<string, string>>({});

  // 2FA setup state
  const [twoFactorSetup, setTwoFactorSetup] = useState<{ secret: string; otpauthUrl: string } | null>(null);
  const [totpCode, setTotpCode] = useState("");
  const [twoFactorActive, setTwoFactorActive] = useState(false);

  const [feedback, setFeedback] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [verRes, payRes] = await Promise.allSettled([
        apiClient.get("/verifications/queue", {
          params: entityFilter ? { entityType: entityFilter, pageSize: 50 } : { pageSize: 50 },
        }),
        apiClient.get("/billing/payments", { params: { pageSize: 50 } }),
      ]);

      if (verRes.status === "fulfilled") {
        const list = Array.isArray(verRes.value.data)
          ? verRes.value.data
          : verRes.value.data?.data ?? [];
        setVerifications(list);
      }
      if (payRes.status === "fulfilled") {
        const list = Array.isArray(payRes.value.data)
          ? payRes.value.data
          : payRes.value.data?.data ?? [];
        setPayments(list);
      }
    } catch {
      setError("Failed to load admin dashboard.");
    } finally {
      setLoading(false);
    }
  }, [entityFilter]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleStartReview = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      await apiClient.post(`/verifications/${id}/start-review`);
      setFeedback("Verification moved to UNDER_REVIEW.");
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to start review.");
    } finally {
      setBusy(false);
    }
  };

  const handleApproveVerification = async (id: string) => {
    setBusy(true);
    setError("");
    try {
      await apiClient.post(`/verifications/${id}/approve`);
      setFeedback("Verification approved.");
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to approve verification.");
    } finally {
      setBusy(false);
    }
  };

  const handleRejectVerification = async (id: string) => {
    const reason = (rejectReasonMap[id] ?? "").trim();
    if (reason.length < 5) {
      setError("Please enter a rejection reason of at least 5 characters.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await apiClient.post(`/verifications/${id}/reject`, { reason });
      setFeedback("Verification rejected.");
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to reject verification.");
    } finally {
      setBusy(false);
    }
  };

  const handleVerifyPayment = async (id: string, status: "VERIFIED" | "REJECTED") => {
    setBusy(true);
    setError("");
    try {
      await apiClient.post(`/billing/payments/${id}/verify`, {
        status,
        ...(status === "REJECTED" ? { rejectionReason: "Rejected by platform admin" } : {}),
      });
      setFeedback(`Payment ${status.toLowerCase()}.`);
      await loadData();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to update payment status.");
    } finally {
      setBusy(false);
    }
  };

  const handleSetup2FA = async () => {
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      const res = await apiClient.post("/auth/2fa/setup");
      setTwoFactorSetup(res.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Unable to initiate 2FA setup.");
    } finally {
      setBusy(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await apiClient.post("/auth/2fa/enable", { code: totpCode.trim() });
      setTwoFactorActive(true);
      setTwoFactorSetup(null);
      setTotpCode("");
      setFeedback("Mandatory Admin 2FA enabled on your account.");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid 6-digit code.");
    } finally {
      setBusy(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("siwesflow_token");
    router.replace("/auth/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <header className="bg-[#07145c] text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/siwesflow_logo_white.png" alt="SIWESFlow" width={140} height={40} className="h-8 w-auto" />
          <span className="text-xs font-medium bg-white/15 px-2.5 py-1 rounded-full">Platform Admin</span>
        </div>
        <button
          onClick={handleLogout}
          className="inline-flex items-center gap-1.5 text-xs font-medium bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {feedback && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {feedback}
          </div>
        )}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Mandatory Admin 2FA Enrollment */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-[#0015A4]" />
              <div>
                <h1 className="text-lg font-bold">Admin Two-Factor Authentication (2FA / MFA)</h1>
                <p className="text-xs text-slate-500">
                  Required for platform administrator accounts under SIWESFlow security policy.
                </p>
              </div>
            </div>
            {twoFactorActive ? (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold w-fit">
                2FA Enabled
              </span>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={handleSetup2FA}
                className="bg-[#0015A4] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-blue-900 w-fit"
              >
                Setup Authenticator 2FA
              </button>
            )}
          </div>

          {twoFactorSetup && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 space-y-3 text-xs">
              <p className="font-semibold text-slate-800">
                Add this secret key to your authenticator app (Google Authenticator / Authy), then enter the 6-digit code below:
              </p>
              <div className="bg-white border border-slate-200 rounded-lg p-3 font-mono text-sm select-all break-all">
                {twoFactorSetup.secret}
              </div>
              <p className="text-[11px] text-slate-500 break-all">
                OTPAuth URI: {twoFactorSetup.otpauthUrl}
              </p>
              <form onSubmit={handleEnable2FA} className="flex items-center gap-2 max-w-sm">
                <input
                  required
                  maxLength={6}
                  inputMode="numeric"
                  placeholder="6-digit code"
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-sm bg-white flex-1"
                />
                <button
                  type="submit"
                  disabled={busy}
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700"
                >
                  Verify & Enable
                </button>
              </form>
            </div>
          )}
        </section>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0015A4]" />
          </div>
        ) : (
          <>
            {/* Entity Verification Queue */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-[#0015A4]" />
                  <h2 className="text-lg font-bold">Platform Verification Queue ({verifications.length})</h2>
                </div>
                <select
                  value={entityFilter}
                  onChange={(e) => setEntityFilter(e.target.value)}
                  className="border rounded-lg px-3 py-2 text-xs bg-white w-fit"
                >
                  <option value="">All Entity Types</option>
                  <option value="SCHOOL">SCHOOL</option>
                  <option value="COMPANY">COMPANY</option>
                  <option value="SUPERVISOR">SUPERVISOR</option>
                  <option value="STUDENT">STUDENT</option>
                </select>
              </div>

              <div className="divide-y divide-slate-100">
                {verifications.map((v) => (
                  <div key={v.id} className="py-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                    <div>
                      <p className="font-semibold text-sm">
                        {v.entityType} · {v.entityId}
                      </p>
                      <p className="text-slate-500">
                        Verification ID: {v.id} · Status: {v.status}
                      </p>
                      {v.notes && <p className="text-slate-600 mt-1">Notes: {v.notes}</p>}
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      {v.status === "SUBMITTED" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleStartReview(v.id)}
                          className="border border-slate-300 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-50"
                        >
                          Start Review
                        </button>
                      )}
                      {v.status === "UNDER_REVIEW" && (
                        <>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleApproveVerification(v.id)}
                            className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                          </button>
                          <input
                            placeholder="Rejection reason (min 5 chars)"
                            value={rejectReasonMap[v.id] ?? ""}
                            onChange={(e) => setRejectReasonMap({ ...rejectReasonMap, [v.id]: e.target.value })}
                            className="border rounded-lg px-2.5 py-1.5 text-xs"
                          />
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleRejectVerification(v.id)}
                            className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium"
                          >
                            <XCircle className="h-3.5 w-3.5" /> Reject
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
                {verifications.length === 0 && (
                  <p className="text-xs text-slate-500 py-2">No pending verification items in queue.</p>
                )}
              </div>
            </section>

            {/* Billing Payments Verification */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-[#0015A4]" />
                <h2 className="text-lg font-bold">Company Billing Payments ({payments.length})</h2>
              </div>

              <div className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="font-semibold text-sm">Ref: {p.reference}</p>
                      <p className="text-slate-500">
                        Company: {p.companyId} · Amount: NGN {(p.amountKobo / 100).toLocaleString()} · Status: {p.status}
                      </p>
                    </div>
                    {p.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleVerifyPayment(p.id, "VERIFIED")}
                          className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium"
                        >
                          Verify Payment
                        </button>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleVerifyPayment(p.id, "REJECTED")}
                          className="bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
                {payments.length === 0 && <p className="text-xs text-slate-500 py-2">No payment records found.</p>}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
