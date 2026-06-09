import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM refunds ORDER BY created_at DESC').all();
  res.json(rows);
});

router.get('/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM refunds WHERE request_id = ? ORDER BY created_at DESC').all(req.params.requestId);
  res.json(rows);
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { requestId, customerId, amount, reason } = req.body;
  db.prepare('INSERT INTO refunds (id, request_id, customer_id, amount, reason, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    id, requestId, customerId, amount, reason, 'pending', now
  );
  const refund = db.prepare('SELECT * FROM refunds WHERE id = ?').get(id);
  res.status(201).json(refund);
});

router.patch('/:id/approve', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  const { approvedBy } = req.body;
  db.prepare('UPDATE refunds SET status = ?, approved_by = ?, approved_at = ? WHERE id = ?').run('approved', approvedBy, now, req.params.id);
  const refund = db.prepare('SELECT * FROM refunds WHERE id = ?').get(req.params.id);
  res.json(refund);
});

router.patch('/:id/reject', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE refunds SET status = ?, approved_at = ? WHERE id = ?').run('rejected', now, req.params.id);
  const refund = db.prepare('SELECT * FROM refunds WHERE id = ?').get(req.params.id);
  res.json(refund);
});

export default router;
