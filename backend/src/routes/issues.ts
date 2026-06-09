import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM issues ORDER BY created_at DESC').all();
  res.json(rows);
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { requestId, type, description } = req.body;
  db.prepare('INSERT INTO issues (id, request_id, type, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, requestId, type, description, 'open', now
  );
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(id);
  res.status(201).json(issue);
});

router.patch('/:id/resolve', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  const { resolution } = req.body;
  db.prepare('UPDATE issues SET status = ?, resolved_at = ?, resolution = ? WHERE id = ?').run('resolved', now, resolution, req.params.id);
  const issue = db.prepare('SELECT * FROM issues WHERE id = ?').get(req.params.id);
  res.json(issue);
});

export default router;
