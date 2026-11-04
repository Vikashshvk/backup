import React, { useState, useMemo } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { formatCurrency, formatDate, downloadCSV } from '../utils/formatters';
import { Expense, ExpenseCategory } from '../types';
import {
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wallet,
  PieChart,
  Search,
  Download,
  Calendar,
  FileCheck,
  CheckCircle,
  Building,
  Award,
} from 'lucide-react';

export const TransparencyView: React.FC = () => {
  const { totalCollected, totalExpenses, remainingBalance, expenses, addToast } = useCommunity();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Category breakdown calculation
  const categoryTotals = useMemo(() => {
    const map: Record<string, number> = {};
    expenses.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + e.amount;
    });
    return map;
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const matchSearch =
        e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.voucherNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.beneficiaryOrVendor.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = selectedCategory === 'all' || e.category === selectedCategory;
      return matchSearch && matchCategory;
    });
  }, [expenses, searchTerm, selectedCategory]);

  const handleExportExpenses = () => {
    const rows = filteredExpenses.map((e) => ({
      'Voucher #': e.voucherNumber,
      Date: e.date,
      Title: e.title,
      Category: e.category,
      'Amount (INR)': e.amount,
      'Beneficiary / Vendor': e.beneficiaryOrVendor,
      'Approved By': e.approvedBy,
      Description: e.description,
    }));

    downloadCSV(`Chamar_Fund_Expense_Ledger_${new Date().toISOString().split('T')[0]}.csv`, rows);
    addToast({
      type: 'success',
      title: 'Expense Ledger Exported',
      message: `${rows.length} expense audit records exported to CSV.`,
    });
  };

  const utilizationRate = totalCollected > 0 ? Math.round((totalExpenses / totalCollected) * 100) : 0;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
            <span>Public Financial Audit & Accountability</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Fund Transparency & Expense Ledger
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Every rupee contributed by community members is openly tracked and documented with
            vouchers.
          </p>
        </div>

        <button
          id="export-expenses-csv-btn"
          onClick={handleExportExpenses}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 shadow-2xs transition shrink-0"
        >
          <Download className="w-4 h-4 text-blue-600" />
          <span>Export Expense Ledger (CSV)</span>
        </button>
      </div>

      {/* Primary KPI Balance Sheet Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Collected */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-100">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Money Collected
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-blue-950 font-mono tracking-tight">
              {formatCurrency(totalCollected)}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              Verified community donations
            </span>
          </div>
        </div>

        {/* Total Money Used */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Money Used
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 font-mono tracking-tight">
              {formatCurrency(totalExpenses)}
            </span>
            <span className="text-xs text-slate-400 block mt-1">
              {utilizationRate}% utilized for welfare & facilities
            </span>
          </div>
        </div>

        {/* Remaining Balance */}
        <div className="bg-gradient-to-br from-emerald-900 to-teal-800 text-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-200 uppercase tracking-wider">
              Remaining Available Balance
            </span>
            <div className="w-9 h-9 rounded-xl bg-white/20 text-white flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
              {formatCurrency(remainingBalance)}
            </span>
            <span className="text-xs text-emerald-200 block mt-1">
              Secured in dual-signature trust account
            </span>
          </div>
        </div>
      </div>

      {/* Category Wise Expenditure Distribution */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-blue-100 space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              Expenditure Breakdown by Purpose
            </h3>
          </div>
          <span className="text-xs text-slate-500">
            Total {expenses.length} sanctioned voucher disbarsals
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(categoryTotals).map(([cat, rawAmt]) => {
            const amt = Number(rawAmt) || 0;
            const percentage = totalExpenses > 0 ? Math.round((amt / totalExpenses) * 100) : 0;
            return (
              <div
                key={cat}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2 hover:border-blue-300 transition"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-slate-800 line-clamp-1">{cat}</span>
                  <span className="text-xs font-mono font-bold text-blue-800">{percentage}%</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>Disbursed:</span>
                  <strong className="text-slate-800">{formatCurrency(amt)}</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Expense Ledger Table */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Audited Expense Ledger</h2>
            <p className="text-xs text-slate-500">
              Itemized list of community expenses with committee approval details
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                id="search-expenses-input"
                type="text"
                placeholder="Search expense / voucher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 w-48 sm:w-64"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              id="filter-expense-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="all">All Categories</option>
              <option value="Education Aid">Education Aid</option>
              <option value="Medical Assistance">Medical Assistance</option>
              <option value="Community Hall Maintenance">Community Hall Maintenance</option>
              <option value="Youth Skill Training">Youth Skill Training</option>
              <option value="Annual Sammelan & Events">Annual Sammelan & Events</option>
              <option value="Legal & Administrative Aid">Legal & Administrative Aid</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Voucher #</th>
                  <th className="py-3.5 px-4">Expense Title</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Beneficiary / Vendor</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4">Approved By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {exp.voucherNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900">{exp.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5 max-w-md line-clamp-1">
                        {exp.description}
                      </p>
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[11px] font-semibold">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 whitespace-nowrap">
                      {formatDate(exp.date)}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 whitespace-nowrap">
                      {exp.beneficiaryOrVendor}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 text-sm whitespace-nowrap">
                      {formatCurrency(exp.amount)}
                    </td>
                    <td className="py-3.5 px-4 text-[11px] text-slate-500">
                      {exp.approvedBy}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Committee Transparency Pledge Box */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start">
            <Award className="w-5 h-5 text-blue-400" />
            <h4 className="text-base font-bold text-white">
              The Chamar Clan Community Transparency Guarantee
            </h4>
          </div>
          <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
            All disbursements above ₹10,000 require minimum dual authorization by the President and
            Treasurer. Bank statements and CA audit balances are reviewed in monthly open community
            meetings and published openly on this portal.
          </p>
        </div>

        <div className="shrink-0">
          <div className="bg-white/10 px-4 py-2.5 rounded-xl border border-white/20 text-center">
            <span className="text-[10px] uppercase font-bold text-blue-300 block">
              Annual Audit Status
            </span>
            <span className="text-sm font-bold text-white">CA Certified Clean</span>
          </div>
        </div>
      </div>
    </div>
  );
};
