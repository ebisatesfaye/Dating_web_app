"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const multer_1 = __importDefault(require("multer"));
const fs_1 = __importDefault(require("fs"));
const auth_1 = require("./middleware/auth");
const auth_2 = require("./controllers/auth");
const profile_1 = require("./controllers/profile");
const payment_1 = require("./controllers/payment");
const admin_1 = require("./controllers/admin");
const app = (0, express_1.default)();
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://192.168.1.9:3000',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        const isAllowed = allowedOrigins.includes(origin) ||
            (process.env.CLIENT_URL && (process.env.CLIENT_URL === '*' || origin === process.env.CLIENT_URL || origin.endsWith('.vercel.app')));
        if (isAllowed) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.options('*', (0, cors_1.default)());
app.use(express_1.default.json());
// Serve uploaded profile photos as static files
const uploadsDir = path_1.default.join(__dirname, '../../uploads/profiles');
if (!fs_1.default.existsSync(uploadsDir))
    fs_1.default.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../../uploads')));
// Multer config — store to disk, allow images only
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadsDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase() || '.jpg';
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
        cb(null, unique);
    },
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        if (/^image\//i.test(file.mimetype))
            cb(null, true);
        else
            cb(new Error('Only image files are allowed'));
    },
});
// Upload endpoint — returns the public URL
app.post('/api/upload/photo', auth_1.authenticateToken, upload.single('photo'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No file uploaded' });
    const host = process.env.BACKEND_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${host}/uploads/profiles/${req.file.filename}`;
    res.json({ url });
});
// Auth Routes
app.post('/api/auth/register', auth_2.register);
app.post('/api/auth/login', auth_2.login);
app.get('/api/auth/me', auth_1.authenticateToken, auth_2.getMe);
// Profile Routes
app.get('/api/profiles', auth_1.authenticateToken, profile_1.getProfiles);
app.get('/api/profiles/:id', auth_1.authenticateToken, profile_1.getProfileById);
app.put('/api/profiles/:id', auth_1.authenticateToken, profile_1.updateProfile);
// Payment Routes
app.post('/api/payments/initiate', auth_1.authenticateToken, payment_1.initiatePayment);
app.post('/api/payments/verify', auth_1.authenticateToken, payment_1.verifyPayment);
app.get('/api/payments/history', auth_1.authenticateToken, payment_1.getPaymentHistory);
// Admin Routes
app.get('/api/admin/dashboard', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.getDashboardStats);
app.get('/api/admin/profiles/pending', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.getPendingProfiles);
app.post('/api/admin/profiles/:id/approve', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.approveProfile);
app.delete('/api/admin/users/:id', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.deleteUser);
app.get('/api/admin/reports', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.getReports);
app.put('/api/admin/reports/:id/resolve', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.resolveReport);
app.get('/api/admin/settings', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.getSettings);
app.put('/api/admin/settings/fee', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.updateFee);
app.get('/api/admin/users', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.getUsers);
app.get('/api/admin/payments', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.getPayments);
app.post('/api/admin/payments/:id/verify', auth_1.authenticateToken, auth_1.requireAdmin, admin_1.verifyPaymentAdmin);
// Report Route (Regular Users)
app.post('/api/reports', auth_1.authenticateToken, admin_1.createReport);
// Public settings
app.get('/api/settings', admin_1.getPublicSettings);
// Health check
app.get('/health', (_req, res) => res.json({ status: 'OK' }));
exports.default = app;
