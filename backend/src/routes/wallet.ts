import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/:customerId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM wallet_transactions WHERE customer_id = ? ORDER BY created_at DESC').all(req.params.customerId) as any[];
  const balance = rows.length > 0 ? rows[0].balance_after : 0;
  res.json({ transactions: rows, balance });
});

router.post('/:customerId/topup', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { amount, description } = req.body;
  const lastTx = db.prepare('SELECT * FROM wallet_transactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.customerId) as any;
  const balanceAfter = (lastTx?.balance_after || 0) + amount;
  db.prepare('INSERT INTO wallet_transactions (id, customer_id, type, amount, balance_after, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    id, req.params.customerId, 'credit', amount, balanceAfter, description || 'Top-up', now
  );
  const tx = db.prepare('SELECT * FROM wallet_transactions WHERE id = ?').get(id);
  res.status(201).json(tx);
});

router.post('/:customerId/debit', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { amount, description, referenceId } = req.body;
  const lastTx = db.prepare('SELECT * FROM wallet_transactions WHERE customer_id = ? ORDER BY created_at DESC LIMIT 1').get(req.params.customerId) as any;
  const balanceAfter = (lastTx?.balance_after || 0) - amount;
  if (balanceAfter < 0) { res.status(400).json({ error: 'Insufficient balance' }); return; }
  db.prepare('INSERT INTO wallet_transactions (id, customer_id, type, amount, balance_after, description, reference_id, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, req.params.customerId, 'debit', amount, balanceAfter, description || 'Payment', referenceId || null, now
  );
  const tx = db.prepare('SELECT * FROM wallet_transactions WHERE id = ?').get(id);
  res.status(201).json(tx);
});

export default router;
