import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const { customerId, partnerId } = req.query;
  let query = 'SELECT * FROM support_tickets';
  const params: string[] = [];
  if (customerId) { query += ' WHERE customer_id = ?'; params.push(customerId as string); }
  else if (partnerId) { query += ' WHERE partner_id = ?'; params.push(partnerId as string); }
  query += ' ORDER BY created_at DESC';
  const rows = db.prepare(query).all(...params);
  res.json(rows);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(req.params.id);
  if (!ticket) { res.status(404).json({ error: 'Not found' }); return; }
  const messages = db.prepare('SELECT * FROM ticket_messages WHERE ticket_id = ? ORDER BY timestamp ASC').all(req.params.id);
  res.json({ ticket, messages });
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { customerId, partnerId, subject, description } = req.body;
  db.prepare('INSERT INTO support_tickets (id, customer_id, partner_id, subject, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(
    id, customerId || null, partnerId || null, subject, description, 'open', now
  );
  const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(id);
  res.status(201).json(ticket);
});

router.post('/:id/messages', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { senderType, senderName, content } = req.body;
  db.prepare('INSERT INTO ticket_messages (id, ticket_id, sender_type, sender_name, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, req.params.id, senderType, senderName, content, now
  );
  db.prepare('UPDATE support_tickets SET status = ? WHERE id = ? AND status = ?').run('open', req.params.id, 'resolved');
  const msg = db.prepare('SELECT * FROM ticket_messages WHERE id = ?').get(id);
  res.status(201).json(msg);
});

router.patch('/:id/resolve', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE support_tickets SET status = ?, resolved_at = ? WHERE id = ?').run('resolved', now, req.params.id);
  const ticket = db.prepare('SELECT * FROM support_tickets WHERE id = ?').get(req.params.id);
  res.json(ticket);
});

export default router;
