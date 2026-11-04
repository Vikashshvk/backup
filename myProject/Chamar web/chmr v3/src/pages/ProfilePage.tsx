import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Contribution } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { ContributionCard } from '../components/ContributionCard';
import { Button } from '../components/Button';
import {
  User,
  Smartphone,
  Mail,
  Shield,
  Coins,
  History,
  PlusCircle,
  LogOut,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const [myContributions, setMyContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setIsLoading(true);
    // Fetch all contributions matching user mobile or name or userId
    api
      .getContributions({ search: user.mobile })
      .then((res) => {
        setMyContributions(res.contributions);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-md mx-auto my-16 text-center">
        <h2 className="text-xl font-bold">Please log in to view your profile</h2>
        <Link to="/login" className="mt-4 inline-block">
          <Button variant="primary">Go to Login</Button>
        </Link>
      </div>
    );
  }

  const totalMyContributed = myContributions
    .filter((c) => c.status === 'Verified')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Profile Overview Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-blue-100 text-blue-800 border border-blue-200">
                {user.role}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
              <span className="flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                {user.mobile}
              </span>
              {user.email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5" />
                  {user.email}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                Member since {formatDate(user.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-stretch md:self-auto">
          <Link to="/contribute" className="flex-1 md:flex-none">
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              className="w-full"
            >
              New Contribution
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="md"
            onClick={logout}
            leftIcon={<LogOut className="w-4 h-4" />}
            className="text-rose-600 hover:bg-rose-50"
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Summary metrics for this user */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-blue-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Contributed (Verified)
          </span>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {formatINR(totalMyContributed)}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Submissions
          </span>
          <div className="text-2xl font-bold text-slate-900 mt-1">
            {myContributions.length} Records
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-emerald-100 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Community Status
          </span>
          <div className="text-sm font-bold text-emerald-700 mt-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Active Clan Contributor
          </div>
        </div>
      </div>

      {/* Personal Contribution History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">My Contribution Ledger</h2>
            <p className="text-xs text-slate-500">
              List of all contributions registered with mobile {user.mobile}
            </p>
          </div>
          <Link to="/contributions" className="text-xs font-semibold text-blue-600 hover:text-blue-800">
            View Public Ledger &rarr;
          </Link>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-sm text-slate-500 border border-slate-200">
            Loading your receipts...
          </div>
        ) : myContributions.length === 0 ? (
          <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
            <Coins className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">No contributions found under your mobile.</p>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Make your first contribution to receive an official digital receipt.
            </p>
            <Link to="/contribute">
              <Button variant="primary" size="sm">
                Contribute Now
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myContributions.map((c) => (
              <ContributionCard key={c._id} contribution={c} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
