import express from 'express';
import { query } from '../lib/db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/', requireAuth, async (req, res) => {
  try {
    const { id } = req.params; // field_id

    const fieldResult = await query('SELECT assigned_agent_id FROM fields WHERE id = $1', [id]);
    if (fieldResult.rows.length === 0) return res.status(404).json({ error: 'Field not found' });
    if (req.user.role === 'agent' && fieldResult.rows[0].assigned_agent_id !== req.user.id) {
       return res.status(403).json({ error: 'Access denied' });
    }

    const updates = await query('SELECT * FROM field_updates WHERE field_id = $1 ORDER BY created_at DESC', [id]);
    res.json(updates.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { stage, notes } = req.body;

    const fieldResult = await query('SELECT assigned_agent_id FROM fields WHERE id = $1', [id]);
    if (fieldResult.rows.length === 0) return res.status(404).json({ error: 'Field not found' });
    if (req.user.role === 'agent' && fieldResult.rows[0].assigned_agent_id !== req.user.id) {
       return res.status(403).json({ error: 'Access denied' });
    }

    const updateResult = await query(`
      INSERT INTO field_updates (field_id, updated_by, stage, notes)
      VALUES ($1, $2, $3, $4) RETURNING *
    `, [id, req.user.id, stage, notes]);

    await query(`
      UPDATE fields SET current_stage = $1, updated_at = NOW() WHERE id = $2
    `, [stage, id]);

    res.status(201).json(updateResult.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
