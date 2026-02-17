"use client";

import { useState } from 'react';
import { ERROR_MESSAGES } from '@/lib/constants';

interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<{ fileId: string; s3Key: string } | null>;
  isUploading: boolean;
  uploadProgress: number;
  error: string | null;
}

export function useFileUpload(): UseFileUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<{ fileId: string; s3Key: string } | null> => {
    setIsUploading(true);
    setError(null);
    setUploadProgress(0);

    try {
      // 1. Get presigned URL from our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
        }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || ERROR_MESSAGES.UPLOAD_FAILED);
      }

      const { uploadUrl, fileId, s3Key } = await response.json();

      // 2. Upload file to S3 directly
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open('PUT', uploadUrl);
        xhr.upload.onprogress = event => {
          if (event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(percentComplete);
          }
        };
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve();
          } else {
            reject(new Error('S3 upload failed'));
          }
        };
        xhr.onerror = () => reject(new Error('S3 upload failed'));
        xhr.send(file);
      });
      
      setIsUploading(false);
      return { fileId, s3Key };

    } catch (e: any) {
      setError(e.message || ERROR_MESSAGES.UPLOAD_FAILED);
      setIsUploading(false);
      setUploadProgress(0);
      return null;
    }
  };

  return { uploadFile, isUploading, uploadProgress, error };
}
