'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { PDFViewerPanel } from '@/components/dashboard/PDFViewerPanel';
import { DataExtractionPanel } from '@/components/dashboard/DataExtractionPanel';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { uploadFile, extractData, createInvoice } from '@/lib/api';
import { ExtractRequest, Invoice } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setUploadedFileId(null);
    setExtractedData(null);
    setError(null);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    setUploadedFileId(null);
    setExtractedData(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    try {
      const uploadResult = await uploadFile(selectedFile);
      setUploadedFileId(uploadResult.fileId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleExtract = async (model: 'gemini' | 'groq') => {
    if (!uploadedFileId) return;

    setLoading(true);
    setError(null);

    try {
      const extractRequest: ExtractRequest = {
        fileId: uploadedFileId,
        model
      };
      const result = await extractData(extractRequest);
      setExtractedData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!extractedData) {
      setError('No data to save');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const savedInvoice = await createInvoice(extractedData);
      // Redirect to the saved invoice detail page
      router.push(`/invoices/${savedInvoice._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="responsive-container">
      <DashboardHeader
        title="PDF Dashboard"
        subtitle="Upload PDFs and extract invoice data using AI"
        actionLabel="View All Invoices"
        actionPath="/invoices"
      />

      <div className="responsive-grid">
        <PDFViewerPanel
          selectedFile={selectedFile}
          uploadedFileId={uploadedFileId}
          loading={loading}
          onFileSelect={handleFileSelect}
          onFileRemove={handleFileRemove}
          onUpload={handleUpload}
        />

        <DataExtractionPanel
          uploadedFileId={uploadedFileId}
          extractedData={extractedData}
          loading={loading}
          error={error}
          onExtract={handleExtract}
          onSave={handleSave}
        />
      </div>

      <MobileNavigation 
        showFab={!selectedFile}
      />
    </div>
  );
}
