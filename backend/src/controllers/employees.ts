import { Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../config/database';

const updateSchema = z.object({
  name: z.string().min(1).max(50),
});

export async function getEmployees(_req: Request, res: Response): Promise<void> {
  const employees = await prisma.employee.findMany({ orderBy: { slot: 'asc' } });
  res.json({ employees });
}

export async function updateEmployee(req: Request, res: Response): Promise<void> {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) { res.status(400).json({ error: 'ID tidak valid.' }); return; }

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: 'Nama tidak valid.' }); return; }

  const existing = await prisma.employee.findUnique({ where: { id } });
  if (!existing) { res.status(404).json({ error: 'Karyawan tidak ditemukan.' }); return; }

  const updated = await prisma.employee.update({
    where: { id },
    data: { name: parsed.data.name },
  });

  res.json({ employee: updated, message: 'Nama karyawan berhasil diperbarui.' });
}
