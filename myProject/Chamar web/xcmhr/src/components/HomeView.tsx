import React from 'react';
import { useCommunity } from '../context/CommunityContext';
import { formatCurrency, formatDate } from '../utils/formatters';
import {
  Shield,
  HeartHandshake,
  Users,
  Award,
  Wallet,
  ArrowRight,
  CheckCircle2,
  BookOpen,
  Building,
  Activity,
  QrCode,
  FileText,
  Clock,
  ChevronRight,
  Eye,
  TrendingUp,
} from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ setActiveTab }) => {
  const {
    settings,
    totalCollected,
    totalContributors,
    committeeMembers,
    totalExpenses,
    remainingBalance,
    targetProgress,
    contributions,
    setSelectedReceipt,
  } = useCommunity();

  const recentContributions = contributions.slice(0, 6);

  return (
    <div className="space-y-10 pb-12">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white shadow-xl">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-400/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative max-w-5xl mx-auto px-6 py-12 sm:py-16 text-center">
          {/* Emblem & Clan Seal */}
          <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-6">
            <Shield className="w-4 h-4 text-blue-300" />
            <span>Official Community Fund Management Portal</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight text-white max-w-4xl mx-auto">
            {settings.communityName}
          </h1>

          <p className="text-base sm:text-xl text-blue-100/90 font-light mt-4 max-w-2xl mx-auto leading-relaxed">
            {settings.tagline}
          </p>

          <p className="text-xs sm:text-sm text-blue-200/75 mt-3 max-w-xl mx-auto leading-relaxed">
            Uniting our clan to build a self-reliant future. Every contribution directly funds student
            scholarships, emergency healthcare relief, and community welfare projects with 100% public
            transparency.
          </p>

          {/* Prominent Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <button
              id="hero-contribute-btn"
              onClick={() => setActiveTab('contribute')}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-white text-blue-900 hover:bg-blue-50 font-bold text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5 cursor-pointer"
            >
              <HeartHandshake className="w-5 h-5 text-blue-600" />
              <span>Contribute Now</span>
            </button>

            <button
              id="hero-view-contributions-btn"
              onClick={() => setActiveTab('contributions')}
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-blue-700/80 hover:bg-blue-700 text-white border border-blue-400/40 font-semibold text-sm sm:text-base rounded-2xl backdrop-blur-sm transition-all duration-200 hover:shadow-md cursor-pointer"
            >
              <Eye className="w-5 h-5 text-blue-200" />
              <span>View Contributions</span>
            </button>
          </div>

          {/* Quick Stats Trust Pill */}
          <div className="mt-10 pt-8 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <span className="block text-xl sm:text-2xl font-black text-white font-mono">
                {formatCurrency(totalCollected)}
              </span>
              <span className="text-[11px] text-blue-200 uppercase tracking-wider font-medium">
                Total Fund Raised
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-white font-mono">
                {totalContributors}
              </span>
              <span className="text-[11px] text-blue-200 uppercase tracking-wider font-medium">
                Active Contributors
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-white font-mono">
                {committeeMembers.length}
              </span>
              <span className="text-[11px] text-blue-200 uppercase tracking-wider font-medium">
                Committee Members
              </span>
            </div>
            <div>
              <span className="block text-xl sm:text-2xl font-black text-white font-mono">
                100%
              </span>
              <span className="text-[11px] text-blue-200 uppercase tracking-wider font-medium">
                Public Transparency
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Target Progress Card */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Annual Collection Target ({settings.fiscalYear})
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Community target set by executive resolution for community hall expansion and coaching
              grants. Target Date: <span className="font-semibold text-slate-700">{settings.targetDeadline}</span>
            </p>
          </div>
          <div className="flex items-baseline gap-2 bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 shrink-0">
            <span className="text-2xl font-black text-blue-900 font-mono">
              {targetProgress}%
            </span>
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">
              Achieved
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-6 space-y-2">
          <div className="w-full bg-slate-100 rounded-full h-4 overflow-hidden p-0.5 border border-slate-200">
            <div
              className="bg-gradient-to-r from-blue-600 to-blue-500 h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${Math.max(5, targetProgress)}%` }}
            ></div>
          </div>

          <div className="flex justify-between items-center text-xs font-medium text-slate-600 pt-1">
            <span>
              Collected: <strong className="text-blue-900 font-mono">{formatCurrency(totalCollected)}</strong>
            </span>
            <span>
              Target: <strong className="text-slate-900 font-mono">{formatCurrency(settings.targetAmount)}</strong>
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 block text-[11px]">Total Money Collected</span>
            <span className="text-base font-bold text-blue-900 font-mono">
              {formatCurrency(totalCollected)}
            </span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl">
            <span className="text-slate-500 block text-[11px]">Total Funds Utilized</span>
            <span className="text-base font-bold text-slate-800 font-mono">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <span className="text-emerald-700 block text-[11px] font-semibold">
              Current Available Balance
            </span>
            <span className="text-base font-bold text-emerald-800 font-mono">
              {formatCurrency(remainingBalance)}
            </span>
          </div>
        </div>
      </section>

      {/* Main Highlights Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Recent Contributions */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-slate-900">Recent Contributions</h3>
              <p className="text-xs text-slate-500">Live feed of verified community donors</p>
            </div>
            <button
              onClick={() => setActiveTab('contributions')}
              className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {recentContributions.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/70 hover:bg-blue-50/50 border border-slate-100 transition duration-150"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-sm shrink-0">
                    {c.memberName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">{c.memberName}</span>
                      {c.status === 'verified' ? (
                        <span className="inline-flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                          Verified
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2 mt-0.5">
                      <span>{c.gotraOrVillage || 'Community Member'}</span>
                      <span>•</span>
                      <span>{formatDate(c.date)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <span className="block text-sm font-bold text-blue-900 font-mono">
                      {formatCurrency(c.amount)}
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase">{c.category.split(' ')[0]}</span>
                  </div>
                  <button
                    onClick={() => setSelectedReceipt(c)}
                    className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg border border-transparent hover:border-slate-200 transition"
                    title="View Receipt"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Receipts can be verified online anytime with the receipt number.
            </span>
            <button
              onClick={() => setActiveTab('contribute')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 hover:underline"
            >
              Add Your Contribution →
            </button>
          </div>
        </div>

        {/* Right Col: Instant UPI Scan & Bank Transfer Card */}
        <div className="bg-gradient-to-b from-blue-50 to-white rounded-2xl p-6 shadow-sm border border-blue-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-blue-900 uppercase tracking-wider">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>Instant UPI Payment</span>
              </div>
              <span className="text-[10px] bg-blue-200/60 text-blue-900 font-semibold px-2 py-0.5 rounded-full">
                Zero Fees
              </span>
            </div>

            <p className="text-xs text-slate-600 mb-4">
              Scan with Google Pay, PhonePe, Paytm or BHIM to contribute directly to the official
              trust account.
            </p>

            {/* Visual QR Code Placeholder with Real UPI Intent Display */}
            <div className="bg-white p-4 rounded-2xl border-2 border-dashed border-blue-300 flex flex-col items-center justify-center shadow-xs">
              <div className="w-44 h-44 bg-slate-900 text-white rounded-xl p-2 relative flex flex-col items-center justify-center">
                {/* Simulated crisp QR pattern */}
                <div className="w-full h-full border-2 border-white/20 rounded p-2 grid grid-cols-6 grid-rows-6 gap-1.5 opacity-90">
                  <div className="col-span-2 row-span-2 bg-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-900"></div>
                  </div>
                  <div className="col-span-2 bg-blue-400 rounded-sm"></div>
                  <div className="col-span-2 row-span-2 bg-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-900"></div>
                  </div>
                  <div className="col-span-2 bg-white rounded-sm"></div>
                  <div className="col-span-2 row-span-2 bg-white rounded-sm flex items-center justify-center">
                    <div className="w-3 h-3 bg-slate-900"></div>
                  </div>
                  <div className="col-span-2 bg-blue-300 rounded-sm"></div>
                  <div className="col-span-2 bg-white rounded-sm"></div>
                  <div className="col-span-2 bg-blue-400 rounded-sm"></div>
                  <div className="col-span-2 bg-white rounded-sm"></div>
                </div>
                {/* Center Badge */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-10 h-10 rounded-full bg-blue-600 border-2 border-white flex items-center justify-center shadow-lg">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>

              <span className="text-[11px] font-mono font-bold text-slate-800 mt-3">
                {settings.upiId}
              </span>
              <span className="text-[10px] text-slate-500">
                {settings.upiPayeeName}
              </span>
            </div>
          </div>

          <div className="mt-6 space-y-2">
            <button
              onClick={() => setActiveTab('contribute')}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
            >
              Open Full Payment Page & Form
            </button>
            <p className="text-[11px] text-center text-slate-500">
              Submit your transaction UTR after paying to generate your instant digital receipt.
            </p>
          </div>
        </div>
      </section>

      {/* Community Welfare Pillars */}
      <section className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-slate-200">
        <div className="text-center max-w-2xl mx-auto mb-8">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
            Where Does Your Money Go?
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-2">
            Direct Impact on Our Clan Community
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Every contribution is governed by democratic bylaws and allocated directly to our core
            welfare initiatives.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Student Scholarships</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Financial support for clan boys and girls preparing for competitive exams, IIT, NEET,
              and UPSC coaching.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-3">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Emergency Medical Aid</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Rapid relief grants for clan families experiencing critical illnesses, surgeries, or
              hospital emergencies.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-blue-800 text-white flex items-center justify-center mb-3">
              <Building className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Community Bhawan</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Expansion of the community library, study center rooms, marriage hall facilities, and
              guest rooms.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 transition">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3">
              <Users className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">Annual Sammelan</h4>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Organizing youth felicitation events, legal awareness camps, and social unity
              conferences.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0" />
            <span className="text-xs text-slate-600">
              Dual-signatory bank account maintained under official registered society rules.
            </span>
          </div>
          <button
            onClick={() => setActiveTab('transparency')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1"
          >
            <span>Review Full Expense Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
