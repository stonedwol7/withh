import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const customerId = req.query.customerId as string;
  let rows: any[];
  if (customerId) {
    rows = db.prepare('SELECT * FROM support_requests WHERE customer_id = ? ORDER BY created_at DESC').all(customerId);
  } else {
    rows = db.prepare('SELECT * FROM support_requests ORDER BY created_at DESC').all();
  }
  res.json(rows);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM support_requests WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(row);
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const r = req.body;
  db.prepare(`INSERT INTO support_requests (id, customer_id, who_needs_support, someone_else_name, someone_else_phone, someone_else_relationship, category, other_category_description, meeting_location, destination, date, time, duration, description, accessibility_needs, gender_preference, language_preference, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).run(
    id, r.customer_id, r.who_needs_support || 'me', r.someone_else_name || null, r.someone_else_phone || null, r.someone_else_relationship || null,
    r.category, r.other_category_description || null, r.meeting_location, r.destination, r.date, r.time, r.duration || 'under-2',
    r.description || '', r.accessibility_needs || '', r.gender_preference || 'no-preference', r.language_preference || 'no-preference',
    'submitted', now, now
  );
  const created = db.prepare('SELECT * FROM support_requests WHERE id = ?').get(id);
  res.status(201).json(created);
});

router.patch('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  const existing = db.prepare('SELECT * FROM support_requests WHERE id = ?').get(req.params.id) as any;
  if (!existing) { res.status(404).json({ error: 'Not found' }); return; }
  const fields = ['status', 'assigned_partner_id', 'match_id'];
  for (const f of fields) {
    if (req.body[f] !== undefined) {
      db.prepare(`UPDATE support_requests SET ${f} = ?, updated_at = ? WHERE id = ?`).run(req.body[f], now, req.params.id);
    }
  }
  const updated = db.prepare('SELECT * FROM support_requests WHERE id = ?').get(req.params.id);
  res.json(updated);
});

export default router;
