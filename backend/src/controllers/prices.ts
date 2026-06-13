import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';

const updateSchema = z.object({
  kecil: z.number().int().min(1000),
  sedang: z.number().int().min(1000),
  besar: z.number().int().min(1000),
});

export async function getPrices(_req: Request, res: Response): Promise<void> {
  const prices = await prisma.price.findMany({ orderBy: { id: 'asc' } });
  res.json({ prices });
}

export async function updatePrices(req: Request, res: Response): Promise<void> {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Harga tidak valid. Minimal Rp 1.000.' });
    return;
  }

  await prisma.$transaction([
    prisma.price.update({ where: { type: 'kecil' }, data: { price: parsed.data.kecil } }),
    prisma.price.update({ where: { type: 'sedang' }, data: { price: parsed.data.sedang } }),
    prisma.price.update({ where: { type: 'besar' }, data: { price: parsed.data.besar } }),
  ]);

  const prices = await prisma.price.findMany({ orderBy: { id: 'asc' } });
  res.json({ prices, message: 'Harga berhasil diperbarui.' });
}
