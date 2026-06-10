"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = require("./middleware/auth");
const auth_2 = require("./controllers/auth");
const profile_1 = require("./controllers/profile");
const payment_1 = require("./controllers/payment");
const admin_1 = require("./controllers/admin");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
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
// Report Route (Regular Users)
app.post('/api/reports', auth_1.authenticateToken, admin_1.createReport);
// Health check
app.get('/health', (req, res) => res.json({ status: 'OK' }));
exports.default = app;
