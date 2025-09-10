import { Router } from 'express';
import { validateBody, schemas } from '../middleware/validation';
import { asyncHandler } from '../middleware/errorHandler';
import { extractDataFromPDF } from '../services/aiExtraction';
import { Invoice } from '../models/Invoice';
import { ApiResponse, ExtractResponse, Invoice as IInvoice } from '../types';

const router = Router();

// POST /extract - Extract data from PDF using AI
router.post('/',
  validateBody(schemas.extractRequest),
  asyncHandler(async (req, res) => {
    const { fileId, model } = req.body;

    try {
      // Extract data using AI
      const extractedData = await extractDataFromPDF(fileId, model);

      if (!extractedData) {
        const response: ApiResponse<ExtractResponse> = {
          success: false,
          error: 'Failed to extract data from PDF'
        };
        return res.status(500).json(response);
      }

      // Save extracted data to database
      const invoiceData = {
        ...extractedData,
        createdAt: new Date().toISOString()
      };

      const savedInvoice = await Invoice.create(invoiceData);

      const response: ApiResponse<IInvoice> = {
        success: true,
        data: savedInvoice.toObject() as IInvoice,
        message: 'Data extracted and saved successfully'
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('Extraction error:', error);
      
      const response: ApiResponse<ExtractResponse> = {
        success: false,
        error: error instanceof Error ? error.message : 'Extraction failed'
      };

      res.status(500).json(response);
    }
  })
);

export { router as extractRoutes };
