import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { sendDailyReport } from '../services/email';

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

interface DbTxPlain {
  motorType: string;
  price: number;
}

interface DbEmployeeWithTx {
  name: string;
  transactions: DbTxPlain[];
}

export async function sendReport(req: Request, res: Response): Promise<void> {
  const date = (req.body.date as string) || today();

  const [txs, employees] = await Promise.all([
    prisma.transaction.findMany({ where: { date } }) as Promise<DbTxPlain[]>,
    prisma.employee.findMany({
      orderBy: { slot: 'asc' },
      include: { transactions: { where: { date } } },
    }),
  ]);

  const result = await sendDailyReport({
    date,
    totalTransactions: txs.length,
    totalRevenue: txs.reduce((s, t) => s + t.price, 0),
    kecilCount: txs.filter(t => t.motorType === 'kecil').length,
    sedangCount: txs.filter(t => t.motorType === 'sedang').length,
    besarCount: txs.filter(t => t.motorType === 'besar').length,
    kecilRevenue: txs.filter(t => t.motorType === 'kecil').reduce((s, t) => s + t.price, 0),
    sedangRevenue: txs.filter(t => t.motorType === 'sedang').reduce((s, t) => s + t.price, 0),
    besarRevenue: txs.filter(t => t.motorType === 'besar').reduce((s, t) => s + t.price, 0),
    employeeStats: (employees as DbEmployeeWithTx[]).map(e => ({
      employee_name: e.name,
      total_washed: e.transactions.length,
      total_revenue: (e.transactions as DbTxPlain[]).reduce((s, t) => s + t.price, 0),
    })),
  });

  if (result.success) {
    res.json({ message: result.message });
  } else {
    res.status(500).json({ error: result.message });
  }
}
