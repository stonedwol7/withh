import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = Router();

function generateCode(): string {
  return crypto.randomBytes(4).toString('hex').toUpperCase().slice(0, 8);
}

router.get('/:referrerId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM referrals WHERE referrer_id = ? ORDER BY created_at DESC').all(req.params.referrerId);
  res.json(rows);
});

router.post('/', (req: Request, res: Response) => {
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  const { referrerId, referrerRole, referredEmail, referredPhone } = req.body;
  const code = generateCode();
  db.prepare('INSERT INTO referrals (id, referrer_id, referrer_role, referred_email, referred_phone, code, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
    id, referrerId, referrerRole, referredEmail || null, referredPhone || null, code, 'pending', now
  );
  const referral = db.prepare('SELECT * FROM referrals WHERE id = ?').get(id);
  res.status(201).json(referral);
});

router.post('/claim', (req: Request, res: Response) => {
  const db = getDb();
  const { code } = req.body;
  const referral = db.prepare('SELECT * FROM referrals WHERE code = ? AND status = ? AND reward_claimed = ?').get(code, 'completed', 0) as any;
  if (!referral) { res.status(404).json({ error: 'No claimable referral found' }); return; }
  const now = new Date().toISOString();
  db.prepare('UPDATE referrals SET reward_claimed = ?, claimed_at = ? WHERE id = ?').run(1, now, referral.id);
  res.json({ ...referral, reward_claimed: 1, claimed_at: now });
});

export default router;
