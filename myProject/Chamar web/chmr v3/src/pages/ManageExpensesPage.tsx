import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';
import { Expense, DashboardStats } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { Modal } from '../components/Modal';
import { Button } from '../components/Button';
import {
  Receipt,
  PlusCircle,
  Edit2,
  Trash2,
  ChevronLeft,
  Calendar,
  Layers,
  ArrowDownCircle,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

const EXPENSE_CATEGORIES = [
  'Community Hall',
  'Youth & Education',
  'Emergency Medical Aid',
  'Social & Welfare',
  'Events & Gatherings',
  'Administrative & Audit',
  'Other Welfare',
];

export const ManageExpensesPage: React.FC = () => {
  const { user } = useAuth();
  const { showSuccess, showError } = useToast();

  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [approvedBy, setApprovedBy] = useState(user?.name || 'Executive Committee');
  const [isSaving, setIsSaving] = useState(false);

  // Delete Confirmation state
  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [expData, dashData] = await Promise.all([
        api.getExpenses(),
        api.getDashboardStats(),
      ]);
      setExpenses(expData.expenses);
      setStats(dashData.stats);
    } catch (err: any) {
      showError(err.message || 'Failed to load expenses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openAddModal = () => {
    setEditingExpense(null);
    setTitle('');
    setAmount('');
    setCategory(EXPENSE_CATEGORIES[0]);
    setDate(new Date().toISOString().split('T')[0]);
    setDescription('');
    setApprovedBy(user ? `${user.name} (${user.role})` : 'Executive Committee');
    setIsModalOpen(true);
  };

  const openEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setTitle(exp.title);
    setAmount(String(exp.amount));
    setCategory(exp.category);
    setDate(exp.date);
    setDescription(exp.description);
    setApprovedBy(exp.approvedBy || user?.name || '');
    setIsModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showError('Please enter expense title');
      return;
    }
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      showError('Please enter a valid expense amount');
      return;
    }

    setIsSaving(true);
    try {
      if (editingExpense) {
        await api.updateExpense(editingExpense._id, {
          title: title.trim(),
          amount: numAmount,
          category,
          date,
          description: description.trim(),
          approvedBy: approvedBy.trim() || undefined,
        });
        showSuccess('Expense updated successfully');
      } else {
        await api.createExpense({
          title: title.trim(),
          amount: numAmount,
          category,
          date,
          description: description.trim(),
          approvedBy: approvedBy.trim() || undefined,
        });
        showSuccess('New expense recorded to treasury');
      }
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to save expense');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteExpense = async () => {
    if (!deleteTarget) return;
    try {
      await api.deleteExpense(deleteTarget._id);
      showSuccess('Expense deleted successfully');
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      showError(err.message || 'Failed to delete expense');
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
            Manage Fund Expenses
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Add sanctioned expenditure vouchers and track category expenditures.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            variant="primary"
            size="md"
            onClick={openAddModal}
            leftIcon={<PlusCircle className="w-4 h-4" />}
          >
            Record Expense
          </Button>
          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="p-2.5 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Snapshot Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Total Sanctioned Expenses
          </span>
          <div className="text-2xl font-bold text-rose-700 mt-1">
            {formatINR(stats?.totalExpenses || 0)}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{expenses.length} approved expense vouchers</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-xs">
          <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">
            Treasury Fund Collected
          </span>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {formatINR(stats?.totalCollected || 0)}
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Verified contributions</p>
        </div>

        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-xs">
          <span className="text-xs uppercase font-bold text-blue-300 tracking-wider">
            Net Available Balance
          </span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {formatINR(stats?.remainingBalance || 0)}
          </div>
          <p className="text-xs text-slate-300 mt-0.5">Liquid cash in bank account</p>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mx-auto mb-2" />
            Loading expenses...
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No expenses recorded yet. Click &ldquo;Record Expense&rdquo; to add your first voucher.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                <tr>
                  <th className="py-3.5 px-4">Date / Voucher</th>
                  <th className="py-3.5 px-4">Title & Details</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Approved By</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((exp) => (
                  <tr key={exp._id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{exp.date}</div>
                      <div className="text-[11px] font-mono text-slate-400">
                        ID: {exp._id.slice(-6).toUpperCase()}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-bold text-slate-900">{exp.title}</div>
                      <p className="text-xs text-slate-500 line-clamp-1">{exp.description}</p>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-bold text-rose-700 text-base">
                      {formatINR(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {exp.approvedBy || 'Committee'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(exp)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(exp)}
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingExpense ? 'Edit Expense Record' : 'Record New Expense Voucher'}
        >
          <form onSubmit={handleSaveExpense} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Expense Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Community Hall Cement & Flooring Work"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Amount (₹) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="10000"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Expenditure Date <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Welfare Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Description / Purpose
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain the purpose of the expense and voucher invoice reference..."
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                Sanctioned / Approved By
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="e.g. Dr. Ramji Ratnakar (President)"
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={isSaving}>
                {editingExpense ? 'Update Expense' : 'Save Expense Voucher'}
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <Modal
          isOpen={!!deleteTarget}
          onClose={() => setDeleteTarget(null)}
          title="Confirm Delete Expense"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-600">
              Are you sure you want to delete the expense voucher{' '}
              <strong className="text-slate-900">&ldquo;{deleteTarget.title}&rdquo;</strong> of{' '}
              <strong className="text-rose-600">{formatINR(deleteTarget.amount)}</strong>?
            </p>
            <p className="text-xs text-slate-500">
              This action will remove the expense from the public transparency report and return the
              amount to the net treasury balance.
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button variant="danger" size="sm" onClick={handleDeleteExpense}>
                Delete Expense
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
