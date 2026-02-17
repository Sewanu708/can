# Contact Import System - Frontend Implementation Tasks

## Project Overview

We are building a **multi-step contact import wizard** that allows users to upload CSV/XLSX files containing contact information (leads/prospects), analyze the data, map columns, preview/validate rows, and finally import them into the system.

### Key Goals
- Move heavy processing OFF the browser (files go to S3, processing happens on server)
- Reduce RAM/memory consumption in the browser
- Maintain user control at each step with clear feedback
- Provide excellent UX with progress indicators, validation, and error handling

### Current Tech Stack
- **Next.js 14+** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** components
- **React hooks** for state management

---

## User Flow (Step-by-Step)

### Step 1: Upload
User drags/drops or selects a CSV/XLSX file → File uploads directly to S3 → Get fileId back

### Step 2: Analysis
System analyzes the file on the server → Shows progress → Displays summary:
- Total rows
- Valid rows count
- Invalid rows count  
- Column names detected
- Sample data preview

### Step 3: Column Mapping
User maps their CSV columns to our system fields:
- Their "Email Address" → Our "email" field
- Their "Full Name" → Our "firstName" field
- etc.

System shows auto-detected mappings where column names match

### Step 4: Preview & Validation
User sees paginated table of all data with:
- Valid rows (green highlight)
- Invalid rows (red highlight with error reasons)
- Ability to select/deselect rows for import
- Error details for each bad row

### Step 5: Import Confirmation
User confirms import → Processing happens → Success message with summary

---

## Data Flow & State Management

### Frontend State
The frontend will manage these states throughout the wizard:

```typescript
type ImportState = {
  // Step 1: Upload
  file: File | null;
  fileId: string | null;
  s3Key: string | null;
  
  // Step 2: Analysis
  analysisStatus: 'idle' | 'uploading' | 'analyzing' | 'complete' | 'error';
  analysisProgress: { processed: number; total?: number } | null;
  analysisSummary: {
    totalRows: number;
    validRows: number;
    invalidRows: number;
    columns: string[];
    columnSummary: Record<string, ColumnStats>;
  } | null;
  
  // Step 3: Column Mapping
  columnMapping: Record<string, string>; // { "Email Address": "email", ... }
  
  // Step 4: Preview
  previewData: PreviewRow[];
  selectedRows: Set<number>; // row indices
  currentPage: number;
  
  // Step 5: Import
  importStatus: 'idle' | 'importing' | 'success' | 'error';
  importResult: { imported: number; skipped: number } | null;
  
  // Current wizard step
  currentStep: 1 | 2 | 3 | 4 | 5;
};
```

### API Interactions (What Each Component Needs to Call)

**NOTE**: For this task, you will create MOCK API calls. Do NOT implement actual API routes. Use fake data and simulated delays.

```typescript
// Mock API functions to simulate
async function uploadFile(file: File): Promise<{ fileId: string; s3Key: string }>;
async function getAnalysisStatus(fileId: string): Promise<AnalysisStatus>;
async function submitColumnMapping(fileId: string, mapping: Record<string, string>): Promise<{ success: boolean }>;
async function getPreviewData(fileId: string, page: number): Promise<PreviewResponse>;
async function submitImport(fileId: string, excludedRows: number[]): Promise<ImportResult>;
```

---

## TypeScript Types & Interfaces

```typescript
// lib/types.ts - Create this file with all type definitions

export type WizardStep = 1 | 2 | 3 | 4 | 5;

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
}

export interface AnalysisProgress {
  processed: number;
  total?: number;
  status: 'analyzing' | 'complete';
}

export interface PreviewRow {
  _rowIndex: number;
  _isValid: boolean;
  _errors?: string[];
  [key: string]: any; // Dynamic fields from CSV
}

export interface PreviewResponse {
  rows: PreviewRow[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors?: string[];
}

export type AnalysisStatus = 
  | { status: 'analyzing'; progress: AnalysisProgress }
  | { status: 'complete'; summary: AnalysisSummary }
  | { status: 'error'; message: string };

// System field definitions
export interface SystemField {
  key: string;
  label: string;
  required: boolean;
  type: 'email' | 'phone' | 'text' | 'date';
  description?: string;
}

export const SYSTEM_FIELDS: SystemField[] = [
  { key: 'email', label: 'Email', required: true, type: 'email' },
  { key: 'firstName', label: 'First Name', required: true, type: 'text' },
  { key: 'lastName', label: 'Last Name', required: false, type: 'text' },
  { key: 'phone', label: 'Phone', required: false, type: 'phone' },
  { key: 'company', label: 'Company', required: false, type: 'text' },
  { key: 'title', label: 'Job Title', required: false, type: 'text' },
  { key: 'address', label: 'Address', required: false, type: 'text' },
  { key: 'city', label: 'City', required: false, type: 'text' },
  { key: 'state', label: 'State', required: false, type: 'text' },
  { key: 'country', label: 'Country', required: false, type: 'text' },
  { key: 'notes', label: 'Notes', required: false, type: 'text' },
];
```

---

## Component Specifications

### 1. `components/upload-zone.tsx`

**Purpose**: File upload area with drag & drop support

**Props**:
```typescript
interface UploadZoneProps {
  onFileSelected: (file: File) => void;
  isUploading: boolean;
  acceptedFileTypes?: string[]; // default: ['.csv', '.xlsx']
  maxFileSizeMB?: number; // default: 100
}
```

**Features**:
- Drag and drop zone (use shadcn's `Card` component)
- Click to browse files
- Show file type restrictions
- Show max file size
- Disable when uploading
- Show upload icon (use `lucide-react` icons: `Upload`, `FileSpreadsheet`)
- Validate file type and size before calling `onFileSelected`

**UI States**:
- Default: "Drag and drop your CSV or Excel file here, or click to browse"
- Hover (drag over): Highlight border, change background
- Uploading: Show spinner, disable interaction
- Error: Show error message for invalid files

**Mock Data**: None needed

---

### 2. `components/file-upload-card.tsx`

**Purpose**: Display uploaded file information

**Props**:
```typescript
interface FileUploadCardProps {
  fileName: string;
  fileSize: number; // in bytes
  rowCount?: number; // optional, shown after analysis
  onRemove?: () => void;
}
```

**Features**:
- Show file icon
- Display file name
- Display file size (format: "2.5 MB", "150 KB")
- Display row count if available (e.g., "1,250 rows")
- Remove/clear button (X icon)
- Use shadcn's `Card` component

**Helper Function**:
```typescript
function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
```

**Mock Data**: None needed

---

### 3. `components/analysis-summary.tsx`

**Purpose**: Show analysis results summary

**Props**:
```typescript
interface AnalysisSummaryProps {
  summary: AnalysisSummary;
}
```

**Features**:
- Display total rows, valid rows, invalid rows with icons
- Show columns detected as badges/chips
- Show column statistics in a collapsible section (optional detail view)
- Use shadcn's `Card`, `Badge`, `Collapsible` components
- Use color coding: green for valid, red for invalid, blue for total

**Layout Example**:
```
┌─────────────────────────────────┐
│ Analysis Complete ✓             │
├─────────────────────────────────┤
│ 📊 Total Rows: 1,250            │
│ ✅ Valid Rows: 1,180 (94%)      │
│ ❌ Invalid Rows: 70 (6%)        │
│                                  │
│ Columns Detected (8):           │
│ [Email] [First Name] [Last Name]│
│ [Phone] [Company] [Title]...    │
│                                  │
│ > Show Column Details           │
└─────────────────────────────────┘
```

**Mock Data**:
```typescript
const mockSummary: AnalysisSummary = {
  totalRows: 1250,
  validRows: 1180,
  invalidRows: 70,
  columns: ['Email Address', 'First Name', 'Last Name', 'Phone Number', 'Company', 'Job Title', 'City', 'State'],
  columnSummary: {
    'Email Address': { filled: 1240, empty: 10, unique: 1235 },
    'First Name': { filled: 1250, empty: 0, unique: 450 },
    'Phone Number': { filled: 980, empty: 270, unique: 975 },
    // ... etc
  }
};
```

---

### 4. `components/column-mapper.tsx`

**Purpose**: Map CSV columns to system fields

**Props**:
```typescript
interface ColumnMapperProps {
  detectedColumns: string[]; // Columns from CSV
  systemFields: SystemField[]; // Available system fields
  initialMapping?: Record<string, string>; // Auto-detected mappings
  onMappingChange: (mapping: Record<string, string>) => void;
  onContinue: () => void;
}
```

**Features**:
- Show each detected column with a dropdown to select system field
- Auto-match similar names (e.g., "Email Address" → "email")
- Highlight required fields that aren't mapped (warning)
- Show unmapped columns (user can ignore them)
- "Skip this column" option in dropdown
- Use shadcn's `Select`, `Label`, `Alert` components
- Continue button (disabled if required fields not mapped)

**Auto-Matching Logic** (simple fuzzy match):
```typescript
function autoMatchColumn(csvColumn: string, systemFields: SystemField[]): string | null {
  const normalized = csvColumn.toLowerCase().replace(/[^a-z]/g, '');
  
  for (const field of systemFields) {
    const fieldNormalized = field.key.toLowerCase();
    if (normalized.includes(fieldNormalized) || fieldNormalized.includes(normalized)) {
      return field.key;
    }
  }
  return null;
}
```

**Layout Example**:
```
┌─────────────────────────────────────────────┐
│ Map Your Columns                             │
├─────────────────────────────────────────────┤
│ Email Address        →  [Email ▼]      *     │
│ First Name           →  [First Name ▼] *     │
│ Last Name            →  [Last Name ▼]        │
│ Phone Number         →  [Phone ▼]            │
│ Company Name         →  [Company ▼]          │
│ Random Column        →  [Skip ▼]             │
├─────────────────────────────────────────────┤
│ ⚠️ Required: Email, First Name               │
│                                   [Continue] │
└─────────────────────────────────────────────┘
```

**Mock Data**: Use `SYSTEM_FIELDS` from types.ts

---

### 5. `components/data-preview-table.tsx`

**Purpose**: Paginated table with row selection and validation highlighting

**Props**:
```typescript
interface DataPreviewTableProps {
  data: PreviewRow[];
  columns: string[]; // Column names to display
  selectedRows: Set<number>;
  onRowSelectionChange: (selectedRows: Set<number>) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}
```

**Features**:
- Checkbox column for row selection
- Highlight valid rows (light green background)
- Highlight invalid rows (light red background)
- Show error icon + tooltip with error details for invalid rows
- Pagination controls at bottom
- "Select all" checkbox in header (for current page only)
- Show row numbers
- Use shadcn's `Table`, `Checkbox`, `Pagination`, `Tooltip` components
- Responsive (scrollable on mobile)

**Layout Example**:
```
┌──────────────────────────────────────────────────────┐
│ Preview Data (Page 1 of 13)                          │
├──┬────┬──────────┬────────────┬────────────┬─────────┤
│☑ │ #  │ Email    │ First Name │ Last Name  │ Phone   │
├──┼────┼──────────┼────────────┼────────────┼─────────┤
│☑ │ 1  │ john@... │ John       │ Doe        │ 555-... │ ✓
│☑ │ 2  │ jane@... │ Jane       │ Smith      │ 555-... │ ✓
│☐ │ 3  │ invalid  │ Bob        │ Brown      │         │ ⚠️
│☑ │ 4  │ alice... │ Alice      │ Johnson    │ 555-... │ ✓
├──┴────┴──────────┴────────────┴────────────┴─────────┤
│                            « 1 2 3 [4] 5 ... 13 »     │
└──────────────────────────────────────────────────────┘
```

**Mock Data**:
```typescript
const mockPreviewData: PreviewRow[] = [
  { _rowIndex: 1, _isValid: true, email: 'john@example.com', firstName: 'John', lastName: 'Doe', phone: '555-1234' },
  { _rowIndex: 2, _isValid: true, email: 'jane@example.com', firstName: 'Jane', lastName: 'Smith', phone: '555-5678' },
  { _rowIndex: 3, _isValid: false, _errors: ['Invalid email format'], email: 'notanemail', firstName: 'Bob', lastName: 'Brown', phone: '' },
  { _rowIndex: 4, _isValid: true, email: 'alice@example.com', firstName: 'Alice', lastName: 'Johnson', phone: '555-9999' },
  // ... 96 more rows for testing pagination
];
```

---

### 6. `components/progress-indicator.tsx`

**Purpose**: Show processing progress

**Props**:
```typescript
interface ProgressIndicatorProps {
  progress: number; // 0-100
  status: string; // e.g., "Analyzing file...", "Processing row 1,250 of 5,000"
  isIndeterminate?: boolean; // Show spinner instead of percentage
}
```

**Features**:
- Progress bar (use shadcn's `Progress` component)
- Status text above/below progress bar
- Percentage display
- Indeterminate/spinner mode for unknown progress
- Use `lucide-react` `Loader2` icon for spinner

**Layout Example**:
```
┌─────────────────────────────────┐
│ Analyzing file...                │
│ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░  45%      │
│ Processing row 2,250 of 5,000    │
└─────────────────────────────────┘
```

**Mock Data**: None needed (controlled by parent)

---

### 7. `components/error-list.tsx`

**Purpose**: Display validation errors grouped by type

**Props**:
```typescript
interface ErrorListProps {
  errors: ValidationError[];
  onViewRow?: (rowIndex: number) => void; // Jump to row in preview
}

interface ValidationError {
  rowIndex: number;
  field: string;
  message: string;
  value?: string;
}
```

**Features**:
- Group errors by type (e.g., "Invalid Email (45)", "Missing Required Field (12)")
- Collapsible sections for each error type
- Show row numbers with errors
- Click to jump to row in preview (optional)
- Use shadcn's `Accordion`, `Badge`, `ScrollArea` components

**Layout Example**:
```
┌─────────────────────────────────────┐
│ Validation Errors (57)               │
├─────────────────────────────────────┤
│ > Invalid Email (45)                 │
│   └─ Row 3: "notanemail"             │
│   └─ Row 12: "missing@"              │
│   └─ Row 34: "no-domain"             │
│   ...                                │
│                                      │
│ > Missing Required Field (12)        │
│   └─ Row 8: First Name is required   │
│   └─ Row 19: Email is required       │
│   ...                                │
└─────────────────────────────────────┘
```

**Mock Data**:
```typescript
const mockErrors: ValidationError[] = [
  { rowIndex: 3, field: 'email', message: 'Invalid email format', value: 'notanemail' },
  { rowIndex: 8, field: 'firstName', message: 'First Name is required', value: '' },
  { rowIndex: 12, field: 'email', message: 'Invalid email format', value: 'missing@' },
  // ... more errors
];
```

---

### 8. `components/import-confirmation.tsx`

**Purpose**: Final confirmation before import

**Props**:
```typescript
interface ImportConfirmationProps {
  totalRows: number;
  selectedRows: number;
  validRows: number;
  invalidRows: number;
  onConfirm: () => void;
  onCancel: () => void;
  isImporting: boolean;
}
```

**Features**:
- Show import summary
- Warning if importing invalid rows
- Confirm and Cancel buttons
- Use shadcn's `Dialog` or `AlertDialog` component
- Disable buttons during import

**Layout Example**:
```
┌─────────────────────────────────────┐
│ Confirm Import                       │
├─────────────────────────────────────┤
│ You are about to import:             │
│                                      │
│ • 1,180 contacts                     │
│ • 70 rows will be skipped (invalid)  │
│                                      │
│ This action cannot be undone.        │
│                                      │
│          [Cancel]  [Import Contacts] │
└─────────────────────────────────────┘
```

**Mock Data**: None needed (controlled by parent)

---

### 9. `components/import-success.tsx`

**Purpose**: Success message after import

**Props**:
```typescript
interface ImportSuccessProps {
  imported: number;
  skipped: number;
  onViewContacts?: () => void;
  onImportAnother?: () => void;
}
```

**Features**:
- Success icon and message
- Show imported and skipped counts
- Action buttons: "View Contacts", "Import Another File"
- Use shadcn's `Card`, `Button` components
- Use `lucide-react` `CheckCircle2` icon

**Layout Example**:
```
┌─────────────────────────────────────┐
│        ✅ Import Successful!         │
├─────────────────────────────────────┤
│ 1,180 contacts imported              │
│ 70 rows skipped                      │
│                                      │
│ [View Contacts]  [Import Another]    │
└─────────────────────────────────────┘
```

**Mock Data**: None needed (controlled by parent)

---

## Custom Hooks Specifications

### 10. `hooks/use-file-upload.ts`

**Purpose**: Handle file upload with progress

**Interface**:
```typescript
interface UseFileUploadReturn {
  uploadFile: (file: File) => Promise<{ fileId: string; s3Key: string }>;
  isUploading: boolean;
  uploadProgress: number; // 0-100
  error: string | null;
}

export function useFileUpload(): UseFileUploadReturn;
```

**Mock Implementation**:
```typescript
// Simulate upload with delay
async function uploadFile(file: File) {
  setIsUploading(true);
  setError(null);
  
  // Simulate progress
  for (let i = 0; i <= 100; i += 10) {
    setUploadProgress(i);
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  setIsUploading(false);
  
  return {
    fileId: `file_${Date.now()}`,
    s3Key: `uploads/${file.name}`
  };
}
```

---

### 11. `hooks/use-analysis.ts`

**Purpose**: Poll for analysis status

**Interface**:
```typescript
interface UseAnalysisReturn {
  status: 'idle' | 'analyzing' | 'complete' | 'error';
  progress: AnalysisProgress | null;
  summary: AnalysisSummary | null;
  error: string | null;
  startAnalysis: (fileId: string) => void;
  reset: () => void;
}

export function useAnalysis(): UseAnalysisReturn;
```

**Mock Implementation**:
```typescript
// Simulate analysis with polling
function startAnalysis(fileId: string) {
  setStatus('analyzing');
  
  let processed = 0;
  const total = 1250;
  
  const interval = setInterval(() => {
    processed += 250;
    setProgress({ processed, total, status: 'analyzing' });
    
    if (processed >= total) {
      clearInterval(interval);
      setStatus('complete');
      setSummary(mockSummary); // Use mock data from earlier
    }
  }, 500);
}
```

---

### 12. `hooks/use-import.ts`

**Purpose**: Handle final import process

**Interface**:
```typescript
interface UseImportReturn {
  startImport: (fileId: string, excludedRows: number[]) => Promise<void>;
  isImporting: boolean;
  result: ImportResult | null;
  error: string | null;
  reset: () => void;
}

export function useImport(): UseImportReturn;
```

**Mock Implementation**:
```typescript
async function startImport(fileId: string, excludedRows: number[]) {
  setIsImporting(true);
  setError(null);
  
  // Simulate import delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  setIsImporting(false);
  setResult({
    success: true,
    imported: 1180,
    skipped: 70
  });
}
```

---

## Main Page Specification

### 13. `app/import/page.tsx`

**Purpose**: Main import wizard orchestrator

**Features**:
- Multi-step wizard (5 steps)
- Step indicator at top (breadcrumb/stepper)
- State management for entire flow
- Navigate between steps
- Use all the components above

**Layout**:
```
┌──────────────────────────────────────────────┐
│ Import Contacts                               │
│                                               │
│ ① Upload → ② Analyze → ③ Map → ④ Preview → ⑤ Import
│ ───────   ────────   ─────   ────────   ──────
│                                               │
│ ┌──────────────────────────────────────────┐ │
│ │                                          │ │
│ │  [Current Step Component Renders Here]   │ │
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│                                               │
│                  [Back]  [Next]               │
└──────────────────────────────────────────────┘
```

**Step Flow**:
1. Show `UploadZone` → Upload file → Show `FileUploadCard`
2. Show `ProgressIndicator` → Poll with `useAnalysis` → Show `AnalysisSummary`
3. Show `ColumnMapper` → Submit mapping
4. Show `DataPreviewTable` + `ErrorList` (sidebar) → User selects rows
5. Show `ImportConfirmation` → Import with `useImport` → Show `ImportSuccess`

**State Management**: Use `useState` for all the state described in the "Data Flow" section

---

## Constants & Configuration

### 14. `lib/constants.ts`

```typescript
export const MAX_FILE_SIZE_MB = 100;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export const ACCEPTED_FILE_TYPES = ['.csv', '.xlsx', '.xls'];
export const ACCEPTED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

export const PREVIEW_PAGE_SIZE = 100;
export const ANALYSIS_POLL_INTERVAL_MS = 2000;

export const ERROR_MESSAGES = {
  FILE_TOO_LARGE: `File size exceeds ${MAX_FILE_SIZE_MB}MB limit`,
  INVALID_FILE_TYPE: 'Please upload a CSV or Excel file',
  UPLOAD_FAILED: 'Failed to upload file. Please try again.',
  ANALYSIS_FAILED: 'Failed to analyze file. Please try again.',
  IMPORT_FAILED: 'Failed to import contacts. Please try again.',
};
```

---

## Validation Logic

### 15. `lib/validators.ts`

**Create mock validators** (these will be used on the server later, but define them now):

```typescript
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  // Simple validation: at least 10 digits
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
}

export function validateRequired(value: string): boolean {
  return value && value.trim().length > 0;
}

export function validateRow(row: Record<string, any>, mapping: Record<string, string>): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // Check required fields
  if (!row.email || !validateEmail(row.email)) {
    errors.push('Invalid or missing email');
  }
  
  if (!row.firstName || !validateRequired(row.firstName)) {
    errors.push('First name is required');
  }
  
  // Check phone if provided
  if (row.phone && !validatePhone(row.phone)) {
    errors.push('Invalid phone number format');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

---

## Mock API Functions

### 16. `lib/mock-api.ts`

**Create all mock API functions** that components will use:

```typescript
import { AnalysisSummary, PreviewRow, ImportResult } from './types';

export async function mockUploadFile(file: File): Promise<{ fileId: string; s3Key: string }> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  return {
    fileId: `file_${Date.now()}`,
    s3Key: `uploads/${Date.now()}-${file.name}`
  };
}

export async function mockAnalyzeFile(fileId: string): Promise<AnalysisSummary> {
  // Simulate analysis delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  return {
    totalRows: 1250,
    validRows: 1180,
    invalidRows: 70,
    columns: ['Email Address', 'First Name', 'Last Name', 'Phone Number', 'Company', 'Job Title', 'City', 'State'],
    columnSummary: {
      'Email Address': { filled: 1240, empty: 10, unique: 1235 },
      'First Name': { filled: 1250, empty: 0, unique: 450 },
      'Last Name': { filled: 1248, empty: 2, unique: 890 },
      'Phone Number': { filled: 980, empty: 270, unique: 975 },
      'Company': { filled: 1100, empty: 150, unique: 450 },
      'Job Title': { filled: 1050, empty: 200, unique: 320 },
      'City': { filled: 1200, empty: 50, unique: 180 },
      'State': { filled: 1220, empty: 30, unique: 48 },
    }
  };
}

export async function mockGetPreviewData(fileId: string, page: number): Promise<{
  rows: PreviewRow[];
  total: number;
  page: number;
  pageSize: number;
}> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Generate mock preview data
  const pageSize = 100;
  const startIdx = (page - 1) * pageSize;
  const rows: PreviewRow[] = [];
  
  for (let i = 0; i < pageSize; i++) {
    const rowIndex = startIdx + i + 1;
    const isValid = Math.random() > 0.05; // 95% valid
    
    rows.push({
      _rowIndex: rowIndex,
      _isValid: isValid,
      _errors: isValid ? undefined : ['Invalid email format'],
      email: isValid ? `user${rowIndex}@example.com` : `invalid${rowIndex}`,
      firstName: `FirstName${rowIndex}`,
      lastName: `LastName${rowIndex}`,
      phone: `555-${String(rowIndex).padStart(4, '0')}`,
      company: `Company ${rowIndex % 50}`,
      title: `Job Title ${rowIndex % 20}`,
    });
  }
  
  return {
    rows,
    total: 1250,
    page,
    pageSize
  };
}

export async function mockImportContacts(fileId: string, excludedRows: number[]): Promise<ImportResult> {
  // Simulate import delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return {
    success: true,
    imported: 1180,
    skipped: 70
  };
}
```

---

## Styling Guidelines

### Use shadcn/ui Components
- `Button`, `Card`, `Table`, `Select`, `Checkbox`, `Badge`, `Progress`, `Dialog`, `Accordion`, `Tooltip`, `Separator`

### Use lucide-react Icons
- `Upload`, `FileSpreadsheet`, `CheckCircle2`, `XCircle`, `AlertCircle`, `Loader2`, `ChevronLeft`, `ChevronRight`, `X`, `Info`

### Color Scheme
- **Success/Valid**: green-500, bg-green-50
- **Error/Invalid**: red-500, bg-red-50
- **Warning**: yellow-500, bg-yellow-50
- **Info**: blue-500, bg-blue-50
- **Neutral**: gray-500, bg-gray-50

### Responsive Design
- Mobile-first approach
- Stack components vertically on small screens
- Make tables scrollable horizontally on mobile
- Reduce padding/spacing on mobile

---

## Testing Checklist

When implementing each component, test:
- ✅ Renders without errors
- ✅ Props are typed correctly
- ✅ Handles edge cases (empty data, null values)
- ✅ Responsive on mobile and desktop
- ✅ Accessible (keyboard navigation, ARIA labels)
- ✅ Loading states work
- ✅ Error states display properly

---

## Implementation Priority

Build in this order for fastest progress:

1. **Types & Constants** (`lib/types.ts`, `lib/constants.ts`) - Foundation
2. **Mock API** (`lib/mock-api.ts`) - So components can fetch data
3. **Upload Components** (`upload-zone.tsx`, `file-upload-card.tsx`) - Step 1
4. **Progress & Analysis** (`progress-indicator.tsx`, `analysis-summary.tsx`) - Step 2
5. **Column Mapping** (`column-mapper.tsx`) - Step 3
6. **Preview Components** (`data-preview-table.tsx`, `error-list.tsx`) - Step 4
7. **Import Components** (`import-confirmation.tsx`, `import-success.tsx`) - Step 5
8. **Hooks** (`use-file-upload.ts`, `use-analysis.ts`, `use-import.ts`) - Glue code
9. **Main Page** (`app/import/page.tsx`) - Orchestrates everything

---

## Notes for AI Assistant

- **DO NOT** create any backend API routes (no `/app/api/` folder)
- **DO NOT** implement actual S3 uploads or Redis connections
- **DO** use mock functions with realistic delays (setTimeout)
- **DO** use TypeScript strictly - no `any` types unless necessary
- **DO** make components reusable and well-typed
- **DO** add helpful comments for complex logic
- **DO** handle loading and error states in every component
- **DO** use shadcn/ui components consistently
- **FOCUS** on making the UI/UX smooth and professional

---

## Questions to Ask Before Starting

1. Should we use a specific color theme or stick with shadcn defaults?
2. Do you want animations/transitions between wizard steps?
3. Should we add keyboard shortcuts (e.g., Enter to continue)?
4. Do you want a "Save Draft" feature to resume later?
5. Should the wizard be fullscreen or centered with max-width?

---

## Final Deliverable

When complete, you should have:
- ✅ All 12 components working with mock data
- ✅ 3 custom hooks for state management
- ✅ 1 main page that orchestrates the full wizard flow
- ✅ Type-safe TypeScript throughout
- ✅ Responsive, accessible UI with shadcn/ui
- ✅ Ready to plug in real API endpoints later (just replace mock functions)

Good luck! 🚀