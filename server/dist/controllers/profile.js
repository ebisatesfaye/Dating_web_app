"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.getProfileById = exports.getProfiles = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const getProfiles = async (req, res) => {
    try {
        const { gender, location, preference, minAge, maxAge } = req.query;
        const whereClause = { isActive: true }; // Only approved profiles
        if (gender)
            whereClause.user = { gender: gender.toUpperCase() };
        if (location)
            whereClause.location = { contains: location, mode: 'insensitive' };
        if (preference)
            whereClause.relationshipPreference = preference.toUpperCase();
        // Age calculation
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
        // Don't show current user's profile
        if (req.user) {
            whereClause.userId = { not: req.user.id };
        }
        const profiles = await prisma.profile.findMany({
            where: whereClause,
            include: {
                user: {
                    select: { id: true, email: true, gender: true, paymentStatus: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Strip private info from the list
        const sanitizedProfiles = profiles.map((p) => {
            const isViewerPaidMale = req.user?.gender === 'MALE' && req.user?.paymentStatus === 'PAID';
            const isTargetFemale = p.user.gender === 'FEMALE';
            const shouldUnlock = isViewerPaidMale && isTargetFemale;
            return {
                ...p,
                telegramUsername: shouldUnlock ? p.telegramUsername : null,
                instagramUsername: shouldUnlock ? p.instagramUsername : null,
                user: { ...p.user, email: shouldUnlock ? p.user.email : null },
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
        const isViewerPaidMale = req.user?.gender === 'MALE' && req.user?.paymentStatus === 'PAID';
        const isTargetFemale = profile.user.gender === 'FEMALE';
        const isUnlocked = isOwner || (isViewerPaidMale && isTargetFemale) || req.user?.role === 'ADMIN';
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
            user: {
                ...profile.user,
                email: isUnlocked ? profile.user.email : null,
                phone: isUnlocked ? profile.user.phone : null,
            },
            isLocked: !isUnlocked && isTargetFemale && req.user?.gender === 'MALE',
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
        const { fullName, bio, location, city, profilePhotoUrl, relationshipPreference, telegramUsername, instagramUsername } = req.body;
        const profile = await prisma.profile.findUnique({ where: { id } });
        if (!profile)
            return res.status(404).json({ error: 'Profile not found' });
        if (profile.userId !== req.user?.id && req.user?.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized profile update' });
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
                // If profile details change, do we require re-approval? Let's keep existing status to be friendly but can reset:
                // isActive: req.user?.role === 'ADMIN' ? undefined : false,
            },
        });
        res.json(updatedProfile);
    }
    catch (error) {
        res.status(500).json({ error: error.message });
    }
};
exports.updateProfile = updateProfile;
