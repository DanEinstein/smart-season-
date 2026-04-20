import express from 'express';
import { query } from '../lib/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { computeStatus } from '../lib/fieldStatus.js';

const router = express.Router();

const getDashboardStats = async (agentId = null) => {
  const baseQuery = `
    SELECT 
      f.*,
      (SELECT MAX(created_at) FROM field_updates WHERE field_id = f.id) as last_update_date
    FROM fields f
  `;
  
  let fieldsResult;
  if (agentId) {
    fieldsResult = await query(`${baseQuery} WHERE assigned_agent_id = $1`, [agentId]);
  } else {
    fieldsResult = await query(baseQuery);
  }

  let total_fields = 0;
  let by_status = { active: 0, 'at-risk': 0, completed: 0 };
  let by_stage = { planted: 0, growing: 0, ready: 0, harvested: 0 };
  
  for (const f of fieldsResult.rows) {
     total_fields++;
     const status = computeStatus(f, f.last_update_date);
     if (by_status[status] !== undefined) by_status[status]++;
     if (by_stage[f.current_stage] !== undefined) by_stage[f.current_stage]++;
  }

  let updatesQuery = `
    SELECT u.*, f.name as field_name, us.name as agent_name
    FROM field_updates u
    JOIN fields f ON u.field_id = f.id
    JOIN users us ON u.updated_by = us.id
  `;
  let updateParams = [];
  
  if (agentId) {
    updatesQuery += ` WHERE f.assigned_agent_id = $1`;
    updateParams.push(agentId);
  }
  updatesQuery += ` ORDER BY u.created_at DESC LIMIT 10`;

  const updatesResult = await query(updatesQuery, updateParams);

  return {
    total_fields,
    by_status,
    by_stage,
    recent_updates: updatesResult.rows
  };
};

router.get('/admin', requireAdmin, async (req, res) => {
  try {
    const stats = await getDashboardStats(null);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/agent', requireAuth, async (req, res) => {
  try {
    if (req.user.role !== 'agent' && req.user.role !== 'admin') {
       return res.status(403).json({ error: 'Access denied' });
    }
    const stats = await getDashboardStats(req.user.id);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
