import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Contribution, ContributionStatus } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { ContributionCard } from '../components/ContributionCard';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import {
  Search,
  Filter,
  ArrowUpDown,
  CheckCircle2,
  Clock,
  XCircle,
  FileSpreadsheet,
  Download,
  Printer,
  CreditCard,
  User,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';

export const ContributionsPage: React.FC = () => {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Selected for Receipt Modal
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);

  const fetchContributions = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getContributions({
        search: search.trim() || undefined,
        status: statusFilter,
        sortBy,
        sortOrder,
      });
      setContributions(data.contributions);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch contribution ledger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [statusFilter, sortBy, sortOrder]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContributions();
  };

  const getStatusBadge = (status: ContributionStatus) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
    }
  };

  // Export CSV of visible ledger
  const exportCSV = () => {
    if (contributions.length === 0) return;
    const headers = ['Reference ID', 'Member Name', 'Mobile', 'Amount (INR)', 'Payment Method', 'Transaction ID', 'Status', 'Date', 'Verified By'];
    const rows = contributions.map((c) => [
      c.referenceId,
      `"${c.name}"`,
      c.mobile,
      c.amount,
      c.paymentMethod,
      `"${c.transactionId}"`,
      c.status,
      formatDate(c.createdAt),
      `"${c.verifiedBy || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Chamar_Clan_Contributions_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            Public Community Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Contribution History
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Complete records of all contributions received and audited for the Chamar Clan Fund.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={exportCSV}
            leftIcon={<Download className="w-4 h-4" />}
            disabled={contributions.length === 0}
          >
            Export CSV
          </Button>
          <button
            type="button"
            onClick={fetchContributions}
            disabled={isLoading}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white rounded-2xl p-4 md:p-5 border border-slate-200 shadow-xs space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by member name, mobile, reference ID, or UTR..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Status Pills */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['All', 'Verified', 'Pending', 'Rejected'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {/* Sort Toggle */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => {
                  if (sortBy === 'date') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('date');
                    setSortOrder('desc');
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                  sortBy === 'date' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <span>Date</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (sortBy === 'amount') {
                    setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
                  } else {
                    setSortBy('amount');
                    setSortOrder('desc');
                  }
                }}
                className={`px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer ${
                  sortBy === 'amount' ? 'bg-white text-blue-700 shadow-2xs' : 'text-slate-600'
                }`}
              >
                <span>Amount</span>
                <ArrowUpDown className="w-3 h-3" />
              </button>
            </div>

            <Button type="submit" size="sm" variant="primary">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Content: Mobile Cards + Desktop Table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
          <p className="text-sm text-slate-500 font-medium">Loading contribution records...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-rose-900 text-sm text-center">
          {error}
        </div>
      ) : contributions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No contributions found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            No entries matched your filter. Try adjusting your search keyword or status filter.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Cards (Visible on screens < md) */}
          <div className="md:hidden space-y-3">
            {contributions.map((c) => (
              <ContributionCard
                key={c._id}
                contribution={c}
                onViewDetails={(item) => setSelectedContribution(item)}
              />
            ))}
          </div>

          {/* Desktop Table (Visible on md and up) */}
          <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-xs uppercase font-bold text-slate-500 tracking-wider">
                  <tr>
                    <th className="py-3.5 px-5">Member</th>
                    <th className="py-3.5 px-5 text-right">Amount</th>
                    <th className="py-3.5 px-5">Date</th>
                    <th className="py-3.5 px-5">Payment Method</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contributions.map((c) => (
                    <tr key={c._id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-4 px-5">
                        <div className="font-semibold text-slate-900">{c.name}</div>
                        <div className="text-xs font-mono text-slate-500">Ref: {c.referenceId}</div>
                      </td>
                      <td className="py-4 px-5 text-right font-bold text-blue-900 text-base">
                        {formatINR(c.amount)}
                      </td>
                      <td className="py-4 px-5 text-slate-600 text-xs">
                        {formatDate(c.createdAt)}
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-xs font-medium text-slate-700">
                          <CreditCard className="w-3 h-3 text-slate-500" />
                          {c.paymentMethod}
                        </span>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-[140px]">
                          {c.transactionId}
                        </div>
                      </td>
                      <td className="py-4 px-5">{getStatusBadge(c.status)}</td>
                      <td className="py-4 px-5 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedContribution(c)}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 px-3 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-50 transition-colors cursor-pointer"
                        >
                          View Slip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Receipt Modal */}
      {selectedContribution && (
        <Modal
          isOpen={!!selectedContribution}
          onClose={() => setSelectedContribution(null)}
          title="Official Contribution Slip"
          maxWidth="md"
        >
          <div className="space-y-4">
            <div className="p-5 bg-blue-50/60 rounded-2xl border border-blue-100">
              <div className="flex items-center justify-between pb-3 border-b border-blue-200">
                <div>
                  <span className="text-[11px] uppercase tracking-wider font-bold text-blue-700">
                    Chamar Clan Community Fund
                  </span>
                  <p className="text-xs text-slate-500">Mutual Welfare & Development Treasury</p>
                </div>
                {getStatusBadge(selectedContribution.status)}
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-blue-100">
                  <span className="text-slate-500">Official Reference ID</span>
                  <span className="font-mono font-bold text-slate-900">
                    {selectedContribution.referenceId}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100">
                  <span className="text-slate-500">Contributor Name</span>
                  <span className="font-semibold text-slate-900">{selectedContribution.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100">
                  <span className="text-slate-500">Mobile</span>
                  <span className="font-mono text-slate-800">{selectedContribution.mobile}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100">
                  <span className="text-slate-500">Amount Contributed</span>
                  <span className="text-base font-bold text-blue-900">
                    {formatINR(selectedContribution.amount)}
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100">
                  <span className="text-slate-500">Payment Mode</span>
                  <span className="font-semibold text-slate-800">{selectedContribution.paymentMethod}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100">
                  <span className="text-slate-500">Transaction ID / UTR</span>
                  <span className="font-mono text-slate-900 break-all">{selectedContribution.transactionId}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-blue-100">
                  <span className="text-slate-500">Date of Submission</span>
                  <span className="text-slate-800">{formatDate(selectedContribution.createdAt)}</span>
                </div>
                {selectedContribution.verifiedBy && (
                  <div className="flex justify-between py-1 border-b border-blue-100">
                    <span className="text-slate-500">Verified By</span>
                    <span className="font-semibold text-emerald-700">
                      {selectedContribution.verifiedBy}
                    </span>
                  </div>
                )}
                {selectedContribution.note && (
                  <div className="pt-2">
                    <span className="text-slate-500 block mb-0.5">Note</span>
                    <span className="text-slate-700 italic bg-white p-2 rounded-lg border border-blue-100 block">
                      &ldquo;{selectedContribution.note}&rdquo;
                    </span>
                  </div>
                )}
                {selectedContribution.rejectionReason && (
                  <div className="pt-2">
                    <span className="text-rose-600 font-bold block mb-0.5">Rejection Reason</span>
                    <span className="text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200 block">
                      {selectedContribution.rejectionReason}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print Slip</span>
              </button>
              <Button size="sm" variant="secondary" onClick={() => setSelectedContribution(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
