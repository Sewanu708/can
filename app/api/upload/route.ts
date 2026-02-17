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
