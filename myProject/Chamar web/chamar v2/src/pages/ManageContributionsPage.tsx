import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Contribution } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  ShieldCheck,
  CreditCard,
  ChevronLeft,
  RefreshCw,
  Eye,
  AlertCircle,
} from 'lucide-react';

export const ManageContributionsPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Selected item for detail & action
  const [activeItem, setActiveItem] = useState<Contribution | null>(null);

  // Reject modal
  const [rejectItem, setRejectItem] = useState<Contribution | null>(null);
  const [rejectReason, setRejectReason] = useState('Unable to verify transaction in bank statement');

  const fetchContributions = async () => {
    setIsLoading(true);
    try {
      const data = await api.getContributions({
        search: search.trim() || undefined,
        status: statusFilter,
        sortBy: 'date',
        sortOrder: 'desc',
      });
      setContributions(data.contributions);
    } catch (err: any) {
      showError(err.message || 'Failed to fetch contributions');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchContributions();
  };

  const handleVerify = async (item: Contribution) => {
    try {
      await api.updateContributionStatus(
        item._id,
        'Verified',
        user ? `${user.name} (${user.role})` : 'Authorized Committee'
      );
      showSuccess(`Contribution from ${item.name} marked as Verified!`);
      setActiveItem(null);
      fetchContributions();
    } catch (err: any) {
      showError(err.message || 'Failed to update status');
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectItem) return;
    try {
      await api.updateContributionStatus(
        rejectItem._id,
        'Rejected',
        user?.name,
        rejectReason.trim()
      );
      showSuccess(`Contribution from ${rejectItem.name} marked as Rejected`);
      setRejectItem(null);
      setActiveItem(null);
      fetchContributions();
    } catch (err: any) {
      showError(err.message || 'Failed to reject contribution');
    }
  };

  const handleMarkPending = async (item: Contribution) => {
    try {
      await api.updateContributionStatus(item._id, 'Pending');
      showSuccess(`Contribution reset to Pending review`);
      setActiveItem(null);
      fetchContributions();
    } catch (err: any) {
      showError(err.message || 'Failed to update status');
    }
  };

  const getStatusBadge = (status: Contribution['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Verified
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" />
            Rejected
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link
            to="/admin"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 mb-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Manage All Contributions
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Audit, verify bank credits, or reject unverified entries.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchContributions}
          disabled={isLoading}
          className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer self-start sm:self-auto"
          title="Refresh list"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, txn ID, or reference ID..."
              className="w-full pl-10 pr-4 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-semibold">
              {(['All', 'Pending', 'Verified', 'Rejected'] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <Button type="submit" size="sm" variant="primary">
              Filter
            </Button>
          </div>
        </form>
      </div>

      {/* Contributions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            Loading contributions ledger...
          </div>
        ) : contributions.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No contributions found matching your criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Ref ID / Date</th>
                  <th className="py-3.5 px-4">Member Name</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Transaction / Mode</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributions.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-xs text-blue-700">
                        {c.referenceId}
                      </div>
                      <div className="text-[11px] text-slate-500">{formatDate(c.createdAt)}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500 font-mono">{c.mobile}</div>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-slate-900 text-base">
                      {formatINR(c.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                        {c.paymentMethod}
                      </span>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 truncate max-w-[140px]">
                        {c.transactionId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(c.status)}</td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === 'Pending' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => handleVerify(c)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              Verify
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setRejectItem(c);
                                setRejectReason('Unable to verify transaction in bank statement');
                              }}
                              className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold rounded-lg cursor-pointer"
                            >
                              Reject
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setActiveItem(c)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                            title="View full voucher"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      {rejectItem && (
        <Modal
          isOpen={!!rejectItem}
          onClose={() => setRejectItem(null)}
          title={`Reject Contribution (${rejectItem.referenceId})`}
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Rejecting will mark this contribution as Rejected on the public ledger. You can provide an
              explanation for the member:
            </p>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Reason for Rejection
              </label>
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRejectItem(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View Details & Override Modal */}
      {activeItem && (
        <Modal
          isOpen={!!activeItem}
          onClose={() => setActiveItem(null)}
          title={`Contribution Voucher: ${activeItem.referenceId}`}
        >
          <div className="space-y-4 text-xs sm:text-sm">
            <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 block">Member Name</span>
                <span className="font-bold text-slate-900">{activeItem.name}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Mobile</span>
                <span className="font-mono text-slate-800">{activeItem.mobile}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Amount</span>
                <span className="text-base font-bold text-blue-900">
                  {formatINR(activeItem.amount)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Status</span>
                <div>{getStatusBadge(activeItem.status)}</div>
              </div>
              <div className="col-span-2">
                <span className="text-slate-500 block">Transaction Reference / UTR</span>
                <span className="font-mono text-xs font-semibold text-slate-800 break-all">
                  {activeItem.transactionId}
                </span>
              </div>
              {activeItem.verifiedBy && (
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500 block">Verified By</span>
                  <span className="text-emerald-700 font-semibold">{activeItem.verifiedBy}</span>
                </div>
              )}
              {activeItem.rejectionReason && (
                <div className="col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-rose-600 block font-semibold">Rejection Note</span>
                  <span className="text-rose-800">{activeItem.rejectionReason}</span>
                </div>
              )}
            </div>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs text-slate-500 font-medium">Status override:</span>
              <div className="flex items-center gap-2">
                {activeItem.status !== 'Verified' && (
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => handleVerify(activeItem)}
                  >
                    Set as Verified
                  </Button>
                )}
                {activeItem.status !== 'Pending' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleMarkPending(activeItem)}
                  >
                    Reset to Pending
                  </Button>
                )}
                {activeItem.status !== 'Rejected' && (
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      setRejectItem(activeItem);
                    }}
                  >
                    Reject
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
