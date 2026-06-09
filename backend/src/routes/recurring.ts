import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/customer/:customerId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM recurring_bookings WHERE customer_id = ? AND active = 1 ORDER BY next_occurrence ASC').all(req.params.customerId);
  res.json(rows);
});

router.get('/partner/:partnerId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM recurring_bookings WHERE partner_id = ? AND active = 1 ORDER BY next_occurrence ASC').all(req.params.partnerId);
  res.json(rows);
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { originalRequestId, customerId, partnerId, frequency, dayOfWeek, dayOfMonth, startDate, endDate, nextOccurrence } = req.body;
  db.prepare('INSERT INTO recurring_bookings (id, original_request_id, customer_id, partner_id, frequency, day_of_week, day_of_month, start_date, end_date, next_occurrence, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, originalRequestId, customerId, partnerId || null, frequency, dayOfWeek || null, dayOfMonth || null, startDate, endDate || null, nextOccurrence, 1, now
  );
  const booking = db.prepare('SELECT * FROM recurring_bookings WHERE id = ?').get(id);
  res.status(201).json(booking);
});

router.patch('/:id/toggle', (req: Request, res: Response) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM recurring_bookings WHERE id = ?').get(req.params.id) as any;
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  db.prepare('UPDATE recurring_bookings SET active = ? WHERE id = ?').run(existing.active ? 0 : 1, req.params.id);
  const updated = db.prepare('SELECT * FROM recurring_bookings WHERE id = ?').get(req.params.id);
  res.json(updated);
});

export default router;
