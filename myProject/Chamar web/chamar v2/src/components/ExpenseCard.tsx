import React from 'react';
import { Expense } from '../types';
import { formatINR, formatDate } from '../utils/format';
import { Calendar, Tag, UserCheck, Edit3, Trash2 } from 'lucide-react';

interface ExpenseCardProps {
  expense: Expense;
  showAdminActions?: boolean;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
}

export const ExpenseCard: React.FC<ExpenseCardProps> = ({
  expense,
  showAdminActions,
  onEdit,
  onDelete,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Education & Scholarship':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Community Hall':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Medical Emergency':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Community Event':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs hover:border-slate-300 hover:shadow-sm transition-all duration-200">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2.5">
        <div>
          <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryColor(
              expense.category
            )} mb-1.5`}
          >
            <Tag className="w-3 h-3" />
            {expense.category}
          </span>
          <h4 className="font-semibold text-slate-900 text-base leading-snug">{expense.title}</h4>
        </div>

        <div className="text-left sm:text-right shrink-0">
          <span className="text-xl font-bold text-slate-900">{formatINR(expense.amount)}</span>
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5 sm:justify-end">
            <Calendar className="w-3 h-3" />
            <span>{expense.date || formatDate(expense.createdAt)}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 mb-3">
        {expense.description}
      </p>

      <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-blue-600" />
          <span>Sanctioned by: <strong className="text-slate-700 font-medium">{expense.createdBy}</strong></span>
        </div>

        {showAdminActions && (
          <div className="flex items-center gap-2">
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(expense)}
                className="p-1 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                title="Edit expense"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(expense._id)}
                className="p-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                title="Delete expense"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
