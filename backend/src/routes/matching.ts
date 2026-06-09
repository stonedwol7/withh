import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.get('/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM matches WHERE request_id = ? ORDER BY matched_at DESC').all(req.params.requestId);
  res.json(rows);
});

router.post('/:requestId/confirm', (req: Request, res: Response) => {
  const db = getDb();
  const now = new Date().toISOString();
  const { matchId } = req.body;
  db.prepare('UPDATE matches SET status = ?, confirmed_at = ?, customer_approved = ? WHERE id = ?').run('confirmed', now, 1, matchId);
  const match = db.prepare('SELECT * FROM matches WHERE id = ?').get(matchId) as any;
  if (match) {
    db.prepare('UPDATE support_requests SET status = ?, assigned_partner_id = ?, match_id = ?, updated_at = ? WHERE id = ?').run('matched', match.partner_id, matchId, now, match.request_id);
  }
  res.json(match);
});

// Generate matches for a request (AI matching simulation)
router.post('/generate/:requestId', (req: Request, res: Response) => {
  const db = getDb();
  const requestId = req.params.requestId;
  const request = db.prepare('SELECT * FROM support_requests WHERE id = ?').get(requestId) as any;
  if (!request) { res.status(404).json({ error: 'Request not found' }); return; }

  const partners = db.prepare('SELECT * FROM support_partners WHERE available = 1 ORDER BY rating DESC').all() as any[];
  const now = new Date().toISOString();
  const matches = [];
  const partnerCount = Math.min(partners.length, 3);
  for (let i = 0; i < partnerCount; i++) {
    const id = uuidv4();
    const reasons = [
      '${request.gender_preference === partners[i].gender ? "Gender preference matched" : "Best available match"}',
      partners[i].rating >= 4.8 ? 'Top-rated companion' : 'Experienced companion',
      partners[i].completed_journeys > 30 ? 'Highly experienced' : 'Reliable and available',
      'Available at requested time'
    ];
    db.prepare('INSERT INTO matches (id, request_id, partner_id, customer_id, status, matched_at, reason_for_match, customer_approved) VALUES (?, ?, ?, ?, ?, ?, ?, ?)').run(
      id, requestId, partners[i].id, request.customer_id, 'pending', now, JSON.stringify(reasons), 0
    );
    matches.push({ id, partnerId: partners[i].id, requestId, status: 'pending' });
  }
  db.prepare('UPDATE support_requests SET status = ?, updated_at = ? WHERE id = ?').run('awaiting-matching', now, requestId);
  res.status(201).json({ matches, requestId });
});

export default router;
