import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM ai_feedback WHERE request_id = ? ORDER BY created_at DESC').all(req.params.requestId);
  res.json(rows);
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { requestId, feedbackType, rating, correct, notes } = req.body;
  db.prepare('INSERT INTO ai_feedback (id, request_id, feedback_type, rating, correct, notes, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    id, requestId, feedbackType, rating || null, correct ?? 1, notes || null, now
  );
  const fb = db.prepare('SELECT * FROM ai_feedback WHERE id = ?').get(id);
  res.status(201).json(fb);
});

router.get('/stats/accuracy', (_req: Request, res: Response) => {
  const db = getDb();
  const total = (db.prepare('SELECT COUNT(*) as c FROM ai_feedback').get() as any).c;
  const correct = (db.prepare('SELECT COUNT(*) as c FROM ai_feedback WHERE correct = 1').get() as any).c;
  res.json({ total, correct, accuracy: total > 0 ? Math.round((correct / total) * 100) : 0 });
});

export default router;
