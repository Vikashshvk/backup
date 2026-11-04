import {
  User,
  Contribution,
  Expense,
  DashboardStats,
  CategoryBreakdown,
  CommunitySettings,
} from '../types';

const API_BASE = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('ccf_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export const api = {
  // Auth
  async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to login');
    return data;
  },

  async register(params: {
    name: string;
    mobile: string;
    email?: string;
    password: string;
    role?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to register');
    return data;
  },

  async getMe(): Promise<{ user: User }> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch current user');
    return data;
  },

  // Dashboard
  async getDashboardStats(): Promise<{
    stats: DashboardStats;
    recentContributions: Contribution[];
    pendingContributionsList: Contribution[];
    recentExpenses: Expense[];
    categoryBreakdown: CategoryBreakdown[];
    settings: CommunitySettings;
  }> {
    const res = await fetch(`${API_BASE}/dashboard/stats`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load dashboard data');
    return data;
  },

  // Contributions
  async getContributions(params?: {
    search?: string;
    status?: string;
    sortBy?: 'date' | 'amount';
    sortOrder?: 'asc' | 'desc';
    userId?: string;
  }): Promise<{ count: number; contributions: Contribution[] }> {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    if (params?.sortOrder) query.set('sortOrder', params.sortOrder);
    if (params?.userId) query.set('userId', params.userId);

    const res = await fetch(`${API_BASE}/contributions?${query.toString()}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch contributions');
    return data;
  },

  async getContributionById(id: string): Promise<{ contribution: Contribution }> {
    const res = await fetch(`${API_BASE}/contributions/${id}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch contribution');
    return data;
  },

  async createContribution(payload: {
    name: string;
    mobile: string;
    amount: number;
    paymentMethod: string;
    transactionId: string;
    screenshot?: string;
    note?: string;
    userId?: string;
  }): Promise<{ message: string; contribution: Contribution; referenceId: string }> {
    const res = await fetch(`${API_BASE}/contributions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit contribution');
    return data;
  },

  async updateContributionStatus(
    id: string,
    status: 'Pending' | 'Verified' | 'Rejected',
    verifiedBy?: string,
    rejectionReason?: string
  ): Promise<{ message: string; contribution: Contribution }> {
    const res = await fetch(`${API_BASE}/contributions/${id}/status`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, verifiedBy, rejectionReason }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update contribution status');
    return data;
  },

  // Expenses
  async getExpenses(): Promise<{ count: number; expenses: Expense[] }> {
    const res = await fetch(`${API_BASE}/expenses`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch expenses');
    return data;
  },

  async createExpense(payload: {
    title: string;
    amount: number;
    category: string;
    description: string;
    date: string;
    approvedBy?: string;
    createdBy?: string;
    receiptUrl?: string;
  }): Promise<{ message: string; expense: Expense }> {
    const res = await fetch(`${API_BASE}/expenses`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to add expense');
    return data;
  },

  async updateExpense(
    id: string,
    updates: Partial<Expense>
  ): Promise<{ message: string; expense: Expense }> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update expense');
    return data;
  },

  async deleteExpense(id: string): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/expenses/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to delete expense');
    return data;
  },

  // Settings
  async getSettings(): Promise<{ settings: CommunitySettings }> {
    const res = await fetch(`${API_BASE}/settings`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');
    return data;
  },

  async updateSettings(settings: Partial<CommunitySettings>): Promise<{ message: string; settings: CommunitySettings }> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to update settings');
    return data;
  },

  async resetDemoData(): Promise<{ message: string }> {
    const res = await fetch(`${API_BASE}/settings/reset-demo`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to reset demo');
    return data;
  },
};
