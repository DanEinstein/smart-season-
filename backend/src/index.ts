import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { ClerkExpressRequireAuth, RequireAuthProp, StrictAuthProp } from '@clerk/clerk-sdk-node';
import { query } from './db.js';

declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

const app = express();
app.use(cors());
app.use(express.json());

app.use(ClerkExpressRequireAuth({}));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err.message === 'Unauthenticated') {
     res.status(401).json({ error: 'Unauthenticated!' });
  } else {
     next(err);
  }
});

app.get('/api/summary', async (req, res) => {
  try {
    const [totalFieldsRes, activeRes, atRiskRes, completedRes] = await Promise.all([
      query('SELECT COUNT(*) FROM fields'),
      query('SELECT COUNT(*) FROM fields WHERE status = $1', ['Active']),
      query('SELECT COUNT(*) FROM fields WHERE status = $1', ['At Risk']),
      query('SELECT COUNT(*) FROM fields WHERE status = $1', ['Completed'])
    ]);

    const stats = {
      totalFields: parseInt(totalFieldsRes.rows[0].count, 10),
      active: parseInt(activeRes.rows[0].count, 10),
      atRisk: parseInt(atRiskRes.rows[0].count, 10),
      completed: parseInt(completedRes.rows[0].count, 10)
    };

    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/fields', async (req, res) => {
  try {
    const { status, stage } = req.query;
    let text = 'SELECT * FROM fields';
    let params: any[] = [];
    let clauses: string[] = [];
    
    if (status) {
      params.push(status);
      clauses.push(`status = $${params.length}`);
    }
    if (stage) {
      params.push(stage);
      clauses.push(`stage = $${params.length}`);
    }

    if (clauses.length > 0) {
      text += ' WHERE ' + clauses.join(' AND ');
    }

    text += ' ORDER BY created_at DESC';

    const result = await query(text, params);
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/fields/:id', async (req, res) => {
  try {
    const result = await query('SELECT * FROM fields WHERE id = $1', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Field not found' });
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fields', async (req, res) => {
  try {
    const { name, crop, agent_name, stage, status, size_hectares, alert_type } = req.body;

    const agent_id = req.auth.userId;

    const result = await query(
      `INSERT INTO fields (name, crop, agent_id, agent_name, stage, status, size_hectares, alert_type)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [name, crop, agent_id, agent_name || agent_id, stage || 'Planted', status || 'Active', size_hectares || null, alert_type || null]
    );

    await query(`INSERT INTO activity_logs (field_id, title, description, activity_type) VALUES ($1, $2, $3, $4)`,
        [result.rows[0].id, 'New Field Registered', `${name} added to portfolio.`, 'success']
    );

    res.status(201).json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/fields/:id', async (req, res) => {
  try {
    const { name, crop, stage, status, size_hectares, alert_type } = req.body;
    const { id } = req.params;

    const result = await query(
      `UPDATE fields SET 
        name = COALESCE($1, name), 
        crop = COALESCE($2, crop), 
        stage = COALESCE($3, stage), 
        status = COALESCE($4, status), 
        size_hectares = COALESCE($5, size_hectares), 
        alert_type = COALESCE($6, alert_type),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $7 RETURNING *`,
      [name, crop, stage, status, size_hectares, alert_type, id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: 'Field not found' });
    res.json(result.rows[0]);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/fields/:id', async (req, res) => {
  try {
    const result = await query('DELETE FROM fields WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Field not found' });
    res.json({ message: 'Field deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/activities', async (req, res) => {
  try {
    const result = await query('SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10');
    res.json(result.rows);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default app;
