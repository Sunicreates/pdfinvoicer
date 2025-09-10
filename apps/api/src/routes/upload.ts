import { Router } from 'express';
import multer from 'multer';
import { uploadFile } from '../services/fileStorage';
import { asyncHandler } from '../middleware/errorHandler';
import { ApiResponse, UploadResponse } from '../types';

const router = Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  }
});

// POST /upload - Upload PDF file
router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) {
    const response: ApiResponse = {
      success: false,
      error: 'No file uploaded'
    };
    return res.status(400).json(response);
  }

  try {
    const uploadResult = await uploadFile(req.file);
    
    const response: ApiResponse<UploadResponse> = {
      success: true,
      data: uploadResult,
      message: 'File uploaded successfully'
    };
    
    res.status(201).json(response);
  } catch (error) {
    throw new Error(`File upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}));

// GET /upload/:fileId - Get file info or download
router.get('/:fileId', asyncHandler(async (req, res) => {
  const { fileId } = req.params;
  
  // This will be implemented based on storage provider
  // For now, return placeholder
  const response: ApiResponse = {
    success: false,
    error: 'File retrieval not implemented yet'
  };
  
  res.status(501).json(response);
}));

export { router as uploadRoutes };
