import express from 'express';
import { query } from '../lib/db.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/agents', requireAdmin, async (req, res) => {
  try {
    const result = await query("SELECT id, name, email FROM users WHERE role = 'agent'");
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
