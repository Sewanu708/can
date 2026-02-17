"use client";

import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
  progress: number; // 0-100
  status: string;
  isIndeterminate?: boolean;
}

export function ProgressIndicator({
  progress,
  status,
  isIndeterminate = false,
}: ProgressIndicatorProps) {
  return (
    <div className="w-full space-y-2">
      <p className="text-sm text-muted-foreground">{status}</p>
      {isIndeterminate ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="flex items-center space-x-4">
          <Progress value={progress} className="w-full" />
          <p className="text-sm font-medium">{Math.round(progress)}%</p>
        </div>
      )}
    </div>
  );
}
