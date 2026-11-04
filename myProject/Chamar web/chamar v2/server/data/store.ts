import fs from 'fs';
import path from 'path';

export interface UserRecord {
  _id: string;
  name: string;
  mobile: string;
  email?: string;
  password?: string;
  role: 'user' | 'committee' | 'admin';
  createdAt: string;
}

export interface ContributionRecord {
  _id: string;
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
  verifiedAt?: string;
  referenceId: string;
  createdAt: string;
}

export interface ExpenseRecord {
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

const defaultSettings: CommunitySettings = {
  fundName: 'Chamar Clan Community Fund',
  tagline: 'Together we contribute, together we grow.',
  targetAmount: 100000,
  upiId: 'chamarclan@upi',
  payeeName: 'Chamar Clan Welfare Society',
  bankDetails: {
    accountName: 'Chamar Clan Community Welfare Fund',
    accountNumber: '50100492817291',
    bankName: 'State Bank of India',
    ifscCode: 'SBIN0001248',
    branch: 'Central Community Branch',
  },
  contactMobile: '+91 98765 43210',
  contactEmail: 'contact@chamarclan.org',
};

const initialUsers: UserRecord[] = [
  {
    _id: 'usr_admin_1',
    name: 'Dr. Ramji Ratnakar',
    mobile: '9876543210',
    email: 'admin@chamarclan.org',
    password: 'admin123',
    role: 'admin',
    createdAt: '2026-08-01T08:00:00.000Z',
  },
  {
    _id: 'usr_comm_1',
    name: 'Sunita Gautam (Treasurer)',
    mobile: '9812345678',
    email: 'committee@chamarclan.org',
    password: 'committee123',
    role: 'committee',
    createdAt: '2026-08-05T09:30:00.000Z',
  },
  {
    _id: 'usr_member_1',
    name: 'Rahul Kumar',
    mobile: '9876501234',
    email: 'rahul@chamarclan.org',
    password: 'member123',
    role: 'user',
    createdAt: '2026-08-10T11:00:00.000Z',
  },
  {
    _id: 'usr_member_2',
    name: 'Manoj Chamar',
    mobile: '9845612390',
    email: 'manoj@chamarclan.org',
    password: 'member123',
    role: 'user',
    createdAt: '2026-08-12T14:20:00.000Z',
  },
];

const initialContributions: ContributionRecord[] = [
  {
    _id: 'cnt_001',
    userId: 'usr_member_1',
    name: 'Rahul Kumar',
    mobile: '9876501234',
    amount: 2000,
    paymentMethod: 'UPI',
    transactionId: 'UPI/2026/9823412093',
    status: 'Verified',
    note: 'Monthly community contribution',
    referenceId: 'CCF-2026-1001',
    verifiedBy: 'Sunita Gautam (Treasurer)',
    verifiedAt: '2026-09-12T14:30:00.000Z',
    createdAt: '2026-09-12T10:15:00.000Z',
  },
  {
    _id: 'cnt_002',
    userId: 'usr_member_2',
    name: 'Manoj Chamar',
    mobile: '9845612390',
    amount: 5000,
    paymentMethod: 'UPI',
    transactionId: 'UPI/2026/8812739401',
    status: 'Verified',
    note: 'Support for Youth Education & Library',
    referenceId: 'CCF-2026-1002',
    verifiedBy: 'Dr. Ramji Ratnakar',
    verifiedAt: '2026-09-10T16:00:00.000Z',
    createdAt: '2026-09-10T12:00:00.000Z',
  },
  {
    _id: 'cnt_003',
    name: 'Anita Devi',
    mobile: '9711223344',
    amount: 1500,
    paymentMethod: 'UPI',
    transactionId: 'UPI/2026/7734891023',
    status: 'Verified',
    note: 'Community Welfare initiative',
    referenceId: 'CCF-2026-1003',
    verifiedBy: 'Sunita Gautam (Treasurer)',
    verifiedAt: '2026-09-08T11:20:00.000Z',
    createdAt: '2026-09-08T09:45:00.000Z',
  },
  {
    _id: 'cnt_004',
    name: 'Sanjay Gautam',
    mobile: '9899887766',
    amount: 10000,
    paymentMethod: 'Bank Transfer',
    transactionId: 'NEFT/2026/554819230',
    status: 'Verified',
    note: 'Annual Family Contribution towards Hall Renovation',
    referenceId: 'CCF-2026-1004',
    verifiedBy: 'Sunita Gautam (Treasurer)',
    verifiedAt: '2026-09-05T15:00:00.000Z',
    createdAt: '2026-09-05T10:30:00.000Z',
  },
  {
    _id: 'cnt_005',
    name: 'Priya Bharti',
    mobile: '9654123980',
    amount: 2500,
    paymentMethod: 'UPI',
    transactionId: 'UPI/2026/341908233',
    status: 'Verified',
    note: 'Women empowerment & girls coaching',
    referenceId: 'CCF-2026-1005',
    verifiedBy: 'Dr. Ramji Ratnakar',
    verifiedAt: '2026-09-03T18:15:00.000Z',
    createdAt: '2026-09-03T13:10:00.000Z',
  },
  {
    _id: 'cnt_006',
    name: 'Vijay Kumar Gautam',
    mobile: '9988776655',
    amount: 5000,
    paymentMethod: 'UPI',
    transactionId: 'UPI/2026/667198231',
    status: 'Verified',
    note: 'Social welfare and youth sports kit fund',
    referenceId: 'CCF-2026-1006',
    verifiedBy: 'Sunita Gautam (Treasurer)',
    verifiedAt: '2026-09-01T12:00:00.000Z',
    createdAt: '2026-09-01T08:45:00.000Z',
  },
  {
    _id: 'cnt_007',
    name: 'Suresh Chandra',
    mobile: '9811224466',
    amount: 3000,
    paymentMethod: 'Cash',
    transactionId: 'CASH/REC/2026-042',
    status: 'Verified',
    note: 'Deposited directly at committee office',
    referenceId: 'CCF-2026-1007',
    verifiedBy: 'Sunita Gautam (Treasurer)',
    verifiedAt: '2026-08-28T17:00:00.000Z',
    createdAt: '2026-08-28T16:30:00.000Z',
  },
  {
    _id: 'cnt_008',
    name: 'Dinesh Kumar',
    mobile: '9788665544',
    amount: 25000,
    paymentMethod: 'Bank Transfer',
    transactionId: 'IMPS/2026/9933441122',
    status: 'Verified',
    note: 'Community Centre digital library setup sponsor',
    referenceId: 'CCF-2026-1008',
    verifiedBy: 'Dr. Ramji Ratnakar',
    verifiedAt: '2026-08-25T14:10:00.000Z',
    createdAt: '2026-08-25T11:00:00.000Z',
  },
  {
    _id: 'cnt_009',
    name: 'Kavita Kumari',
    mobile: '9910293847',
    amount: 21000,
    paymentMethod: 'UPI',
    transactionId: 'UPI/2026/7788990011',
    status: 'Verified',
    note: 'In memory of late Sh. Ganga Ram Ji',
    referenceId: 'CCF-2026-1009',
    verifiedBy: 'Sunita Gautam (Treasurer)',
    verifiedAt: '2026-08-20T10:00:00.000Z',
    createdAt: '2026-08-20T08:00:00.000Z',
  },
  // Pending contributions to demonstrate committee review workflow!
  {
    _id: 'cnt_010',
    name: 'Amit Kumar',
    mobile: '9812984712',
    amount: 1000,
    paymentMethod: 'UPI',
    transactionId: 'UPI/2026/112984712',
    status: 'Pending',
    note: 'Monthly member dues',
    referenceId: 'CCF-2026-1010',
    createdAt: '2026-09-13T19:40:00.000Z',
  },
  {
    _id: 'cnt_011',
    name: 'Rakesh Singh',
    mobile: '9871029384',
    amount: 2000,
    paymentMethod: 'UPI',
    transactionId: 'UPI/2026/889210456',
    status: 'Pending',
    note: 'Contribution towards student books distribution',
    referenceId: 'CCF-2026-1011',
    createdAt: '2026-09-14T01:15:00.000Z',
  },
  {
    _id: 'cnt_012',
    name: 'Pooja Rani',
    mobile: '9958473625',
    amount: 500,
    paymentMethod: 'UPI',
    transactionId: 'UPI/2026/447812903',
    status: 'Pending',
    note: 'Welfare fund token contribution',
    referenceId: 'CCF-2026-1012',
    createdAt: '2026-09-14T02:00:00.000Z',
  },
];

const initialExpenses: ExpenseRecord[] = [
  {
    _id: 'exp_001',
    title: 'Youth Higher Education & Civil Services Coaching Scholarship',
    amount: 10000,
    category: 'Education & Scholarship',
    description: 'Financial assistance for 2 students preparing for state civil service and polytechnic entrance tests. Approved in general body meeting.',
    date: '12 Sep 2026',
    createdBy: 'Sunita Gautam (Treasurer)',
    createdAt: '2026-09-12T16:00:00.000Z',
  },
  {
    _id: 'exp_002',
    title: 'Community Hall Electrical Repairs & High-Efficiency Fans',
    amount: 6500,
    category: 'Community Hall',
    description: 'Replacement of faulty wiring, 4 ceiling fans, and LED fixtures at the community central hall.',
    date: '02 Sep 2026',
    createdBy: 'Dr. Ramji Ratnakar',
    createdAt: '2026-09-02T11:30:00.000Z',
  },
  {
    _id: 'exp_003',
    title: 'Emergency Medical Relief Support for Smt. Phoolwati Ji',
    amount: 5000,
    category: 'Medical Emergency',
    description: 'Immediate compassionate medical fund sanctioned for cardiac medication and hospital stay.',
    date: '24 Aug 2026',
    createdBy: 'Sunita Gautam (Treasurer)',
    createdAt: '2026-08-24T14:15:00.000Z',
  },
  {
    _id: 'exp_004',
    title: 'Annual Free Book & Stationery Drive for 85 School Students',
    amount: 4000,
    category: 'Education & Scholarship',
    description: 'Distribution of notebooks, geometry boxes, and bags to community children for the new academic semester.',
    date: '15 Aug 2026',
    createdBy: 'Sunita Gautam (Treasurer)',
    createdAt: '2026-08-15T10:00:00.000Z',
  },
];

class MemoryStore {
  users: UserRecord[] = [...initialUsers];
  contributions: ContributionRecord[] = [...initialContributions];
  expenses: ExpenseRecord[] = [...initialExpenses];
  settings: CommunitySettings = { ...defaultSettings };
  nextRefNumber: number = 1013;

  constructor() {
    this.loadFromDisk();
  }

  private getStoragePath() {
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        // ignore
      }
    }
    return path.join(dataDir, 'community_data.json');
  }

  private loadFromDisk() {
    try {
      const filePath = this.getStoragePath();
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users && Array.isArray(parsed.users)) this.users = parsed.users;
        if (parsed.contributions && Array.isArray(parsed.contributions)) this.contributions = parsed.contributions;
        if (parsed.expenses && Array.isArray(parsed.expenses)) this.expenses = parsed.expenses;
        if (parsed.settings) this.settings = { ...defaultSettings, ...parsed.settings };
        if (parsed.nextRefNumber) this.nextRefNumber = parsed.nextRefNumber;
      }
    } catch (err) {
      console.warn('Could not read saved data, using default memory state', err);
    }
  }

  private saveToDisk() {
    try {
      const filePath = this.getStoragePath();
      const payload = {
        users: this.users,
        contributions: this.contributions,
        expenses: this.expenses,
        settings: this.settings,
        nextRefNumber: this.nextRefNumber,
      };
      fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Could not persist data to disk', err);
    }
  }

  // Stats calculation
  getStats() {
    const verifiedContributions = this.contributions.filter((c) => c.status === 'Verified');
    const totalCollected = verifiedContributions.reduce((sum, c) => sum + c.amount, 0);
    const totalExpenses = this.expenses.reduce((sum, e) => sum + e.amount, 0);
    const remainingBalance = totalCollected - totalExpenses;
    const uniqueContributors = new Set(verifiedContributions.map((c) => c.mobile || c.name)).size;
    const pendingContributions = this.contributions.filter((c) => c.status === 'Pending').length;
    const targetAmount = this.settings.targetAmount || 100000;
    const remainingToTarget = Math.max(0, targetAmount - totalCollected);
    const percentageCompleted = Math.min(100, Math.round((totalCollected / targetAmount) * 100));

    return {
      totalCollected,
      totalExpenses,
      remainingBalance,
      contributorCount: uniqueContributors,
      pendingContributions,
      targetAmount,
      remainingToTarget,
      percentageCompleted,
    };
  }

  // Users
  findUserByEmailOrMobile(identifier: string) {
    const clean = identifier.trim().toLowerCase();
    return this.users.find(
      (u) =>
        u.mobile === clean ||
        (u.email && u.email.toLowerCase() === clean)
    );
  }

  findUserById(id: string) {
    return this.users.find((u) => u._id === id);
  }

  createUser(data: Omit<UserRecord, '_id' | 'createdAt'>) {
    const newUser: UserRecord = {
      ...data,
      _id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.users.unshift(newUser);
    this.saveToDisk();
    return newUser;
  }

  // Contributions
  getContributions(filters?: {
    search?: string;
    status?: string;
    sortBy?: 'date' | 'amount';
    sortOrder?: 'asc' | 'desc';
    userId?: string;
  }) {
    let list = [...this.contributions];

    if (filters?.userId) {
      list = list.filter((c) => c.userId === filters.userId);
    }

    if (filters?.status && filters.status !== 'All') {
      list = list.filter((c) => c.status.toLowerCase() === filters.status!.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.mobile.includes(q) ||
          c.transactionId.toLowerCase().includes(q) ||
          c.referenceId.toLowerCase().includes(q)
      );
    }

    // Sort
    const sortBy = filters?.sortBy || 'date';
    const sortOrder = filters?.sortOrder || 'desc';

    list.sort((a, b) => {
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    return list;
  }

  getContributionById(id: string) {
    return this.contributions.find((c) => c._id === id || c.referenceId === id);
  }

  addContribution(data: Omit<ContributionRecord, '_id' | 'referenceId' | 'createdAt' | 'status'> & { status?: 'Pending' | 'Verified' | 'Rejected' }) {
    const referenceId = `CCF-2026-${this.nextRefNumber++}`;
    const newRecord: ContributionRecord = {
      ...data,
      _id: `cnt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      referenceId,
      status: data.status || 'Pending',
      createdAt: new Date().toISOString(),
    };
    this.contributions.unshift(newRecord);
    this.saveToDisk();
    return newRecord;
  }

  updateContributionStatus(id: string, status: 'Pending' | 'Verified' | 'Rejected', verifiedBy?: string, rejectionReason?: string) {
    const item = this.contributions.find((c) => c._id === id || c.referenceId === id);
    if (!item) return null;

    item.status = status;
    if (status === 'Verified') {
      item.verifiedAt = new Date().toISOString();
      item.verifiedBy = verifiedBy || 'Authorized Committee';
      item.rejectionReason = undefined;
    } else if (status === 'Rejected') {
      item.rejectionReason = rejectionReason || 'Transaction could not be verified in bank ledger';
      item.verifiedAt = undefined;
    } else {
      item.verifiedAt = undefined;
      item.verifiedBy = undefined;
      item.rejectionReason = undefined;
    }

    this.saveToDisk();
    return item;
  }

  // Expenses
  getExpenses() {
    return [...this.expenses].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  getExpenseById(id: string) {
    return this.expenses.find((e) => e._id === id);
  }

  addExpense(data: Omit<ExpenseRecord, '_id' | 'createdAt'>) {
    const newExpense: ExpenseRecord = {
      ...data,
      _id: `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toISOString(),
    };
    this.expenses.unshift(newExpense);
    this.saveToDisk();
    return newExpense;
  }

  updateExpense(id: string, updates: Partial<Omit<ExpenseRecord, '_id' | 'createdAt'>>) {
    const item = this.expenses.find((e) => e._id === id);
    if (!item) return null;
    Object.assign(item, updates);
    this.saveToDisk();
    return item;
  }

  deleteExpense(id: string) {
    const index = this.expenses.findIndex((e) => e._id === id);
    if (index === -1) return false;
    this.expenses.splice(index, 1);
    this.saveToDisk();
    return true;
  }

  // Settings
  getSettings() {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<CommunitySettings>) {
    this.settings = { ...this.settings, ...updates };
    this.saveToDisk();
    return this.settings;
  }

  resetToDefault() {
    this.users = [...initialUsers];
    this.contributions = [...initialContributions];
    this.expenses = [...initialExpenses];
    this.settings = { ...defaultSettings };
    this.saveToDisk();
  }
}

export const communityStore = new MemoryStore();
