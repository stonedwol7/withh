import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/:partnerId', (req: Request, res: Response) => {
  const db = getDb();
  const { partnerId } = req.params;
  const slots = db.prepare('SELECT * FROM availability_slots WHERE partner_id = ? ORDER BY day_of_week, start_time').all(partnerId);
  res.json(slots);
});

router.post('/:partnerId', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { dayOfWeek, startTime, endTime, recurring, specificDate } = req.body;
  db.prepare('INSERT INTO availability_slots (id, partner_id, day_of_week, start_time, end_time, recurring, specific_date, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, req.params.partnerId, dayOfWeek, startTime, endTime, recurring ?? 1, specificDate || null, now
  );
  const slot = db.prepare('SELECT * FROM availability_slots WHERE id = ?').get(id);
  res.status(201).json(slot);
});

router.delete('/:slotId', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('DELETE FROM availability_slots WHERE id = ?').run(req.params.slotId);
  res.json({ success: true });
});

export default router;
