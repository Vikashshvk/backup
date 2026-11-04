import React, { useState, useMemo } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import { Contribution, ContributionCategory, ContributionStatus } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Download,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import { downloadCSV } from '../utils/formatters';

export const ContributionsListView: React.FC = () => {
  const { contributions, setSelectedReceipt, addToast } = useCommunity();

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc' | 'name-asc'>('date-desc');

  const filteredContributions = useMemo(() => {
    return contributions
      .filter((c) => {
        const matchesSearch =
          c.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.receiptNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.utrOrRefNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (c.gotraOrVillage && c.gotraOrVillage.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || c.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
        if (sortBy === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        if (sortBy === 'name-asc') return a.memberName.localeCompare(b.memberName);
        return 0;
      });
  }, [contributions, searchTerm, statusFilter, categoryFilter, sortBy]);

  const filteredTotal = filteredContributions
    .filter((c) => c.status === 'verified')
    .reduce((sum, c) => sum + c.amount, 0);

  const handleExport = () => {
    const rows = filteredContributions.map((c) => ({
      'Receipt No': c.receiptNumber,
      'Member Name': c.memberName,
      Mobile: c.mobile,
      'Clan / Village': c.gotraOrVillage || '',
      'Amount (INR)': c.amount,
      Category: c.category,
      'Payment Mode': c.paymentMethod,
      'UTR / Ref': c.utrOrRefNumber,
      Date: c.date,
      Status: c.status,
      'Verified By': c.verifiedBy || '',
    }));

    downloadCSV(`Chamar_Community_Contributions_${new Date().toISOString().split('T')[0]}.csv`, rows);
    addToast({
      type: 'success',
      title: 'Data Exported',
      message: `${rows.length} contribution records exported to CSV file.`,
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Heading & Export Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Transparent Contribution Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time public record of all member contributions and verified donations.
          </p>
        </div>

        <button
          id="export-contributions-csv-btn"
          onClick={handleExport}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition shrink-0"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Export Records (CSV)</span>
        </button>
      </div>

      {/* Filter and Search Controls Card */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-blue-100 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <input
              id="search-contributions-input"
              type="text"
              placeholder="Search by donor name, receipt #, UTR, village..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 sm:top-3" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              id="filter-status-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="verified">Verified Only</option>
              <option value="pending">Pending Only</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              id="filter-category-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="all">All Purposes / Causes</option>
              <option value="General Welfare Fund">General Welfare Fund</option>
              <option value="Education & Scholarships">Education & Scholarships</option>
              <option value="Medical Emergency Relief">Medical Emergency Relief</option>
              <option value="Community Center Development">Community Center Development</option>
              <option value="Youth Career & Coaching">Youth Career & Coaching</option>
              <option value="Annual Sammelan & Cultural">Annual Sammelan & Cultural</option>
            </select>
          </div>

          {/* Sort Control */}
          <div className="md:col-span-2">
            <select
              id="sort-contributions-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
            >
              <option value="date-desc">Newest Date</option>
              <option value="date-asc">Oldest Date</option>
              <option value="amount-desc">Highest Amount</option>
              <option value="amount-asc">Lowest Amount</option>
              <option value="name-asc">Donor Name (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Live Filter Metric Strip */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-800">{filteredContributions.length}</strong> records
            </span>
            <span>•</span>
            <span>
              Filtered Verified Total:{' '}
              <strong className="text-blue-900 font-mono font-bold">
                {formatCurrency(filteredTotal)}
              </strong>
            </span>
          </div>

          {(searchTerm || statusFilter !== 'all' || categoryFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
                setCategoryFilter('all');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Contributions Table for Desktop / Cards for Mobile */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {filteredContributions.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Layers className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-semibold text-slate-700">No contributions match your filter</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing search terms or status filters.</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Receipt #</th>
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Clan / Village</th>
                    <th className="py-3.5 px-4">Cause / Category</th>
                    <th className="py-3.5 px-4">Mode & UTR</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4 text-right">Amount</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredContributions.map((item) => (
                    <tr key={item.id} className="hover:bg-blue-50/40 transition">
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-600 whitespace-nowrap">
                        {item.receiptNumber}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-900 whitespace-nowrap">
                        {item.memberName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {item.gotraOrVillage || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-medium text-slate-700">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-mono text-[11px]">
                        <div>{item.paymentMethod}</div>
                        <div className="text-slate-400 text-[10px] truncate max-w-[120px]">
                          {item.utrOrRefNumber}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-blue-900 text-sm whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.status === 'verified' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            Verified
                          </span>
                        ) : item.status === 'pending' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[11px] font-bold border border-amber-200">
                            <Clock className="w-3 h-3" />
                            Pending
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-red-50 text-red-700 text-[11px] font-bold border border-red-200">
                            <XCircle className="w-3 h-3" />
                            Rejected
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedReceipt(item)}
                          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition"
                          title="View Official Receipt"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card List View */}
            <div className="md:hidden divide-y divide-slate-100">
              {filteredContributions.map((item) => (
                <div key={item.id} className="p-4 space-y-2.5 hover:bg-slate-50">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.memberName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {item.receiptNumber} • {formatDate(item.date)}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-blue-900 font-mono">
                        {formatCurrency(item.amount)}
                      </span>
                      <div className="mt-0.5">
                        {item.status === 'verified' ? (
                          <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                            Verified
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 flex flex-wrap gap-2 items-center">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                      {item.category}
                    </span>
                    {item.gotraOrVillage && (
                      <span className="text-slate-500 text-[11px]">{item.gotraOrVillage}</span>
                    )}
                  </div>

                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px] text-slate-500">
                    <span className="font-mono truncate max-w-[200px]">
                      {item.paymentMethod}: {item.utrOrRefNumber}
                    </span>
                    <button
                      onClick={() => setSelectedReceipt(item)}
                      className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Receipt</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
