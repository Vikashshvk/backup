import React, { useState } from 'react';
import { useCommunity } from '../context/CommunityContext';
import {
  Shield,
  Menu,
  X,
  HeartHandshake,
  User,
  LogOut,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'member' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenAuth,
}) => {
  const { settings, currentUser, logout, pendingCount } = useCommunity();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'about', label: 'About Community' },
    { id: 'contribute', label: 'Contribute' },
    { id: 'contributions', label: 'Contributions' },
    { id: 'transparency', label: 'Fund Transparency' },
    { id: 'committee', label: 'Committee' },
    { id: 'contact', label: 'Contact' },
  ];

  const handleNavClick = (id: string) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-blue-100 shadow-xs">
      {/* Top emergency / notice ticker */}
      {settings.welcomeNotice && (
        <div className="bg-blue-900 text-blue-100 px-4 py-1.5 text-xs text-center font-medium flex items-center justify-center gap-2">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
          <span className="truncate max-w-4xl">{settings.welcomeNotice}</span>
          <button
            onClick={() => handleNavClick('transparency')}
            className="underline text-blue-200 hover:text-white shrink-0 ml-1 cursor-pointer"
          >
            Audit Reports
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Community Name */}
          <div
            id="brand-logo-container"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-800 to-blue-600 text-white flex items-center justify-center shadow-md border-2 border-blue-400/40 group-hover:scale-105 transition-transform duration-200">
              <Shield className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg sm:text-xl font-black tracking-tight text-blue-950">
                  {settings.communityName}
                </span>
                <span className="hidden md:inline-flex items-center text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full">
                  Verified Trust
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium tracking-wide line-clamp-1">
                {settings.tagline}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                    isActive
                      ? 'text-blue-700 bg-blue-50 font-bold'
                      : 'text-slate-600 hover:text-blue-900 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Area */}
          <div className="hidden sm:flex items-center gap-2.5">
            {currentUser.isLoggedIn ? (
              <div className="flex items-center gap-2">
                {currentUser.role === 'admin' ? (
                  <button
                    id="nav-admin-dashboard-btn"
                    onClick={() => handleNavClick('admin')}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition ${
                      activeTab === 'admin'
                        ? 'bg-blue-900 text-white border-blue-900'
                        : 'bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>Committee Portal</span>
                    {pendingCount > 0 && (
                      <span className="bg-amber-500 text-white text-[10px] px-1.5 py-0.2 rounded-full font-mono">
                        {pendingCount}
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium px-2 py-1 bg-slate-100 rounded-lg">
                    <User className="w-3.5 h-3.5 text-blue-600" />
                    <span>{currentUser.name.split(' ')[0]}</span>
                  </div>
                )}
                <button
                  onClick={logout}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                  title="Log out"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                id="nav-login-btn"
                onClick={() => onOpenAuth('member')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-900 hover:bg-blue-50/80 rounded-lg transition"
              >
                <User className="w-4 h-4 text-blue-600" />
                <span>Login</span>
              </button>
            )}

            {/* Primary CTA: Contribute Now */}
            <button
              id="nav-contribute-cta"
              onClick={() => handleNavClick('contribute')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <HeartHandshake className="w-4 h-4" />
              <span>Contribute Now</span>
            </button>
          </div>

          {/* Mobile Hamburger Toggle */}
          <div className="flex items-center gap-2 sm:hidden">
            <button
              id="mobile-contribute-shortcut"
              onClick={() => handleNavClick('contribute')}
              className="px-2.5 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
            >
              Contribute
            </button>
            <button
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-blue-900" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div id="mobile-nav-drawer" className="lg:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-6 space-y-2 shadow-xl animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-bold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              );
            })}
          </div>

          <div className="pt-4 mt-2 border-t border-slate-100 space-y-2">
            {currentUser.isLoggedIn ? (
              <>
                {currentUser.role === 'admin' && (
                  <button
                    onClick={() => handleNavClick('admin')}
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-blue-900 text-white text-sm font-bold shadow-sm"
                  >
                    <span className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-blue-300" />
                      Committee Admin Portal
                    </span>
                    {pendingCount > 0 && (
                      <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-mono">
                        {pendingCount} pending
                      </span>
                    )}
                  </button>
                )}
                <div className="flex items-center justify-between px-4 py-2 text-xs text-slate-500">
                  <span>Signed in as {currentUser.name}</span>
                  <button
                    onClick={logout}
                    className="text-red-600 font-semibold hover:underline"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('member');
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Member Login
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth('admin');
                  }}
                  className="w-full py-2.5 text-center text-xs font-bold text-blue-700 bg-blue-50 rounded-xl border border-blue-200"
                >
                  Committee Admin
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
