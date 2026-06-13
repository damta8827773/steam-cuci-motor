import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';

interface DbTx {
  id: number;
  employeeId: number;
  motorType: string;
  price: number;
  date: string;
  createdAt: Date;
  employee: { name: string };
}

interface DbTxPlain {
  id: number;
  employeeId: number;
  motorType: string;
  price: number;
  date: string;
  createdAt: Date;
}

const createSchema = z.object({
  employee_id: z.number().int().positive(),
  motor_type: z.enum(['kecil', 'sedang', 'besar']),
});

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function serializeTx(t: DbTx) {
  return {
    id: t.id,
    employee_id: t.employeeId,
    employee_name: t.employee.name,
    motor_type: t.motorType,
    price: t.price,
    date: t.date,
    created_at: t.createdAt,
  };
}

export async function createTransaction(req: Request, res: Response): Promise<void> {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Data tidak valid.', details: parsed.error.flatten() });
    return;
  }

  const { employee_id, motor_type } = parsed.data;

  const [employee, priceRow] = await Promise.all([
    prisma.employee.findUnique({ where: { id: employee_id } }),
    prisma.price.findUnique({ where: { type: motor_type } }),
  ]);

  if (!employee) { res.status(404).json({ error: 'Karyawan tidak ditemukan.' }); return; }
  if (!priceRow) { res.status(404).json({ error: 'Tipe motor tidak ditemukan.' }); return; }

  const tx = await prisma.transaction.create({
    data: { employeeId: employee_id, motorType: motor_type, price: priceRow.price, date: today() },
    include: { employee: true },
  });

  res.status(201).json({ transaction: serializeTx(tx as DbTx), message: 'Transaksi berhasil!' });
}

export async function getTodayTransactions(_req: Request, res: Response): Promise<void> {
  const txs = await prisma.transaction.findMany({
    where: { date: today() },
    include: { employee: true },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ transactions: (txs as DbTx[]).map(serializeTx), date: today() });
}

export async function getDailyStats(req: Request, res: Response): Promise<void> {
  const date = (req.query.date as string) || today();
  const txs = await prisma.transaction.findMany({ where: { date } }) as DbTxPlain[];

  res.json({
    stats: {
      total_transactions: txs.length,
      total_revenue: txs.reduce((s, t) => s + t.price, 0),
      kecil_count: txs.filter(t => t.motorType === 'kecil').length,
      sedang_count: txs.filter(t => t.motorType === 'sedang').length,
      besar_count: txs.filter(t => t.motorType === 'besar').length,
    },
    date,
  });
}

export async function getHourlyData(req: Request, res: Response): Promise<void> {
  const date = (req.query.date as string) || today();
  const txs = await prisma.transaction.findMany({ where: { date } }) as DbTxPlain[];

  const hourlyMap = new Map<number, number>();
  for (const tx of txs) {
    const h = new Date(tx.createdAt).getHours();
    hourlyMap.set(h, (hourlyMap.get(h) ?? 0) + 1);
  }

  res.json({
    hourly: Array.from({ length: 24 }, (_, h) => ({
      hour: h,
      label: `${String(h).padStart(2, '0')}:00`,
      count: hourlyMap.get(h) ?? 0,
    })),
    date,
  });
}

export async function getEmployeeStats(_req: Request, res: Response): Promise<void> {
  const date = today();
  const employees = await prisma.employee.findMany({
    orderBy: { slot: 'asc' },
    include: { transactions: { where: { date } } },
  }) as Array<{ id: number; name: string; transactions: DbTxPlain[] }>;

  res.json({
    stats: employees.map(e => ({
      employee_id: e.id,
      employee_name: e.name,
      total_washed: e.transactions.length,
      total_revenue: e.transactions.reduce((s, t) => s + t.price, 0),
    })),
    date,
  });
}

export async function getWeeklyData(_req: Request, res: Response): Promise<void> {
  const now = new Date();
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now);
    d.setDate(now.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });

  const txs = await prisma.transaction.findMany({
    where: { date: { in: dates } },
  }) as DbTxPlain[];

  res.json({
    weekly: dates.map(date => {
      const day = txs.filter(t => t.date === date);
      return {
        date,
        total_transactions: day.length,
        total_revenue: day.reduce((s, t) => s + t.price, 0),
      };
    }),
  });
}
