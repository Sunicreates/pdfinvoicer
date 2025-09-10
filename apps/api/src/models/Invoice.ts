import mongoose, { Schema, Document } from 'mongoose';
import { Invoice as IInvoice, LineItem, Vendor, InvoiceDetails } from '../types';

// Mongoose document interfaces
export interface InvoiceDocument extends Omit<IInvoice, '_id'>, Document {
  _id: mongoose.Types.ObjectId;
}

// Schemas
const LineItemSchema = new Schema<LineItem>({
  description: { type: String, required: true },
  unitPrice: { type: Number, required: true },
  quantity: { type: Number, required: true },
  total: { type: Number, required: true }
}, { _id: false });

const VendorSchema = new Schema<Vendor>({
  name: { type: String, required: true },
  address: { type: String },
  taxId: { type: String }
}, { _id: false });

const InvoiceDetailsSchema = new Schema<InvoiceDetails>({
  number: { type: String, required: true },
  date: { type: String, required: true },
  currency: { type: String },
  subtotal: { type: Number },
  taxPercent: { type: Number },
  total: { type: Number },
  poNumber: { type: String },
  poDate: { type: String },
  lineItems: { type: [LineItemSchema], default: [] }
}, { _id: false });

const InvoiceSchema = new Schema<InvoiceDocument>({
  fileId: { type: String, required: true, unique: true },
  fileName: { type: String, required: true },
  fileUrl: { type: String }, // Store Vercel Blob URL
  vendor: { type: VendorSchema, required: true },
  invoice: { type: InvoiceDetailsSchema, required: true },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String }
}, {
  timestamps: false // We handle timestamps manually
});

// Indexes for search functionality
InvoiceSchema.index({ 'vendor.name': 'text', 'invoice.number': 'text' });
InvoiceSchema.index({ fileId: 1 });
InvoiceSchema.index({ createdAt: -1 });

// Pre-save middleware to update timestamps
InvoiceSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = new Date().toISOString();
  }
  next();
});

export const Invoice = mongoose.model<InvoiceDocument>('Invoice', InvoiceSchema);
