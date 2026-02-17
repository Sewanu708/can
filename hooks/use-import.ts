"use client";

import { useState } from 'react';
import { ImportResult } from '@/lib/types';
import { ERROR_MESSAGES } from '@/lib/constants';

interface UseImportReturn {
  startImport: (fileId: string, excludedRows: number[]) => Promise<void>;
  isImporting: boolean;
  result: ImportResult | null;
  error: string | null;
  reset: () => void;
}

export function useImport(): UseImportReturn {
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startImport = async (fileId: string, excludedRows: number[]) => {
    setIsImporting(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, excludedRows }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || ERROR_MESSAGES.IMPORT_FAILED);
      }

      const importResult = await response.json();
      setResult(importResult);

    } catch (e: any) {
      setError(e.message || ERROR_MESSAGES.IMPORT_FAILED);
    } finally {
      setIsImporting(false);
    }
  };

  const reset = () => {
    setIsImporting(false);
    setResult(null);
    setError(null);
  };

  return { startImport, isImporting, result, error, reset };
}
