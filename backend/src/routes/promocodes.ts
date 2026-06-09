import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM promo_codes ORDER BY created_at DESC').all();
  res.json(rows);
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { code, discountType, discountValue, minAmount, maxUses, expiresAt } = req.body;
  db.prepare('INSERT INTO promo_codes (id, code, discount_type, discount_value, min_amount, max_uses, expires_at, active, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, code.toUpperCase(), discountType, discountValue, minAmount || 0, maxUses || 100, expiresAt || null, 1, now
  );
  const pc = db.prepare('SELECT * FROM promo_codes WHERE id = ?').get(id);
  res.status(201).json(pc);
});

router.post('/validate', (req: Request, res: Response) => {
  const db = getDb();
  const { code, amount } = req.body;
  const pc = db.prepare('SELECT * FROM promo_codes WHERE code = ? AND active = 1').get(code.toUpperCase()) as any;
  if (!pc) { res.status(404).json({ error: 'Invalid code' }); return; }
  if (pc.expires_at && new Date(pc.expires_at) < new Date()) { res.status(400).json({ error: 'Code expired' }); return; }
  if (pc.current_uses >= pc.max_uses) { res.status(400).json({ error: 'Usage limit reached' }); return; }
  if (amount < pc.min_amount) { res.status(400).json({ error: `Min order amount ₹${pc.min_amount}` }); return; }
  let discount = pc.discount_type === 'percentage' ? Math.round(amount * (pc.discount_value / 100)) : pc.discount_value;
  discount = Math.min(discount, amount);
  res.json({ valid: true, code: pc.code, discount, discountType: pc.discount_type, discountValue: pc.discount_value });
});

router.post('/:id/use', (req: Request, res: Response) => {
  const db = getDb();
  db.prepare('UPDATE promo_codes SET current_uses = current_uses + 1 WHERE id = ?').run(req.params.id);
  res.json({ success: true });
});

export default router;
