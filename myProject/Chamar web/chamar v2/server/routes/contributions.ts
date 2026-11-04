import { Router, Request, Response } from 'express';
import { communityStore } from '../data/store';

const router = Router();

// GET /api/contributions
// Query options: search, status, sortBy ('date' | 'amount'), sortOrder ('asc' | 'desc'), userId
router.get('/', (req: Request, res: Response) => {
  try {
    const { search, status, sortBy, sortOrder, userId } = req.query;

    const list = communityStore.getContributions({
      search: typeof search === 'string' ? search : undefined,
      status: typeof status === 'string' ? status : undefined,
      sortBy: sortBy === 'amount' ? 'amount' : 'date',
      sortOrder: sortOrder === 'asc' ? 'asc' : 'desc',
      userId: typeof userId === 'string' ? userId : undefined,
    });

    return res.json({
      success: true,
      count: list.length,
      contributions: list,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch contributions' });
  }
});

// GET /api/contributions/:id
router.get('/:id', (req: Request, res: Response) => {
  try {
    const item = communityStore.getContributionById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: 'Contribution record not found' });
    }
    return res.json({ success: true, contribution: item });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch contribution' });
  }
});

// POST /api/contributions
router.post('/', (req: Request, res: Response) => {
  try {
    const {
      name,
      mobile,
      amount,
      paymentMethod,
      transactionId,
      screenshot,
      note,
      userId,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full Name is required' });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ error: 'Mobile Number is required' });
    }
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount < 1) {
      return res.status(400).json({ error: 'Please enter a valid contribution amount' });
    }
    if (!transactionId || !transactionId.trim()) {
      return res.status(400).json({ error: 'Payment Reference / Transaction ID is required' });
    }

    // Check duplicate transaction ID
    const existingTxn = communityStore.contributions.find(
      (c) => c.transactionId.toLowerCase() === transactionId.trim().toLowerCase()
    );
    if (existingTxn) {
      return res.status(400).json({
        error: `A contribution with Transaction ID "${transactionId.trim()}" has already been submitted.`,
      });
    }

    const contribution = communityStore.addContribution({
      userId: userId || undefined,
      name: name.trim(),
      mobile: mobile.trim(),
      amount: parsedAmount,
      paymentMethod: paymentMethod || 'UPI',
      transactionId: transactionId.trim(),
      screenshot: screenshot || undefined,
      note: note ? note.trim() : undefined,
      status: 'Pending',
    });

    return res.status(201).json({
      success: true,
      message: 'Contribution submitted successfully. It will be verified by the committee shortly.',
      contribution,
      referenceId: contribution.referenceId,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to submit contribution' });
  }
});

// PATCH /api/contributions/:id/status
router.patch('/:id/status', (req: Request, res: Response) => {
  try {
    const { status, verifiedBy, rejectionReason } = req.body;

    if (!status || !['Pending', 'Verified', 'Rejected'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required (Pending, Verified, Rejected)' });
    }

    const updated = communityStore.updateContributionStatus(
      req.params.id,
      status,
      verifiedBy,
      rejectionReason
    );

    if (!updated) {
      return res.status(404).json({ error: 'Contribution not found' });
    }

    return res.json({
      success: true,
      message: `Contribution status updated to ${status}`,
      contribution: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update status' });
  }
});

export default router;
