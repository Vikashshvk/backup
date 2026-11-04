import mongoose, { Schema, Document } from 'mongoose';

export interface IContribution extends Document {
  userId?: string;
  name: string;
  mobile: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  screenshot?: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  note?: string;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: Date;
  referenceId: string;
  createdAt: Date;
}

export const ContributionSchema = new Schema<IContribution>({
  userId: { type: String },
  name: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  amount: { type: Number, required: true, min: 1 },
  paymentMethod: { type: String, required: true, default: 'UPI' },
  transactionId: { type: String, required: true, trim: true },
  screenshot: { type: String },
  status: { type: String, enum: ['Pending', 'Verified', 'Rejected'], default: 'Pending' },
  note: { type: String, trim: true },
  rejectionReason: { type: String, trim: true },
  verifiedBy: { type: String },
  verifiedAt: { type: Date },
  referenceId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const ContributionModel = mongoose.models.Contribution || mongoose.model<IContribution>('Contribution', ContributionSchema);
