import { clerkClient } from '@clerk/clerk-sdk-node';
import { query } from '../lib/db.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];

    const payload = await clerkClient.verifyToken(token);

    const userResult = await query('SELECT * FROM users WHERE clerk_id = $1', [payload.sub]);
    
    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User record not found in database. Please sync.' });
    }
    
    req.user = userResult.rows[0];
    next();
  } catch (error) {
    console.error('Auth verification error:', error);
    res.status(401).json({ error: 'Unauthenticated' });
  }
};

export const requireAdmin = async (req, res, next) => {
  await requireAuth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden: Admin access required' });
    }
    next();
  });
};
