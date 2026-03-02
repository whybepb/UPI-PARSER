import { Router } from 'express';
import { pool } from '../lib/db.js';

const router = Router();

router.post('/sync', async (req, res) => {
  const { userId, payload, cursor } = req.body;
  if (!userId || !payload || !cursor) return res.status(400).json({ error: 'Missing required fields' });

  await pool.query(
    `INSERT INTO encrypted_sync(id, user_id, payload, cursor) VALUES($1,$2,$3,$4)
     ON CONFLICT(id) DO UPDATE SET payload = EXCLUDED.payload, cursor = EXCLUDED.cursor`,
    [`${userId}:${cursor}`, userId, payload, cursor]
  );

  return res.json({ ok: true, cursor });
});

router.get('/restore', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });

  const result = await pool.query(
    'SELECT payload, cursor FROM encrypted_sync WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1',
    [userId]
  );

  return res.json({ ok: true, snapshot: result.rows[0] || null });
});

export default router;
