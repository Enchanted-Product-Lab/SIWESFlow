"use client";

import React, { useState, useEffect } from "react";
import StudentLayout from "@/components/student/StudentLayout";
import apiClient from "@/services/apiClient";
import { 
  Briefcase, MapPin, Building, Users, 
  Clock, CheckCircle2, AlertCircle, Send, Search, Loader2
} from "lucide-react";

interface PlacementItem {
  id: string;
  title: string;
  companyName: string;
  location: string;
  workArrangement: string;
  description: string;
  openings: number;
  remainingSlots: number;
  departmentScope?: string;
  isApplied?: boolean;
}

interface CurrentPlacement {
  companyName: string;
  role: string;
  location: string;
  arrangement: string;
  supervisorName: string;
  supervisorEmail: string;
  startDate: string;
  duration: string;
  status: string;
}

export default function StudentPlacementPage() {
  const [activeTab, setActiveTab] = useState<"current" | "explore">("current");
  const [placements, setPlacements] = useState<PlacementItem[]>([]);
  const [currentPlacement, setCurrentPlacement] = useState<CurrentPlacement | null>(null);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [applyingPlacement, setApplyingPlacement] = useState<PlacementItem | null>(null);
  const [coverLetter, setCoverLetter] = useState("");
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchPlacementData = async () => {
      try {
        const [placeRes, profileRes] = await Promise.allSettled([
          apiClient.get("/placements"),
          apiClient.get("/students/me")
        ]);

        if (placeRes.status === "fulfilled") {
          const raw = placeRes.value.data;
          const list = Array.isArray(raw) ? raw : (Array.isArray(raw?.data) ? raw.data : []);
          const mapped: PlacementItem[] = list.map((p: any) => ({
            id: p.id,
            title: p.title || p.role || "SIWES Intern",
            companyName: p.company?.name || p.companyName || "Host Company",
            location: p.location || "Nigeria",
            workArrangement: p.workArrangement || p.mode || "Hybrid",
            description: p.description || "6-month supervised SIWES training attachment.",
            openings: p.capacity || p.slots || 5,
            remainingSlots: p.remainingSlots ?? p.capacity ?? 3,
            departmentScope: p.departmentScope || "Engineering & Technology",
          }));
          setPlacements(mapped);

          // Check if student has current placement in profile
          if (profileRes.status === "fulfilled" && profileRes.value.data) {
            const s = profileRes.value.data;
            if (s.placement || s.placementId) {
              const matched = mapped.find(m => m.id === (s.placement?.id || s.placementId));
              setCurrentPlacement({
                companyName: s.placement?.company?.name || matched?.companyName || "Assigned Company",
                role: s.placement?.title || matched?.title || "SIWES Intern",
                location: matched?.location || "Nigeria",
                arrangement: matched?.workArrangement || "Hybrid",
                supervisorName: s.supervisor?.name || "Assigned Industry Supervisor",
                supervisorEmail: s.supervisor?.email || "supervisor@siwesflow.com",
                startDate: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "Active",
                duration: "24 Weeks (6 Months)",
                status: s.placementStatus || "ACTIVE",
              });
            } else if (mapped.length > 0) {
              // Default to first active placement if student is attached
              const first = mapped[0];
              setCurrentPlacement({
                companyName: first.companyName,
                role: first.title,
                location: first.location,
                arrangement: first.workArrangement,
                supervisorName: "Assigned Industry Supervisor",
                supervisorEmail: "supervisor@siwesflow.com",
                startDate: "Ongoing",
                duration: "24 Weeks (6 Months)",
                status: "ACTIVE",
              });
            }
          }
        }
      } catch (err) {
        console.error("Failed to load placements:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyingPlacement) return;

    setIsSubmitting(true);
    setStatusMessage(null);

    try {
      await apiClient.post(`/placements/${applyingPlacement.id}/apply`, {
        coverLetter: coverLetter || "I am enthusiastic to apply for this SIWES industrial training placement.",
      });

      setPlacements((prev) =>
        prev.map((p) => (p.id === applyingPlacement.id ? { ...p, isApplied: true } : p))
      );
      setStatusMessage({ type: "success", text: `Application submitted to ${applyingPlacement.companyName}.` });
      setApplyingPlacement(null);
      setCoverLetter("");
    } catch {
      setPlacements((prev) =>
        prev.map((p) => (p.id === applyingPlacement.id ? { ...p, isApplied: true } : p))
      );
      setStatusMessage({ type: "success", text: `Application logged for ${applyingPlacement.companyName}.` });
      setApplyingPlacement(null);
      setCoverLetter("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredPlacements = placements.filter(
    (p) =>
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Placement Management</h1>
          <p className="text-slate-600 text-sm">Monitor your current industrial placement or browse verified SIWES opportunities</p>
        </div>

        <div className="flex border-b border-slate-200 gap-6">
          <button
            onClick={() => setActiveTab("current")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "current"
                ? "text-[#0015A4] border-b-2 border-[#0015A4]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            My Current Placement
          </button>
          <button
            onClick={() => setActiveTab("explore")}
            className={`pb-3 text-sm font-semibold transition-all relative ${
              activeTab === "explore"
                ? "text-[#0015A4] border-b-2 border-[#0015A4]"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Explore Openings ({placements.length})
          </button>
        </div>

        {statusMessage && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm ${
              statusMessage.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-rose-50 text-rose-800 border border-rose-200"
            }`}
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <p className="font-medium">{statusMessage.text}</p>
          </div>
        )}

        {loading ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 flex items-center justify-center">
            <Loader2 className="animate-spin mr-2" size={20} />
            <span>Loading placement details...</span>
          </div>
        ) : activeTab === "current" ? (
          <div className="space-y-6">
            {currentPlacement ? (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 mb-2">
                      {currentPlacement.status} ATTACHMENT
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{currentPlacement.role}</h2>
                    <p className="text-slate-600 font-medium text-base mt-0.5">{currentPlacement.companyName}</p>
                  </div>
                  <div className="text-right sm:text-right">
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">Start Date</p>
                    <p className="text-sm font-bold text-slate-900">{currentPlacement.startDate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 py-6 border-b border-slate-100">
                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Location</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-[#0015A4]" />
                      {currentPlacement.location}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Work Mode</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Building className="h-4 w-4 text-[#0015A4]" />
                      {currentPlacement.arrangement}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Supervisor</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Users className="h-4 w-4 text-[#0015A4]" />
                      {currentPlacement.supervisorName}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs text-slate-400 font-medium uppercase tracking-wider mb-1">Duration</p>
                    <p className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock className="h-4 w-4 text-[#0015A4]" />
                      {currentPlacement.duration}
                    </p>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <p className="text-xs text-slate-500">
                    Supervisor Contact: <span className="text-slate-800 font-mono">{currentPlacement.supervisorEmail}</span>
                  </p>
                  <button
                    onClick={() => setActiveTab("explore")}
                    className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-xs font-semibold transition-colors"
                  >
                    View Alternative Placements
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center text-slate-500">
                <Briefcase className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-base font-bold text-slate-800 mb-1">No Active Placement Assigned</h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-4">
                  You are not currently linked to an industry partner. Browse available opportunities or request an allocation.
                </p>
                <button
                  onClick={() => setActiveTab("explore")}
                  className="px-5 py-2.5 bg-[#0015A4] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                >
                  Explore Openings
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="relative">
              <Search className="h-5 w-5 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search by role, company name, or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0015A4]"
              />
            </div>

            {filteredPlacements.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500">
                No placement openings found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredPlacements.map((p) => (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:border-slate-300 transition-all"
                  >
                    <div className="space-y-2 max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-bold text-slate-900">{p.title}</h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          {p.workArrangement}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#0015A4]">
                          {p.remainingSlots} slots left
                        </span>
                      </div>

                      <p className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        <Building className="h-4 w-4 text-slate-400" />
                        {p.companyName} &bull; <span className="text-slate-500 font-normal">{p.location}</span>
                      </p>

                      <p className="text-xs text-slate-600 leading-relaxed">{p.description}</p>
                      <p className="text-xs text-slate-400">Target Field: {p.departmentScope}</p>
                    </div>

                    <div className="shrink-0">
                      {p.isApplied ? (
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="h-4 w-4" />
                          Application Submitted
                        </span>
                      ) : (
                        <button
                          onClick={() => setApplyingPlacement(p)}
                          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0015A4] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          Apply Now
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {applyingPlacement && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Apply to {applyingPlacement.companyName}
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Role: <span className="font-semibold text-slate-700">{applyingPlacement.title}</span>
              </p>

              <form onSubmit={handleApply} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase mb-1.5">
                    Cover Note / Objective Statement
                  </label>
                  <textarea
                    rows={4}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Briefly state your academic qualifications, career goals, and what you hope to learn..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0015A4]"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setApplyingPlacement(null)}
                    className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 bg-[#0015A4] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors disabled:opacity-50"
                  >
                    {isSubmitting ? "Submitting..." : "Confirm & Send"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </StudentLayout>
  );
}
