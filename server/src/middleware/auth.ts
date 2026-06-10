import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    gender: string;
    paymentStatus: string;
  };
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: 'Access token required' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'whaatachi-secret') as any;
    
    // Fetch latest user details from DB to prevent stale JWT payload issues (e.g. ban, payment upgrade)
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id }
    });

    if (!dbUser) {
      return res.status(401).json({ error: 'User account not found or has been deleted' });
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      gender: dbUser.gender,
      paymentStatus: dbUser.paymentStatus,
    };
    
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

export const requireAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};
