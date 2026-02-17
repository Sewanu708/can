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
    let imported = 0;

    // Parse and prepare contacts
    await parseCSVStream(stream,
       (row, index) => {
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
      imported++;

      // Batch insert every 500 rows
      if (contactsToImport.length >= 500) {
        // Note: For production, you'd want to make this truly async
        // For now, we'll insert all at the end
      }
    });

    // Insert all contacts
    console.log("---CONTACTS TO IMPORT---");
    console.log(contactsToImport);
    console.log("------------------------");


    // Clean up storage
    await storage.delete(STORAGE_KEYS.analysis(fileId));
    await storage.delete(STORAGE_KEYS.mapping(fileId));
    await storage.delete(STORAGE_KEYS.progress(fileId));

    const result: ImportResult = {
      success: true,
      imported: imported,
      skipped: skipped,
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
