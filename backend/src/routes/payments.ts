import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM payments WHERE request_id = ?').all(req.params.requestId);
  res.json(rows);
});

router.post('/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { customerId, amount, baseFee, additionalTimeFee } = req.body;
  db.prepare('INSERT INTO payments (id, request_id, customer_id, amount, base_fee, additional_time_fee, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, req.params.requestId, customerId, amount, baseFee, additionalTimeFee || 0, 'pending', now
  );
  const pay = db.prepare('SELECT * FROM payments WHERE id = ?').get(id);
  res.status(201).json(pay);
});

export default router;
