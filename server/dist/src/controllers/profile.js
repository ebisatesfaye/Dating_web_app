"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfileById = exports.getProfiles = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProfiles = async (req, res) => {
    try {
        const { gender, location, preference, minAge, maxAge } = req.query;
        const whereClause = { isActive: true };
        if (gender)
            whereClause.user = { gender: gender.toUpperCase() };
        if (location)
            whereClause.location = { contains: location, mode: 'insensitive' };
        if (preference)
            whereClause.relationshipPreference = preference.toUpperCase();
        if (minAge || maxAge) {
            const now = new Date();
            const minDate = minAge ? new Date(now.getFullYear() - Number(minAge), now.getMonth(), now.getDate()) : undefined;
            const maxDate = maxAge ? new Date(now.getFullYear() - Number(maxAge) - 1, now.getMonth(), now.getDate()) : undefined;
            whereClause.dateOfBirth = {};
            if (minDate)
                whereClause.dateOfBirth.lte = minDate;
            if (maxDate)
                whereClause.dateOfBirth.gte = maxDate;
        }
        if (req.user) {
            whereClause.userId = { not: req.user.id };
        }
        const profiles = await prisma.profile.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, email: true, phone: true, gender: true, paymentStatus: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        const sanitizedProfiles = profiles.map((p) => {
            const isOwner = req.user?.id === p.userId;
            const isAdmin = req.user?.role === 'ADMIN';
            const isViewerPaid = req.user?.paymentStatus === 'PAID';
            const isViewerFemale = req.user?.gender === 'FEMALE';
            const isTargetMale = p.user.gender === 'MALE';
            const shouldUnlock = isOwner ||
                isAdmin ||
                isViewerPaid ||
                (isViewerFemale && isTargetMale);
            return {
                ...p,
                telegramUsername: shouldUnlock ? p.telegramUsername : null,
                instagramUsername: shouldUnlock ? p.instagramUsername : null,
                facebookUsername: shouldUnlock ? p.facebookUsername : null,
                whatsappNumber: shouldUnlock ? p.whatsappNumber : null,
                tiktokUsername: shouldUnlock ? p.tiktokUsername : null,
                user: {
                    ...p.user,
                    email: shouldUnlock ? p.user.email : null,
                    phone: shouldUnlock ? p.user.phone : null,
                },
            };
        });
        res.json(sanitizedProfiles);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProfiles = getProfiles;
const getProfileById = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = await prisma.profile.findUnique({
            where: { id },
            include: {
                user: {
                    select: { id: true, email: true, phone: true, gender: true, paymentStatus: true },
                },
            },
        });
        if (!profile)
            return res.status(404).json({ error: 'Profile not found' });
        const isOwner = req.user?.id === profile.userId;
        const isAdmin = req.user?.role === 'ADMIN';
        const isViewerPaid = req.user?.paymentStatus === 'PAID';
        const isViewerFemale = req.user?.gender === 'FEMALE';
        const isTargetMale = profile.user.gender === 'MALE';
        const isUnlocked = isOwner ||
            isAdmin ||
            isViewerPaid ||
            (isViewerFemale && isTargetMale);
        // Record view connection
        if (req.user && !isOwner) {
            await prisma.connection.upsert({
                where: {
                    viewerId_viewedUserId: {
                        viewerId: req.user.id,
                        viewedUserId: profile.userId,
                    },
                },
                update: { viewedAt: new Date() },
                create: {
                    viewerId: req.user.id,
                    viewedUserId: profile.userId,
                },
            });
        }
        const sanitized = {
            ...profile,
            telegramUsername: isUnlocked ? profile.telegramUsername : null,
            instagramUsername: isUnlocked ? profile.instagramUsername : null,
            facebookUsername: isUnlocked ? profile.facebookUsername : null,
            whatsappNumber: isUnlocked ? profile.whatsappNumber : null,
            tiktokUsername: isUnlocked ? profile.tiktokUsername : null,
            user: {
                ...profile.user,
                email: isUnlocked ? profile.user.email : null,
                phone: isUnlocked ? profile.user.phone : null,
            },
            isLocked: !isUnlocked,
        };
        res.json(sanitized);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.getProfileById = getProfileById;
const updateProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const { fullName, bio, location, city, profilePhotoUrl, relationshipPreference, telegramUsername, instagramUsername, facebookUsername, whatsappNumber, tiktokUsername, dateOfBirth, } = req.body;
        const profile = await prisma.profile.findUnique({ where: { id } });
        if (!profile)
            return res.status(404).json({ error: 'Profile not found' });
        if (profile.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized profile update' });
        }
        // Also update phone on User if provided
        if (req.body.phone !== undefined) {
            await prisma.user.update({
                where: { id: profile.userId },
                data: { phone: req.body.phone || null },
            });
        }
        const updatedProfile = await prisma.profile.update({
            where: { id },
            data: {
                fullName,
                bio,
                location,
                city,
                profilePhotoUrl,
                relationshipPreference,
                telegramUsername,
                instagramUsername,
                facebookUsername,
                whatsappNumber,
                tiktokUsername,
                dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
            },
        });
        res.json(updatedProfile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProfile = updateProfile;
