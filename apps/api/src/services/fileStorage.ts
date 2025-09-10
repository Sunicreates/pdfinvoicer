import { put, head, list, del } from '@vercel/blob';
import { UploadResponse } from '../types';
import { randomUUID } from 'crypto';

interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export async function uploadFile(file: UploadedFile): Promise<UploadResponse> {
  try {
    // Generate unique file ID
    const fileId = randomUUID();
    const fileName = file.originalname;
    
    // Upload to Vercel Blob
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      const blob = await put(`pdfs/${fileId}-${fileName}`, file.buffer, {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });

      return {
        fileId,
        fileName,
        fileUrl: blob.url
      };
    }
    
    // Fallback: Store in MongoDB GridFS (simplified implementation)
    // In a real app, you'd implement GridFS properly
    console.warn('No Vercel Blob token found, using fallback storage');
    
    return {
      fileId,
      fileName,
      fileUrl: `/api/files/${fileId}` // Placeholder URL
    };

  } catch (error) {
    console.error('File upload error:', error);
    throw new Error('Failed to upload file');
  }
}

export async function getFile(fileId: string): Promise<Buffer | null> {
  try {
    console.log(`Retrieving file: ${fileId}`);
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('No Vercel Blob token found');
      throw new Error('Blob storage not configured');
    }

    // First, let's try to find the file by listing all files and finding the one with our fileId
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: 'pdfs/'
    });

    // Find the blob that contains our fileId
    const targetBlob = blobs.find(blob => blob.pathname.includes(fileId));
    
    if (!targetBlob) {
      console.error(`File not found in blob storage: ${fileId}`);
      throw new Error('File not found');
    }

    // Fetch the file content
    const response = await fetch(targetBlob.url);
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);

  } catch (error) {
    console.error('File retrieval error:', error);
    throw new Error('File not found');
  }
}

export async function deleteFile(fileId: string): Promise<void> {
  try {
    console.log(`Deleting file: ${fileId}`);
    
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      console.error('No Vercel Blob token found');
      return;
    }

    // Find the file to delete
    const { blobs } = await list({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      prefix: 'pdfs/'
    });

    const targetBlob = blobs.find(blob => blob.pathname.includes(fileId));
    
    if (targetBlob) {
      await del(targetBlob.url, {
        token: process.env.BLOB_READ_WRITE_TOKEN
      });
      console.log(`File deleted successfully: ${fileId}`);
    } else {
      console.warn(`File not found for deletion: ${fileId}`);
    }

  } catch (error) {
    console.error('File deletion error:', error);
    throw new Error('Failed to delete file');
  }
}
