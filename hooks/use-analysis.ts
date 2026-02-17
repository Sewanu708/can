"use client";

import { useState, useCallback, useRef } from 'react';
import { AnalysisProgress, AnalysisSummary } from '@/lib/types';
import { ERROR_MESSAGES, ANALYSIS_POLL_INTERVAL_MS } from '@/lib/constants';

interface UseAnalysisReturn {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  progress: AnalysisProgress | null;
  summary: AnalysisSummary | null;
  error: string | null;
  startAnalysis: (fileId: string, s3Key: string) => void;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn {
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'complete' | 'error'>('idle');
  const [progress, setProgress] = useState<AnalysisProgress | null>(null);
  const [summary, setSummary] = useState<AnalysisSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  const pollStatus = useCallback(async (fileId: string) => {
    try {
      const response = await fetch(`/api/analyze/status/${fileId}`);
      if (!response.ok) {
        throw new Error('Failed to get analysis status');
      }
      const result = await response.json();

      if (result.status === 'analyzing') {
        setProgress(result.progress);
        setStatus('analyzing');
      } else if (result.status === 'complete') {
        setSummary(result.summary);
        setStatus('complete');
        setProgress(null);
        stopPolling();
      } else if (result.status === 'error') {
        setError(result.message || ERROR_MESSAGES.ANALYSIS_FAILED);
        setStatus('error');
        setProgress(null);
        stopPolling();
      }
    } catch (e: any) {
      setError(e.message || ERROR_MESSAGES.ANALYSIS_FAILED);
      setStatus('error');
      stopPolling();
    }
  }, [stopPolling]);

  const startAnalysis = useCallback(async (fileId: string, s3Key: string) => {
    setStatus('analyzing');
    setError(null);
    setSummary(null);
    setProgress({ processed: 0, status: 'analyzing' });

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileId, s3Key }),
      });

      if (!response.ok) {
        throw new Error('Failed to start analysis');
      }

      // Start polling
      pollIntervalRef.current = setInterval(() => {
        pollStatus(fileId);
      }, ANALYSIS_POLL_INTERVAL_MS);

    } catch (e: any) {
      setError(e.message || ERROR_MESSAGES.ANALYSIS_FAILED);
      setStatus('error');
    }
  }, [pollStatus]);

  const reset = useCallback(() => {
    stopPolling();
    setStatus('idle');
    setProgress(null);
    setSummary(null);
    setError(null);
  }, [stopPolling]);

  return { status, progress, summary, error, startAnalysis, reset };
}
