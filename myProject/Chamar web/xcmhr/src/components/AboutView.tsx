import React from 'react';
import { useCommunity } from '../context/CommunityContext';
import { Shield, BookOpen, Heart, Users, Target, CheckCircle2, Award, Landmark } from 'lucide-react';

export const AboutView: React.FC = () => {
  const { settings } = useCommunity();

  return (
    <div className="space-y-10 max-w-5xl mx-auto pb-12">
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100 text-blue-800 text-xs font-bold uppercase tracking-wider mb-3">
          <Landmark className="w-4 h-4 text-blue-600" />
          <span>Clan Heritage & Welfare Vision</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About {settings.communityName}
        </h1>
        <p className="text-xs sm:text-base text-slate-600 mt-3 leading-relaxed">
          Inspired by the ideals of Sant Guru Ravidas, Babasaheb Dr. B. R. Ambedkar, and our esteemed
          community reformers, we are committed to building economic resilience, mutual aid, and
          educational advancement for every generation.
        </p>
      </div>

      {/* Core Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-xs border border-blue-100 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Education as the Foundation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            "Educate, Agitate, Organize." Our primary mission is to ensure no aspiring student from
            our community is forced to abandon higher education, civil service preparation, or
            technical degrees due to financial hardship.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-blue-100 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-blue-700 text-white flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Clan Safety Net</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Unforeseen medical crises and emergency surgeries can wipe out families financially.
            The community welfare fund acts as an immediate solidarity fund to provide interest-free
            or non-repayable grants.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-xs border border-blue-100 space-y-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Absolute Transparency</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Trust is the cornerstone of community organizing. Every single rupee collected is
            itemized in public records. Income, expenses, and bank vouchers are visible to all members
            24/7 on this portal.
          </p>
        </div>
      </div>

      {/* Key Milestones & History */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-slate-200 space-y-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 border-b border-slate-100 pb-3">
          Our Journey & Key Milestones
        </h2>

        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 font-bold font-mono text-sm flex items-center justify-center shrink-0 border border-blue-200">
              2019
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Establishment of the Community Fund</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Formed during the National Clan Sammelan in New Delhi with an initial voluntary
                corpus contributed by 45 founding community members and professionals.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 font-bold font-mono text-sm flex items-center justify-center shrink-0 border border-blue-200">
              2021
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Covid Emergency Relief & Ambulance Assistance</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Disbursed emergency ration kits, oxygen concentrators, and direct financial help to
                over 230 vulnerable families across UP, Punjab, Bihar, and Rajasthan.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-800 font-bold font-mono text-sm flex items-center justify-center shrink-0 border border-blue-200">
              2024
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Student Study Center & Digital Library</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Inauguration of the dedicated Ambedkar Study Center equipped with 20 high-speed
                computer systems and 1,500+ competitive examination textbooks.
              </p>
            </div>
          </div>

          <div className="flex gap-4 items-start">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white font-bold font-mono text-sm flex items-center justify-center shrink-0">
              2026
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Unified Digital Portal Launch</h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Launch of this responsive digital contribution and fund management portal, bringing
                real-time transparency and instant digital receipting to our clan worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Community Financial Bylaws Summary */}
      <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-base font-bold text-slate-900">Community Governance & Bylaws Summary</h3>
        <ul className="space-y-2 text-xs text-slate-700">
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Voluntary Contributions:</strong> All donations are purely voluntary and
              non-refundable once issued towards charitable community purposes.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Bank Security:</strong> No funds are stored in personal accounts; funds reside
              exclusively in the official trust bank account with dual signatories.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Democratic Election:</strong> Committee officers serve a 3-year term and are
              subject to review at the annual general meeting.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <span>
              <strong>Zero Administrative Embezzlement:</strong> All committee members volunteer
              their time pro bono. No salaries or personal perks are drawn from community donations.
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};
