"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import StudentLayout from "@/components/student/StudentLayout";
import apiClient from "@/services/apiClient";
import { 
  FileText, UploadCloud, CheckCircle2, Clock, 
  AlertCircle, Download, ExternalLink, ShieldCheck, FileCheck
} from "lucide-react";

interface DocumentItem {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  fileSize?: string;
  status: "VERIFIED" | "PENDING_VERIFICATION" | "REJECTED";
  uploadedAt: string;
  verifiedBy?: string;
  notes?: string;
}

export default function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([
    {
      id: "doc-1",
      name: "SIWES_Acceptance_Letter_TechNova.pdf",
      type: "ACCEPTANCE_LETTER",
      fileUrl: "/documents/sample_acceptance.pdf",
      fileSize: "1.2 MB",
      status: "VERIFIED",
      uploadedAt: "2026-11-01",
      verifiedBy: "School Coordinator",
    },
    {
      id: "doc-2",
      name: "Institutional_Introduction_Letter_UNILAG.pdf",
      type: "INTRODUCTION_LETTER",
      fileUrl: "/documents/sample_intro.pdf",
      fileSize: "840 KB",
      status: "VERIFIED",
      uploadedAt: "2026-10-28",
      verifiedBy: "School Coordinator",
    },
    {
      id: "doc-3",
      name: "Midterm_Activity_Summary_Extract.pdf",
      type: "LOGBOOK_EXTRACT",
      fileUrl: "/documents/sample_extract.pdf",
      fileSize: "2.1 MB",
      status: "PENDING_VERIFICATION",
      uploadedAt: "2026-11-07",
    },
  ]);

  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await apiClient.get("/documents");
        if (Array.isArray(res.data) && res.data.length > 0) {
          const mapped: DocumentItem[] = res.data.map((d: any) => ({
            id: d.id,
            name: d.originalName || d.name || "SIWES_Document.pdf",
            type: d.type || "GENERAL",
            fileUrl: d.url || d.fileUrl || "#",
            fileSize: d.size ? `${(d.size / (1024 * 1024)).toFixed(1)} MB` : "1.0 MB",
            status: d.status || "PENDING_VERIFICATION",
            uploadedAt: d.createdAt ? String(d.createdAt).slice(0, 10) : "2026-11-08",
            verifiedBy: d.verifiedBy || undefined,
            notes: d.notes || undefined,
          }));
          setDocuments(mapped);
        }
      } catch {
        // Fallback to local default documents
      }
    };

    fetchDocs();
  }, []);

  const formatDocType = (type: string) => {
    return type.replace(/_/g, " ");
  };

  return (
    <StudentLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">SIWES Documents & Clearances</h1>
            <p className="text-slate-600 text-sm">Review official verification status of uploaded letters, extracts, and compliance files</p>
          </div>
          <Link
            href="/student/documents/upload"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0015A4] hover:bg-blue-800 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors self-start"
          >
            <UploadCloud className="h-4 w-4" />
            Upload New Document
          </Link>
        </div>

        {/* Verification Overview Banner */}
        <div className="bg-[#04104B] text-white p-6 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white/10 flex items-center justify-center text-teal-400 shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-base font-bold">Institutional Compliance</h3>
              <p className="text-xs text-slate-300 mt-0.5">
                {documents.filter((d) => d.status === "VERIFIED").length} of {documents.length} required documents verified by school coordinator.
              </p>
            </div>
          </div>
          <Link
            href="/student/documents/upload"
            className="px-4 py-2 bg-white text-[#04104B] hover:bg-slate-100 rounded-xl text-xs font-bold transition-colors self-start sm:self-auto"
          >
            Submit Pending File
          </Link>
        </div>

        {/* Documents Table / Card List */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Uploaded Documents</h2>
            <span className="text-xs font-semibold text-slate-500">{documents.length} Files</span>
          </div>

          <div className="divide-y divide-slate-100">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
              >
                <div className="flex items-start gap-3.5">
                  <div className="h-10 w-10 rounded-xl bg-blue-50 text-[#0015A4] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{doc.name}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="text-xs text-slate-500 font-medium">{formatDocType(doc.type)}</span>
                      <span className="text-xs text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-400">{doc.fileSize}</span>
                      <span className="text-xs text-slate-300">&bull;</span>
                      <span className="text-xs text-slate-400">Uploaded on {doc.uploadedAt}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-center">
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                      doc.status === "VERIFIED"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : doc.status === "PENDING_VERIFICATION"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {doc.status === "VERIFIED" ? (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    ) : doc.status === "PENDING_VERIFICATION" ? (
                      <Clock className="h-3.5 w-3.5" />
                    ) : (
                      <AlertCircle className="h-3.5 w-3.5" />
                    )}
                    {doc.status === "PENDING_VERIFICATION" ? "Pending Approval" : doc.status}
                  </span>

                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Download / View Document"
                  >
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </StudentLayout>
  );
}
