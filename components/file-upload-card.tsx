"use client";

import { FileSpreadsheet, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

interface FileUploadCardProps {
  fileName: string;
  fileSize: number; // in bytes
  rowCount?: number; // optional, shown after analysis
  onRemove?: () => void;
}

export function FileUploadCard({
  fileName,
  fileSize,
  rowCount,
  onRemove,
}: FileUploadCardProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <FileSpreadsheet className="h-8 w-8 text-primary" />
            <div>
              <CardTitle className="text-lg">{fileName}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {formatFileSize(fileSize)}
                {rowCount && ` · ${rowCount.toLocaleString()} rows`}
              </p>
            </div>
          </div>
          {onRemove && (
            <Button variant="ghost" size="icon" onClick={onRemove}>
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>
      </CardHeader>
    </Card>
  );
}
