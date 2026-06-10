import { Response } from 'express';
import { PrismaClient, ReportStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();
const FEE_KEY = 'membership_fee_etb';

// Ensure default fee row exists
async function ensureFeeExists() {
  await prisma.settings.upsert({
    where:  { key: FEE_KEY },
    update: {},
    create: { key: FEE_KEY, value: '200' },
  });
}

export const getSettings = async (req: AuthRequest, res: Response) => {
  try {
    await ensureFeeExists();
    const row = await prisma.settings.findUnique({ where: { key: FEE_KEY } });
    res.json({ membershipFee: Number(row!.value) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPublicSettings = async (req: any, res: Response) => {
  try {
    await ensureFeeExists();
    const row = await prisma.settings.findUnique({ where: { key: FEE_KEY } });
    res.json({ membershipFee: Number(row!.value) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFee = async (req: AuthRequest, res: Response) => {
  try {
    const { amount } = req.body;
    if (!amount || isNaN(Number(amount)) || Number(amount) < 0) {
      return res.status(400).json({ error: 'Valid positive amount is required' });
    }
    const row = await prisma.settings.upsert({
      where:  { key: FEE_KEY },
      update: { value: String(amount) },
      create: { key: FEE_KEY, value: String(amount) },
    });
    await prisma.adminLog.create({
      data: { adminId: req.user!.id, action: 'UPDATE_MEMBERSHIP_FEE', entityType: 'SETTINGS', details: `Fee set to ${amount} ETB` },
    });
    res.json({ membershipFee: Number(row.value), message: 'Membership fee updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const maleUsers = await prisma.user.count({ where: { gender: 'MALE' } });
    const femaleUsers = await prisma.user.count({ where: { gender: 'FEMALE' } });
    const pendingApprovals = await prisma.profile.count({ where: { isActive: false } });
    
    const completedPayments = await prisma.payment.findMany({
      where: { status: 'COMPLETED' },
      select: { amount: true },
    });
    const totalRevenue = completedPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    const activeReports = await prisma.report.count({ where: { status: 'PENDING' } });

    res.json({
      totalUsers,
      maleUsers,
      femaleUsers,
      pendingApprovals,
      totalRevenue,
      activeReports,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPendingProfiles = async (req: AuthRequest, res: Response) => {
  try {
    const profiles = await prisma.profile.findMany({
      where: { isActive: false },
      include: {
        user: {
          select: { id: true, email: true, phone: true, gender: true },
        },
      },
      orderBy: { createdAt: 'asc' },
    });
    res.json(profiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveProfile = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { approve } = req.body; // true or false

    const profile = await prisma.profile.findUnique({ where: { id } });
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    if (approve) {
      await prisma.profile.update({
        where: { id },
        data: { isActive: true },
      });
      await prisma.adminLog.create({
        data: {
          adminId: req.user!.id,
          action: 'APPROVE_PROFILE',
          entityType: 'PROFILE',
          entityId: id,
        },
      });
      res.json({ message: 'Profile approved and is now active.' });
    } else {
      // Rejecting profile deletes it or keeps it inactive
      await prisma.profile.delete({ where: { id } });
      res.json({ message: 'Profile rejected and deleted.' });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id } });
    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        action: 'DELETE_USER',
        entityType: 'USER',
        entityId: id,
      },
    });
    res.json({ message: 'User deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getReports = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { email: true, profile: { select: { fullName: true } } } },
        reportedUser: { select: { email: true, profile: { select: { id: true, fullName: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createReport = async (req: AuthRequest, res: Response) => {
  try {
    const { reportedUserId, reason } = req.body;
    if (!reportedUserId || !reason) {
      return res.status(400).json({ error: 'Reported user ID and reason are required' });
    }

    const report = await prisma.report.create({
      data: {
        reporterId: req.user!.id,
        reportedUserId,
        reason,
        status: ReportStatus.PENDING,
      },
    });
    res.status(201).json(report);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const resolveReport = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    await prisma.report.update({
      where: { id },
      data: { status: ReportStatus.RESOLVED },
    });
    res.json({ message: 'Report marked as resolved.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        profile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getPayments = async (req: AuthRequest, res: Response) => {
  try {
    const payments = await prisma.payment.findMany({
      include: {
        user: {
          select: {
            email: true,
            phone: true,
            gender: true,
            profile: {
              select: { fullName: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const verifyPaymentAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body; // 'COMPLETED' or 'FAILED'

    const payment = await prisma.payment.findUnique({ where: { id } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        status,
        verifiedAt: status === 'COMPLETED' ? new Date() : null,
      },
    });

    if (status === 'COMPLETED') {
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          paymentStatus: 'PAID',
          isVerified: true,
        },
      });
    } else {
      await prisma.user.update({
        where: { id: payment.userId },
        data: {
          paymentStatus: 'PENDING',
        },
      });
    }

    await prisma.adminLog.create({
      data: {
        adminId: req.user!.id,
        action: `VERIFY_PAYMENT_${status}`,
        entityType: 'PAYMENT',
        entityId: id,
        details: `Payment status updated to ${status}`
      },
    });

    res.json({ message: `Payment verified as ${status}`, payment: updatedPayment });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

