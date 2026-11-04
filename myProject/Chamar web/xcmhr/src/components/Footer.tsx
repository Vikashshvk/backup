import React from 'react';
import { useCommunity } from '../context/CommunityContext';
import { Shield, Phone, Mail, MapPin, ExternalLink, Heart, Award } from 'lucide-react';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  onOpenAuth: (mode?: 'member' | 'admin') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenAuth }) => {
  const { settings } = useCommunity();

  const handleNav = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-14 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Col 1: About & Mission */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-base tracking-tight">
                  {settings.communityName}
                </h3>
                <p className="text-xs text-blue-400">Est. {settings.establishedYear}</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Dedicated to collective economic empowerment, student educational grants, emergency
              medical relief, and building community infrastructure for our clan across India.
            </p>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Award className="w-4 h-4 text-blue-400" />
              <span>100% Public Financial Transparency</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2">
              Community Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => handleNav('home')}
                  className="hover:text-white transition"
                >
                  Home Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contribute')}
                  className="hover:text-white transition"
                >
                  Contribute Online (UPI / Bank)
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('contributions')}
                  className="hover:text-white transition"
                >
                  Public Contribution List
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('transparency')}
                  className="hover:text-white transition"
                >
                  Fund Transparency & Ledger
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('committee')}
                  className="hover:text-white transition"
                >
                  Executive Committee Members
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleNav('about')}
                  className="hover:text-white transition"
                >
                  About Community & Bylaws
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Official Bank / UPI Info */}
          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2">
              Official Trust Account
            </h4>
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700/60 space-y-2 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Beneficiary Name
                </span>
                <span className="text-white font-medium">{settings.upiPayeeName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                  Bank & Branch
                </span>
                <span className="text-slate-200">
                  {settings.bankName}, {settings.bankBranch}
                </span>
              </div>
              <div className="flex justify-between font-mono pt-1 text-[11px]">
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">A/C Number</span>
                  <span className="text-blue-300 font-bold">{settings.bankAccountNo}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-sans">IFSC</span>
                  <span className="text-blue-300 font-bold">{settings.bankIfsc}</span>
                </div>
              </div>
              <div className="pt-1 text-[11px]">
                <span className="text-[10px] text-slate-400 block">UPI VPA:</span>
                <span className="text-white font-mono bg-slate-900 px-2 py-0.5 rounded inline-block">
                  {settings.upiId}
                </span>
              </div>
            </div>
          </div>

          {/* Col 4: Contact & Committee Access */}
          <div className="space-y-3">
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-4 border-l-2 border-blue-500 pl-2">
              Helpdesk & Admin
            </h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{settings.registeredAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`tel:${settings.contactPhone}`} className="hover:text-white">
                  {settings.contactPhone}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <a href={`mailto:${settings.contactEmail}`} className="hover:text-white">
                  {settings.contactEmail}
                </a>
              </div>
            </div>

            <div className="pt-2">
              <button
                id="footer-admin-btn"
                onClick={() => onOpenAuth('admin')}
                className="w-full text-center py-2 px-3 bg-slate-800 hover:bg-slate-700 text-blue-300 text-xs font-semibold rounded-lg border border-slate-700 transition"
              >
                Committee Administrator Login
              </button>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="pt-8 border-t border-slate-800 text-center sm:flex sm:justify-between sm:text-left text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} {settings.communityName}. All rights reserved.
          </p>
          <p className="mt-2 sm:mt-0 flex items-center justify-center sm:justify-end gap-1">
            <span>Built with solidarity & unity for community welfare</span>
            <Heart className="w-3.5 h-3.5 text-blue-400 fill-blue-400" />
          </p>
        </div>
      </div>
    </footer>
  );
};
