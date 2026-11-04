import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { formatCurrency, formatDate, downloadCSV, generateReceiptNumber } from '../utils/formatters';
import {
  Contribution,
  Expense,
  CommitteeMember,
  ContributionCategory,
  PaymentMethod,
  CommitteeRole,
  ExpenseCategory,
} from '../types';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  Trash2,
  Edit,
  Download,
  Settings,
  Users,
  Wallet,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  RotateCcw,
  Save,
  Search,
  Eye,
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const {
    contributions,
    expenses,
    committeeMembers,
    settings,
    currentUser,
    totalCollected,
    totalPendingAmount,
    pendingCount,
    totalExpenses,
    remainingBalance,
    verifyContribution,
    rejectContribution,
    deleteContribution,
    addContribution,
    updateContribution,
    addExpense,
    deleteExpense,
    addCommitteeMember,
    deleteCommitteeMember,
    updateSettings,
    resetToDefaults,
    setSelectedReceipt,
    addToast,
  } = useCommunity();

  const [activeAdminTab, setActiveAdminTab] = useState<
    'verification' | 'contributions' | 'expenses' | 'committee' | 'settings' | 'reports'
  >('verification');

  // Form states for modals/drawers
  const [showAddContributionModal, setShowAddContributionModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [rejectReasonModalId, setRejectReasonModalId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('Payment verification could not be matched with bank statement');

  // Editable settings state
  const [editableSettings, setEditableSettings] = useState(settings);

  // New offline contribution state
  const [newContrib, setNewContrib] = useState({
    memberName: '',
    mobile: '',
    gotraOrVillage: '',
    amount: 2100,
    category: 'General Welfare Fund' as ContributionCategory,
    paymentMethod: 'Cash / Cheque' as PaymentMethod,
    utrOrRefNumber: 'CASH-REC-' + Math.floor(1000 + Math.random() * 9000),
    notes: 'Collected directly at community meeting',
  });

  // New expense state
  const [newExp, setNewExp] = useState({
    title: '',
    category: 'Education Aid' as ExpenseCategory,
    amount: 10000,
    date: new Date().toISOString().split('T')[0],
    description: '',
    beneficiaryOrVendor: '',
    approvedBy: 'Adv. Satish Kumar & Er. Rakesh Babu Sonkar',
  });

  // New committee member state
  const [newMember, setNewMember] = useState({
    name: '',
    role: 'Executive Member' as CommitteeRole,
    phone: '',
    email: '',
    villageOrLocation: '',
    tenure: '2024 - 2027',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isKeySignatory: false,
  });

  // Pending contributions
  const pendingList = contributions.filter((c) => c.status === 'pending');

  const handleVerify = (id: string) => {
    verifyContribution(id, currentUser.name || 'Treasurer');
  };

  const handleConfirmReject = () => {
    if (!rejectReasonModalId) return;
    rejectContribution(rejectReasonModalId, rejectReason);
    setRejectReasonModalId(null);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(editableSettings);
  };

  const handleAddContributionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContrib.memberName || !newContrib.mobile || !newContrib.amount) {
      addToast({ type: 'error', title: 'Error', message: 'Please fill all required fields' });
      return;
    }
    addContribution({
      ...newContrib,
      status: 'verified',
      verifiedBy: currentUser.name,
      verifiedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });
    setShowAddContributionModal(false);
    setNewContrib({
      memberName: '',
      mobile: '',
      gotraOrVillage: '',
      amount: 2100,
      category: 'General Welfare Fund',
      paymentMethod: 'Cash / Cheque',
      utrOrRefNumber: 'CASH-REC-' + Math.floor(1000 + Math.random() * 9000),
      notes: '',
    });
  };

  const handleAddExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExp.title || !newExp.amount || !newExp.beneficiaryOrVendor) {
      addToast({ type: 'error', title: 'Error', message: 'Please fill required expense fields' });
      return;
    }
    addExpense(newExp);
    setShowAddExpenseModal(false);
    setNewExp({
      title: '',
      category: 'Education Aid',
      amount: 10000,
      date: new Date().toISOString().split('T')[0],
      description: '',
      beneficiaryOrVendor: '',
      approvedBy: 'Adv. Satish Kumar & Er. Rakesh Babu Sonkar',
    });
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMember.name || !newMember.phone) {
      addToast({ type: 'error', title: 'Error', message: 'Name and phone are required' });
      return;
    }
    addCommitteeMember(newMember);
    setShowAddMemberModal(false);
    setNewMember({
      name: '',
      role: 'Executive Member',
      phone: '',
      email: '',
      villageOrLocation: '',
      tenure: '2024 - 2027',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      isKeySignatory: false,
    });
  };

  const handleExportAll = () => {
    const rows = contributions.map((c) => ({
      Receipt: c.receiptNumber,
      Name: c.memberName,
      Mobile: c.mobile,
      Amount: c.amount,
      Category: c.category,
      Date: c.date,
      Status: c.status,
      UTR: c.utrOrRefNumber,
      VerifiedBy: c.verifiedBy || '',
    }));
    downloadCSV(`Chamar_Clan_All_Contributions_${new Date().toISOString().split('T')[0]}.csv`, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 text-white rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-700 text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-300" />
            <span>Authorized Committee Management Portal</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black">
            Executive Committee & Fund Control
          </h1>
          <p className="text-xs text-blue-200 mt-0.5">
            Logged in as <strong className="text-white">{currentUser.name}</strong> • {currentUser.email || 'Admin'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="admin-quick-add-contrib-btn"
            onClick={() => setShowAddContributionModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white text-blue-900 text-xs font-bold rounded-xl shadow-xs hover:bg-blue-50 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Record Offline Cash / Donat.</span>
          </button>
          <button
            id="admin-quick-add-exp-btn"
            onClick={() => setShowAddExpenseModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-blue-700 hover:bg-blue-600 text-white text-xs font-bold rounded-xl border border-blue-400/40 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Expense Voucher</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Verified Collections
          </span>
          <span className="text-xl font-black text-blue-900 font-mono mt-1 block">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[10px] text-slate-400">
            {contributions.filter((c) => c.status === 'verified').length} verified records
          </span>
        </div>

        <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-amber-800 font-bold uppercase tracking-wider block">
              Pending Approvals
            </span>
            <span className="bg-amber-500 text-white font-mono text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              {pendingCount}
            </span>
          </div>
          <span className="text-xl font-black text-amber-900 font-mono mt-1 block">
            {formatCurrency(totalPendingAmount)}
          </span>
          <span className="text-[10px] text-amber-700">Awaiting UTR / bank check</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider block">
            Total Fund Expended
          </span>
          <span className="text-xl font-black text-slate-900 font-mono mt-1 block">
            {formatCurrency(totalExpenses)}
          </span>
          <span className="text-[10px] text-slate-400">{expenses.length} voucher disbarsals</span>
        </div>

        <div className="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200 shadow-2xs">
          <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider block">
            Net Liquid Reserve
          </span>
          <span className="text-xl font-black text-emerald-900 font-mono mt-1 block">
            {formatCurrency(remainingBalance)}
          </span>
          <span className="text-[10px] text-emerald-700">Available bank balance</span>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex overflow-x-auto border-b border-slate-200 bg-white rounded-xl p-1.5 shadow-2xs gap-1">
        <button
          id="admin-tab-verification"
          onClick={() => setActiveAdminTab('verification')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeAdminTab === 'verification'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-3.5 h-3.5" />
          <span>Pending Verifications</span>
          {pendingCount > 0 && (
            <span className="bg-amber-400 text-slate-900 text-[10px] px-1.5 py-0.2 rounded-full font-mono">
              {pendingCount}
            </span>
          )}
        </button>

        <button
          id="admin-tab-contributions"
          onClick={() => setActiveAdminTab('contributions')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeAdminTab === 'contributions'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>All Contributions ({contributions.length})</span>
        </button>

        <button
          id="admin-tab-expenses"
          onClick={() => setActiveAdminTab('expenses')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeAdminTab === 'expenses'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wallet className="w-3.5 h-3.5" />
          <span>Expense Vouchers ({expenses.length})</span>
        </button>

        <button
          id="admin-tab-committee"
          onClick={() => setActiveAdminTab('committee')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeAdminTab === 'committee'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Committee Roster ({committeeMembers.length})</span>
        </button>

        <button
          id="admin-tab-settings"
          onClick={() => setActiveAdminTab('settings')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeAdminTab === 'settings'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Portal & Payment Settings</span>
        </button>

        <button
          id="admin-tab-reports"
          onClick={() => setActiveAdminTab('reports')}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 ${
            activeAdminTab === 'reports'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Reports & Audit Export</span>
        </button>
      </div>

      {/* Tab 1: Pending Verification Queue */}
      {activeAdminTab === 'verification' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Pending Contributions Queue ({pendingList.length})
              </h2>
              <p className="text-xs text-slate-500">
                Cross-check the donor's 12-digit UPI UTR or bank reference with your trust bank
                statement.
              </p>
            </div>
            {pendingList.length > 0 && (
              <span className="text-xs font-mono font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                Total Pending: {formatCurrency(totalPendingAmount)}
              </span>
            )}
          </div>

          {pendingList.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
              <h4 className="text-base font-bold text-slate-800">All Payments Verified!</h4>
              <p className="text-xs text-slate-400 mt-1">
                There are no pending member contributions awaiting review right now.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Receipt #</th>
                    <th className="py-3 px-3">Donor Name</th>
                    <th className="py-3 px-3">Mobile & Location</th>
                    <th className="py-3 px-3">Amount</th>
                    <th className="py-3 px-3">Method & UTR</th>
                    <th className="py-3 px-3">Screenshot</th>
                    <th className="py-3 px-3">Date</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingList.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/40 transition">
                      <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                        {item.receiptNumber}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        {item.memberName}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div>+91 {item.mobile}</div>
                        <div className="text-[11px] text-slate-400">{item.gotraOrVillage || '—'}</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-black text-blue-950 text-sm whitespace-nowrap">
                        {formatCurrency(item.amount)}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-semibold text-slate-700">{item.paymentMethod}</span>
                        <div className="font-mono text-[11px] text-blue-700 font-semibold mt-0.5">
                          {item.utrOrRefNumber}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {item.receiptScreenshot ? (
                          <a
                            href={item.receiptScreenshot}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline text-[11px] font-semibold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Proof
                          </a>
                        ) : (
                          <span className="text-slate-400 text-[11px]">No image</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                        {formatDate(item.date)}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap space-x-1.5">
                        <button
                          onClick={() => handleVerify(item.id)}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold inline-flex items-center gap-1 shadow-2xs"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => setRejectReasonModalId(item.id)}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-red-50 text-red-600 border border-slate-200 rounded-lg text-xs font-bold inline-flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Contributions Management */}
      {activeAdminTab === 'contributions' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                All Contributions Database ({contributions.length})
              </h2>
              <p className="text-xs text-slate-500">
                View, modify, generate receipts, or delete records.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleExportAll}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                CSV
              </button>
              <button
                onClick={() => setShowAddContributionModal(true)}
                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Record
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Receipt</th>
                  <th className="py-3 px-3">Donor</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 text-center">Status</th>
                  <th className="py-3 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {contributions.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono font-medium text-slate-600 whitespace-nowrap">
                      {c.receiptNumber}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="font-bold text-slate-900 block">{c.memberName}</span>
                      <span className="text-[11px] text-slate-400">+91 {c.mobile}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {c.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-blue-900 whitespace-nowrap">
                      {formatCurrency(c.amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(c.date)}
                    </td>
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {c.status === 'verified' ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          Verified
                        </span>
                      ) : c.status === 'pending' ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-bold">
                          Pending
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-bold">
                          Rejected
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => setSelectedReceipt(c)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="View Official Receipt"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete record for ${c.memberName}?`)) {
                            deleteContribution(c.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Expense Vouchers */}
      {activeAdminTab === 'expenses' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Community Expenses & Disbursements ({expenses.length})
              </h2>
              <p className="text-xs text-slate-500">
                Log and manage funds spent for scholarships, hall maintenance, and aid.
              </p>
            </div>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Expense
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">Voucher #</th>
                  <th className="py-3 px-3">Title & Beneficiary</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Approved By</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expenses.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-3 font-mono font-bold text-blue-900 whitespace-nowrap">
                      {e.voucherNumber}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900 block">{e.title}</span>
                      <span className="text-[11px] text-slate-500">To: {e.beneficiaryOrVendor}</span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 text-[11px] font-semibold">
                        {e.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {formatCurrency(e.amount)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {formatDate(e.date)}
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap">
                      {e.approvedBy}
                    </td>
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete expense voucher ${e.voucherNumber}?`)) {
                            deleteExpense(e.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded"
                        title="Delete expense"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Committee Roster Management */}
      {activeAdminTab === 'committee' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Committee Directory & Signatories ({committeeMembers.length})
              </h2>
              <p className="text-xs text-slate-500">
                Manage designated office bearers shown in public directory and receipts.
              </p>
            </div>
            <button
              onClick={() => setShowAddMemberModal(true)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Committee Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {committeeMembers.map((m) => (
              <div
                key={m.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={m.avatarUrl}
                    alt={m.name}
                    className="w-12 h-12 rounded-xl object-cover border border-slate-300"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{m.name}</h4>
                    <p className="text-[11px] text-blue-700 font-semibold">{m.role}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">{m.phone}</p>
                    <p className="text-[10px] text-slate-400">{m.villageOrLocation}</p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm(`Remove ${m.name} from committee?`)) {
                      deleteCommitteeMember(m.id);
                    }
                  }}
                  className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50"
                  title="Remove Member"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Portal & Payment Settings */}
      {activeAdminTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Portal Configuration & Bank Details
              </h2>
              <p className="text-xs text-slate-500">
                Keep community name, target, UPI ID, and bank account configurable as requested.
              </p>
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save Configuration</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Community Name</label>
              <input
                type="text"
                value={editableSettings.communityName}
                onChange={(e) =>
                  setEditableSettings((prev) => ({ ...prev, communityName: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mission Tagline</label>
              <input
                type="text"
                value={editableSettings.tagline}
                onChange={(e) =>
                  setEditableSettings((prev) => ({ ...prev, tagline: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Collection Target Amount (₹)
              </label>
              <input
                type="number"
                value={editableSettings.targetAmount}
                onChange={(e) =>
                  setEditableSettings((prev) => ({
                    ...prev,
                    targetAmount: parseInt(e.target.value, 10) || 0,
                  }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Deadline & Fiscal Year
              </label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Fiscal Year (e.g. 2026-2027)"
                  value={editableSettings.fiscalYear}
                  onChange={(e) =>
                    setEditableSettings((prev) => ({ ...prev, fiscalYear: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
                <input
                  type="text"
                  placeholder="Deadline (e.g. 31 March 2027)"
                  value={editableSettings.targetDeadline}
                  onChange={(e) =>
                    setEditableSettings((prev) => ({ ...prev, targetDeadline: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Official UPI ID</label>
              <input
                type="text"
                value={editableSettings.upiId}
                onChange={(e) =>
                  setEditableSettings((prev) => ({ ...prev, upiId: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">UPI Payee Name</label>
              <input
                type="text"
                value={editableSettings.upiPayeeName}
                onChange={(e) =>
                  setEditableSettings((prev) => ({ ...prev, upiPayeeName: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
              <input
                type="text"
                value={editableSettings.bankName}
                onChange={(e) =>
                  setEditableSettings((prev) => ({ ...prev, bankName: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Account Number</label>
              <input
                type="text"
                value={editableSettings.bankAccountNo}
                onChange={(e) =>
                  setEditableSettings((prev) => ({ ...prev, bankAccountNo: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
              <input
                type="text"
                value={editableSettings.bankIfsc}
                onChange={(e) =>
                  setEditableSettings((prev) => ({ ...prev, bankIfsc: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Bank Branch</label>
              <input
                type="text"
                value={editableSettings.bankBranch}
                onChange={(e) =>
                  setEditableSettings((prev) => ({ ...prev, bankBranch: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Announcement / Notice Header
              </label>
              <textarea
                rows={2}
                value={editableSettings.welcomeNotice}
                onChange={(e) =>
                  setEditableSettings((prev) => ({ ...prev, welcomeNotice: e.target.value }))
                }
                className="w-full px-3 py-2 border border-slate-300 rounded-xl"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                if (window.confirm('Reset all databases and settings back to initial sample records?')) {
                  resetToDefaults();
                  setEditableSettings(settings);
                }
              }}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-semibold"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset to Sample Data
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Save Configuration
            </button>
          </div>
        </form>
      )}

      {/* Tab 6: Reports & Audit Export */}
      {activeAdminTab === 'reports' && (
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Executive Financial Reports & Audit Export
            </h2>
            <p className="text-xs text-slate-500">
              Download standard audit statements for committee records and general body meetings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Contributions Ledger
              </h4>
              <p className="text-[11px] text-slate-500">
                Complete list of all {contributions.length} member transactions with UTR numbers and
                verification stamps.
              </p>
              <button
                onClick={handleExportAll}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 text-blue-700 text-xs font-bold rounded-lg inline-flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Expense Vouchers Ledger
              </h4>
              <p className="text-[11px] text-slate-500">
                Itemized register of all {expenses.length} sanctioned disbursements with beneficiary
                details.
              </p>
              <button
                onClick={() => {
                  const rows = expenses.map((e) => ({
                    Voucher: e.voucherNumber,
                    Date: e.date,
                    Title: e.title,
                    Category: e.category,
                    Amount: e.amount,
                    Beneficiary: e.beneficiaryOrVendor,
                    ApprovedBy: e.approvedBy,
                  }));
                  downloadCSV('Chamar_Clan_Expense_Ledger.csv', rows);
                }}
                className="w-full py-2 bg-white hover:bg-slate-100 border border-slate-300 text-blue-700 text-xs font-bold rounded-lg inline-flex items-center justify-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                Download CSV
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Print Financial Summary
              </h4>
              <p className="text-[11px] text-slate-500">
                Print or export browser PDF of current balance sheet: Total Collected (
                {formatCurrency(totalCollected)}) vs Expenses ({formatCurrency(totalExpenses)}).
              </p>
              <button
                onClick={() => window.print()}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg inline-flex items-center justify-center gap-1 shadow-2xs"
              >
                <FileText className="w-3.5 h-3.5" />
                Print Balance Sheet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add Offline / Cash Contribution */}
      {showAddContributionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-blue-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Record Offline / Direct Contribution
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Add contributions received in cash or cheque during community meetings.
            </p>

            <form onSubmit={handleAddContributionSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Member Name *</label>
                <input
                  type="text"
                  required
                  placeholder="Full name"
                  value={newContrib.memberName}
                  onChange={(e) => setNewContrib({ ...newContrib, memberName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit mobile"
                    value={newContrib.mobile}
                    onChange={(e) =>
                      setNewContrib({ ...newContrib, mobile: e.target.value.replace(/\D/g, '') })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Clan / Village</label>
                  <input
                    type="text"
                    placeholder="e.g. Kardam / Meerut"
                    value={newContrib.gotraOrVillage}
                    onChange={(e) =>
                      setNewContrib({ ...newContrib, gotraOrVillage: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={10}
                    value={newContrib.amount}
                    onChange={(e) =>
                      setNewContrib({
                        ...newContrib,
                        amount: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={newContrib.paymentMethod}
                    onChange={(e) =>
                      setNewContrib({ ...newContrib, paymentMethod: e.target.value as any })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Cash / Cheque">Cash / Cheque</option>
                    <option value="UPI">UPI</option>
                    <option value="Net Banking">Net Banking</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Category / Purpose</label>
                <select
                  value={newContrib.category}
                  onChange={(e) =>
                    setNewContrib({ ...newContrib, category: e.target.value as any })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                >
                  <option value="General Welfare Fund">General Welfare Fund</option>
                  <option value="Education & Scholarships">Education & Scholarships</option>
                  <option value="Medical Emergency Relief">Medical Emergency Relief</option>
                  <option value="Community Center Development">Community Center Development</option>
                  <option value="Youth Career & Coaching">Youth Career & Coaching</option>
                  <option value="Annual Sammelan & Cultural">Annual Sammelan & Cultural</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reference / Note</label>
                <input
                  type="text"
                  placeholder="Receipt book serial / meeting note"
                  value={newContrib.notes}
                  onChange={(e) => setNewContrib({ ...newContrib, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddContributionModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Save & Verify Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Expense Voucher */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-blue-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">Create New Expense Voucher</h3>
            <p className="text-xs text-slate-500 mb-4">
              Itemize disbursements for student aid, medical grants, or community maintenance.
            </p>

            <form onSubmit={handleAddExpenseSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Scholarship disbarsal for 5 medical students"
                  value={newExp.title}
                  onChange={(e) => setNewExp({ ...newExp, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newExp.category}
                    onChange={(e) => setNewExp({ ...newExp, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="Education Aid">Education Aid</option>
                    <option value="Medical Assistance">Medical Assistance</option>
                    <option value="Community Hall Maintenance">Community Hall Maintenance</option>
                    <option value="Youth Skill Training">Youth Skill Training</option>
                    <option value="Annual Sammelan & Events">Annual Sammelan & Events</option>
                    <option value="Legal & Administrative Aid">Legal & Administrative Aid</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newExp.amount}
                    onChange={(e) =>
                      setNewExp({ ...newExp, amount: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Beneficiary / Vendor *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Recipient name or vendor"
                    value={newExp.beneficiaryOrVendor}
                    onChange={(e) =>
                      setNewExp({ ...newExp, beneficiaryOrVendor: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newExp.date}
                    onChange={(e) => setNewExp({ ...newExp, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Authorizing Resolution / Approved By
                </label>
                <input
                  type="text"
                  value={newExp.approvedBy}
                  onChange={(e) => setNewExp({ ...newExp, approvedBy: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Description / Details</label>
                <textarea
                  rows={2}
                  placeholder="Detailed purpose of the expenditure..."
                  value={newExp.description}
                  onChange={(e) => setNewExp({ ...newExp, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Issue Expense Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add Committee Member */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-blue-100">
            <h3 className="text-base font-bold text-slate-900 mb-1">Add Committee Member</h3>
            <p className="text-xs text-slate-500 mb-4">
              Add an elected officer or executive member to the public roster.
            </p>

            <form onSubmit={handleAddMemberSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Adv. Ratan Lal"
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Designation / Role</label>
                  <select
                    value={newMember.role}
                    onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl bg-white"
                  >
                    <option value="President">President</option>
                    <option value="Vice President">Vice President</option>
                    <option value="General Secretary">General Secretary</option>
                    <option value="Treasurer">Treasurer</option>
                    <option value="Auditor / Comptroller">Auditor / Comptroller</option>
                    <option value="Youth Coordinator">Youth Coordinator</option>
                    <option value="Welfare Secretary">Welfare Secretary</option>
                    <option value="Executive Member">Executive Member</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                  <input
                    type="text"
                    required
                    placeholder="+91 98..."
                    value={newMember.phone}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="email@address.com"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Location / Village</label>
                  <input
                    type="text"
                    placeholder="City or Village"
                    value={newMember.villageOrLocation}
                    onChange={(e) =>
                      setNewMember({ ...newMember, villageOrLocation: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold"
                >
                  Add Member
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reject Reason */}
      {rejectReasonModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-red-100">
            <div className="flex items-center gap-2 text-red-600 mb-2">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-bold text-slate-900">Reject Contribution</h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              Please enter the reason for rejecting this contribution. It will be logged in records.
            </p>

            <div className="space-y-3">
              <textarea
                rows={3}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="w-full p-3 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRejectReasonModalId(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-3 py-1.5 text-xs bg-red-600 text-white font-bold rounded-lg hover:bg-red-700"
                >
                  Confirm Rejection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
