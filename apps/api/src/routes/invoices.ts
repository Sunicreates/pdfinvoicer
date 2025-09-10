import { Router } from 'express';
import { Invoice } from '../models/Invoice';
import { asyncHandler } from '../middleware/errorHandler';
import { validateBody, validateQuery, schemas } from '../middleware/validation';
import { ApiResponse, PaginatedResponse, Invoice as IInvoice } from '../types';

const router = Router();

// GET /invoices - List invoices with search and pagination
router.get('/', 
  validateQuery(schemas.searchQuery),
  asyncHandler(async (req, res) => {
    const { q = '', page = 1, limit = 10 } = req.query as any;
    const skip = (page - 1) * limit;

    // Build search query
    let searchQuery: any = {};
    if (q) {
      searchQuery = {
        $or: [
          { 'vendor.name': { $regex: q, $options: 'i' } },
          { 'invoice.number': { $regex: q, $options: 'i' } }
        ]
      };
    }

    // Get total count and invoices
    const [total, invoices] = await Promise.all([
      Invoice.countDocuments(searchQuery),
      Invoice.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean()
    ]);

    const response: ApiResponse<PaginatedResponse<IInvoice>> = {
      success: true,
      data: {
        data: invoices as IInvoice[],
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      }
    };

    res.json(response);
  })
);

// GET /invoices/:id - Get single invoice
router.get('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id).lean();
  
  if (!invoice) {
    const response: ApiResponse = {
      success: false,
      error: 'Invoice not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse<IInvoice> = {
    success: true,
    data: invoice as IInvoice
  };

  res.json(response);
}));

// POST /invoices - Create new invoice
router.post('/',
  validateBody(schemas.updateInvoice),
  asyncHandler(async (req, res) => {
    const invoiceData = {
      ...req.body,
      createdAt: new Date().toISOString()
    };

    const newInvoice = await Invoice.create(invoiceData);

    const response: ApiResponse<IInvoice> = {
      success: true,
      data: newInvoice.toObject() as IInvoice,
      message: 'Invoice created successfully'
    };

    res.status(201).json(response);
  })
);

// PUT /invoices/:id - Update invoice
router.put('/:id',
  validateBody(schemas.updateInvoice),
  asyncHandler(async (req, res) => {
    const { id } = req.params;

    const updatedInvoice = await Invoice.findByIdAndUpdate(
      id,
      { 
        ...req.body,
        updatedAt: new Date().toISOString()
      },
      { new: true, runValidators: true }
    ).lean();

    if (!updatedInvoice) {
      const response: ApiResponse = {
        success: false,
        error: 'Invoice not found'
      };
      return res.status(404).json(response);
    }

    const response: ApiResponse<IInvoice> = {
      success: true,
      data: updatedInvoice as IInvoice,
      message: 'Invoice updated successfully'
    };

    res.json(response);
  })
);

// DELETE /invoices/:id - Delete invoice
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deletedInvoice = await Invoice.findByIdAndDelete(id);

  if (!deletedInvoice) {
    const response: ApiResponse = {
      success: false,
      error: 'Invoice not found'
    };
    return res.status(404).json(response);
  }

  const response: ApiResponse = {
    success: true,
    message: 'Invoice deleted successfully'
  };

  res.json(response);
}));

export { router as invoiceRoutes };
