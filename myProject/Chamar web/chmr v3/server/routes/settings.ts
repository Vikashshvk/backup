import { Router, Request, Response } from 'express';
import { communityStore } from '../data/store';

const router = Router();

// GET /api/settings
router.get('/', (req: Request, res: Response) => {
  try {
    const settings = communityStore.getSettings();
    return res.json({ success: true, settings });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch settings' });
  }
});

// PUT /api/settings
router.put('/', (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const updated = communityStore.updateSettings(updates);
    return res.json({
      success: true,
      message: 'Community fund settings updated successfully',
      settings: updated,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to update settings' });
  }
});

// POST /api/settings/reset-demo
router.post('/reset-demo', (req: Request, res: Response) => {
  try {
    communityStore.resetToDefault();
    return res.json({
      success: true,
      message: 'Data successfully restored to demo baseline',
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to reset demo data' });
  }
});

export default router;
