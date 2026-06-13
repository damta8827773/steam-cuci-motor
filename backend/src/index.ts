import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { initDatabase, prisma } from './config/database';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import employeeRoutes from './routes/employees';
import priceRoutes from './routes/prices';
import reportRoutes from './routes/reports';

const app = express();
const PORT = Number(process.env.PORT) || 3001;

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/prices', priceRoutes);
app.use('/api/reports', reportRoutes);

app.get('/api/health', (_req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));

async function main() {
  await prisma.$connect();
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`\n🚀 Steam Backend  : http://localhost:${PORT}`);
    console.log(`💧 Kasir Frontend : http://localhost:5173`);
    console.log(`❤️  Health check  : http://localhost:${PORT}/api/health\n`);
  });
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
