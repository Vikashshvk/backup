import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { DashboardStats, Contribution, Expense, CommunitySettings } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { StatsCard } from '../components/StatsCard';
import { ProgressBar } from '../components/ProgressBar';
import { ContributionCard } from '../components/ContributionCard';
import { ExpenseCard } from '../components/ExpenseCard';
import { Button } from '../components/Button';
import {
  Coins,
  Users,
  Target,
  PieChart,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Heart,
  QrCode,
  FileCheck,
  Building,
  GraduationCap,
  Sparkles,
  RefreshCw,
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentContributions, setRecentContributions] = useState<Contribution[]>([]);
  const [recentExpenses, setRecentExpenses] = useState<Expense[]>([]);
  const [settings, setSettings] = useState<CommunitySettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getDashboardStats();
      setStats(data.stats);
      setRecentContributions(data.recentContributions);
      setRecentExpenses(data.recentExpenses);
      setSettings(data.settings);
    } catch (err: any) {
      setError(err.message || 'Failed to load community statistics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-12 md:space-y-16 pb-12">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-blue-50/70 via-white to-slate-50 border-b border-blue-100/60 pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800 text-xs font-semibold shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Official Chamar Clan Community Platform</span>
              </div>

              <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
                Chamar Clan <br className="hidden sm:inline" />
                <span className="text-blue-600">Community Fund</span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 font-medium max-w-xl mx-auto lg:mx-0">
                &ldquo;Together we contribute, together we grow.&rdquo;
              </p>

              <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                A dedicated, non-profit mutual benefit fund established to support youth education,
                emergency medical aid, social welfare, and community hall infrastructure. Transparent,
                audited, and accessible to every family member.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link to="/contribute" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="primary"
                    rightIcon={<ArrowRight className="w-4 h-4" />}
                    className="w-full shadow-md"
                  >
                    Contribute Now
                  </Button>
                </Link>
                <Link to="/transparency" className="w-full sm:w-auto">
                  <Button size="lg" variant="outline" className="w-full">
                    View Fund Details
                  </Button>
                </Link>
              </div>

              {/* Trust markers */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-5 text-xs text-slate-600 font-medium">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Verified Public Ledger</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>Committee Supervised</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>100% Direct Welfare</span>
                </div>
              </div>
            </div>

            {/* Right Visual / Illustration */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-md">
                {/* Visual Card */}
                <div className="bg-white rounded-3xl p-6 md:p-8 border border-blue-100 shadow-xl relative z-10">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Heart className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">Community Treasury</h3>
                        <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Status: Active & Audited
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-mono bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md font-semibold">
                      UPI: chamarclan@upi
                    </span>
                  </div>

                  {/* Visual Pillars */}
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50/70 border border-blue-100">
                      <div className="w-9 h-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900">Youth Education & Books</h4>
                        <p className="text-[11px] text-slate-500">Scholarships & competitive exams aid</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
                      <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900">Emergency Medical Fund</h4>
                        <p className="text-[11px] text-slate-500">Urgent relief for families in distress</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 p-3 rounded-xl bg-indigo-50/70 border border-indigo-100">
                      <div className="w-9 h-9 rounded-lg bg-indigo-600 text-white flex items-center justify-center shrink-0">
                        <Building className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xs font-bold text-slate-900">Community Hall & Events</h4>
                        <p className="text-[11px] text-slate-500">Infrastructure and annual gatherings</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 text-center">
                    <Link
                      to="/contribute"
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-center gap-1"
                    >
                      <span>Join 100+ fellow clan contributors</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Decorative glow / backdrop */}
                <div className="absolute -top-4 -right-4 w-72 h-72 bg-blue-200/50 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-4 -left-4 w-60 h-60 bg-indigo-200/50 rounded-full blur-3xl -z-10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Fund Overview Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              Real-time Ledger
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-2">Fund Overview</h2>
            <p className="text-sm text-slate-500 mt-1">
              Complete financial snapshot verified by the committee executive council.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-blue-600 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
            <span>Refresh Stats</span>
          </button>
        </div>

        {error ? (
          <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-rose-900 text-sm">
            <p className="font-semibold">Unable to load fund overview</p>
            <p className="mt-1">{error}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 4 Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              <StatsCard
                title="Total Fund Collected"
                value={formatINR(stats?.totalCollected || 75000)}
                subtitle="Verified contributions in treasury"
                icon={<Coins className="w-6 h-6" />}
                variant="blue"
                trend="Verified"
              />

              <StatsCard
                title="Total Contributors"
                value={String(stats?.contributorCount || 9)}
                subtitle="Community members participated"
                icon={<Users className="w-6 h-6" />}
                variant="navy"
                badge="United"
              />

              <StatsCard
                title="Collection Target"
                value={formatINR(stats?.targetAmount || 100000)}
                subtitle="Current milestone objective"
                icon={<Target className="w-6 h-6" />}
                variant="amber"
              />

              <StatsCard
                title="Remaining Amount"
                value={formatINR(stats?.remainingToTarget || 25000)}
                subtitle="To reach current collection goal"
                icon={<PieChart className="w-6 h-6" />}
                variant="emerald"
              />
            </div>

            {/* Collection Progress Bar */}
            <ProgressBar
              collected={stats?.totalCollected || 75000}
              target={stats?.targetAmount || 100000}
              percentage={stats?.percentageCompleted || 75}
            />
          </div>
        )}
      </section>

      {/* 3. How It Works: 3 Simple Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-6 sm:p-10 text-white relative overflow-hidden">
          <div className="max-w-xl mb-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-900/60 px-2.5 py-1 rounded-md">
              Easy 3-Step Process
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-3 text-white">
              How Community Contribution Works
            </h2>
            <p className="text-sm text-slate-300 mt-2">
              Contributing takes less than two minutes. No complicated banking credentials required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            {/* Step 1 */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                  1
                </div>
                <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-blue-400" />
                  Scan QR or Copy UPI ID
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Open Google Pay, PhonePe, Paytm, or BHIM. Scan the official community QR code or enter UPI ID{' '}
                  <span className="font-mono text-blue-300 font-semibold">chamarclan@upi</span>.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                  2
                </div>
                <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2">
                  <FileCheck className="w-4 h-4 text-indigo-400" />
                  Submit Reference ID
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Fill the short contribution form with your name, phone number, and the 12-digit UPI UTR
                  or bank transaction reference.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-5 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm mb-4">
                  3
                </div>
                <h3 className="font-bold text-base text-white mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Instant Ledger Receipt
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Get your official digital receipt immediately. The committee verifies bank settlement
                  and the amount reflects on the public ledger.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              Need assistance? Call committee helpline: +91 98765 43210
            </span>
            <Link to="/contribute">
              <Button variant="primary" size="md" className="w-full sm:w-auto">
                Start Contribution Now &rarr;
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Recent Verified Contributions & Recent Expenses */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Contributions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Contributions</h3>
                <p className="text-xs text-slate-500">Latest verified community support</p>
              </div>
              <Link
                to="/contributions"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentContributions.length > 0 ? (
                recentContributions.slice(0, 4).map((item) => (
                  <ContributionCard key={item._id} contribution={item} />
                ))
              ) : (
                <div className="bg-white rounded-xl p-6 text-center border border-slate-200 text-sm text-slate-500">
                  No verified contributions yet.
                </div>
              )}
            </div>
          </div>

          {/* Recent Expenses */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Recent Fund Expenses</h3>
                <p className="text-xs text-slate-500">Transparent community expenditure</p>
              </div>
              <Link
                to="/transparency"
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>Full Ledger</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentExpenses.length > 0 ? (
                recentExpenses.slice(0, 3).map((item) => (
                  <ExpenseCard key={item._id} expense={item} />
                ))
              ) : (
                <div className="bg-white rounded-xl p-6 text-center border border-slate-200 text-sm text-slate-500">
                  No expenses recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Bottom Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-8 md:p-12 text-white shadow-xl text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-4 backdrop-blur-xs">
            <Coins className="w-8 h-8" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold max-w-xl">
            Every Contribution Strengthens Our Clan Community
          </h2>
          <p className="text-sm sm:text-base text-blue-100 max-w-lg mt-3 leading-relaxed">
            Whether ₹500 or ₹11,000, your collective effort empowers education, aids elders in need,
            and builds a resilient future for our youth.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/contribute">
              <Button size="lg" variant="secondary" className="bg-white text-blue-900 hover:bg-blue-50 font-bold">
                Contribute Now
              </Button>
            </Link>
            <Link to="/transparency">
              <Button size="lg" variant="ghost" className="text-white hover:bg-white/10">
                View Transparency Report
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
