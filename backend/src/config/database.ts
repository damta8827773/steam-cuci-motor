import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});

export async function initDatabase(): Promise<void> {
  const employeeCount = await prisma.employee.count();

  if (employeeCount === 0) {
    const defaultEmployees = [
      'Karyawan 1', 'Karyawan 2', 'Karyawan 3', 'Karyawan 4',
      'Karyawan 5', 'Karyawan 6', 'Karyawan 7',
    ];
    await prisma.employee.createMany({
      data: defaultEmployees.map((name, i) => ({ name, slot: i + 1 })),
    });
    console.log('✅ 7 karyawan default dibuat');
  }

  const priceCount = await prisma.price.count();

  if (priceCount === 0) {
    await prisma.price.createMany({
      data: [
        { type: 'kecil', price: 18000 },
        { type: 'sedang', price: 20000 },
        { type: 'besar', price: 25000 },
      ],
    });
    console.log('✅ Harga default dibuat (18k/20k/25k)');
  }
}
