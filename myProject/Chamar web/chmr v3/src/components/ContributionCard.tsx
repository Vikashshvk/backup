import React from 'react';
import { Contribution } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { CheckCircle2, Clock, XCircle, ShieldCheck, CreditCard, ChevronRight } from 'lucide-react';

interface ContributionCardProps {
  contribution: Contribution;
  onViewDetails?: (contribution: Contribution) => void;
  showAdminActions?: boolean;
  onVerify?: (id: string) => void;
  onReject?: (id: string) => void;
}

export const ContributionCard: React.FC<ContributionCardProps> = ({
  contribution,
  onViewDetails,
  showAdminActions,
  onVerify,
  onReject,
}) => {
  const getStatusBadge = (status: Contribution['status']) => {
    switch (status) {
      case 'Verified':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Verified
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Pending
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/80 shadow-xs hover:border-blue-200 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-slate-900 text-base">{contribution.name}</h4>
            {contribution.verifiedBy && (
              <span title={`Verified by ${contribution.verifiedBy}`}>
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
            <span>Ref: {contribution.referenceId}</span>
            <span>•</span>
            <span>{formatDate(contribution.createdAt)}</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-blue-900">
            {formatINR(contribution.amount)}
          </div>
          <div className="mt-1">{getStatusBadge(contribution.status)}</div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-medium">
            <CreditCard className="w-3 h-3 text-slate-500" />
            {contribution.paymentMethod}
          </span>
          <span className="font-mono text-[11px] text-slate-500 truncate max-w-[180px] sm:max-w-xs">
            Txn: {contribution.transactionId}
          </span>
        </div>

        <div className="flex items-center gap-2 ml-auto">
          {showAdminActions && contribution.status === 'Pending' && (
            <>
              {onVerify && (
                <button
                  type="button"
                  onClick={() => onVerify(contribution._id)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs transition-colors cursor-pointer"
                >
                  Verify
                </button>
              )}
              {onReject && (
                <button
                  type="button"
                  onClick={() => onReject(contribution._id)}
                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-medium text-xs transition-colors cursor-pointer"
                >
                  Reject
                </button>
              )}
            </>
          )}

          {onViewDetails && (
            <button
              type="button"
              onClick={() => onViewDetails(contribution)}
              className="inline-flex items-center gap-0.5 text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              <span>Receipt</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {contribution.rejectionReason && (
        <div className="mt-2.5 p-2 bg-rose-50/70 border border-rose-100 rounded-lg text-xs text-rose-800">
          <span className="font-semibold">Reason:</span> {contribution.rejectionReason}
        </div>
      )}
    </div>
  );
};
