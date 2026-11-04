import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Button } from '../components/Button';
import { Lock, Smartphone, ShieldCheck, UserCheck, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      showError('Please enter your mobile/email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login(identifier.trim(), password);
      showSuccess(`Welcome back, ${user.name}!`);

      if (user.role === 'admin' || user.role === 'committee') {
        navigate('/admin');
      } else {
        navigate(from === '/login' ? '/profile' : from);
      }
    } catch (err: any) {
      showError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoLogin = async (id: string, pass: string) => {
    setIdentifier(id);
    setPassword(pass);
    setIsSubmitting(true);
    try {
      const user = await login(id, pass);
      showSuccess(`Logged in as ${user.name} (${user.role})`);
      if (user.role === 'admin' || user.role === 'committee') {
        navigate('/admin');
      } else {
        navigate('/profile');
      }
    } catch (err: any) {
      showError(err.message || 'Demo login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-10 sm:py-16 space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Sign In to Community Fund</h1>
          <p className="text-xs text-slate-500 mt-1">
            Access your contribution history or manage committee ledger
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Mobile Number or Email
            </label>
            <div className="relative">
              <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. 9876543210 or admin@chamarclan.org"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isSubmitting}
            className="w-full mt-2"
          >
            Sign In &rarr;
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            New community member?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:text-blue-800">
              Register here
            </Link>
          </p>
        </div>
      </div>

      {/* 1-Click Demo Accounts for Easy Testing */}
      <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Quick Demo Access (1-Click Login)</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Click any persona below to quickly test committee verification, admin privileges, or contributor features:
        </p>

        <div className="grid grid-cols-1 gap-2 pt-1">
          {/* Committee Treasurer */}
          <button
            type="button"
            onClick={() => handleDemoLogin('committee@chamarclan.org', 'committee123')}
            className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all flex items-center justify-between cursor-pointer text-xs"
          >
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                <span>Sunita Gautam (Treasurer / Committee)</span>
              </div>
              <span className="text-[10px] text-slate-500">Verify contributions, add & manage expenses</span>
            </div>
            <span className="text-indigo-600 font-bold text-[11px]">Log in &rarr;</span>
          </button>

          {/* Admin President */}
          <button
            type="button"
            onClick={() => handleDemoLogin('admin@chamarclan.org', 'admin123')}
            className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all flex items-center justify-between cursor-pointer text-xs"
          >
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Dr. Ramji Ratnakar (President / Admin)</span>
              </div>
              <span className="text-[10px] text-slate-500">Full control, fund settings, target updates</span>
            </div>
            <span className="text-blue-600 font-bold text-[11px]">Log in &rarr;</span>
          </button>

          {/* Regular Contributor */}
          <button
            type="button"
            onClick={() => handleDemoLogin('rahul@chamarclan.org', 'member123')}
            className="w-full text-left p-2.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 transition-all flex items-center justify-between cursor-pointer text-xs"
          >
            <div>
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Rahul Kumar (Community Member)</span>
              </div>
              <span className="text-[10px] text-slate-500">Track personal receipts & history</span>
            </div>
            <span className="text-emerald-600 font-bold text-[11px]">Log in &rarr;</span>
          </button>
        </div>
      </div>
    </div>
  );
};
