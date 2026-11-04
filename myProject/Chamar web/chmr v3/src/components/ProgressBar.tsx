import React from 'react';
import { formatINR } from '../utils/format';

interface ProgressBarProps {
  collected: number;
  target: number;
  percentage?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  collected,
  target,
  percentage: customPercentage,
}) => {
  const percentage =
    customPercentage !== undefined
      ? customPercentage
      : target > 0
      ? Math.min(100, Math.round((collected / target) * 100))
      : 0;

  return (
    <div className="bg-white rounded-2xl p-5 md:p-6 border border-blue-100 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
            Collection Progress
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl md:text-3xl font-bold text-slate-900">
              {formatINR(collected)}
            </span>
            <span className="text-sm font-medium text-slate-500">
              collected of {formatINR(target)} goal
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <div className="px-3 py-1.5 rounded-xl bg-blue-600 text-white font-bold text-sm shadow-xs">
            {percentage}% Completed
          </div>
        </div>
      </div>

      {/* Progress track */}
      <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden p-0.5">
        <div
          className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.max(3, Math.min(100, percentage))}%` }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-slate-500 mt-2.5 font-medium">
        <span>₹0 Initial</span>
        <span className="text-blue-700 font-semibold">
          {percentage >= 100
            ? '🎉 Target Reached!'
            : `${formatINR(Math.max(0, target - collected))} remaining to reach target`}
        </span>
        <span>{formatINR(target)}</span>
      </div>
    </div>
  );
};
