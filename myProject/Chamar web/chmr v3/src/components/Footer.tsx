import React from 'react';
import { Link } from 'react-router-dom';
import { HeartHandshake, ShieldCheck, Mail, Phone, ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          {/* Col 1: Brand & Mission */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg leading-tight">Chamar Clan Community Fund</h3>
                <p className="text-xs text-blue-400 font-semibold tracking-wide">
                  Together we contribute, together we grow.
                </p>
              </div>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed max-w-md">
              A united initiative by the community, for the community. Every single rupee collected is
              transparently accounted for and utilized for education scholarships, medical assistance,
              community hall maintenance, and cultural empowerment.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Committee-Audited & Transparent Public Ledger</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Quick Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="text-slate-400 hover:text-white transition-colors">
                  Home & Fund Overview
                </Link>
              </li>
              <li>
                <Link to="/contribute" className="text-slate-400 hover:text-white transition-colors">
                  Contribute Online
                </Link>
              </li>
              <li>
                <Link to="/contributions" className="text-slate-400 hover:text-white transition-colors">
                  Contribution History
                </Link>
              </li>
              <li>
                <Link to="/transparency" className="text-slate-400 hover:text-white transition-colors">
                  Fund Transparency & Expenses
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-slate-400 hover:text-white transition-colors">
                  Committee / Admin Portal
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Contact & UPI Help */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider text-white mb-4">
              Committee Helpline
            </h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-blue-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-blue-400 shrink-0" />
                <span>contact@chamarclan.org</span>
              </li>
              <li className="pt-2">
                <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
                  <span className="text-xs text-slate-400 block">Official Community UPI ID:</span>
                  <span className="text-sm font-mono text-blue-300 font-bold">chamarclan@upi</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© 2026 Chamar Clan Community Fund. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link to="/transparency" className="hover:text-slate-400">
              Audit Transparency
            </Link>
            <span>•</span>
            <Link to="/admin" className="hover:text-slate-400">
              Committee Verification
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
