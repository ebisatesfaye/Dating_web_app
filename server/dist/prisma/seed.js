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
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcryptjs"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('Seeding database...');
    // Clean existing data
    await prisma.adminLog.deleteMany({});
    await prisma.report.deleteMany({});
    await prisma.connection.deleteMany({});
    await prisma.payment.deleteMany({});
    await prisma.profile.deleteMany({});
    await prisma.user.deleteMany({});
    const salt = await bcrypt.genSalt(10);
    const commonPasswordHash = await bcrypt.hash('Password123!', salt);
    const adminPasswordHash = await bcrypt.hash('AdminPassword123!', salt);
    // 1. Admin User
    const admin = await prisma.user.create({
        data: {
            email: 'admin@whaatachi.com',
            phone: '+251911123456',
            passwordHash: adminPasswordHash,
            gender: client_1.Gender.MALE,
            role: client_1.Role.ADMIN,
            isVerified: true,
            paymentStatus: client_1.PaymentStatus.FREE,
            profile: {
                create: {
                    fullName: 'System Admin',
                    dateOfBirth: new Date('1990-01-01'),
                    location: 'Addis Ababa',
                    city: 'Bole',
                    bio: 'Whaatachi system administrator account.',
                    isActive: true,
                    relationshipPreference: client_1.RelationshipPreference.RELATIONSHIP,
                },
            },
        },
    });
    console.log('Admin user seeded:', admin.email);
    // 2. Active Female Profiles (Free access)
    const female1 = await prisma.user.create({
        data: {
            email: 'jeru@whaatachi.com',
            phone: '+251922334455',
            passwordHash: commonPasswordHash,
            gender: client_1.Gender.FEMALE,
            role: client_1.Role.MEMBER,
            isVerified: true,
            paymentStatus: client_1.PaymentStatus.FREE,
            profile: {
                create: {
                    fullName: 'Jerusalem Abera',
                    dateOfBirth: new Date('2002-04-12'),
                    location: 'Addis Ababa',
                    city: 'Bole',
                    bio: 'Passionate about art, coffee, and good conversations. Let’s find something genuine!',
                    profilePhotoUrl: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=500',
                    relationshipPreference: client_1.RelationshipPreference.RELATIONSHIP,
                    telegramUsername: 'jeru_abera',
                    instagramUsername: 'jeru.abera',
                    isActive: true,
                },
            },
        },
    });
    const female2 = await prisma.user.create({
        data: {
            email: 'helen@whaatachi.com',
            phone: '+251933445566',
            passwordHash: commonPasswordHash,
            gender: client_1.Gender.FEMALE,
            role: client_1.Role.MEMBER,
            isVerified: true,
            paymentStatus: client_1.PaymentStatus.FREE,
            profile: {
                create: {
                    fullName: 'Helen Tesfaye',
                    dateOfBirth: new Date('2000-08-25'),
                    location: 'Hawassa',
                    city: 'Lake Side',
                    bio: 'Nature lover. I enjoy traveling and meeting new people. Let’s connect!',
                    profilePhotoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=500',
                    relationshipPreference: client_1.RelationshipPreference.DATING,
                    telegramUsername: 'helen_tesfaye',
                    isActive: true,
                },
            },
        },
    });
    const female3 = await prisma.user.create({
        data: {
            email: 'eden@whaatachi.com',
            phone: '+251944556677',
            passwordHash: commonPasswordHash,
            gender: client_1.Gender.FEMALE,
            role: client_1.Role.MEMBER,
            isVerified: true,
            paymentStatus: client_1.PaymentStatus.FREE,
            profile: {
                create: {
                    fullName: 'Eden Getachew',
                    dateOfBirth: new Date('2004-11-02'),
                    location: 'Bahir Dar',
                    city: 'Tana',
                    bio: 'Student at BDU. Simple, honest, and looking for friendship.',
                    profilePhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500',
                    relationshipPreference: client_1.RelationshipPreference.FWB,
                    instagramUsername: 'eden_getachew',
                    isActive: true,
                },
            },
        },
    });
    // 3. Pending Female Profiles (Awaiting Admin approval)
    const femalePending1 = await prisma.user.create({
        data: {
            email: 'selam@whaatachi.com',
            phone: '+251955667788',
            passwordHash: commonPasswordHash,
            gender: client_1.Gender.FEMALE,
            role: client_1.Role.MEMBER,
            isVerified: true,
            paymentStatus: client_1.PaymentStatus.FREE,
            profile: {
                create: {
                    fullName: 'Selam Kassa',
                    dateOfBirth: new Date('2001-02-14'),
                    location: 'Addis Ababa',
                    city: 'Sarbet',
                    bio: 'Dating with purpose. Talk to me if you are looking for long term relationship.',
                    profilePhotoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500',
                    relationshipPreference: client_1.RelationshipPreference.RELATIONSHIP,
                    telegramUsername: 'selam_kassa_new',
                    isActive: false, // Pending
                },
            },
        },
    });
    const femalePending2 = await prisma.user.create({
        data: {
            email: 'tigist@whaatachi.com',
            phone: '+251966778899',
            passwordHash: commonPasswordHash,
            gender: client_1.Gender.FEMALE,
            role: client_1.Role.MEMBER,
            isVerified: true,
            paymentStatus: client_1.PaymentStatus.FREE,
            profile: {
                create: {
                    fullName: 'Tigist Girma',
                    dateOfBirth: new Date('2003-09-30'),
                    location: 'Adama',
                    city: 'Melka Adama',
                    bio: 'Let’s enjoy life together! Seeking fun times and nice chats.',
                    profilePhotoUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500',
                    relationshipPreference: client_1.RelationshipPreference.CASUAL,
                    telegramUsername: 'tigi_girma',
                    isActive: false, // Pending
                },
            },
        },
    });
    // 4. Male Users (Pending Payment)
    const malePending = await prisma.user.create({
        data: {
            email: 'dawit@whaatachi.com',
            phone: '+251977889900',
            passwordHash: commonPasswordHash,
            gender: client_1.Gender.MALE,
            role: client_1.Role.MEMBER,
            isVerified: true,
            paymentStatus: client_1.PaymentStatus.PENDING,
            profile: {
                create: {
                    fullName: 'Dawit Abebe',
                    dateOfBirth: new Date('1998-05-18'),
                    location: 'Addis Ababa',
                    city: 'Megenagna',
                    bio: 'Engineer. Loves books, hikes, and exploring new cultures.',
                    profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500',
                    relationshipPreference: client_1.RelationshipPreference.RELATIONSHIP,
                    isActive: true,
                },
            },
        },
    });
    // 5. Male Users (Paid)
    const malePaid = await prisma.user.create({
        data: {
            email: 'elias@whaatachi.com',
            phone: '+251988990011',
            passwordHash: commonPasswordHash,
            gender: client_1.Gender.MALE,
            role: client_1.Role.MEMBER,
            isVerified: true,
            paymentStatus: client_1.PaymentStatus.PAID,
            profile: {
                create: {
                    fullName: 'Elias Kebede',
                    dateOfBirth: new Date('1999-12-10'),
                    location: 'Hawassa',
                    city: 'Piazza',
                    bio: 'Entrepreneur. Always looking for creative minds. Let’s grab a cup of coffee!',
                    profilePhotoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500',
                    relationshipPreference: client_1.RelationshipPreference.DATING,
                    isActive: true,
                },
            },
        },
    });
    console.log('Seeding completed successfully!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
