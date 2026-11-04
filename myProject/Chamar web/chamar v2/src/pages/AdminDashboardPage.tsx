import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { DashboardStats, Contribution, Expense, CommunitySettings } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { StatsCard } from '../components/StatsCard';
import { ProgressBar } from '../components/ProgressBar';
import { ContributionCard } from '../components/ContributionCard';
import { Button } from '../components/Button';
import { Modal } from '../components/Modal';
import {
  Shield,
  Coins,
  Users,
  Clock,
  ArrowUpRight,
  TrendingUp,
  FileCheck,
  Receipt,
  Settings,
  PlusCircle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingList, setPendingList] = useState<Contribution[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Reject Modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedRejectId, setSelectedRejectId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Settings Modal state
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [targetInput, setTargetInput] = useState('100000');
  const [upiInput, setUpiInput] = useState('chamarclan@upi');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data.stats);
      setPendingList(data.pendingContributionsList);
      setRecentExpenses(data.recentExpenses);
      setSettings(data.settings);
      if (data.settings) {
        setTargetInput(String(data.settings.targetAmount));
        setUpiInput(data.settings.upiId);
      }
    } catch (err: any) {
      showError(err.message || 'Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleVerify = async (id: string) => {
    try {
      await api.updateContributionStatus(
        id,
        'Verified',
        user ? `${user.name} (${user.role})` : 'Authorized Committee'
      );
      showSuccess('Contribution successfully verified & posted to ledger');
      loadDashboard();
    } catch (err: any) {
      showError(err.message || 'Failed to verify contribution');
    }
  };

  const handleOpenReject = (id: string) => {
    setSelectedRejectId(id);
    setRejectionReason('Transaction ID could not be matched with bank ledger');
    setRejectModalOpen(true);
  };

  const handleConfirmReject = async () => {
    if (!selectedRejectId) return;
    try {
      await api.updateContributionStatus(
        selectedRejectId,
        'Rejected',
        user?.name,
        rejectionReason.trim()
      );
      showSuccess('Contribution status updated to Rejected');
      setRejectModalOpen(false);
      loadDashboard();
    } catch (err: any) {
      showError(err.message || 'Failed to reject contribution');
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    try {
      await api.updateSettings({
        targetAmount: Number(targetInput) || 100000,
        upiId: upiInput.trim(),
      });
      showSuccess('Fund settings updated successfully');
      setSettingsModalOpen(false);
      loadDashboard();
    } catch (err: any) {
      showError(err.message || 'Failed to update settings');
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleResetDemo = async () => {
    if (
      !window.confirm(
        'Reset community database back to the demo baseline? This will restore initial seed contributions and expenses.'
      )
    ) {
      return;
    }
    try {
      await api.resetDemoData();
      showSuccess('Demo data reset successfully');
      loadDashboard();
    } catch (err: any) {
      showError(err.message || 'Failed to reset demo');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5" />
              Committee Management
            </span>
            <span className="text-xs text-slate-500">
              Logged in as: <strong className="text-slate-800">{user?.name}</strong> ({user?.role})
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Committee & Admin Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track fund collections, verify incoming member payments, and record sanctioned expenses.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          <Link to="/admin/contributions">
            <Button variant="outline" size="sm" leftIcon={<FileCheck className="w-4 h-4" />}>
              Manage Contributions
            </Button>
          </Link>
          <Link to="/admin/expenses">
            <Button variant="primary" size="sm" leftIcon={<Receipt className="w-4 h-4" />}>
              Manage Expenses
            </Button>
          </Link>
          <button
            type="button"
            onClick={() => setSettingsModalOpen(true)}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Fund Settings"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={loadDashboard}
            disabled={isLoading}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Collected"
          value={formatINR(stats?.totalCollected || 0)}
          subtitle="Verified by committee"
          icon={<Coins className="w-6 h-6" />}
          variant="blue"
        />

        <StatsCard
          title="Contributors"
          value={String(stats?.contributorCount || 0)}
          subtitle="Unique participating families"
          icon={<Users className="w-6 h-6" />}
          variant="navy"
        />

        <StatsCard
          title="Pending Verification"
          value={String(stats?.pendingContributions || 0)}
          subtitle="Submissions awaiting audit"
          icon={<Clock className="w-6 h-6" />}
          variant="amber"
          badge={stats?.pendingContributions ? 'Action Needed' : 'Up to Date'}
        />

        <StatsCard
          title="Net Treasury Balance"
          value={formatINR(stats?.remainingBalance || 0)}
          subtitle={`After ${formatINR(stats?.totalExpenses || 0)} expenses`}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="emerald"
        />
      </div>

      {/* Progress Bar */}
      <ProgressBar
        collected={stats?.totalCollected || 0}
        target={stats?.targetAmount || 100000}
        percentage={stats?.percentageCompleted}
      />

      {/* Verification Queue (Pending Contributions) */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-slate-900">Pending Contributions Review</h3>
              {pendingList.length > 0 && (
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {pendingList.length} Pending
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Verify against bank/UPI statement and approve to update public ledger
            </p>
          </div>

          <Link
            to="/admin/contributions"
            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
          >
            <span>All Contributions</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {pendingList.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No pending contributions</p>
            <p className="text-xs text-slate-500 mt-0.5">
              All member contributions have been verified and settled!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingList.map((item) => (
              <ContributionCard
                key={item._id}
                contribution={item}
                showAdminActions={true}
                onVerify={handleVerify}
                onReject={handleOpenReject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Recent Expenses & Fast Expense Add */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">Recent Sanctioned Expenses</h3>
              <p className="text-xs text-slate-500">Expenditures deducted from community treasury</p>
            </div>
            <Link
              to="/admin/expenses"
              className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Manage Expenses</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {recentExpenses.length === 0 ? (
            <p className="text-xs text-slate-500 italic py-4">No expenses recorded yet.</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.slice(0, 3).map((exp) => (
                <div
                  key={exp._id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
                >
                  <div>
                    <span className="text-xs font-semibold text-slate-500">{exp.category} • {exp.date}</span>
                    <h4 className="text-sm font-bold text-slate-900">{exp.title}</h4>
                    <p className="text-xs text-slate-600 truncate max-w-md">{exp.description}</p>
                  </div>
                  <div className="text-right pl-4">
                    <span className="text-base font-bold text-rose-700">
                      {formatINR(exp.amount)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions Panel */}
        <div className="lg:col-span-4 bg-slate-900 text-white rounded-3xl p-6 shadow-md flex flex-col justify-between space-y-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
              Quick Admin Actions
            </span>
            <h3 className="text-lg font-bold mt-1">Management Controls</h3>
            <p className="text-xs text-slate-300 mt-1">
              Easily navigate ledger tasks and manage public settings.
            </p>

            <div className="mt-5 space-y-2.5">
              <Link to="/admin/expenses" className="block">
                <Button variant="primary" size="sm" className="w-full justify-start gap-2">
                  <PlusCircle className="w-4 h-4" />
                  <span>Record New Expense Voucher</span>
                </Button>
              </Link>
              <Link to="/admin/contributions" className="block">
                <Button variant="secondary" size="sm" className="w-full justify-start gap-2 bg-slate-800 hover:bg-slate-700">
                  <FileCheck className="w-4 h-4" />
                  <span>Audit Complete Contributions</span>
                </Button>
              </Link>
              <Link to="/transparency" className="block">
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2 text-slate-300 hover:bg-slate-800 hover:text-white">
                  <ExternalLink className="w-4 h-4" />
                  <span>View Public Transparency Page</span>
                </Button>
              </Link>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-400">Reset Demo Data</span>
            <button
              type="button"
              onClick={handleResetDemo}
              className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset State</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <Modal
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          title="Reject Contribution"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Specify the reason why this contribution could not be verified. The contributor will be able
              to see this reason.
            </p>
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Rejection Reason
              </label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-rose-500"
                placeholder="e.g. UTR not found in bank statement, or duplicate transaction"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setRejectModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleConfirmReject}>
                Confirm Rejection
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Settings Modal */}
      {settingsModalOpen && (
        <Modal
          isOpen={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
          title="Configure Community Fund Settings"
        >
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Collection Target (₹)
              </label>
              <input
                type="number"
                min="1000"
                required
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Official UPI ID
              </label>
              <input
                type="text"
                required
                value={upiInput}
                onChange={(e) => setUpiInput(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 font-mono"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" type="button" onClick={() => setSettingsModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" isLoading={isUpdatingSettings}>
                Save Settings
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
