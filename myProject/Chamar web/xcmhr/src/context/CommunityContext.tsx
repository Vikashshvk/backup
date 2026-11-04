import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Contribution,
  Expense,
  CommitteeMember,
  CommunitySettings,
  UserSession,
  ToastMessage,
  ContributionStatus,
} from '../types';
import {
  initialContributions,
  initialExpenses,
  initialCommitteeMembers,
  initialSettings,
} from '../data/initialData';
import { generateReceiptNumber } from '../utils/formatters';

interface CommunityContextType {
  contributions: Contribution[];
  expenses: Expense[];
  committeeMembers: CommitteeMember[];
  settings: CommunitySettings;
  currentUser: UserSession;
  toasts: ToastMessage[];
  selectedReceipt: Contribution | null;

  // Computed metrics
  totalCollected: number;
  totalPendingAmount: number;
  pendingCount: number;
  totalContributors: number;
  totalExpenses: number;
  remainingBalance: number;
  targetProgress: number;

  // Actions
  addContribution: (data: Omit<Contribution, 'id' | 'receiptNumber' | 'date' | 'status'> & { status?: ContributionStatus }) => Contribution;
  verifyContribution: (id: string, verifierName: string) => void;
  rejectContribution: (id: string, reason: string) => void;
  deleteContribution: (id: string) => void;
  updateContribution: (id: string, data: Partial<Contribution>) => void;

  addExpense: (expense: Omit<Expense, 'id' | 'voucherNumber'>) => void;
  deleteExpense: (id: string) => void;
  updateExpense: (id: string, data: Partial<Expense>) => void;

  addCommitteeMember: (member: Omit<CommitteeMember, 'id'>) => void;
  updateCommitteeMember: (id: string, member: Partial<CommitteeMember>) => void;
  deleteCommitteeMember: (id: string) => void;

  updateSettings: (newSettings: Partial<CommunitySettings>) => void;
  resetToDefaults: () => void;

  loginAsMember: (name: string, mobile: string) => void;
  loginAsAdmin: (password: string) => boolean;
  logout: () => void;

  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  setSelectedReceipt: (contribution: Contribution | null) => void;
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CONTRIBUTIONS: 'chamar_fund_contributions_v1',
  EXPENSES: 'chamar_fund_expenses_v1',
  MEMBERS: 'chamar_fund_members_v1',
  SETTINGS: 'chamar_fund_settings_v1',
  USER: 'chamar_fund_user_v1',
};

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [contributions, setContributions] = useState<Contribution[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONTRIBUTIONS);
      return saved ? JSON.parse(saved) : initialContributions;
    } catch {
      return initialContributions;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : initialExpenses;
    } catch {
      return initialExpenses;
    }
  });

  const [committeeMembers, setCommitteeMembers] = useState<CommitteeMember[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return saved ? JSON.parse(saved) : initialCommitteeMembers;
    } catch {
      return initialCommitteeMembers;
    }
  });

  const [settings, setSettings] = useState<CommunitySettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialSettings;
    } catch {
      return initialSettings;
    }
  });

  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      return saved ? JSON.parse(saved) : { isLoggedIn: false, role: 'guest', name: 'Guest User' };
    } catch {
      return { isLoggedIn: false, role: 'guest', name: 'Guest User' };
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedReceipt, setSelectedReceipt] = useState<Contribution | null>(null);

  // Sync state to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CONTRIBUTIONS, JSON.stringify(contributions));
    } catch (e) {
      console.warn('Failed to save contributions to localStorage', e);
    }
  }, [contributions]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.warn('Failed to save expenses to localStorage', e);
    }
  }, [expenses]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(committeeMembers));
    } catch (e) {
      console.warn('Failed to save members to localStorage', e);
    }
  }, [committeeMembers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.warn('Failed to save settings to localStorage', e);
    }
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser));
    } catch (e) {
      console.warn('Failed to save user session to localStorage', e);
    }
  }, [currentUser]);

  // Toast Management
  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Computed metrics
  const verifiedContributions = contributions.filter((c) => c.status === 'verified');
  const pendingContributions = contributions.filter((c) => c.status === 'pending');

  const totalCollected = verifiedContributions.reduce((sum, c) => sum + c.amount, 0);
  const totalPendingAmount = pendingContributions.reduce((sum, c) => sum + c.amount, 0);
  const pendingCount = pendingContributions.length;

  const uniqueContributors = new Set(contributions.map((c) => c.mobile || c.memberName.trim().toLowerCase()));
  const totalContributors = uniqueContributors.size;

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const remainingBalance = totalCollected - totalExpenses;
  const targetProgress = Math.min(
    100,
    Math.round((totalCollected / (settings.targetAmount || 1)) * 100)
  );

  // Contribution actions
  const addContribution = (
    data: Omit<Contribution, 'id' | 'receiptNumber' | 'date' | 'status'> & { status?: ContributionStatus }
  ): Contribution => {
    const today = new Date().toISOString().split('T')[0];
    const newContribution: Contribution = {
      ...data,
      id: `CONT-${Date.now().toString().slice(-6)}`,
      receiptNumber: generateReceiptNumber(),
      date: today,
      status: data.status || 'pending',
    };

    setContributions((prev) => [newContribution, ...prev]);

    if (newContribution.status === 'verified') {
      addToast({
        type: 'success',
        title: 'Contribution Recorded',
        message: `Thank you, ${data.memberName}! ₹${data.amount.toLocaleString('en-IN')} has been added as verified.`,
      });
    } else {
      addToast({
        type: 'info',
        title: 'Contribution Submitted',
        message: `Receipt #${newContribution.receiptNumber} generated. Payment reference submitted for committee verification.`,
      });
    }

    return newContribution;
  };

  const verifyContribution = (id: string, verifierName: string) => {
    const now = new Date();
    const formattedNow = `${now.toISOString().split('T')[0]} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setContributions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'verified',
              verifiedBy: verifierName,
              verifiedAt: formattedNow,
            }
          : c
      )
    );

    addToast({
      type: 'success',
      title: 'Payment Verified',
      message: `Contribution has been successfully verified and added to the public fund total.`,
    });
  };

  const rejectContribution = (id: string, reason: string) => {
    setContributions((prev) =>
      prev.map((c) =>
        c.id === id
          ? {
              ...c,
              status: 'rejected',
              notes: `${c.notes ? c.notes + ' | ' : ''}Rejected: ${reason}`,
            }
          : c
      )
    );

    addToast({
      type: 'warning',
      title: 'Contribution Rejected',
      message: `Status updated to rejected. Reason: ${reason}`,
    });
  };

  const deleteContribution = (id: string) => {
    setContributions((prev) => prev.filter((c) => c.id !== id));
    addToast({
      type: 'info',
      title: 'Record Removed',
      message: 'Contribution record was deleted.',
    });
  };

  const updateContribution = (id: string, data: Partial<Contribution>) => {
    setContributions((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...data } : c))
    );
    addToast({
      type: 'success',
      title: 'Record Updated',
      message: 'Contribution record was updated successfully.',
    });
  };

  // Expense actions
  const addExpense = (expenseData: Omit<Expense, 'id' | 'voucherNumber'>) => {
    const newVoucher = `VOUCH-2026-${Math.floor(100 + Math.random() * 900)}`;
    const newExpense: Expense = {
      ...expenseData,
      id: `EXP-${Date.now().toString().slice(-6)}`,
      voucherNumber: newVoucher,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addToast({
      type: 'success',
      title: 'Expense Recorded',
      message: `₹${expenseData.amount.toLocaleString('en-IN')} expense logged under voucher ${newVoucher}.`,
    });
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addToast({
      type: 'info',
      title: 'Expense Deleted',
      message: 'Expense entry has been removed from transparency records.',
    });
  };

  const updateExpense = (id: string, data: Partial<Expense>) => {
    setExpenses((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...data } : e))
    );
    addToast({
      type: 'success',
      title: 'Expense Updated',
      message: 'Expense ledger entry was updated.',
    });
  };

  // Committee Member actions
  const addCommitteeMember = (memberData: Omit<CommitteeMember, 'id'>) => {
    const newMember: CommitteeMember = {
      ...memberData,
      id: `cm-${Date.now().toString().slice(-5)}`,
    };
    setCommitteeMembers((prev) => [...prev, newMember]);
    addToast({
      type: 'success',
      title: 'Member Added',
      message: `${memberData.name} was added to the committee directory.`,
    });
  };

  const updateCommitteeMember = (id: string, data: Partial<CommitteeMember>) => {
    setCommitteeMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, ...data } : m))
    );
    addToast({
      type: 'success',
      title: 'Member Updated',
      message: 'Committee member details updated.',
    });
  };

  const deleteCommitteeMember = (id: string) => {
    setCommitteeMembers((prev) => prev.filter((m) => m.id !== id));
    addToast({
      type: 'info',
      title: 'Member Removed',
      message: 'Committee member was removed.',
    });
  };

  // Settings
  const updateSettings = (newSettings: Partial<CommunitySettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    addToast({
      type: 'success',
      title: 'Settings Saved',
      message: 'Community configuration and payment details updated successfully.',
    });
  };

  const resetToDefaults = () => {
    setContributions(initialContributions);
    setExpenses(initialExpenses);
    setCommitteeMembers(initialCommitteeMembers);
    setSettings(initialSettings);
    addToast({
      type: 'info',
      title: 'Reset Completed',
      message: 'Database restored to initial sample records.',
    });
  };

  // Authentication
  const loginAsMember = (name: string, mobile: string) => {
    setCurrentUser({
      isLoggedIn: true,
      role: 'member',
      name: name.trim() || 'Community Member',
      mobile: mobile.trim(),
    });
    addToast({
      type: 'success',
      title: 'Welcome!',
      message: `Signed in as ${name}. You can track and submit contributions.`,
    });
  };

  const loginAsAdmin = (password: string): boolean => {
    // Allows password 'admin123' or 'chamar2026' or 'admin'
    if (password === 'admin123' || password === 'chamar2026' || password === 'admin') {
      setCurrentUser({
        isLoggedIn: true,
        role: 'admin',
        name: 'Er. Rakesh Babu Sonkar (Treasurer)',
        email: 'treasurer@chamarwelfare.org',
      });
      addToast({
        type: 'success',
        title: 'Admin Access Granted',
        message: 'Welcome to the Committee Management Dashboard.',
      });
      return true;
    }
    addToast({
      type: 'error',
      title: 'Access Denied',
      message: 'Invalid committee passcode. Try using "admin123".',
    });
    return false;
  };

  const logout = () => {
    setCurrentUser({ isLoggedIn: false, role: 'guest', name: 'Guest User' });
    addToast({
      type: 'info',
      title: 'Signed Out',
      message: 'You have returned to guest browsing mode.',
    });
  };

  return (
    <CommunityContext.Provider
      value={{
        contributions,
        expenses,
        committeeMembers,
        settings,
        currentUser,
        toasts,
        selectedReceipt,
        totalCollected,
        totalPendingAmount,
        pendingCount,
        totalContributors,
        totalExpenses,
        remainingBalance,
        targetProgress,
        addContribution,
        verifyContribution,
        rejectContribution,
        deleteContribution,
        updateContribution,
        addExpense,
        deleteExpense,
        updateExpense,
        addCommitteeMember,
        updateCommitteeMember,
        deleteCommitteeMember,
        updateSettings,
        resetToDefaults,
        loginAsMember,
        loginAsAdmin,
        logout,
        addToast,
        removeToast,
        setSelectedReceipt,
      }}
    >
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = (): CommunityContextType => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
