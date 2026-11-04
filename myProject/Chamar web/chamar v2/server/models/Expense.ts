import mongoose, { Schema, Document } from 'mongoose';

export interface IExpense extends Document {
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receiptUrl?: string;
  approvedBy?: string;
  createdBy: string;
  createdAt: Date;
}

export const ExpenseSchema = new Schema<IExpense>({
  title: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 1 },
  category: { type: String, required: true, default: 'Community Welfare' },
  description: { type: String, required: true, trim: true },
  date: { type: String, required: true },
  receiptUrl: { type: String },
  approvedBy: { type: String },
  createdBy: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ExpenseModel = mongoose.models.Expense || mongoose.model<IExpense>('Expense', ExpenseSchema);
