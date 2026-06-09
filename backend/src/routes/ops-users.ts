import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM ops_users ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM ops_users WHERE id = ?').get(req.params.id);
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(row);
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { name, email, role, permissions } = req.body;
  db.prepare('INSERT INTO ops_users (id, name, email, role, permissions, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    id, name, email, role || 'operator', JSON.stringify(permissions || []), 1, now
  );
  const user = db.prepare('SELECT * FROM ops_users WHERE id = ?').get(id);
  res.status(201).json(user);
});

router.patch('/:id/deactivate', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('UPDATE ops_users SET active = 0 WHERE id = ?').run(req.params.id);
  const user = db.prepare('SELECT * FROM ops_users WHERE id = ?').get(req.params.id);
  res.json(user);
});

export default router;
