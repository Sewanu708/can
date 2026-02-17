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
