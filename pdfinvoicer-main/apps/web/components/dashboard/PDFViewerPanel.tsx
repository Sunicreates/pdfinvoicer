'use client';

import React from 'react';
import { FileUpload } from '@/components/pdf/FileUpload';
import dynamic from 'next/dynamic';
const PDFViewer = dynamic(() => import('@/components/pdf/PDFViewer'), { ssr: false });
import { Button } from '@/components/ui/button';

interface PDFViewerPanelProps {
  selectedFile: File | null;
  uploadedFileId: string | null;
  loading: boolean;
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  onUpload: () => void;
}

export function PDFViewerPanel({
  selectedFile,
  uploadedFileId,
  loading,
  onFileSelect,
  onFileRemove,
  onUpload
}: PDFViewerPanelProps) {
  return (
    <div className="responsive-grid-item space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">PDF Viewer</h2>
        {selectedFile && !uploadedFileId && (
          <Button 
            onClick={onUpload} 
            disabled={loading}
            className="responsive-button"
          >
            {loading ? 'Uploading...' : 'Upload'}
          </Button>
        )}
      </div>

      {!selectedFile ? (
        <FileUpload
          onFileSelect={onFileSelect}
          onFileRemove={onFileRemove}
          selectedFile={selectedFile}
          disabled={loading}
          className="responsive-upload-area h-full"
        />
      ) : (
        <div className="h-full border rounded-lg responsive-card">
          <PDFViewer 
            file={selectedFile} 
            className="h-full"
          />
        </div>
      )}
    </div>
  );
}
