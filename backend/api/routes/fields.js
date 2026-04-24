import express from 'express';
import { query } from '../lib/db.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { computeStatus } from '../lib/fieldStatus.js';

const router = express.Router();

const buildFieldResponse = (fieldRow) => {
  return {
    id: fieldRow.id,
    name: fieldRow.name,
    crop_type: fieldRow.crop_type,
    planting_date: fieldRow.planting_date,
    current_stage: fieldRow.current_stage,
    status: computeStatus(fieldRow, fieldRow.last_update_date),
    assigned_agent: fieldRow.agent_id ? {
      id: fieldRow.agent_id,
      name: fieldRow.agent_name,
      email: fieldRow.agent_email
    } : null,
    created_by: fieldRow.created_by,
    created_at: fieldRow.created_at,
    updated_at: fieldRow.updated_at,
    last_update_date: fieldRow.last_update_date || fieldRow.updated_at
  };
};

const baseQuery = `
  SELECT 
    f.*,
    u.id as agent_id, u.name as agent_name, u.email as agent_email,
    (SELECT MAX(created_at) FROM field_updates WHERE field_id = f.id) as last_update_date
  FROM fields f
  LEFT JOIN users u ON f.assigned_agent_id = u.id
`;

router.get('/', requireAuth, async (req, res) => {
  try {
    let result;
    if (req.user.role === 'admin') {
      result = await query(`${baseQuery} ORDER BY f.created_at DESC`);
    } else {
      result = await query(`${baseQuery} WHERE f.assigned_agent_id = $1 ORDER BY f.created_at DESC`, [req.user.id]);
    }
    
    res.json(result.rows.map(buildFieldResponse));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', requireAdmin, async (req, res) => {
  try {
    const { name, crop_type, planting_date, current_stage, assigned_agent_id } = req.body;
    
    const insertResult = await query(`
      INSERT INTO fields (name, crop_type, planting_date, current_stage, assigned_agent_id, created_by)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id
    `, [name, crop_type, planting_date, current_stage || 'planted', assigned_agent_id || null, req.user.id]);
    
    const newFieldId = insertResult.rows[0].id;
    const fetchResult = await query(`${baseQuery} WHERE f.id = $1`, [newFieldId]);
    res.status(201).json(buildFieldResponse(fetchResult.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', requireAuth, async (req, res) => {
  try {
    const result = await query(`${baseQuery} WHERE f.id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const field = result.rows[0];
    if (req.user.role === 'agent' && field.assigned_agent_id !== req.user.id) {
       return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(buildFieldResponse(field));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { name, crop_type, planting_date, current_stage, assigned_agent_id } = req.body;
    const updateResult = await query(`
      UPDATE fields SET 
        name = COALESCE($1, name),
        crop_type = COALESCE($2, crop_type),
        planting_date = COALESCE($3, planting_date),
        current_stage = COALESCE($4, current_stage),
        assigned_agent_id = $5,
        updated_at = NOW()
      WHERE id = $6
      RETURNING id
    `, [name, crop_type, planting_date, current_stage, assigned_agent_id, req.params.id]);

    if (updateResult.rows.length === 0) return res.status(404).json({ error: 'Not found' });

    const fetchResult = await query(`${baseQuery} WHERE f.id = $1`, [req.params.id]);
    res.json(buildFieldResponse(fetchResult.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const result = await query('DELETE FROM fields WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    res.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/:id/assign', requireAdmin, async (req, res) => {
  try {
    const { agent_id } = req.body;
    const result = await query(`
      UPDATE fields SET assigned_agent_id = $1, updated_at = NOW() WHERE id = $2 RETURNING id
    `, [agent_id || null, req.params.id]);

    if (result.rows.length === 0) return res.status(404).json({ error: 'Not found' });
    
    const fetchResult = await query(`${baseQuery} WHERE f.id = $1`, [req.params.id]);
    res.json(buildFieldResponse(fetchResult.rows[0]));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
