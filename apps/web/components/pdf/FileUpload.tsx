'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, File, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  disabled?: boolean;
  className?: string;
}

export function FileUpload({
  onFileSelect,
  onFileRemove,
  selectedFile,
  disabled = false,
  className
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
    setDragActive(false);
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf']
    },
    multiple: false,
    maxFiles: 1,
    maxSize: 25 * 1024 * 1024, // 25MB
    disabled,
    onDragEnter: (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(true);
    },
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
    },
    onDragLeave: (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
    },
    onDropRejected: (fileRejections) => {
      setDragActive(false);
      const errors = fileRejections[0]?.errors;
      if (errors) {
        const errorMessage = errors.map(e => e.message).join(', ');
        alert(`Upload failed: ${errorMessage}`);
      }
    }
  });

  if (selectedFile) {
    return (
      <div className={cn("responsive-card border-2 border-dashed border-border rounded-lg", className)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <File className="h-8 w-8 text-primary" />
            <div>
              <p className="font-medium">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onFileRemove}
            disabled={disabled}
            className="responsive-button"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "responsive-upload-area border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
        isDragActive || dragActive
          ? "border-primary bg-primary/10"
          : "border-muted-foreground/25 hover:border-muted-foreground/50",
        disabled && "cursor-not-allowed opacity-50",
        className
      )}
    >
      <input {...getInputProps() as React.InputHTMLAttributes<HTMLInputElement>} />
      <Upload className="upload-icon mx-auto h-12 w-12 text-muted-foreground mb-4" />
      <div className="space-y-2">
        <p className="upload-text text-lg font-medium">
          {isDragActive ? "Drop the PDF here" : "Upload PDF"}
        </p>
        <p className="upload-subtext text-sm text-muted-foreground">
          Drag and drop a PDF file here, or click to browse
        </p>
        <p className="upload-subtext text-xs text-muted-foreground">
          Maximum file size: 25MB
        </p>
      </div>
    </div>
  );
}
