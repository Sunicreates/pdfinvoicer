'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { InvoiceEditForm } from '@/components/invoice/InvoiceEditForm';
import { ErrorState } from '@/components/ui/ErrorState';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { getInvoice, updateInvoice } from '@/lib/api';
import { Invoice, LineItem } from '@/lib/types';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [vendorName, setVendorName] = useState('');
  const [vendorAddress, setVendorAddress] = useState('');
  const [vendorEmail, setVendorEmail] = useState('');
  const [vendorPhone, setVendorPhone] = useState('');
  
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [invoiceDate, setInvoiceDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [subtotal, setSubtotal] = useState<number | ''>('');
  const [tax, setTax] = useState<number | ''>('');
  const [total, setTotal] = useState<number | ''>('');
  
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const invoice = await getInvoice(invoiceId);
      
      // Populate form with existing data
      setVendorName(invoice.vendor.name || '');
      setVendorAddress(invoice.vendor.address || '');
      setVendorEmail(invoice.vendor.email || '');
      setVendorPhone(invoice.vendor.phone || '');
      
      setInvoiceNumber(invoice.invoice.number || '');
      setInvoiceDate(invoice.invoice.date ? new Date(invoice.invoice.date).toISOString().split('T')[0] : '');
      setDueDate(invoice.invoice.dueDate ? new Date(invoice.invoice.dueDate).toISOString().split('T')[0] : '');
      setCurrency(invoice.invoice.currency || 'USD');
      setSubtotal(invoice.invoice.subtotal || '');
      setTax(invoice.invoice.tax || '');
      setTotal(invoice.invoice.total || '');
      
      setLineItems(invoice.lineItems || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleAddLineItem = () => {
    const newItem: LineItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    setLineItems([...lineItems, newItem]);
  };

  const handleUpdateLineItem = (index: number, field: keyof LineItem, value: any) => {
    const updatedItems = [...lineItems];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Auto-calculate total price if quantity or unit price changes
    if (field === 'quantity' || field === 'unitPrice') {
      const item = updatedItems[index];
      if (typeof item.quantity === 'number' && typeof item.unitPrice === 'number') {
        updatedItems[index].totalPrice = item.quantity * item.unitPrice;
      }
    }
    
    setLineItems(updatedItems);
  };

  const handleRemoveLineItem = (index: number) => {
    setLineItems(lineItems.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!invoiceNumber || !invoiceDate || !vendorName || total === '') {
      setError('Please fill in all required fields');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const updatedInvoice: Partial<Invoice> = {
        vendor: {
          name: vendorName,
          address: vendorAddress || undefined,
          email: vendorEmail || undefined,
          phone: vendorPhone || undefined,
        },
        invoice: {
          number: invoiceNumber,
          date: invoiceDate,
          dueDate: dueDate || undefined,
          currency: currency || 'USD',
          subtotal: typeof subtotal === 'number' ? subtotal : undefined,
          tax: typeof tax === 'number' ? tax : undefined,
          total: typeof total === 'number' ? total : 0,
        },
        lineItems: lineItems.filter(item => item.description.trim() !== ''),
      };

      await updateInvoice(invoiceId, updatedInvoice);
      router.push(`/invoices/${invoiceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save invoice');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/invoices/${invoiceId}`);
  };

  if (error && loading) {
    return (
      <div className="responsive-container">
        <ErrorState 
          error={error} 
          onRetry={fetchInvoice}
        />
      </div>
    );
  }

  return (
    <>
      {error && !loading && (
        <div className="responsive-container">
          <ErrorState error={error} />
        </div>
      )}
      
      <InvoiceEditForm
        loading={loading}
        saving={saving}
        vendorName={vendorName}
        setVendorName={setVendorName}
        vendorAddress={vendorAddress}
        setVendorAddress={setVendorAddress}
        vendorEmail={vendorEmail}
        setVendorEmail={setVendorEmail}
        vendorPhone={vendorPhone}
        setVendorPhone={setVendorPhone}
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
        invoiceDate={invoiceDate}
        setInvoiceDate={setInvoiceDate}
        dueDate={dueDate}
        setDueDate={setDueDate}
        currency={currency}
        setCurrency={setCurrency}
        subtotal={subtotal}
        setSubtotal={setSubtotal}
        tax={tax}
        setTax={setTax}
        total={total}
        setTotal={setTotal}
        lineItems={lineItems}
        onAddLineItem={handleAddLineItem}
        onUpdateLineItem={handleUpdateLineItem}
        onRemoveLineItem={handleRemoveLineItem}
        onSave={handleSave}
        onCancel={handleCancel}
      />
      
      <MobileNavigation 
        showFab={false}
      />
    </>
  );
}
