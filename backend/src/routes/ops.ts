import { Router, Request, Response } from 'express';
import { getDb } from '../db';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM operation_events ORDER BY timestamp DESC').all();
  res.json(rows);
});

router.get('/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM operation_events WHERE request_id = ? ORDER BY timestamp ASC').all(req.params.requestId);
  res.json(rows);
});

// Dashboard stats
router.get('/dashboard/stats', (req: Request, res: Response) => {
  const db = getDb();
  const totalRequests = (db.prepare('SELECT COUNT(*) as c FROM support_requests').get() as any).c;
  const activeSupports = (db.prepare("SELECT COUNT(*) as c FROM support_requests WHERE status IN ('partner-en-route','partner-arrived','in-progress')").get() as any).c;
  const pendingMatching = (db.prepare("SELECT COUNT(*) as c FROM support_requests WHERE status IN ('submitted','awaiting-matching','pending','confirmed')").get() as any).c;
  const completedToday = (db.prepare("SELECT COUNT(*) as c FROM support_requests WHERE status = 'completed' AND date(updated_at) = date('now')").get() as any).c;
  res.json({ totalRequests, activeSupports, pendingMatching, completedToday });
});

// Active supports (ops view)
router.get('/active-supports', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare("SELECT * FROM support_requests WHERE status IN ('partner-en-route','partner-arrived','in-progress','matched','confirmed') ORDER BY updated_at DESC").all();
  res.json(rows);
});

// Partner earnings
router.get('/earnings/:partnerId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM partner_earnings WHERE partner_id = ? ORDER BY created_at DESC').all(req.params.partnerId);
  res.json(rows);
});

// Finance records (ops view)
router.get('/finance/records', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM finance_records ORDER BY created_at DESC').all();
  res.json(rows);
});

// AI Analyses
router.get('/ai/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const row = db.prepare('SELECT * FROM ai_analyses WHERE request_id = ?').get(req.params.requestId) as any;
  if (!row) { res.status(404).json({ error: 'No analysis found' }); return; }
  row.tags = JSON.parse(row.tags);
  row.risk_flags = JSON.parse(row.risk_flags);
  res.json(row);
});

export default router;
