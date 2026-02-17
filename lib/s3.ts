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
