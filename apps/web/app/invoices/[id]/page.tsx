'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Download, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getInvoice, deleteInvoice } from '@/lib/api';
import { Invoice } from '@/lib/types';

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInvoice = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await getInvoice(invoiceId);
      setInvoice(data);
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

  const handleDelete = async () => {
    if (!invoice || !confirm(`Are you sure you want to delete "${invoice.fileName}"?`)) {
      return;
    }

    try {
      await deleteInvoice(invoiceId);
      router.push('/invoices');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string = 'USD') => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Invoice</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => router.push('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
          <h2 className="text-xl font-semibold mb-2">Invoice Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The invoice you're looking for doesn't exist or has been deleted.
          </p>
          <Button onClick={() => router.push('/invoices')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Invoices
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => router.push('/invoices')}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Invoice Details</h1>
            <p className="text-muted-foreground mt-1">
              {invoice.fileName}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/invoices/${invoiceId}/edit`)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            variant="outline"
            onClick={handleDelete}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vendor Information */}
        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Vendor Name
              </label>
              <p className="text-lg font-semibold">{invoice.vendor.name}</p>
            </div>
            
            {invoice.vendor.address && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Address
                </label>
                <p className="text-sm">{invoice.vendor.address}</p>
              </div>
            )}
            
            {invoice.vendor.email && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Email
                </label>
                <p className="text-sm">{invoice.vendor.email}</p>
              </div>
            )}
            
            {invoice.vendor.phone && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Phone
                </label>
                <p className="text-sm">{invoice.vendor.phone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice Information */}
        <Card>
          <CardHeader>
            <CardTitle>Invoice Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Invoice Number
              </label>
              <p className="text-lg font-semibold">{invoice.invoice.number}</p>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Invoice Date
              </label>
              <p className="text-sm">{formatDate(invoice.invoice.date)}</p>
            </div>
            
            {invoice.invoice.dueDate && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Due Date
                </label>
                <p className="text-sm">{formatDate(invoice.invoice.dueDate)}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Total Amount
              </label>
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(invoice.invoice.total, invoice.invoice.currency)}
              </p>
            </div>
            
            {invoice.invoice.tax && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Tax Amount
                </label>
                <p className="text-sm">
                  {formatCurrency(invoice.invoice.tax, invoice.invoice.currency)}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Line Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Line Items</CardTitle>
          </CardHeader>
          <CardContent>
            {invoice.lineItems && invoice.lineItems.length > 0 ? (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-sm font-medium text-muted-foreground">
                          Description
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-muted-foreground">
                          Quantity
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-muted-foreground">
                          Unit Price
                        </th>
                        <th className="text-right py-2 text-sm font-medium text-muted-foreground">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoice.lineItems.map((item, index) => (
                        <tr key={index} className="border-b">
                          <td className="py-3">
                            <div>
                              <p className="font-medium">{item.description}</p>
                              {item.productCode && (
                                <p className="text-sm text-muted-foreground">
                                  Code: {item.productCode}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="text-right py-3">
                            {item.quantity || '-'}
                          </td>
                          <td className="text-right py-3">
                            {item.unitPrice 
                              ? formatCurrency(item.unitPrice, invoice.invoice.currency)
                              : '-'
                            }
                          </td>
                          <td className="text-right py-3 font-medium">
                            {item.totalPrice 
                              ? formatCurrency(item.totalPrice, invoice.invoice.currency)
                              : '-'
                            }
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                <Separator />
                
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    {invoice.invoice.subtotal && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Subtotal:</span>
                        <span className="font-medium">
                          {formatCurrency(invoice.invoice.subtotal, invoice.invoice.currency)}
                        </span>
                      </div>
                    )}
                    {invoice.invoice.tax && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Tax:</span>
                        <span className="font-medium">
                          {formatCurrency(invoice.invoice.tax, invoice.invoice.currency)}
                        </span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between">
                      <span className="font-semibold">Total:</span>
                      <span className="font-bold text-lg">
                        {formatCurrency(invoice.invoice.total, invoice.invoice.currency)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No line items available
              </p>
            )}
          </CardContent>
        </Card>

        {/* File Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>File Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  File Name
                </label>
                <p className="text-sm font-medium">{invoice.fileName}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  File Size
                </label>
                <p className="text-sm">
                  {invoice.fileSize ? `${(invoice.fileSize / 1024 / 1024).toFixed(2)} MB` : '-'}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Uploaded
                </label>
                <p className="text-sm">{formatDate(invoice.createdAt)}</p>
              </div>
            </div>
            
            {invoice.fileUrl && (
              <div className="mt-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(invoice.fileUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
