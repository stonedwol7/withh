import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM journey_messages WHERE request_id = ? ORDER BY timestamp ASC').all(req.params.requestId);
  res.json(rows);
});

router.post('/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { fromType, senderName, content } = req.body;
  db.prepare('INSERT INTO journey_messages (id, request_id, from_type, sender_name, content, timestamp) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, req.params.requestId, fromType, senderName, content, now
  );
  const msg = db.prepare('SELECT * FROM journey_messages WHERE id = ?').get(id);
  res.status(201).json(msg);
});

export default router;
