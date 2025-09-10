'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { SearchBar } from '@/components/invoices/SearchBar';
import { InvoiceTable } from '@/components/invoices/InvoiceTable';
import { InvoiceCards } from '@/components/invoices/InvoiceCards';
import { Pagination } from '@/components/invoices/Pagination';
import { LoadingState } from '@/components/ui/LoadingState';
import { ErrorState } from '@/components/ui/ErrorState';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { getInvoices, deleteInvoice } from '@/lib/api';
import { Invoice, PaginatedResponse } from '@/lib/types';

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const itemsPerPage = 10;

  const fetchInvoices = async (page: number = 1, query: string = '') => {
    setLoading(true);
    setError(null);

    try {
      const response: PaginatedResponse<Invoice> = await getInvoices({
        q: query,
        page,
        limit: itemsPerPage
      });

      setInvoices(response.data);
      setCurrentPage(response.pagination.page);
      setTotalPages(response.pagination.pages);
      setTotal(response.pagination.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices(1, searchQuery);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchInvoices(1, searchQuery);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this invoice?')) {
      return;
    }

    try {
      await deleteInvoice(id);
      fetchInvoices(currentPage, searchQuery);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number | undefined, currency: string = 'USD') => {
    if (amount === undefined) return '-';
    
    // Clean up currency code - only allow valid ISO currency codes
    let cleanCurrency = 'USD'; // default
    if (currency && typeof currency === 'string') {
      const uppercaseCurrency = currency.toUpperCase().trim();
      // Check if it's a valid 3-letter currency code
      if (/^[A-Z]{3}$/.test(uppercaseCurrency)) {
        cleanCurrency = uppercaseCurrency;
      }
    }
    
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: cleanCurrency
      }).format(amount);
    } catch {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(amount);
    }
  };

  return (
    <div className="responsive-container">
      <DashboardHeader
        title="Invoices"
        subtitle="Manage your extracted invoice data"
        actionLabel="New Invoice"
        actionPath="/"
      />

      <SearchBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearch={handleSearch}
        loading={loading}
      />

      {/* Results Summary */}
      {!loading && (
        <div className="mb-4 text-sm text-muted-foreground">
          {total > 0 ? (
            <span>
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, total)} of {total} invoices
            </span>
          ) : (
            <span>No invoices found</span>
          )}
        </div>
      )}

      {/* Error State */}
      {error && (
        <ErrorState 
          error={error} 
          onRetry={() => fetchInvoices(currentPage, searchQuery)}
        />
      )}

      {/* Loading State */}
      {loading ? (
        <LoadingState message="Loading invoices..." />
      ) : (
        <>
          <InvoiceTable
            invoices={invoices}
            searchQuery={searchQuery}
            loading={loading}
            onDelete={handleDelete}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />

          <InvoiceCards
            invoices={invoices}
            searchQuery={searchQuery}
            loading={loading}
            onDelete={handleDelete}
            formatDate={formatDate}
            formatCurrency={formatCurrency}
          />
        </>
      )}

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        onPageChange={(page) => fetchInvoices(page, searchQuery)}
      />

      <MobileNavigation 
        showFab={true}
        fabAction={() => router.push('/')}
      />
    </div>
  );
}
