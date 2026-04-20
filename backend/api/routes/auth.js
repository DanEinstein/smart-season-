import express from 'express';
import { clerkClient } from '@clerk/clerk-sdk-node';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/sync', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or invalid token' });
    }

    const token = authHeader.split(' ')[1];
    const payload = await clerkClient.verifyToken(token);
    const clerk_id = payload.sub;

    const { name, email, role } = req.body;
    
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and email are required' });
    }

    const validRole = (role === 'admin' || role === 'agent') ? role : 'agent';

    const result = await query(`
      INSERT INTO users (clerk_id, name, email, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (clerk_id) DO UPDATE SET
        name = EXCLUDED.name,
        email = EXCLUDED.email
      RETURNING *
    `, [clerk_id, name, email, validRole]);

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/me', requireAuth, (req, res) => {
  res.json(req.user);
});

export default router;
