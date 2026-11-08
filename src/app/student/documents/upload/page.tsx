"use client";

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, File, AlertCircle, Loader2, CheckCircle2, ArrowRight } from 'lucide-react';
import apiClient from '../../../../services/apiClient';
import axios from 'axios';

const ALLOWED_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'image/jpeg', 'image/jpg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB limit per Sprint rules

export default function DocumentUpload() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState('PASSPORT');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccessMsg('');
    const selectedFile = e.target.files?.[0];
    
    if (!selectedFile) return;

    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError('Invalid file type. Only PDF, DOC, DOCX, JPG, JPEG, and PNG are allowed.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('File is too large. Maximum size is 10 MB.');
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    setIsUploading(true);
    setError('');
    setSuccessMsg('');

    try {
      const typeMap: Record<string, string> = {
        PASSPORT: 'PASSPORT_PHOTO',
        STUDENT_ID: 'STUDENT_ID_CARD',
        ACCEPTANCE_LETTER: 'ACCEPTANCE_LETTER',
        PLACEMENT_LETTER: 'PLACEMENT_LETTER',
        SCHOOL_INTRO: 'SCHOOL_INTRO_LETTER',
      };
      const normalizedDocType = typeMap[documentType] || documentType;

      const formData = new FormData();
      formData.append('file', file);
      formData.append('documentType', normalizedDocType);
      formData.append('ownerType', 'student');

      // Sending file to the live backend POST /documents endpoint
      await apiClient.post('/documents', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccessMsg(`${file.name} uploaded successfully!`);
      setFile(null); // Reset after successful upload
      if (fileInputRef.current) fileInputRef.current.value = '';
      
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.error || err.response?.data?.message || 'Failed to upload document. Please try again.');
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unexpected error occurred during upload.');
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleFinishOnboarding = () => {
    // Route to the student dashboard shell once they are done uploading
    router.push('/student/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-12 px-6 font-sans">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-[#0015A4] px-8 py-8 text-white relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-full h-[60%] bg-gradient-to-t from-blue-900/50 to-transparent z-0"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-1">Upload Documents</h2>
            <p className="text-blue-100 text-sm">Please upload your required SIWES files below.</p>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 sm:p-12">
          {error && (
            <div className="mb-6 bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <CheckCircle2 className="h-5 w-5 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleUpload} className="space-y-6">
            
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Document Type</label>
              <select
                value={documentType}
                onChange={(e) => setDocumentType(e.target.value)}
                className="block w-full text-slate-700 py-3 px-4 text-sm border border-slate-300 rounded-lg focus:ring-[#0015A4] focus:border-[#0015A4] bg-white"
              >
                <option value="PASSPORT">Passport Photograph (JPEG)</option>
                <option value="ACCEPTANCE_LETTER">Acceptance Letter</option>
                <option value="PLACEMENT_LETTER">Placement Letter</option>
                <option value="SCHOOL_INTRO">School Introduction Letter</option>
              </select>
            </div>

            {/* Drag & Drop Area */}
            <div 
              className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              
              {file ? (
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-blue-50 text-[#0015A4] rounded-full">
                    <File className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  <p className="text-xs text-[#0015A4] hover:underline mt-2">Click to change file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="p-3 bg-slate-100 text-slate-500 rounded-full mb-2">
                    <UploadCloud className="h-8 w-8" />
                  </div>
                  <p className="text-sm font-medium text-slate-900">Click to upload or drag and drop</p>
                  <p className="text-xs text-slate-500">PDF, DOC, DOCX, JPG or PNG (max. 10MB)</p>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isUploading || !file}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#0015A4] hover:bg-blue-900 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isUploading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <UploadCloud className="h-5 w-5 mr-2" />}
              {isUploading ? 'Uploading...' : 'Upload Document'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <button
              onClick={handleFinishOnboarding}
              className="w-full flex justify-center items-center py-3 px-4 border border-slate-300 rounded-lg shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Finish Onboarding <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
