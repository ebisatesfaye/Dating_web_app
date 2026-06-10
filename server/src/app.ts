import express from 'express';
import cors from 'cors';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';
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

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dmafjwawt',
  api_key: process.env.CLOUDINARY_API_KEY || '111535793578121',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'lNw6Ykg77Ym8VNtUooj085uYbzo',
});

const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://192.168.1.9:3000',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    const isAllowed = allowedOrigins.includes(origin) ||
                      (process.env.CLIENT_URL && (process.env.CLIENT_URL === '*' || origin === process.env.CLIENT_URL || origin.endsWith('.vercel.app'))) ||
                      (process.env.FRONTEND_URL && (process.env.FRONTEND_URL === '*' || origin === process.env.FRONTEND_URL || origin.endsWith('.vercel.app')));
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', cors());
app.use(express.json());

// Serve uploaded profile photos as static files (legacy/fallback)
const uploadsDir = path.join(__dirname, '../../uploads/profiles');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(path.join(__dirname, '../../uploads')));

// Multer config — store in memory, allow images only
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (/^image\//i.test(file.mimetype)) cb(null, true);
    else cb(new Error('Only image files are allowed'));
  },
});

// Upload endpoint — uploads to Cloudinary and returns the public secure URL
app.post('/api/upload/photo', authenticateToken, upload.single('photo'), (req: any, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

  cloudinary.uploader.upload_stream(
    {
      folder: 'whaatachi_profiles',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET || 'qr_menu_uploads',
    },
    (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
      }
      res.json({ url: result?.secure_url });
    }
  ).end(req.file.buffer);
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
