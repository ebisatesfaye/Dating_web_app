import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
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
  getUsers,
  getPayments,
  verifyPaymentAdmin,
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

// Serve uploaded profile photos as static files
const uploadsDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Multer config — store to disk, allow images only
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, unique);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Upload endpoint — returns the public URL
app.post('/api/upload/photo', authenticateToken, upload.single('photo'), (req: any, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `http://localhost:5000/uploads/profiles/${req.file.filename}`;
  res.json({ url });
});

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
app.get('/api/admin/users',               authenticateToken, requireAdmin, getUsers);
app.get('/api/admin/payments',            authenticateToken, requireAdmin, getPayments);
app.post('/api/admin/payments/:id/verify', authenticateToken, requireAdmin, verifyPaymentAdmin);

// Report Route (Regular Users)
app.post('/api/reports', authenticateToken, createReport);

// Public settings
app.get('/api/settings', getPublicSettings);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'OK' }));

export default app;
