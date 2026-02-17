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

    // Set initial progress state before returning response to prevent race conditions
    await storage.set(STORAGE_KEYS.progress(fileId), {
      status: 'analyzing',
      processed: 0,
    });

    // Start analysis asynchronously (don't await)
    analyzeFileAsync(fileId, s3Key).catch((error) => {
      console.error('Analysis failed:', error);
      storage.set(STORAGE_KEYS.progress(fileId), {
        status: 'error',
        message: error.message,
      });
    });

    return NextResponse.json({
      status: 'analyzing',
      message: 'Analysis started',
    });
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
  // Fetch file from S3
  const s3Stream = await getFileFromS3(s3Key);
  console.log('get file from s3')
  const stream = s3Stream as Readable;

  let totalRows = 0;
  let validRows = 0;
  let invalidRows = 0;
  const columnSummary: Record<string, ColumnStats> = {};
  const sampleRows: PreviewRow[] = [];

  // Parse CSV and analyze
  await parseCSVStream(stream, 
    async (row, index) => {
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
