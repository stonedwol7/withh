import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/:partnerId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM partner_documents WHERE partner_id = ? ORDER BY uploaded_at DESC').all(req.params.partnerId);
  res.json(rows);
});

router.post('/:partnerId', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { type, filename } = req.body;
  db.prepare('INSERT INTO partner_documents (id, partner_id, type, filename, status, uploaded_at) VALUES (?, ?, ?, ?, ?, ?)').run(
    id, req.params.partnerId, type, filename, 'pending', now
  );
  const doc = db.prepare('SELECT * FROM partner_documents WHERE id = ?').get(id);
  res.status(201).json(doc);
});

router.patch('/:id/verify', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  db.prepare('UPDATE partner_documents SET status = ?, verified_at = ? WHERE id = ?').run('verified', now, req.params.id);
  const doc = db.prepare('SELECT * FROM partner_documents WHERE id = ?').get(req.params.id);
  res.json(doc);
});

export default router;
