import express from 'express';
import cors from 'cors';
import { authenticateToken, requireAdmin } from './middleware/auth';
import { register, login, getMe } from './controllers/auth';
import { getProfiles, getProfileById, updateProfile } from './controllers/profile';
import { initiatePayment, verifyPayment, getPaymentHistory } from './controllers/payment';
import {
  getDashboardStats,
  getPendingProfiles,
  approveProfile,
  deleteUser,
  getReports,
  createReport,
  resolveReport,
  getSettings,
  updateFee,
  getPublicSettings,
} from './controllers/admin';

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://192.168.1.9:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json());

// Auth Routes
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, getMe);

// Profile Routes
app.get('/api/profiles', authenticateToken, getProfiles);
app.get('/api/profiles/:id', authenticateToken, getProfileById);
app.put('/api/profiles/:id', authenticateToken, updateProfile);

// Payment Routes
app.post('/api/payments/initiate', authenticateToken, initiatePayment);
app.post('/api/payments/verify', authenticateToken, verifyPayment);
app.get('/api/payments/history', authenticateToken, getPaymentHistory);

// Admin Routes
app.get('/api/admin/dashboard', authenticateToken, requireAdmin, getDashboardStats);
app.get('/api/admin/profiles/pending', authenticateToken, requireAdmin, getPendingProfiles);
app.post('/api/admin/profiles/:id/approve', authenticateToken, requireAdmin, approveProfile);
app.delete('/api/admin/users/:id', authenticateToken, requireAdmin, deleteUser);
app.get('/api/admin/reports', authenticateToken, requireAdmin, getReports);
app.put('/api/admin/reports/:id/resolve', authenticateToken, requireAdmin, resolveReport);
app.get('/api/admin/settings',            authenticateToken, requireAdmin, getSettings);
app.put('/api/admin/settings/fee',        authenticateToken, requireAdmin, updateFee);

// Report Route (Regular Users)
app.post('/api/reports', authenticateToken, createReport);

// Public settings
app.get('/api/settings', getPublicSettings);

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));

export default app;
