import { Router, Request, Response } from 'express';
import { getDb } from '../db';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

router.post('/login', (req: Request, res: Response) => {
  const { role, userName } = req.body;
  if (!role || !userName) {
    res.status(400).json({ error: 'role and userName are required' });
    return;
  }
  const db = getDb();
  const id = uuidv4();
  const now = new Date().toISOString();
  db.prepare('INSERT INTO sessions (id, role, user_name, created_at) VALUES (?, ?, ?, ?)').run(id, role, userName, now);
  res.json({ session: { id, role, userName, createdAt: now } });
});

router.post('/logout', (req: Request, res: Response) => {
  const { sessionId } = req.body;
  if (!sessionId) {
    res.status(400).json({ error: 'sessionId required' });
    return;
  }
  const db = getDb();
  db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
  res.json({ success: true });
});

router.post('/register', (req: Request, res: Response) => {
  const { name, phone, email, role, gender, languages } = req.body;
  if (!name || !phone || !email || !role) {
    res.status(400).json({ error: 'name, phone, email, and role are required' });
    return;
  }
  const db = getDb();
  const now = new Date().toISOString();
  const id = uuidv4();

  if (role === 'customer') {
    db.prepare('INSERT INTO customers (id, name, phone, email, created_at) VALUES (?, ?, ?, ?, ?)').run(id, name, phone, email, now);
  } else if (role === 'partner') {
    const langs = languages ? JSON.stringify(languages) : '[]';
    db.prepare('INSERT INTO support_partners (id, name, phone, email, gender, languages, joined_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run(id, name, phone, email, gender || 'female', langs, now);
  }

  const sessionId = uuidv4();
  db.prepare('INSERT INTO sessions (id, role, user_name, created_at) VALUES (?, ?, ?, ?)').run(sessionId, role, name, now);
  res.json({ session: { id: sessionId, role, userName: name, createdAt: now }, userId: id });
});

router.get('/session/:id', (req: Request, res: Response) => {
  const db = getDb();
  const session = db.prepare('SELECT * FROM sessions WHERE id = ?').get(req.params.id) as any;
  if (!session) {
    res.status(404).json({ error: 'Session not found' });
    return;
  }
  res.json(session);
});

export default router;
