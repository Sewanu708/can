"use client";

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { MAX_FILE_SIZE_BYTES, ACCEPTED_MIME_TYPES, ERROR_MESSAGES } from '@/lib/constants';

interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  acceptedFileTypes?: string[];
  maxFileSizeMB?: number;
}

export function UploadZone({
  onFileSelected,
  isUploading,
  acceptedFileTypes = ['.csv', '.xlsx'],
  maxFileSizeMB = 100,
}: UploadZoneProps) {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: any[]) => {
    setError(null);

    if (rejectedFiles.length > 0) {
      const firstError = rejectedFiles[0].errors[0];
      if (firstError.code === 'file-too-large') {
        setError(ERROR_MESSAGES.FILE_TOO_LARGE);
      } else if (firstError.code === 'file-invalid-type') {
        setError(ERROR_MESSAGES.INVALID_FILE_TYPE);
      } else {
        setError('An unknown error occurred.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelected(acceptedFiles[0]);
    }
  }, [onFileSelected]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
    maxSize: MAX_FILE_SIZE_BYTES,
    multiple: false,
    disabled: isUploading,
  });

  return (
    <Card
      {...getRootProps()}
      className={cn(
        'border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors',
        isDragActive ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50',
        isUploading ? 'cursor-not-allowed bg-muted/50' : ''
      )}
    >
      <input {...getInputProps()} />
      <CardContent className="flex flex-col items-center justify-center space-y-4">
        {isUploading ? (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="text-muted-foreground">Uploading...</p>
          </>
        ) : (
          <>
            <div className="flex items-center justify-center space-x-4">
              <Upload className="h-12 w-12 text-muted-foreground" />
              <FileSpreadsheet className="h-12 w-12 text-muted-foreground" />
            </div>
            <p className="text-lg font-medium">
              {isDragActive ? 'Drop the file here...' : 'Drag and drop your file here, or click to browse'}
            </p>
            <p className="text-sm text-muted-foreground">
              Accepted file types: {acceptedFileTypes.join(', ')}. Max size: {maxFileSizeMB}MB.
            </p>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
