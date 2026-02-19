// /lib/gcs.ts
// Google Cloud Storage helper functions for file operations

import { Storage } from '@google-cloud/storage';

/**
 * Initialize GCS client with credentials from environment variables
 */
function getStorageClient(): Storage {
  return new Storage({
    projectId: process.env.GCS_PROJECT_ID,
    credentials: {
      client_email: process.env.GCS_CLIENT_EMAIL,
      private_key: process.env.GCS_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
  });
}

/**
 * Delete a file from Google Cloud Storage bucket
 * @param filename - The filename to delete from the bucket
 */
export async function deleteFileFromGCS(filename: string): Promise<void> {
  const storage = getStorageClient();
  const bucketName = process.env.GCS_BUCKET_NAME;
  
  if (!bucketName) {
    throw new Error('GCS_BUCKET_NAME environment variable not set');
  }
  
  const bucket = storage.bucket(bucketName);
  await bucket.file(filename).delete();
}

/**
 * Delete multiple files from Google Cloud Storage bucket
 * @param filenames - Array of filenames to delete
 * @returns Number of files successfully deleted
 */
export async function deleteMultipleFilesFromGCS(filenames: string[]): Promise<number> {
  let deletedCount = 0;
  
  for (const filename of filenames) {
    try {
      await deleteFileFromGCS(filename);
      deletedCount++;
    } catch (error) {
      console.error(`Failed to delete file ${filename} from GCS:`, error);
      // Continue with other files even if one fails
    }
  }
  
  return deletedCount;
}