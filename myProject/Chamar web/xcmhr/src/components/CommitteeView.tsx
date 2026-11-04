import React from 'react';
import { useCommunity } from '../context/CommunityContext';
import { Shield, Phone, Mail, MapPin, Award, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';

export const CommitteeView: React.FC = () => {
  const { committeeMembers, settings } = useCommunity();

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
          <UserCheck className="w-4 h-4 text-blue-600" />
          <span>Governance & Administration</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Executive Committee Members
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
          Elected representatives dedicated to managing the {settings.communityName}, safeguarding
          funds, and ensuring community welfare projects are delivered with utmost integrity.
        </p>
      </div>

      {/* Committee Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {committeeMembers.map((member) => (
          <div
            key={member.id}
            className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              {/* Avatar & Role Badge */}
              <div className="flex items-start justify-between mb-4">
                <div className="relative">
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-200 shadow-xs"
                  />
                  {member.isKeySignatory && (
                    <span
                      title="Authorized Bank Signatory"
                      className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-700 text-white rounded-full flex items-center justify-center border-2 border-white shadow-xs"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-100">
                  {member.role}
                </span>
              </div>

              {/* Name & Details */}
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                {member.name}
              </h3>
              <p className="text-xs text-blue-600 font-semibold mt-0.5">{member.role}</p>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate">{member.villageOrLocation}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${member.phone}`} className="hover:text-blue-600 font-mono">
                    {member.phone}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <a href={`mailto:${member.email}`} className="hover:text-blue-600 truncate">
                    {member.email}
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Tenure:</span>
              <span className="font-semibold text-slate-700">{member.tenure}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Governance & Accountability Guidelines */}
      <div className="bg-blue-50/70 rounded-2xl p-6 sm:p-8 border border-blue-200/80">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-blue-950">
              Committee Code of Ethics & Financial Guidelines
            </h3>
            <p className="text-xs text-blue-800">Mandatory standards followed by every committee member</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-700 mt-4">
          <div className="p-4 bg-white rounded-xl border border-blue-100 space-y-1.5">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Dual Signatory Banking
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              No expenditure can be withdrawn or disbursed without the joint signatures of the
              Treasurer and the General Secretary / President.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-blue-100 space-y-1.5">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Voucher Verification
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Every disbursement must be supported by an official bill, invoice, or direct bank
              transfer receipt to the verified student or beneficiary.
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-blue-100 space-y-1.5">
            <span className="font-bold text-slate-900 block flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Monthly Public Audit
            </span>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Accounts are reconciled monthly and presented at the general body meeting. Any clan
              member can inspect the physical ledger books upon request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
