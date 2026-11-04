import { Router, Request, Response } from 'express';
import { communityStore } from '../data/store';

const router = Router();

// GET /api/expenses
router.get('/', (req: Request, res: Response) => {
  try {
    const list = communityStore.getExpenses();
    return res.json({
      success: true,
      count: list.length,
      expenses: list,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch expenses' });
  }
});

// POST /api/expenses
router.post('/', (req: Request, res: Response) => {
  try {
    const { title, amount, category, description, date, createdBy, receiptUrl } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Expense title is required' });
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount < 1) {
      return res.status(400).json({ error: 'Valid expense amount is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ error: 'Description is required' });
    }

    const expense = communityStore.addExpense({
      title: title.trim(),
      amount: parsedAmount,
      category: category || 'Community Welfare',
      description: description.trim(),
      date: date || new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
      createdBy: createdBy || 'Committee Treasurer',
      receiptUrl: receiptUrl || undefined,
    });

    return res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      expense,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to add expense' });
  }
});

// PUT /api/expenses/:id
router.put('/:id', (req: Request, res: Response) => {
  try {
    const { title, amount, category, description, date, receiptUrl } = req.body;

    const updates: any = {};
    if (title) updates.title = title.trim();
    if (amount) updates.amount = Number(amount);
    if (category) updates.category = category;
    if (description) updates.description = description.trim();
    if (date) updates.date = date;
    if (receiptUrl !== undefined) updates.receiptUrl = receiptUrl;

    const updated = communityStore.updateExpense(req.params.id, updates);
    if (!updated) {
      return res.status(404).json({ error: 'Expense record not found' });
    }

    return res.json({
      success: true,
      message: 'Expense updated successfully',
      expense: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update expense' });
  }
});

// DELETE /api/expenses/:id
router.delete('/:id', (req: Request, res: Response) => {
  try {
    const success = communityStore.deleteExpense(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Expense not found' });
    }
    return res.json({
      success: true,
      message: 'Expense deleted successfully',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to delete expense' });
  }
});

export default router;
