export type PaymentMethod = 'UPI' | 'Net Banking' | 'Cash / Cheque';

export type ContributionStatus = 'verified' | 'pending' | 'rejected';

export type ContributionCategory =
  | 'General Welfare Fund'
  | 'Education & Scholarships'
  | 'Medical Emergency Relief'
  | 'Community Center Development'
  | 'Youth Career & Coaching'
  | 'Annual Sammelan & Cultural';

export interface Contribution {
  id: string;
  receiptNumber: string;
  memberName: string;
  mobile: string;
  email?: string;
  gotraOrVillage?: string;
  amount: number;
  category: ContributionCategory;
  paymentMethod: PaymentMethod;
  utrOrRefNumber: string;
  date: string; // YYYY-MM-DD
  status: ContributionStatus;
  verifiedBy?: string;
  verifiedAt?: string;
  notes?: string;
  receiptScreenshot?: string;
}

export type ExpenseCategory =
  | 'Education Aid'
  | 'Medical Assistance'
  | 'Community Hall Maintenance'
  | 'Youth Skill Training'
  | 'Annual Sammelan & Events'
  | 'Legal & Administrative Aid';

export interface Expense {
  id: string;
  voucherNumber: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  description: string;
  beneficiaryOrVendor: string;
  approvedBy: string;
  receiptDocUrl?: string;
}

export type CommitteeRole =
  | 'President'
  | 'Vice President'
  | 'General Secretary'
  | 'Treasurer'
  | 'Auditor / Comptroller'
  | 'Youth Coordinator'
  | 'Welfare Secretary'
  | 'Executive Member';

export interface CommitteeMember {
  id: string;
  name: string;
  role: CommitteeRole;
  phone: string;
  email: string;
  villageOrLocation: string;
  avatarUrl?: string;
  tenure: string;
  isKeySignatory: boolean;
}

export interface CommunitySettings {
  communityName: string;
  tagline: string;
  establishedYear: string;
  targetAmount: number;
  fiscalYear: string;
  targetDeadline: string;
  upiId: string;
  upiPayeeName: string;
  bankName: string;
  bankAccountNo: string;
  bankIfsc: string;
  bankBranch: string;
  welcomeNotice: string;
  contactPhone: string;
  contactEmail: string;
  registeredAddress: string;
}

export interface UserSession {
  isLoggedIn: boolean;
  role: 'guest' | 'member' | 'admin';
  name: string;
  mobile?: string;
  email?: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'error';
  title: string;
  message: string;
}
