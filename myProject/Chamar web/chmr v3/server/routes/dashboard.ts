import { Router, Request, Response } from 'express';
import { communityStore } from '../data/store';

const router = Router();

// GET /api/dashboard/stats
router.get('/stats', (req: Request, res: Response) => {
  try {
    const stats = communityStore.getStats();
    const allContributions = communityStore.getContributions();
    const verifiedContributions = allContributions.filter((c) => c.status === 'Verified');
    const pendingList = allContributions.filter((c) => c.status === 'Pending');
    const allExpenses = communityStore.getExpenses();

    // Category breakdown for expenses
    const categoryMap: Record<string, number> = {};
    for (const exp of allExpenses) {
      categoryMap[exp.category] = (categoryMap[exp.category] || 0) + exp.amount;
    }
    const categoryBreakdown = Object.entries(categoryMap).map(([name, value]) => ({
      category: name,
      amount: value,
      percentage: stats.totalExpenses > 0 ? Math.round((value / stats.totalExpenses) * 100) : 0,
    }));

    return res.json({
      success: true,
      stats,
      recentContributions: verifiedContributions.slice(0, 5),
      pendingContributionsList: pendingList.slice(0, 5),
      recentExpenses: allExpenses.slice(0, 5),
      categoryBreakdown,
      settings: communityStore.getSettings(),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch dashboard stats' });
  }
});

export default router;
