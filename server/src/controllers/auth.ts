import { Response } from 'express';
import { PrismaClient, Role, PaymentStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'whaatachi-secret';

const generateToken = (user: any) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      gender: user.gender,
      paymentStatus: user.paymentStatus,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
};

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const {
      email,
      phone,
      password,
      gender,
      fullName,
      dateOfBirth,
      location,
      city,
      bio,
      profilePhotoUrl,
      relationshipPreference,
      telegramUsername,
      instagramUsername,
      facebookUsername,
      whatsappNumber,
      tiktokUsername,
    } = req.body;

    if (!email || !password || !gender || !fullName || !location || !relationshipPreference) {
      return res.status(400).json({ error: 'Missing required fields: fullName, email, password, gender, location, relationshipPreference' });
    }

    // At least one contact method is required
    if (!phone && !telegramUsername && !instagramUsername) {
      return res.status(400).json({ error: 'At least one contact method is required: phone number, Telegram username, or Instagram username.' });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email },
          ...(phone ? [{ phone }] : []),
        ],
      },
    });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email or phone already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const paymentStatus = gender.toUpperCase() === 'FEMALE' ? PaymentStatus.FREE : PaymentStatus.PENDING;

    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        passwordHash,
        gender: gender.toUpperCase(),
        paymentStatus,
        profile: {
          create: {
            fullName,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            location,
            city,
            bio,
            profilePhotoUrl: profilePhotoUrl || null,
            relationshipPreference: relationshipPreference.toUpperCase(),
            telegramUsername: telegramUsername || null,
            instagramUsername: instagramUsername || null,
            facebookUsername: facebookUsername || null,
            whatsappNumber: whatsappNumber || null,
            tiktokUsername: tiktokUsername || null,
            isActive: false,
          },
        },
      },
      include: { profile: true },
    });

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, gender: user.gender, paymentStatus: user.paymentStatus, profile: user.profile } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });

    const user = await prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });
    if (!user) return res.status(400).json({ error: 'Invalid email or password' });

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) return res.status(400).json({ error: 'Invalid email or password' });

    const token = generateToken(user);
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, gender: user.gender, paymentStatus: user.paymentStatus, profile: user.profile } });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, email: user.email, role: user.role, gender: user.gender, paymentStatus: user.paymentStatus, profile: user.profile });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
