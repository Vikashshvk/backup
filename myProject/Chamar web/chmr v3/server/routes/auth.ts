import { Router, Request, Response } from 'express';
import { communityStore } from '../data/store';

const router = Router();

// Helper to sanitize user object
function sanitizeUser(user: any) {
  const { password, ...safeUser } = user;
  return safeUser;
}

// POST /api/auth/register
router.post('/register', (req: Request, res: Response) => {
  try {
    const { name, mobile, email, password, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Full Name is required' });
    }
    if (!mobile || !mobile.trim()) {
      return res.status(400).json({ error: 'Mobile Number is required' });
    }
    if (!password || password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    const cleanMobile = mobile.trim();
    const existing = communityStore.findUserByEmailOrMobile(cleanMobile);
    if (existing) {
      return res.status(400).json({ error: 'A member with this mobile number is already registered' });
    }

    // Assign role (default 'user', allows 'committee' or 'admin' for demo/admin creation)
    const assignedRole = role && ['user', 'committee', 'admin'].includes(role) ? role : 'user';

    const user = communityStore.createUser({
      name: name.trim(),
      mobile: cleanMobile,
      email: email ? email.trim() : undefined,
      password: password,
      role: assignedRole,
    });

    // In a production app, use jwt.sign. Here we provide a simple token
    const token = Buffer.from(JSON.stringify({ id: user._id, role: user.role })).toString('base64');

    return res.status(201).json({
      message: 'Registration successful',
      user: sanitizeUser(user),
      token,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Registration failed' });
  }
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ error: 'Please provide mobile/email and password' });
    }

    const user = communityStore.findUserByEmailOrMobile(identifier);
    if (!user) {
      return res.status(401).json({ error: 'No account found with this mobile or email' });
    }

    if (user.password !== password) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    const token = Buffer.from(JSON.stringify({ id: user._id, role: user.role })).toString('base64');

    return res.json({
      message: 'Login successful',
      user: sanitizeUser(user),
      token,
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const tokenStr = authHeader.replace('Bearer ', '');
    let decoded: any = {};
    try {
      decoded = JSON.parse(Buffer.from(tokenStr, 'base64').toString('utf-8'));
    } catch {
      return res.status(401).json({ error: 'Invalid authentication token' });
    }

    const user = communityStore.findUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({
      user: sanitizeUser(user),
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message || 'Failed to fetch user profile' });
  }
});

export default router;
