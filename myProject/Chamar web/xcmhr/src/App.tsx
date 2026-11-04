import React, { useState } from 'react';
import { CommunityProvider, useCommunity } from './context/CommunityContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { AboutView } from './components/AboutView';
import { ContributeView } from './components/ContributeView';
import { ContributionsListView } from './components/ContributionsListView';
import { TransparencyView } from './components/TransparencyView';
import { CommitteeView } from './components/CommitteeView';
import { ContactView } from './components/ContactView';
import { AdminDashboard } from './components/AdminDashboard';
import { ReceiptModal } from './components/ReceiptModal';
import { ToastContainer } from './components/Toast';
import { AuthModal } from './components/AuthModal';
import { Shield, Sparkles, UserCheck, ShieldCheck } from 'lucide-react';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'member' | 'admin'>('member');

  const { currentUser, loginAsAdmin, loginAsMember, logout } = useCommunity();

  const handleOpenAuth = (mode: 'member' | 'admin' = 'member') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleSwitchToAdmin = () => {
    loginAsAdmin('admin123');
    setActiveTab('admin');
  };

  const handleSwitchToMember = () => {
    loginAsMember('Rajesh Kumar Chamar', '9812345678');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/60 font-sans text-slate-800 antialiased selection:bg-blue-600 selection:text-white">
      {/* Top Demo Fast-Switch Bar for Evaluation */}
      <div className="bg-slate-900 text-slate-300 px-4 py-2 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 font-bold text-blue-400">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            <span>Chamar Clan Community Fund Portal</span>
          </span>
          <span className="text-slate-500 hidden sm:inline">•</span>
          <span className="text-slate-400 hidden sm:inline">
            Status: Active Production Simulation
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="text-slate-400">Current Role:</span>
          <span
            className={`font-bold px-2 py-0.5 rounded ${
              currentUser.role === 'admin'
                ? 'bg-blue-600 text-white'
                : currentUser.role === 'member'
                ? 'bg-slate-700 text-blue-200'
                : 'bg-slate-800 text-slate-300'
            }`}
          >
            {currentUser.role === 'admin'
              ? 'Committee Admin (Full Access)'
              : currentUser.role === 'member'
              ? `Member (${currentUser.name})`
              : 'Guest Contributor'}
          </span>

          {currentUser.role !== 'admin' ? (
            <button
              id="switch-admin-fast-btn"
              onClick={handleSwitchToAdmin}
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 hover:text-white transition font-semibold"
              title="Test as Committee Admin"
            >
              <ShieldCheck className="w-3 h-3 text-blue-400" />
              <span>Switch to Admin</span>
            </button>
          ) : (
            <button
              id="switch-guest-fast-btn"
              onClick={logout}
              className="ml-1 inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              <span>Back to Guest</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Responsive Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={handleOpenAuth}
      />

      {/* Main Body View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {activeTab === 'home' && <HomeView setActiveTab={setActiveTab} />}
        {activeTab === 'about' && <AboutView />}
        {activeTab === 'contribute' && <ContributeView />}
        {activeTab === 'contributions' && <ContributionsListView />}
        {activeTab === 'transparency' && <TransparencyView />}
        {activeTab === 'committee' && <CommitteeView />}
        {activeTab === 'contact' && <ContactView />}
        {activeTab === 'admin' && (
          currentUser.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <div className="bg-white rounded-2xl p-8 max-w-md mx-auto my-12 text-center border border-blue-100 shadow-md space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mx-auto">
                <Shield className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-bold text-slate-900">
                Committee Passcode Required
              </h2>
              <p className="text-xs text-slate-500">
                This portal is restricted to elected executive committee members.
              </p>
              <button
                onClick={() => handleOpenAuth('admin')}
                className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition"
              >
                Enter Committee Passcode
              </button>
              <button
                onClick={handleSwitchToAdmin}
                className="text-xs text-blue-600 hover:underline font-semibold"
              >
                Or 1-Click Auto Login as Admin
              </button>
            </div>
          )
        )}
      </main>

      {/* Footer */}
      <Footer setActiveTab={setActiveTab} onOpenAuth={handleOpenAuth} />

      {/* Global Modals & Notifications */}
      <ReceiptModal />
      <ToastContainer />
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authMode}
      />
    </div>
  );
};

export default function App() {
  return (
    <CommunityProvider>
      <AppContent />
    </CommunityProvider>
  );
}
