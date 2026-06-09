import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './db';
import authRoutes from './routes/auth';
import requestRoutes from './routes/requests';
import partnerRoutes from './routes/partners';
import matchingRoutes from './routes/matching';
import paymentRoutes from './routes/payments';
import messageRoutes from './routes/messages';
import issueRoutes from './routes/issues';
import opsRoutes from './routes/ops';
import refundRoutes from './routes/refunds';
import availabilityRoutes from './routes/availability';
import referralRoutes from './routes/referrals';
import recurringRoutes from './routes/recurring';
import walletRoutes from './routes/wallet';
import aiFeedbackRoutes from './routes/ai-feedback';
import promocodesRoutes from './routes/promocodes';
import opsUsersRoutes from './routes/ops-users';
import documentRoutes from './routes/documents';
import ticketRoutes from './routes/tickets';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

initializeDatabase();

app.use('/api/auth', authRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/matching', matchingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/issues', issueRoutes);
app.use('/api/ops', opsRoutes);
app.use('/api/refunds', refundRoutes);
app.use('/api/availability', availabilityRoutes);
app.use('/api/referrals', referralRoutes);
app.use('/api/recurring', recurringRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/ai-feedback', aiFeedbackRoutes);
app.use('/api/promocodes', promocodesRoutes);
app.use('/api/ops-users', opsUsersRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 WITHH Backend API running on http://localhost:${PORT}`);
  });
}

export default app;
