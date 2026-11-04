import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import { X, Shield, User, Lock, KeyRound, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'member' | 'admin';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'member',
}) => {
  const { loginAsMember, loginAsAdmin } = useCommunity();
  const [mode, setMode] = useState<'member' | 'admin'>(initialMode);

  // Member form state
  const [memberName, setMemberName] = useState('');
  const [memberMobile, setMemberMobile] = useState('');

  // Admin form state
  const [adminPassword, setAdminPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName.trim()) {
      setErrorMsg('Please enter your full name');
      return;
    }
    if (!memberMobile.trim() || memberMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number');
      return;
    }
    loginAsMember(memberName, memberMobile);
    onClose();
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = loginAsAdmin(adminPassword);
    if (success) {
      onClose();
    } else {
      setErrorMsg('Incorrect committee passcode. Hint: Use "admin123"');
    }
  };

  const handleQuickDemoAdmin = () => {
    setAdminPassword('admin123');
    loginAsAdmin('admin123');
    onClose();
  };

  const handleQuickDemoMember = () => {
    loginAsMember('Rajesh Chamar', '9812345678');
    onClose();
  };

  return (
    <div
      id="auth-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
    >
      <div
        id="auth-modal-card"
        className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-blue-100 overflow-hidden"
      >
        {/* Modal Header Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            id="tab-member-auth"
            type="button"
            onClick={() => {
              setMode('member');
              setErrorMsg('');
            }}
            className={`flex-1 py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition ${
              mode === 'member'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            Member Access
          </button>
          <button
            id="tab-admin-auth"
            type="button"
            onClick={() => {
              setMode('admin');
              setErrorMsg('');
            }}
            className={`flex-1 py-3.5 px-4 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 border-b-2 transition ${
              mode === 'admin'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Shield className="w-4 h-4 text-blue-600" />
            Committee Admin
          </button>
          <button
            onClick={onClose}
            className="p-3 text-slate-400 hover:text-slate-600 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs rounded-xl border border-red-200 font-medium">
              {errorMsg}
            </div>
          )}

          {mode === 'member' ? (
            <div>
              <div className="text-center mb-5">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-2">
                  <User className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Member Sign In</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enter your details to track your past contributions and get personalized receipts.
                </p>
              </div>

              <form onSubmit={handleMemberSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name *
                  </label>
                  <input
                    id="member-name-input"
                    type="text"
                    required
                    placeholder="e.g. Ramesh Kumar Chamar"
                    value={memberName}
                    onChange={(e) => setMemberName(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <div className="flex">
                    <span className="inline-flex items-center px-3 text-xs font-medium text-slate-600 bg-slate-100 border border-r-0 border-slate-300 rounded-l-xl">
                      +91
                    </span>
                    <input
                      id="member-mobile-input"
                      type="tel"
                      maxLength={10}
                      required
                      placeholder="9876543210"
                      value={memberMobile}
                      onChange={(e) => setMemberMobile(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-r-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
                    />
                  </div>
                </div>

                <button
                  id="member-submit-btn"
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl shadow-md transition duration-150"
                >
                  Continue as Member
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Quick Testing:</span>
                <button
                  id="quick-demo-member-btn"
                  type="button"
                  onClick={handleQuickDemoMember}
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Auto-fill Demo Member
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-5">
                <div className="w-12 h-12 bg-blue-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-md">
                  <KeyRound className="w-6 h-6 text-blue-300" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Committee Admin Login</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Authorized access for Committee President, General Secretary & Treasurer to verify
                  funds, manage expenses, and approve receipts.
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Committee Passcode *
                  </label>
                  <div className="relative">
                    <input
                      id="admin-passcode-input"
                      type="password"
                      required
                      placeholder="Enter administrator passcode"
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent font-mono"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Demo Committee Passcode is <code className="bg-slate-100 text-blue-700 px-1 py-0.5 rounded font-mono font-bold">admin123</code>
                  </p>
                </div>

                <button
                  id="admin-submit-btn"
                  type="submit"
                  className="w-full py-2.5 px-4 bg-blue-700 hover:bg-blue-800 text-white text-sm font-semibold rounded-xl shadow-md transition duration-150"
                >
                  Unlock Committee Portal
                </button>
              </form>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">One-click evaluation:</span>
                <button
                  id="quick-demo-admin-btn"
                  type="button"
                  onClick={handleQuickDemoAdmin}
                  className="inline-flex items-center gap-1 text-xs text-blue-700 hover:text-blue-900 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  One-Click Admin Login
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
