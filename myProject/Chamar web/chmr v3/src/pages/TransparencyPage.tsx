import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { DashboardStats, Expense, CategoryBreakdown } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { ExpenseCard } from '../components/ExpenseCard';
import { Button } from '../components/Button';
import {
  Scale,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  ShieldCheck,
  Download,
  Printer,
  Calendar,
  Layers,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';

export const TransparencyPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<CategoryBreakdown[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTransparencyData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data.stats);
      setCategories(data.categoryBreakdown);
      const expData = await api.getExpenses();
      setExpenses(expData.expenses);
    } catch (err: any) {
      setError(err.message || 'Failed to load transparency ledger');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTransparencyData();
  }, []);

  const filteredExpenses =
    selectedCategory === 'All'
      ? expenses
      : expenses.filter((e) => e.category === selectedCategory);

  const allCategoryNames = ['All', ...new Set(expenses.map((e) => e.category))];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
            Open Community Audit
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            Fund Transparency & Expenses
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Every contribution received and every rupee spent is recorded here with description, date,
            and committee approval to ensure total trust and accountability.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            leftIcon={<Printer className="w-4 h-4" />}
          >
            Print Audit Statement
          </Button>
          <button
            type="button"
            onClick={loadTransparencyData}
            disabled={isLoading}
            className="p-2 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl text-slate-600 transition-colors cursor-pointer"
            title="Refresh ledger"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. Fund Summary Big KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Collected */}
        <div className="bg-white rounded-2xl p-6 border border-blue-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ArrowDownCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Collected
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
              {formatINR(stats?.totalCollected || 0)}
            </div>
            <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Verified member deposits
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <ArrowUpCircle className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Expenses
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-0.5">
              {formatINR(stats?.totalExpenses || 0)}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              {expenses.length} sanctioned expenditures
            </p>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-md flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/10 text-emerald-400 flex items-center justify-center shrink-0">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Remaining Balance
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-white mt-0.5">
              {formatINR(stats?.remainingBalance || 0)}
            </div>
            <p className="text-[11px] text-emerald-300 font-medium mt-1">
              Currently held in treasury account
            </p>
          </div>
        </div>
      </div>

      {/* 2. Category Breakdown Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600" />
          Expenditure Allocation by Category
        </h3>
        <p className="text-xs text-slate-500 mb-5">
          Distribution of community expenditures across social welfare sectors.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.category}
              className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col justify-between"
            >
              <div>
                <span className="text-xs font-semibold text-slate-700 block truncate">
                  {cat.category}
                </span>
                <div className="text-lg font-bold text-slate-900 mt-1">
                  {formatINR(cat.amount)}
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>Share</span>
                  <span className="font-bold text-blue-700">{cat.percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, cat.percentage)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Detailed Expenses Ledger */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Expenditure Itemization</h2>
            <p className="text-xs text-slate-500">
              Showing {filteredExpenses.length} expense records
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex flex-wrap items-center gap-1.5">
            {allCategoryNames.map((cName) => (
              <button
                key={cName}
                type="button"
                onClick={() => setSelectedCategory(cName)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cName
                    ? 'bg-blue-600 text-white shadow-xs font-bold'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                {cName}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses List */}
        {isLoading ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <RefreshCw className="w-7 h-7 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-slate-500">Loading expense vouchers...</p>
          </div>
        ) : filteredExpenses.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 text-sm text-slate-500">
            No expenses found under this category.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExpenses.map((exp) => (
              <ExpenseCard key={exp._id} expense={exp} />
            ))}
          </div>
        )}
      </div>

      {/* 4. Transparency Certification Note */}
      <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-5 md:p-6 flex flex-col sm:flex-row items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-blue-950">Chamar Clan Community Audit Guarantee</h4>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            All expenditures require prior committee approval and signed invoice vouchers. Hard copies
            of all bank statements, invoices, and physical receipts are preserved at the committee
            headquarters and available for inspection by any community member during the monthly
            general body meeting.
          </p>
        </div>
      </div>
    </div>
  );
};
