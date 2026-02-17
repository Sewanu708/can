# Contact Import System - Backend Implementation Tasks

## Project Overview

This document covers the **backend implementation** for the contact import system. The frontend has already been built (see `TASK.md`). Now we need to create the API routes and server-side logic to:

1. Generate presigned S3 URLs for file uploads
2. Analyze CSV/XLSX files from S3
3. Store temporary state in Redis (or S3 as alternative)
4. Process column mappings
5. Provide paginated preview data
6. Execute final import into database

---

## Architecture Overview

```
User Browser
     ↓
   Next.js API Routes (app/api/*)
     ↓
   ├─→ AWS S3 (file storage)
   ├─→ Redis/Upstash (temporary state)
   └─→ Your Database (final contact import)
```

### Data Flow

1. **Upload**: Browser → S3 (direct upload via presigned URL)
2. **Analysis**: API fetches from S3 → Parses CSV → Stores results in Redis
3. **Mapping**: API retrieves from Redis → Applies mapping → Stores back in Redis
4. **Preview**: API retrieves from Redis → Returns paginated data
5. **Import**: API fetches from S3 → Validates → Inserts into your database

---

## Tech Stack

- **Next.js 14+** App Router (API Routes)
- **TypeScript**
- **AWS S3** (file storage)
- **Redis (Upstash)** (temporary state) OR **S3 JSON files** (alternative)
- **csv-parse** (CSV parsing)
- **xlsx** (Excel parsing)

---

## Environment Variables

Create/update `.env.local`:

```bash
# AWS S3 Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
S3_BUCKET_NAME=your-contact-imports-bucket

# Upstash Redis Configuration (if using Redis)
UPSTASH_REDIS_REST_URL=https://your-instance.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here


# Optional: Rate Limiting
ENABLE_RATE_LIMITING=false

# Optional: File Upload Limits
MAX_FILE_SIZE_MB=100
MAX_ROWS_ALLOWED=500000

# Optional: Debugging
DEBUG_MODE=true
```

---

## Required Dependencies

Install these packages:

```bash
# AWS S3
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner

# Redis (choose one)
npm install @upstash/redis              # For Upstash Redis
# OR
npm install redis                       # For self-hosted Redis

# CSV/Excel Parsing
npm install csv-parse xlsx papaparse

# Validation
npm install validator

# Optional: Rate Limiting
npm install @upstash/ratelimit

# Optional: UUID generation
npm install uuid

# TypeScript types
npm install -D @types/uuid @types/validator
```

---

## File Structure

Create these files:

```
app/
├── api/
│   ├── upload/
│   │   └── route.ts              # ✅ Generate presigned S3 URL
│   ├── analyze/
│   │   ├── route.ts              # ✅ Analyze file from S3
│   │   └── status/
│   │       └── [fileId]/
│   │           └── route.ts      # ✅ Get analysis progress/results
│   ├── map-columns/
│   │   └── route.ts              # ✅ Apply column mapping
│   ├── preview/
│   │   └── route.ts              # ✅ Get paginated preview data
│   └── import/
│       └── route.ts              # ✅ Execute final import
lib/
├── s3.ts                         # ✅ S3 client and utilities
├── redis.ts                      # ✅ Redis client and utilities
├── storage.ts                    # ✅ Abstraction layer (Redis OR S3)
├── csv-parser.ts                 # ✅ CSV/Excel parsing utilities
├── validators.ts                 # ✅ Email, phone, data validation
└── types.ts                      # ✅ Shared TypeScript types
```

**Total: 13 files to create**

---

## Shared Types (lib/types.ts)

Create this file first - it's used everywhere:

```typescript
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
  status: 'analyzing' | 'complete' | 'error';
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
  type: 'email' | 'phone' | 'text' | 'date' | 'number';
  validate?: (value: any) => boolean;
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
  { key: 'state', label: 'State/Province', required: false, type: 'text' },
  { key: 'country', label: 'Country', required: false, type: 'text' },
  { key: 'zipCode', label: 'Zip/Postal Code', required: false, type: 'text' },
  { key: 'notes', label: 'Notes', required: false, type: 'text' },
];

// Redis/Storage keys
export const STORAGE_KEYS = {
  analysis: (fileId: string) => `analysis:${fileId}`,
  progress: (fileId: string) => `analysis:${fileId}:progress`,
  mapping: (fileId: string) => `mapping:${fileId}`,
};

// Constants
export const MAX_FILE_SIZE_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '100');
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const MAX_ROWS_ALLOWED = parseInt(process.env.MAX_ROWS_ALLOWED || '500000');
export const PREVIEW_PAGE_SIZE = 100;
export const SAMPLE_ROWS_COUNT = 1000; // How many rows to keep for preview
export const TTL_SECONDS = 3600; // 1 hour expiration for Redis data

export const ALLOWED_MIME_TYPES = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
```

---

## Task 1: S3 Client Setup (lib/s3.ts)

**Purpose:** Configure S3 client and provide utility functions

**Requirements:**
- Initialize S3 client with credentials from env vars
- Function to generate presigned upload URLs
- Function to fetch file as stream from S3
- Function to delete file from S3

**Implementation:**

```typescript
// lib/s3.ts
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Initialize S3 client
export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME!;

/**
 * Generate a presigned URL for uploading a file
 * @param key - S3 object key (e.g., "uploads/12345-contacts.csv")
 * @param contentType - MIME type of the file
 * @param expiresIn - URL expiration in seconds (default: 1 hour)
 */
export async function generatePresignedUploadUrl(
  key: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(s3Client, command, { expiresIn });
}

/**
 * Get a file from S3 as a readable stream
 */
export async function getFileFromS3(key: string) {
  const command = new GetObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  const response = await s3Client.send(command);
  return response.Body;
}

/**
 * Delete a file from S3
 */
export async function deleteFileFromS3(key: string): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
  });

  await s3Client.send(command);
}

/**
 * Generate a unique S3 key for an upload
 */
export function generateS3Key(filename: string): string {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(7);
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');
  return `uploads/${timestamp}-${randomStr}-${sanitizedFilename}`;
}
```

**Testing:**
```typescript
// Test S3 connection
const testKey = generateS3Key('test.csv');
const url = await generatePresignedUploadUrl(testKey, 'text/csv');
console.log('Presigned URL:', url);
```

---

## Task 2: Redis Client Setup (lib/redis.ts)


```typescript
// lib/redis.ts
import { Redis } from '@upstash/redis';
import { TTL_SECONDS } from './types';

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

/**
 * Store data with automatic expiration
 */
export async function setWithExpiry<T>(
  key: string,
  value: T,
  ttl: number = TTL_SECONDS
): Promise<void> {
  await redis.set(key, JSON.stringify(value), { ex: ttl });
}

/**
 * Get data from Redis
 */
export async function get<T>(key: string): Promise<T | null> {
  const data = await redis.get(key);
  if (!data) return null;
  
  // Upstash returns parsed JSON automatically
  return data as T;
}

/**
 * Delete data from Redis
 */
export async function del(key: string): Promise<void> {
  await redis.del(key);
}

/**
 * Check if key exists
 */
export async function exists(key: string): Promise<boolean> {
  const result = await redis.exists(key);
  return result === 1;
}
```


**Testing:**
```typescript
// Test Redis connection
await setWithExpiry('test', { hello: 'world' });
const result = await get('test');
console.log('Redis test:', result); // Should print { hello: 'world' }
```

---

## Task 3: Storage Abstraction Layer (lib/storage.ts)

**Purpose:** Provide a unified interface that works with either Redis 

```typescript
// lib/storage.ts
import { redis, setWithExpiry, get, del } from './redis';
import { STORAGE_KEYS, TTL_SECONDS } from './types';

const STORAGE_BACKEND ='redis';

/**
 * Generic storage interface
 */
interface Storage {
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
}

/**
 * Redis-based storage
 */
const redisStorage: Storage = {
  set: setWithExpiry,
  get,
  delete: del,
};

/**
 * S3-based storage (stores JSON files)
 */

// Export the active storage backend
export const storage: Storage =  redisStorage;
```

**Usage in API routes:**
```typescript
import { storage } from '@/lib/storage';

// Store analysis results
await storage.set(STORAGE_KEYS.analysis(fileId), analysisResult);

// Retrieve analysis results
const analysis = await storage.get(STORAGE_KEYS.analysis(fileId));
```

---

## Task 4: CSV/Excel Parser (lib/csv-parser.ts)

**Purpose:** Parse CSV and Excel files efficiently with streaming

**Requirements:**
- Support CSV and XLSX files
- Stream parsing for large files (memory efficient)
- Detect column names
- Return rows as objects

```typescript
// lib/csv-parser.ts
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';
import { Readable } from 'stream';

export interface ParseOptions {
  maxRows?: number;
  skipEmptyLines?: boolean;
}

/**
 * Parse CSV file from a stream
 */
export async function parseCSVStream(
  stream: Readable,
  onRow: (row: Record<string, any>, index: number) => void | Promise<void>,
  options: ParseOptions = {}
): Promise<{ totalRows: number; columns: string[] }> {
  return new Promise((resolve, reject) => {
    const parser = parse({
      columns: true, // Use first row as column names
      skip_empty_lines: options.skipEmptyLines !== false,
      trim: true,
    });

    let totalRows = 0;
    let columns: string[] = [];

    parser.on('readable', async function () {
      let row;
      while ((row = parser.read()) !== null) {
        if (totalRows === 0) {
          columns = Object.keys(row);
        }

        if (options.maxRows && totalRows >= options.maxRows) {
          parser.destroy();
          break;
        }

        await onRow(row, totalRows);
        totalRows++;
      }
    });

    parser.on('error', (err) => reject(err));
    parser.on('end', () => resolve({ totalRows, columns }));

    stream.pipe(parser);
  });
}

/**
 * Parse entire CSV into memory (for smaller files)
 */
export async function parseCSV(
  stream: Readable
): Promise<{ rows: Record<string, any>[]; columns: string[] }> {
  const rows: Record<string, any>[] = [];
  let columns: string[] = [];

  await parseCSVStream(stream, (row, index) => {
    if (index === 0) {
      columns = Object.keys(row);
    }
    rows.push(row);
  });

  return { rows, columns };
}

/**
 * Parse Excel file from buffer
 */
export async function parseExcel(
  buffer: Buffer
): Promise<{ rows: Record<string, any>[]; columns: string[] }> {
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  
  // Get first sheet
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  
  // Convert to JSON (with header row as keys)
  const rows = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
  
  const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
  
  return { rows, columns };
}

/**
 * Auto-detect file type and parse accordingly
 */
export async function parseFile(
  fileStream: Readable,
  fileExtension: string
): Promise<{ rows: Record<string, any>[]; columns: string[] }> {
  const ext = fileExtension.toLowerCase();

  if (ext === '.csv' || ext === 'csv') {
    return await parseCSV(fileStream);
  } else if (ext === '.xlsx' || ext === 'xlsx' || ext === '.xls' || ext === 'xls') {
    // For Excel, we need to read the entire stream into a buffer
    const chunks: Buffer[] = [];
    for await (const chunk of fileStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    return await parseExcel(buffer);
  } else {
    throw new Error(`Unsupported file type: ${fileExtension}`);
  }
}
```

---

## Task 5: Validators (lib/validators.ts)

**Purpose:** Validate contact data fields

```typescript
// lib/validators.ts
import validator from 'validator';
import { ValidationError, SYSTEM_FIELDS } from './types';

export function validateEmail(email: string): boolean {
  if (!email) return false;
  return validator.isEmail(email);
}

export function validatePhone(phone: string): boolean {
  if (!phone) return true; // Optional field
  // Remove all non-digits
  const digitsOnly = phone.replace(/\D/g, '');
  // Must have at least 10 digits
  return digitsOnly.length >= 10;
}

export function validateRequired(value: string): boolean {
  return Boolean(value && value.trim().length > 0);
}

/**
 * Validate a single row based on mapped fields
 */
export function validateRow(
  row: Record<string, any>,
  mapping: Record<string, string>
): { isValid: boolean; errors: ValidationError[] } {
  const errors: ValidationError[] = [];

  // Check required fields
  const requiredFields = SYSTEM_FIELDS.filter((f) => f.required);

  for (const field of requiredFields) {
    const value = row[field.key];

    if (!validateRequired(value)) {
      errors.push({
        field: field.key,
        message: `${field.label} is required`,
        value,
      });
    }
  }

  // Validate email format
  if (row.email && !validateEmail(row.email)) {
    errors.push({
      field: 'email',
      message: 'Invalid email format',
      value: row.email,
    });
  }

  // Validate phone format
  if (row.phone && !validatePhone(row.phone)) {
    errors.push({
      field: 'phone',
      message: 'Invalid phone number format',
      value: row.phone,
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Batch validate multiple rows
 */
export function validateRows(
  rows: Record<string, any>[],
  mapping: Record<string, string>
): Array<{ row: Record<string, any>; isValid: boolean; errors: ValidationError[] }> {
  return rows.map((row) => {
    const validation = validateRow(row, mapping);
    return {
      row,
      isValid: validation.isValid,
      errors: validation.errors,
    };
  });
}
```

---

## Task 7: API Route - Upload (app/api/upload/route.ts)

**Purpose:** Generate presigned S3 URL for direct browser upload

**HTTP Method:** POST

**Request Body:**
```json
{
  "filename": "contacts.csv",
  "fileType": "text/csv",
  "fileSize": 1048576
}
```

**Response:**
```json
{
  "uploadUrl": "https://s3.amazonaws.com/...",
  "fileId": "file_1234567890",
  "s3Key": "uploads/1234567890-abc123-contacts.csv"
}
```

**Implementation:**

```typescript
// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { generatePresignedUploadUrl, generateS3Key } from '@/lib/s3';
import { ALLOWED_MIME_TYPES, MAX_FILE_SIZE_BYTES } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { filename, fileType, fileSize } = body;

    // Validation
    if (!filename || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields: filename, fileType' },
        { status: 400 }
      );
    }

    // Check file type
    if (!ALLOWED_MIME_TYPES.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only CSV and Excel files are allowed.' },
        { status: 400 }
      );
    }

    // Check file size
    if (fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File size exceeds maximum of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Generate S3 key and file ID
    const s3Key = generateS3Key(filename);
    const fileId = `file_${uuidv4()}`;

    // Generate presigned URL (expires in 1 hour)
    const uploadUrl = await generatePresignedUploadUrl(s3Key, fileType, 3600);

    return NextResponse.json({
      uploadUrl,
      fileId,
      s3Key,
    });
  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}
```

**Testing:**
```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.csv","fileType":"text/csv","fileSize":1000}'
```

---

## Task 8: API Route - Analyze (app/api/analyze/route.ts)

**Purpose:** Analyze uploaded file from S3 (streaming, memory-efficient)

**HTTP Method:** POST

**Request Body:**
```json
{
  "fileId": "file_1234567890",
  "s3Key": "uploads/1234567890-abc123-contacts.csv"
}
```

**Response:**
```json
{
  "status": "analyzing"
}
```

**Implementation:**

```typescript
// app/api/analyze/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFileFromS3 } from '@/lib/s3';
import { parseCSVStream } from '@/lib/csv-parser';
import { storage } from '@/lib/storage';
import { validateRow } from '@/lib/validators';
import { 
  AnalysisSummary, 
  PreviewRow, 
  ColumnStats, 
  STORAGE_KEYS,
  SAMPLE_ROWS_COUNT 
} from '@/lib/types';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const { fileId, s3Key } = await req.json();

    if (!fileId || !s3Key) {
      return NextResponse.json(
        { error: 'Missing fileId or s3Key' },
        { status: 400 }
      );
    }

    // Start analysis asynchronously (don't await)
    analyzeFileAsync(fileId, s3Key).catch((error) => {
      console.error('Analysis failed:', error);
      storage.set(STORAGE_KEYS.progress(fileId), {
        status: 'error',
        message: error.message,
      });
    });

    return NextResponse.json({ status: 'analyzing' });
  } catch (error) {
    console.error('Analyze route error:', error);
    return NextResponse.json(
      { error: 'Failed to start analysis' },
      { status: 500 }
    );
  }
}

/**
 * Async function that performs the actual analysis
 */
async function analyzeFileAsync(fileId: string, s3Key: string) {
  // Update progress: analyzing
  await storage.set(STORAGE_KEYS.progress(fileId), {
    status: 'analyzing',
    processed: 0,
  });

  // Fetch file from S3
  const s3Stream = await getFileFromS3(s3Key);
  const stream = s3Stream as Readable;

  let totalRows = 0;
  let validRows = 0;
  let invalidRows = 0;
  const columnSummary: Record<string, ColumnStats> = {};
  const sampleRows: PreviewRow[] = [];

  // Parse CSV and analyze
  await parseCSVStream(stream, async (row, index) => {
    totalRows++;

    // Update progress every 1000 rows
    if (totalRows % 1000 === 0) {
      await storage.set(STORAGE_KEYS.progress(fileId), {
        status: 'analyzing',
        processed: totalRows,
      });
    }

    // Validate row (using empty mapping for now, will apply mapping later)
    const validation = validateRow(row, {});
    const isValid = validation.isValid;

    if (isValid) {
      validRows++;
    } else {
      invalidRows++;
    }

    // Collect column statistics
    Object.keys(row).forEach((col) => {
      if (!columnSummary[col]) {
        columnSummary[col] = {
          filled: 0,
          empty: 0,
          unique: 0,
          samples: [],
        };
      }

      const value = row[col];
      if (value && value.toString().trim().length > 0) {
        columnSummary[col].filled++;
        
        // Collect sample values (first 5 unique)
        if (
          columnSummary[col].samples!.length < 5 &&
          !columnSummary[col].samples!.includes(value)
        ) {
          columnSummary[col].samples!.push(value);
        }
      } else {
        columnSummary[col].empty++;
      }
    });

    // Keep first N rows for preview
    if (sampleRows.length < SAMPLE_ROWS_COUNT) {
      sampleRows.push({
        _rowIndex: index + 1,
        _isValid: isValid,
        _errors: validation.errors.map((e) => e.message),
        ...row,
      });
    }
  });

  // Calculate unique counts (simplified - just use filled count as estimate)
  Object.keys(columnSummary).forEach((col) => {
    columnSummary[col].unique = Math.min(
      columnSummary[col].filled,
      totalRows
    );
  });

  // Store analysis results
  const analysisResult: AnalysisSummary = {
    totalRows,
    validRows,
    invalidRows,
    columns: Object.keys(columnSummary),
    columnSummary,
    sampleRows,
    s3Key,
    fileId,
  };

  await storage.set(STORAGE_KEYS.analysis(fileId), analysisResult);

  // Update progress: complete
  await storage.set(STORAGE_KEYS.progress(fileId), {
    status: 'complete',
    processed: totalRows,
    total: totalRows,
  });
}
```

**Testing:**
```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"fileId":"file_123","s3Key":"uploads/test.csv"}'
```

---

## Task 9: API Route - Analysis Status (app/api/analyze/status/[fileId]/route.ts)

**Purpose:** Poll for analysis progress and results

**HTTP Method:** GET

**URL:** `/api/analyze/status/{fileId}`

**Response (analyzing):**
```json
{
  "status": "analyzing",
  "progress": {
    "processed": 5000,
    "total": null,
    "status": "analyzing"
  }
}
```

**Response (complete):**
```json
{
  "status": "complete",
  "summary": {
    "totalRows": 10000,
    "validRows": 9500,
    "invalidRows": 500,
    "columns": ["Email", "First Name", ...],
    "columnSummary": { ... }
  }
}
```

**Implementation:**

```typescript
// app/api/analyze/status/[fileId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS, AnalysisSummary, AnalysisProgress } from '@/lib/types';

export async function GET(
  req: NextRequest,
  { params }: { params: { fileId: string } }
) {
  try {
    const { fileId } = params;

    // Check progress first
    const progress = await storage.get<AnalysisProgress>(
      STORAGE_KEYS.progress(fileId)
    );

    if (!progress) {
      return NextResponse.json(
        { error: 'Analysis not found' },
        { status: 404 }
      );
    }

    // If still analyzing, return progress
    if (progress.status === 'analyzing') {
      return NextResponse.json({
        status: 'analyzing',
        progress,
      });
    }

    // If error, return error
    if (progress.status === 'error') {
      return NextResponse.json({
        status: 'error',
        message: (progress as any).message || 'Analysis failed',
      });
    }

    // If complete, return summary
    if (progress.status === 'complete') {
      const summary = await storage.get<AnalysisSummary>(
        STORAGE_KEYS.analysis(fileId)
      );

      if (!summary) {
        return NextResponse.json(
          { error: 'Analysis results not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        status: 'complete',
        summary,
      });
    }

    return NextResponse.json(
      { error: 'Unknown status' },
      { status: 500 }
    );
  } catch (error) {
    console.error('Status route error:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis status' },
      { status: 500 }
    );
  }
}
```

**Testing:**
```bash
curl http://localhost:3000/api/analyze/status/file_123
```

---

## Task 10: API Route - Map Columns (app/api/map-columns/route.ts)

**Purpose:** Apply user's column mapping and store it

**HTTP Method:** POST

**Request Body:**
```json
{
  "fileId": "file_1234567890",
  "mapping": {
    "Email Address": "email",
    "First Name": "firstName",
    "Last Name": "lastName",
    "Phone Number": "phone"
  }
}
```

**Response:**
```json
{
  "success": true
}
```

**Implementation:**

```typescript
// app/api/map-columns/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { validateRow } from '@/lib/validators';
import { 
  STORAGE_KEYS, 
  AnalysisSummary, 
  ColumnMapping, 
  PreviewRow 
} from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { fileId, mapping } = await req.json();

    if (!fileId || !mapping) {
      return NextResponse.json(
        { error: 'Missing fileId or mapping' },
        { status: 400 }
      );
    }

    // Get analysis results
    const analysis = await storage.get<AnalysisSummary>(
      STORAGE_KEYS.analysis(fileId)
    );

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis not found. Please analyze file first.' },
        { status: 404 }
      );
    }

    // Apply mapping to sample rows
    const mappedSampleRows: PreviewRow[] = analysis.sampleRows.map((row) => {
      const mappedRow: any = {
        _rowIndex: row._rowIndex,
      };

      // Apply column mapping
      Object.entries(mapping).forEach(([originalCol, targetCol]) => {
        mappedRow[targetCol as string] = row[originalCol];
      });

      // Re-validate with mapped columns
      const validation = validateRow(mappedRow, mapping);
      mappedRow._isValid = validation.isValid;
      mappedRow._errors = validation.errors.map((e) => e.message);

      return mappedRow;
    });

    // Store mapping and mapped sample
    const columnMapping: ColumnMapping = {
      mapping,
      s3Key: analysis.s3Key,
      fileId,
    };

    await storage.set(STORAGE_KEYS.mapping(fileId), columnMapping);

    // Update analysis with mapped sample rows
    analysis.sampleRows = mappedSampleRows;
    await storage.set(STORAGE_KEYS.analysis(fileId), analysis);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Map columns route error:', error);
    return NextResponse.json(
      { error: 'Failed to map columns' },
      { status: 500 }
    );
  }
}
```

**Testing:**
```bash
curl -X POST http://localhost:3000/api/map-columns \
  -H "Content-Type: application/json" \
  -d '{"fileId":"file_123","mapping":{"Email":"email","Name":"firstName"}}'
```

---

## Task 11: API Route - Preview (app/api/preview/route.ts)

**Purpose:** Get paginated preview data

**HTTP Method:** GET

**Query Params:** `?fileId=file_123&page=1`

**Response:**
```json
{
  "rows": [
    {
      "_rowIndex": 1,
      "_isValid": true,
      "email": "john@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    ...
  ],
  "total": 1000,
  "page": 1,
  "pageSize": 100
}
```

**Implementation:**

```typescript
// app/api/preview/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/storage';
import { STORAGE_KEYS, AnalysisSummary, PREVIEW_PAGE_SIZE } from '@/lib/types';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fileId = searchParams.get('fileId');
    const page = parseInt(searchParams.get('page') || '1');

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId parameter' },
        { status: 400 }
      );
    }

    // Get analysis with mapped sample rows
    const analysis = await storage.get<AnalysisSummary>(
      STORAGE_KEYS.analysis(fileId)
    );

    if (!analysis) {
      return NextResponse.json(
        { error: 'Preview data not found' },
        { status: 404 }
      );
    }

    // Paginate sample rows
    const startIndex = (page - 1) * PREVIEW_PAGE_SIZE;
    const endIndex = startIndex + PREVIEW_PAGE_SIZE;
    const paginatedRows = analysis.sampleRows.slice(startIndex, endIndex);

    return NextResponse.json({
      rows: paginatedRows,
      total: analysis.sampleRows.length,
      page,
      pageSize: PREVIEW_PAGE_SIZE,
    });
  } catch (error) {
    console.error('Preview route error:', error);
    return NextResponse.json(
      { error: 'Failed to get preview data' },
      { status: 500 }
    );
  }
}
```

**Testing:**
```bash
curl "http://localhost:3000/api/preview?fileId=file_123&page=1"
```

---

## Task 12: API Route - Import (app/api/import/route.ts)

**Purpose:** Execute final import into database

**HTTP Method:** POST

**Request Body:**
```json
{
  "fileId": "file_1234567890",
  "excludedRows": [5, 12, 45]
}
```

**Response:**
```json
{
  "success": true,
  "imported": 9995,
  "skipped": 5
}
```

**Implementation:**

```typescript
// app/api/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getFileFromS3 } from '@/lib/s3';
import { parseCSVStream } from '@/lib/csv-parser';
import { storage } from '@/lib/storage';
import { validateRow } from '@/lib/validators';
import { STORAGE_KEYS, ColumnMapping, ImportResult } from '@/lib/types';
import { Readable } from 'stream';

export async function POST(req: NextRequest) {
  try {
    const { fileId, excludedRows = [] } = await req.json();

    if (!fileId) {
      return NextResponse.json(
        { error: 'Missing fileId' },
        { status: 400 }
      );
    }

    // Get column mapping
    const columnMapping = await storage.get<ColumnMapping>(
      STORAGE_KEYS.mapping(fileId)
    );

    if (!columnMapping) {
      return NextResponse.json(
        { error: 'Column mapping not found. Please map columns first.' },
        { status: 404 }
      );
    }

    // Fetch file from S3
    const s3Stream = await getFileFromS3(columnMapping.s3Key);
    const stream = s3Stream as Readable;

    const excludedSet = new Set(excludedRows);
    const contactsToImport: any[] = [];
    let totalProcessed = 0;
    let skipped = 0;

    // Parse and prepare contacts
    await parseCSVStream(stream, (row, index) => {
      const rowIndex = index + 1;
      totalProcessed++;

      // Skip excluded rows
      if (excludedSet.has(rowIndex)) {
        skipped++;
        return;
      }

      // Apply column mapping
      const mappedRow: any = {};
      Object.entries(columnMapping.mapping).forEach(([originalCol, targetCol]) => {
        mappedRow[targetCol] = row[originalCol];
      });

      // Validate
      const validation = validateRow(mappedRow, columnMapping.mapping);
      if (!validation.isValid) {
        skipped++;
        return;
      }

      // Add to import batch
      contactsToImport.push(mappedRow);

      // Batch insert every 500 rows
      if (contactsToImport.length >= 500) {
        // Note: For production, you'd want to make this truly async
        // For now, we'll insert all at the end
      }
    });

    // Insert all contacts
    console.log(contactsToImport)

    // Clean up storage
    await storage.delete(STORAGE_KEYS.analysis(fileId));
    await storage.delete(STORAGE_KEYS.mapping(fileId));
    await storage.delete(STORAGE_KEYS.progress(fileId));

    const result: ImportResult = {
      success: true,
      imported: inserted,
      skipped: skipped + failed,
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('Import route error:', error);
    return NextResponse.json(
      { error: 'Failed to import contacts' },
      { status: 500 }
    );
  }
}
```

**Testing:**
```bash
curl -X POST http://localhost:3000/api/import \
  -H "Content-Type: application/json" \
  -d '{"fileId":"file_123","excludedRows":[5,12]}'
```

---

## Security Considerations

### 1. **Rate Limiting** (Optional but Recommended)

Add rate limiting to prevent abuse:

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './redis';

export const uploadRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 uploads per hour
});

export const importRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '1 h'), // 5 imports per hour
});

// Usage in API route
import { uploadRateLimit } from '@/lib/rate-limit';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';
  const { success } = await uploadRateLimit.limit(ip);
  
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429 }
    );
  }
  
  // ... rest of the logic
}
```

### 2. **File Size Validation**

Already implemented in upload route, but also validate on the server side during analysis.

### 3. **Input Sanitization**

Sanitize user inputs (column names, file names) to prevent injection attacks:

```typescript
function sanitizeColumnName(name: string): string {
  return name.replace(/[<>\"']/g, '');
}
```

## Error Handling Best Practices

### Consistent Error Responses

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleApiError(error: any) {
  console.error('API Error:', error);

  if (error instanceof AppError) {
    return NextResponse.json(
      { error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }

  return NextResponse.json(
    { error: 'Internal server error' },
    { status: 500 }
  );
}

// Usage in API routes
try {
  // ... logic
  if (!fileId) {
    throw new AppError('Missing fileId', 400, 'MISSING_FILE_ID');
  }
} catch (error) {
  return handleApiError(error);
}
```

---

## Testing Checklist

For each API route, test:

- ✅ Success case with valid data
- ✅ Missing required parameters
- ✅ Invalid file types
- ✅ File size limits
- ✅ Non-existent fileId
- ✅ Database connection failures
- ✅ S3 connection failures
- ✅ Redis connection failures
- ✅ Large files (>50MB)
- ✅ Edge cases (empty files, single row, special characters)

---



## Troubleshooting Guide

### Issue: "Analysis takes too long"
**Solution:** 
- Check if streaming is working (not loading entire file into memory)
- Increase serverless function timeout in Next.js config
- Consider breaking into smaller batches

### Issue: "Redis connection timeout"
**Solution:**
- Check Redis URL and token in env vars
- Verify network connectivity
- Check Redis dashboard for errors

### Issue: "S3 upload fails with CORS error"
**Solution:**
- Verify CORS configuration in S3 bucket
- Check allowed origins include your domain
- Ensure presigned URL hasn't expired


## Next Steps After Backend Implementation

Once backend is complete:

1. **Connect frontend to backend** - Replace mock API calls with real API calls
2. **Add error handling UI** - Show user-friendly error messages
3. **Add loading states** - Show spinners during API calls
4. **Test end-to-end** - Upload real files and verify import works
5. **Add monitoring** - Track success/failure rates
6. **Optimize performance** - Profile slow queries, add indexes
7. **Add features** - Duplicate detection, field validation rules, etc.



Good luck with the implementation! 🚀