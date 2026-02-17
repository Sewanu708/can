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
