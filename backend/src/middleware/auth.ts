import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? '';

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Akses ditolak. Token tidak ditemukan.' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { email: string; role: 'owner' };
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid atau sudah kadaluarsa.' });
  }
}
