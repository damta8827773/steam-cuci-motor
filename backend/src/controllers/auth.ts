import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const OWNER_EMAIL = process.env.OWNER_EMAIL;
const OWNER_PASSWORD = process.env.OWNER_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

if (!OWNER_EMAIL || !OWNER_PASSWORD || !JWT_SECRET) {
  throw new Error('Missing required env vars: OWNER_EMAIL, OWNER_PASSWORD, JWT_SECRET');
}
const BLOCKED_MESSAGE = 'Akses ditolak. Email tidak terdaftar sebagai pemilik.';

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Format email atau password tidak valid.' });
    return;
  }

  const { email, password } = parsed.data;

  if (email !== OWNER_EMAIL) {
    res.status(403).json({ error: BLOCKED_MESSAGE });
    return;
  }

  const isMatch = await bcrypt.compare(password, await bcrypt.hash(OWNER_PASSWORD, 10))
    .then(() => password === OWNER_PASSWORD);

  if (!isMatch) {
    res.status(401).json({ error: 'Password salah.' });
    return;
  }

  const token = jwt.sign(
    { email, role: 'owner' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    token,
    user: { email, role: 'owner' },
    message: 'Login berhasil. Selamat datang, Pemilik!',
  });
}

export function verifyToken(req: Request, res: Response): void {
  res.json({ user: req.user, valid: true });
}
