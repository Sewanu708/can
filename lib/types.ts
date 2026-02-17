// lib/types.ts

export interface ColumnStats {
  filled: number;
  empty: number;
  unique: number;
  samples?: string[]; // First 5 unique values
}



export interface AnalysisSummary {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  columns: string[];
  columnSummary: Record<string, ColumnStats>;
  sampleRows: PreviewRow[];
  s3Key: string;
  fileId: string;
}

export interface AnalysisProgress {
  processed: number;
  total?: number;
  status: "analyzing" | "complete" | "error";
}

export interface PreviewRow {
  _rowIndex: number;
  _isValid: boolean;
  _errors?: string[];
  [key: string]: any; // Dynamic fields from CSV
}

export interface ColumnMapping {
  mapping: Record<string, string>; // { "Email Address": "email", ... }
  s3Key: string;
  fileId: string;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors?: Array<{ row: number; message: string }>;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

// System fields that users can map to
export interface SystemField {
  key: string;
  label: string;
  required: boolean;
  type: "email" | "phone" | "text" | "date" | "number";
  validate?: (value: any) => boolean;
}

// Redis/Storage keys
export const STORAGE_KEYS = {
  analysis: (fileId: string) => `analysis:${fileId}`,
  progress: (fileId: string) => `analysis:${fileId}:progress`,
  mapping: (fileId: string) => `mapping:${fileId}`,
};

// Constants
export const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || "100");
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_ROWS_ALLOWED = parseInt(
  process.env.MAX_ROWS_ALLOWED || "500000"
);
export const PREVIEW_PAGE_SIZE = 100;
export const SAMPLE_ROWS_COUNT = 1000; // How many rows to keep for preview
export const TTL_SECONDS = 3600; // 1 hour expiration for Redis data

export const ALLOWED_MIME_TYPES = [
  "text/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
];
