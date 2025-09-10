import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { ApiResponse } from '../types';

export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      };
      
      return res.status(400).json(response);
    }
    
    next();
  };
}

export function validateQuery(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.query);
    
    if (error) {
      const response: ApiResponse = {
        success: false,
        error: 'Query validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value
        }))
      };
      
      return res.status(400).json(response);
    }
    
    next();
  };
}

// Common validation schemas
export const schemas = {
  extractRequest: Joi.object({
    fileId: Joi.string().required(),
    model: Joi.string().valid('gemini', 'groq').required()
  }),
  
  updateInvoice: Joi.object({
    vendor: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().allow(''),
      taxId: Joi.string().allow('')
    }).required(),
    
    invoice: Joi.object({
      number: Joi.string().required(),
      date: Joi.string().required(),
      currency: Joi.string().allow(''),
      subtotal: Joi.number().min(0),
      taxPercent: Joi.number().min(0).max(100),
      total: Joi.number().min(0),
      poNumber: Joi.string().allow(''),
      poDate: Joi.string().allow(''),
      lineItems: Joi.array().items(
        Joi.object({
          description: Joi.string().required(),
          unitPrice: Joi.number().min(0).required(),
          quantity: Joi.number().min(0).required(),
          total: Joi.number().min(0).required()
        })
      ).default([])
    }).required()
  }),
  
  searchQuery: Joi.object({
    q: Joi.string().allow(''),
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};
