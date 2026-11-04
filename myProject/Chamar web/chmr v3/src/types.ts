export type UserRole = 'user' | 'committee' | 'admin';

export interface User {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  role: UserRole;
  createdAt: string;
}

export type ContributionStatus = 'Pending' | 'Verified' | 'Rejected';

export interface Contribution {
  _id: string;
  userId?: string;
  name: string;
  mobile: string;
  amount: number;
  paymentMethod: string;
  transactionId: string;
  screenshot?: string;
  status: ContributionStatus;
  note?: string;
  rejectionReason?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  referenceId: string;
  createdAt: string;
}

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  receiptUrl?: string;
  approvedBy?: string;
  createdBy: string;
  createdAt: string;
}

export interface DashboardStats {
  totalCollected: number;
  totalExpenses: number;
  remainingBalance: number;
  contributorCount: number;
  pendingContributions: number;
  targetAmount: number;
  remainingToTarget: number;
  percentageCompleted: number;
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export interface CommunitySettings {
  fundName: string;
  tagline: string;
  targetAmount: number;
  upiId: string;
  payeeName: string;
  bankDetails: {
    accountName: string;
    accountNumber: string;
    bankName: string;
    ifscCode: string;
    branch: string;
  };
  contactMobile: string;
  contactEmail: string;
}
