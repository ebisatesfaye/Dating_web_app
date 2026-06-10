"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const jwt = __importStar(require("jsonwebtoken"));
const prisma = new client_1.PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'whaatachi-secret';
const generateToken = (user) => {
    return jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role,
        gender: user.gender,
        paymentStatus: user.paymentStatus,
    }, JWT_SECRET, { expiresIn: '30d' });
};
const register = async (req, res) => {
    try {
        const { email, phone, password, gender, fullName, dateOfBirth, location, city, bio, profilePhotoUrl, relationshipPreference, telegramUsername, instagramUsername, } = req.body;
        if (!email || !phone || !password || !gender || !fullName || !dateOfBirth || !location || !relationshipPreference) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const existingUser = await prisma.user.findFirst({
            where: { OR: [{ email }, { phone }] },
        });
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email or phone already exists' });
        }
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        // Default payment status: female is FREE, male/other is PENDING
        const paymentStatus = gender.toUpperCase() === 'FEMALE' ? client_1.PaymentStatus.FREE : client_1.PaymentStatus.PENDING;
        const user = await prisma.user.create({
            data: {
                email,
                phone,
                passwordHash,
                gender: gender.toUpperCase(),
                paymentStatus,
                profile: {
                    create: {
                        fullName,
                        dateOfBirth: new Date(dateOfBirth),
                        location,
                        city,
                        bio,
                        profilePhotoUrl: profilePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=500',
                        relationshipPreference: relationshipPreference.toUpperCase(),
                        telegramUsername,
                        instagramUsername,
                        isActive: false, // requires admin approval
                    },
                },
            },
            include: { profile: true },
        });
        const token = generateToken(user);
        res.status(201).json({ token, user: { id: user.id, email: user.email, role: user.role, gender: user.gender, paymentStatus: user.paymentStatus, profile: user.profile } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password)
            return res.status(400).json({ error: 'Email and password are required' });
        const user = await prisma.user.findUnique({
            where: { email },
            include: { profile: true },
        });
        if (!user)
            return res.status(400).json({ error: 'Invalid email or password' });
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch)
            return res.status(400).json({ error: 'Invalid email or password' });
        const token = generateToken(user);
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, gender: user.gender, paymentStatus: user.paymentStatus, profile: user.profile } });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ error: 'Unauthorized' });
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { profile: true },
        });
        if (!user)
            return res.status(404).json({ error: 'User not found' });
        res.json({ id: user.id, email: user.email, role: user.role, gender: user.gender, paymentStatus: user.paymentStatus, profile: user.profile });
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getMe = getMe;
