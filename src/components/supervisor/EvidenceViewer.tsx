"use client";

import React, { useState, useEffect } from 'react';
import { ImageIcon, FileX, Loader2, AlertCircle } from 'lucide-react';
import apiClient from '../../services/apiClient';

export interface EvidenceMetadata {
  documentId: string;
  fileName: string;
  fileFormat?: string;
  fileSizeBytes?: number;
  uploadedAt?: string;
}

interface EvidenceViewerProps {
  attachments: EvidenceMetadata[];
}

function EvidenceCard({ attachment }: { attachment: EvidenceMetadata }) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

 useEffect(() => {
    let isMounted = true;

    const fetchSignedUrl = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get(`/documents/${attachment.documentId}/url`);
        if (isMounted) {
          setSignedUrl(response.data.url);
        }
      } catch (err) {
        console.warn('Backend offline - using fallback URL for local UI testing:', err);
        if (isMounted) {
          // Mock URL so you can preview the UI and button hover states locally
          setSignedUrl("#");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    if (attachment.documentId) {
      fetchSignedUrl();
    }

    return () => {
      isMounted = false;
    };
  }, [attachment.documentId]);

  return (
    <div className="relative group rounded-xl overflow-hidden border border-slate-200 shadow-sm bg-slate-100 aspect-video flex items-center justify-center p-4">
      {isLoading && (
        <div className="flex flex-col items-center text-slate-400">
          <Loader2 size={24} className="animate-spin mb-2" />
          <span className="text-xs font-medium">Securing link...</span>
        </div>
      )}

      {error && !isLoading && (
        <div className="flex flex-col items-center text-rose-500">
          <AlertCircle size={24} className="mb-2" />
          <span className="text-xs font-medium">Failed to load</span>
        </div>
      )}

      {!isLoading && !error && signedUrl && (
        <>
          <div className="flex flex-col items-center text-slate-500">
            <ImageIcon size={32} className="mb-2 text-slate-400" />
            <span className="text-xs font-medium px-2 truncate w-full text-center">
              {attachment.fileName || 'Document'}
            </span>
            {attachment.fileSizeBytes && (
              <span className="text-[10px] text-slate-400 mt-0.5">
                {(attachment.fileSizeBytes / 1024 / 1024).toFixed(2)} MB
              </span>
            )}
          </div>

          <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <a
              href={signedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-white text-slate-900 text-sm font-medium rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
            >
              View Full
            </a>
          </div>
        </>
      )}
    </div>
  );
}

export default function EvidenceViewer({ attachments }: EvidenceViewerProps) {
  if (!attachments || attachments.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-slate-500">
        <FileX size={32} className="mb-2 text-slate-400" />
        <p className="text-sm font-medium">No evidence attached</p>
        <p className="text-xs text-slate-400 mt-1">The student did not upload any files for this log.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {attachments.map((attachment, index) => (
        <EvidenceCard key={attachment.documentId || index} attachment={attachment} />
      ))}
    </div>
  );
}