"use client";

import React, { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Building2,
  Users,
  Briefcase,
  CheckCircle2,
  XCircle,
  LogOut,
  Plus,
  Loader2,
} from "lucide-react";
import apiClient from "@/services/apiClient";

interface CompanyProfile {
  id: string;
  name: string;
  companyCode?: string;
  industry: string;
  address: string;
  state: string;
  country: string;
  email: string;
  phone: string;
  verificationStatus: string;
}

interface SupervisorItem {
  id: string;
  fullName: string;
  email: string;
  position: string;
  department: string;
  activationStatus: string;
  verificationStatus: string;
}

interface PlacementItem {
  id: string;
  title: string;
  department: string;
  availableSlots: number;
  filledSlots: number;
  approvalStatus: string;
  workMode: string;
  startDate: string;
  endDate: string;
}

interface ApplicationItem {
  id: string;
  status: string;
  appliedAt: string;
  coverNote?: string | null;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    department?: string;
    level?: string;
    email?: string;
  };
}

export default function CompanyDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [company, setCompany] = useState<CompanyProfile | null>(null);
  const [supervisors, setSupervisors] = useState<SupervisorItem[]>([]);
  const [placements, setPlacements] = useState<PlacementItem[]>([]);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string | null>(null);
  const [applications, setApplications] = useState<ApplicationItem[]>([]);
  const [feedback, setFeedback] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [busy, setBusy] = useState(false);

  // Forms
  const [companyForm, setCompanyForm] = useState({
    name: "",
    industry: "",
    address: "",
    state: "Lagos",
    country: "Nigeria",
    email: "",
    phone: "",
  });

  const [supForm, setSupForm] = useState({
    fullName: "",
    email: "",
    position: "",
    department: "",
    phone: "",
  });

  const [plcForm, setPlcForm] = useState({
    title: "",
    department: "",
    availableSlots: 3,
    startDate: "2026-06-01",
    endDate: "2026-11-30",
    location: "Lagos",
    workMode: "HYBRID",
    description: "",
  });

  const [assignSupMap, setAssignSupMap] = useState<Record<string, string>>({});

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const compRes = await apiClient.get("/companies/me").catch(() => null);
      if (compRes?.data) {
        setCompany(compRes.data);
      } else {
        setCompany(null);
      }

      const [supRes, plcRes] = await Promise.allSettled([
        apiClient.get("/supervisors", { params: { pageSize: 50 } }),
        apiClient.get("/placements", { params: { pageSize: 50 } }),
      ]);

      if (supRes.status === "fulfilled") {
        const list = Array.isArray(supRes.value.data)
          ? supRes.value.data
          : supRes.value.data?.data ?? [];
        setSupervisors(list);
      }
      if (plcRes.status === "fulfilled") {
        const list = Array.isArray(plcRes.value.data)
          ? plcRes.value.data
          : plcRes.value.data?.data ?? [];
        setPlacements(list);
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to load company workspace.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const loadApplications = async (placementId: string) => {
    setSelectedPlacementId(placementId);
    try {
      const res = await apiClient.get(`/placements/${placementId}/applications`);
      const list = Array.isArray(res.data) ? res.data : res.data?.data ?? [];
      setApplications(list);
    } catch {
      setApplications([]);
    }
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await apiClient.post("/companies", companyForm);
      setFeedback("Company profile created.");
      await loadAll();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create company profile.");
    } finally {
      setBusy(false);
    }
  };

  const handleInviteSupervisor = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await apiClient.post("/supervisors", supForm);
      setSupForm({ fullName: "", email: "", position: "", department: "", phone: "" });
      setFeedback("Supervisor invited.");
      await loadAll();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to invite supervisor.");
    } finally {
      setBusy(false);
    }
  };

  const handleConfirmSupervisor = async (supervisorId: string) => {
    setBusy(true);
    setError("");
    try {
      await apiClient.post(`/supervisors/${supervisorId}/confirm`);
      setFeedback("Supervisor confirmed.");
      await loadAll();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to confirm supervisor.");
    } finally {
      setBusy(false);
    }
  };

  const handleCreatePlacement = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      await apiClient.post("/placements", {
        ...plcForm,
        availableSlots: Number(plcForm.availableSlots),
        requiredSkills: [],
      });
      setPlcForm({
        title: "",
        department: "",
        availableSlots: 3,
        startDate: "2026-06-01",
        endDate: "2026-11-30",
        location: "Lagos",
        workMode: "HYBRID",
        description: "",
      });
      setFeedback("Placement created (pending school approval).");
      await loadAll();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create placement (verify company & active subscription).");
    } finally {
      setBusy(false);
    }
  };

  const handleApplicationDecision = async (appId: string, action: "accept" | "reject") => {
    setBusy(true);
    setError("");
    setFeedback("");
    try {
      if (action === "accept") {
        const supId = assignSupMap[appId];
        await apiClient.post(`/placements/applications/${appId}/accept`, supId ? { supervisorId: supId } : {});
        setFeedback("Application accepted and student placed.");
      } else {
        await apiClient.post(`/placements/applications/${appId}/reject`);
        setFeedback("Application rejected.");
      }
      if (selectedPlacementId) await loadApplications(selectedPlacementId);
      await loadAll();
    } catch (err: any) {
      setError(err?.response?.data?.error || `Failed to ${action} application.`);
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
          <span className="text-xs font-medium bg-white/15 px-2.5 py-1 rounded-full">Company Admin Portal</span>
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

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-[#0015A4]" />
          </div>
        ) : !company ? (
          <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="h-5 w-5 text-[#0015A4]" />
              <h1 className="text-xl font-bold">Create Company Profile</h1>
            </div>
            <form onSubmit={handleCreateCompany} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input required placeholder="Company Name" value={companyForm.name} onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Industry" value={companyForm.industry} onChange={(e) => setCompanyForm({ ...companyForm, industry: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Official Email" type="email" value={companyForm.email} onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Phone (+234...)" value={companyForm.phone} onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Address" value={companyForm.address} onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })} className="border rounded-lg px-3 py-2 text-sm sm:col-span-2" />
              <input required placeholder="State" value={companyForm.state} onChange={(e) => setCompanyForm({ ...companyForm, state: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Country" value={companyForm.country} onChange={(e) => setCompanyForm({ ...companyForm, country: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
              <button disabled={busy} className="sm:col-span-2 bg-[#0015A4] text-white rounded-lg py-2.5 text-sm font-semibold hover:bg-blue-900">
                Save Company Profile
              </button>
            </form>
          </section>
        ) : (
          <>
            {/* Company Overview */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-[#0015A4]" />
                  <h1 className="text-xl font-bold">{company.name}</h1>
                </div>
                <p className="text-sm text-slate-600 mt-1">
                  {company.industry} · {company.address}, {company.state}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${company.verificationStatus === "VERIFIED" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                Verification: {company.verificationStatus}
              </span>
            </section>

            {/* Supervisors */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#0015A4]" />
                <h2 className="text-lg font-bold">Supervisors ({supervisors.length})</h2>
              </div>

              <form onSubmit={handleInviteSupervisor} className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                <input required placeholder="Full Name" value={supForm.fullName} onChange={(e) => setSupForm({ ...supForm, fullName: e.target.value })} className="border rounded-lg px-3 py-2 text-xs" />
                <input required type="email" placeholder="Work Email" value={supForm.email} onChange={(e) => setSupForm({ ...supForm, email: e.target.value })} className="border rounded-lg px-3 py-2 text-xs" />
                <input required placeholder="Position" value={supForm.position} onChange={(e) => setSupForm({ ...supForm, position: e.target.value })} className="border rounded-lg px-3 py-2 text-xs" />
                <input required placeholder="Department" value={supForm.department} onChange={(e) => setSupForm({ ...supForm, department: e.target.value })} className="border rounded-lg px-3 py-2 text-xs" />
                <div className="flex gap-2">
                  <input required placeholder="Phone" value={supForm.phone} onChange={(e) => setSupForm({ ...supForm, phone: e.target.value })} className="border rounded-lg px-3 py-2 text-xs flex-1 min-w-0" />
                  <button disabled={busy} className="bg-[#0015A4] text-white rounded-lg px-3 py-2 text-xs font-semibold inline-flex items-center gap-1 shrink-0">
                    <Plus className="h-3.5 w-3.5" /> Invite
                  </button>
                </div>
              </form>

              <div className="divide-y divide-slate-100">
                {supervisors.map((s) => (
                  <div key={s.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="font-semibold">{s.fullName}</p>
                      <p className="text-xs text-slate-500">{s.position} · {s.department} · {s.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">
                        {s.activationStatus}
                      </span>
                      {s.activationStatus !== "ACTIVE" && (
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => handleConfirmSupervisor(s.id)}
                          className="text-xs bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium hover:bg-emerald-700"
                        >
                          Confirm Supervisor
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {supervisors.length === 0 && <p className="text-xs text-slate-500 py-2">No supervisors added yet.</p>}
              </div>
            </section>

            {/* Placements & Applications */}
            <section className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-[#0015A4]" />
                <h2 className="text-lg font-bold">Placements & Applications ({placements.length})</h2>
              </div>

              <form onSubmit={handleCreatePlacement} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <input required placeholder="Role Title" value={plcForm.title} onChange={(e) => setPlcForm({ ...plcForm, title: e.target.value })} className="border rounded-lg px-3 py-2 text-xs bg-white" />
                <input required placeholder="Department" value={plcForm.department} onChange={(e) => setPlcForm({ ...plcForm, department: e.target.value })} className="border rounded-lg px-3 py-2 text-xs bg-white" />
                <input required type="number" min={1} placeholder="Slots" value={plcForm.availableSlots} onChange={(e) => setPlcForm({ ...plcForm, availableSlots: Number(e.target.value) })} className="border rounded-lg px-3 py-2 text-xs bg-white" />
                <select value={plcForm.workMode} onChange={(e) => setPlcForm({ ...plcForm, workMode: e.target.value })} className="border rounded-lg px-3 py-2 text-xs bg-white">
                  <option value="ON_SITE">ON_SITE</option>
                  <option value="HYBRID">HYBRID</option>
                  <option value="REMOTE">REMOTE</option>
                </select>
                <input required type="date" value={plcForm.startDate} onChange={(e) => setPlcForm({ ...plcForm, startDate: e.target.value })} className="border rounded-lg px-3 py-2 text-xs bg-white" />
                <input required type="date" value={plcForm.endDate} onChange={(e) => setPlcForm({ ...plcForm, endDate: e.target.value })} className="border rounded-lg px-3 py-2 text-xs bg-white" />
                <input placeholder="Location" value={plcForm.location} onChange={(e) => setPlcForm({ ...plcForm, location: e.target.value })} className="border rounded-lg px-3 py-2 text-xs bg-white" />
                <button disabled={busy} className="bg-[#0015A4] text-white rounded-lg px-4 py-2 text-xs font-semibold hover:bg-blue-900">
                  Post Placement
                </button>
              </form>

              <div className="divide-y divide-slate-100">
                {placements.map((p) => (
                  <div key={p.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-sm">
                    <div>
                      <p className="font-semibold">{p.title}</p>
                      <p className="text-xs text-slate-500">
                        {p.department} · {p.filledSlots}/{p.availableSlots} slots filled · {p.workMode} · School Approval: {p.approvalStatus}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => loadApplications(p.id)}
                      className="text-xs border border-slate-300 px-3 py-1.5 rounded-lg font-medium hover:bg-slate-50 w-fit"
                    >
                      View Applications
                    </button>
                  </div>
                ))}
                {placements.length === 0 && <p className="text-xs text-slate-500 py-2">No placements posted yet.</p>}
              </div>

              {selectedPlacementId && (
                <div className="border-t border-slate-200 pt-4 space-y-3">
                  <h3 className="text-sm font-bold">Applications for Selected Placement</h3>
                  {applications.length === 0 ? (
                    <p className="text-xs text-slate-500">No applications for this placement yet.</p>
                  ) : (
                    applications.map((app) => (
                      <div key={app.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                        <div>
                          <p className="font-semibold text-sm">
                            {app.student ? `${app.student.firstName} ${app.student.lastName}` : app.id}
                          </p>
                          <p className="text-slate-500">
                            {app.student?.department} · Status: {app.status}
                          </p>
                        </div>
                        {app.status === "PENDING" && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <select
                              value={assignSupMap[app.id] ?? ""}
                              onChange={(e) => setAssignSupMap({ ...assignSupMap, [app.id]: e.target.value })}
                              className="border rounded-lg px-2 py-1.5 bg-white text-xs"
                            >
                              <option value="">Assign supervisor (optional)</option>
                              {supervisors.map((s) => (
                                <option key={s.id} value={s.id}>{s.fullName}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleApplicationDecision(app.id, "accept")}
                              className="inline-flex items-center gap-1 bg-emerald-600 text-white px-3 py-1.5 rounded-lg font-medium"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" /> Accept
                            </button>
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleApplicationDecision(app.id, "reject")}
                              className="inline-flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-lg font-medium"
                            >
                              <XCircle className="h-3.5 w-3.5" /> Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}
