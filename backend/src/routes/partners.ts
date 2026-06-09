import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const available = req.query.available as string;
  let rows: any[];
  if (available === 'true') {
    rows = db.prepare('SELECT * FROM support_partners WHERE available = 1 ORDER BY rating DESC').all();
  } else {
    rows = db.prepare('SELECT * FROM support_partners ORDER BY rating DESC').all();
  }
  res.json(rows);
});

router.get('/:id', (req: Request, res: Response) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM support_partners WHERE id = ?').get(req.params.id) as any;
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(row);
});

export default router;
