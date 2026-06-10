# WHAATACHI - SOFTWARE REQUIREMENTS SPECIFICATION
**Version 1.0 | Ethiopian Dating & Social Connection Platform**

---

## 1. EXECUTIVE SUMMARY

**Platform:** Whaatachi  
**Purpose:** Modern dating and social connection platform for Ethiopian users  
**Target Market:** Ethiopia (Telebirr/CBE Birr payment integration)  
**Pricing Model:** Men: 200 ETB (one-time), Women: Free  

---

## 2. SYSTEM OVERVIEW

### 2.1 Core Features
- User registration & profile management
- Advanced search & filtering
- Category-based matching (Relationship, Dating, FWB, Casual)
- Payment-gated contact revelation (women's contacts)
- Admin dashboard with analytics
- Mobile-responsive dark UI

### 2.2 User Roles
- **Guest:** Browse public profiles
- **Member (Male):** Paid access to all contacts
- **Member (Female):** Free access, limited view
- **Admin:** Full system management

---

## 3. FUNCTIONAL REQUIREMENTS

### FR-01: User Registration
```
- Fields: Full Name, Email, Phone, Password, Gender, Age, Location
- Email/Phone verification required
- Profile photo upload (mandatory)
- Social links: Telegram, Instagram (optional)
```

### FR-02: Profile Management
```
Public Fields (Visible to all):
- Name, Age, Gender, Location
- Profile Photo, Bio
- Relationship Preference
- Connection Category

Private Fields (Gated):
- Phone Number
- Telegram Username
- Instagram Username
- Email Address
```

### FR-03: Search & Browse
```
Filters:
- Gender preference
- Age range
- Location/City
- Relationship type
- Connection category
- Online status
```

### FR-04: Payment System
```
Payment Gateways:
- Telebirr integration
- CBE Birr integration
- Amount: 200 ETB (men only)
- One-time payment
- Auto-unlock women's contacts upon verification
```

### FR-05: Contact Revelation Logic
```
IF viewer_gender = 'male' AND profile_gender = 'female':
    REQUIRE payment_verification
    UNLOCK phone, telegram, instagram
ELSE:
    DISPLAY public_info_only
```

### FR-06: Admin Dashboard
```
Modules:
- User Management (approve/reject/delete)
- Payment Verification & Tracking
- Profile Moderation
- Fake Account Detection
- Analytics & Reports
- Revenue Management
- System Statistics
```

---

## 4. NON-FUNCTIONAL REQUIREMENTS

### NFR-01: Performance
```
- Page load time: < 3 seconds
- API response time: < 500ms
- Support 10,000 concurrent users
- Image optimization & lazy loading
```

### NFR-02: Security
```
- HTTPS/SSL encryption
- Password hashing (bcrypt)
- JWT token authentication
- SQL injection prevention
- XSS protection
- Rate limiting (100 req/min)
- GDPR-compliant data handling
```

### NFR-03: Scalability
```
- Cloud-native architecture
- Horizontal scaling capability
- CDN for static assets
- Database replication
```

### NFR-04: Availability
```
- 99.9% uptime SLA
- Automated backups (daily)
- Disaster recovery plan
- Multi-region deployment ready
```

---

## 5. DATABASE DESIGN (ERD)

### 5.1 Core Tables

```sql
-- Users Table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    gender ENUM('male', 'female', 'other') NOT NULL,
    is_verified BOOLEAN DEFAULT FALSE,
    payment_status ENUM('pending', 'paid', 'free') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Profiles Table
CREATE TABLE profiles (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    location VARCHAR(100) NOT NULL,
    city VARCHAR(50),
    bio TEXT,
    profile_photo_url VARCHAR(500),
    relationship_preference ENUM('relationship', 'dating', 'fwb', 'casual'),
    instagram_username VARCHAR(100),
    telegram_username VARCHAR(100),
    is_private_info_visible BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'ETB',
    payment_method ENUM('telebirr', 'cbe_birr') NOT NULL,
    transaction_id VARCHAR(255) UNIQUE,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Connections Table
CREATE TABLE connections (
    id UUID PRIMARY KEY,
    viewer_id UUID REFERENCES users(id),
    viewed_user_id UUID REFERENCES users(id),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(viewer_id, viewed_user_id)
);

-- Admin Logs Table
CREATE TABLE admin_logs (
    id UUID PRIMARY KEY,
    admin_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    details JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reports Table
CREATE TABLE reports (
    id UUID PRIMARY KEY,
    reporter_id UUID REFERENCES users(id),
    reported_user_id UUID REFERENCES users(id),
    reason VARCHAR(255) NOT NULL,
    status ENUM('pending', 'reviewed', 'resolved') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 5.2 Indexes
```sql
CREATE INDEX idx_profiles_location ON profiles(location);
CREATE INDEX idx_profiles_gender ON profiles(gender);
CREATE INDEX idx_profiles_preference ON profiles(relationship_preference);
CREATE INDEX idx_payments_user ON payments(user_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_connections_viewer ON connections(viewer_id);
```

---

## 6. SYSTEM ARCHITECTURE

### 6.1 Technology Stack
```
Frontend:
- React.js / Next.js 14+
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- React Query (data fetching)

Backend:
- Node.js / Express.js
- TypeScript
- PostgreSQL (primary DB)
- Redis (caching & sessions)
- JWT authentication

Storage:
- AWS S3 / Cloudinary (images)
- CDN: Cloudflare

Payments:
- Telebirr API
- CBE Birr API

Infrastructure:
- Docker containers
- Kubernetes orchestration
- AWS/Azure cloud
- Nginx reverse proxy
```

### 6.2 Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Web    │  │  Mobile  │  │   Admin  │              │
│  │  (Next)  │  │ (React)  │  │  Portal  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                        ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY                            │
│              (Nginx + Rate Limiting)                     │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                 APPLICATION LAYER                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │   Auth   │  │  Profile │  │ Payment  │              │
│  │ Service  │  │ Service  │  │ Service  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │  Search  │  │ Connection│  │  Admin   │              │
│  │ Service  │  │ Service  │  │ Service  │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────────┐
│                   DATA LAYER                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │PostgreSQL│  │  Redis   │  │   S3     │              │
│  │  (Main)  │  │ (Cache)  │  │(Storage) │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

---

## 7. API ENDPOINTS

### 7.1 Authentication
```
POST   /api/auth/register           - User registration
POST   /api/auth/login              - User login
POST   /api/auth/logout             - User logout
POST   /api/auth/verify-phone       - Phone verification
POST   /api/auth/forgot-password    - Password reset
POST   /api/auth/change-password    - Change password
GET    /api/auth/me                 - Get current user
```

### 7.2 Profiles
```
GET    /api/profiles                - Browse profiles (paginated)
GET    /api/profiles/:id            - Get profile details
POST   /api/profiles                - Create profile
PUT    /api/profiles/:id            - Update profile
DELETE /api/profiles/:id            - Delete profile
POST   /api/profiles/:id/photo      - Upload profile photo
GET    /api/profiles/me/contacts    - Get viewed contacts
```

### 7.3 Search
```
GET    /api/search                  - Advanced search
GET    /api/search/filters          - Get available filters
POST   /api/search/save             - Save search criteria
```

### 7.4 Payments
```
POST   /api/payments/initiate       - Initiate payment
POST   /api/payments/verify         - Verify payment (webhook)
GET    /api/payments/status         - Check payment status
GET    /api/payments/history        - Payment history
```

### 7.5 Connections
```
POST   /api/connections/view        - Record profile view
GET    /api/connections/unlocked    - Get unlocked contacts
DELETE /api/connections/:id         - Remove connection
```

### 7.6 Admin
```
GET    /api/admin/dashboard         - Dashboard stats
GET    /api/admin/users             - List all users
PUT    /api/admin/users/:id/verify  - Verify user
PUT    /api/admin/users/:id/ban     - Ban user
DELETE /api/admin/users/:id         - Delete user
GET    /api/admin/payments          - Payment reports
PUT    /api/admin/payments/:id/verify - Verify payment
GET    /api/admin/reports           - User reports
PUT    /api/admin/reports/:id       - Resolve report
GET    /api/admin/analytics         - Analytics data
```

---

## 8. PAYMENT PROCESS FLOW

### 8.1 Telebirr Integration
```
1. User initiates payment (200 ETB)
2. Backend creates payment record (status: pending)
3. Call Telebirr API to generate payment request
4. User receives USSD prompt on phone
5. User enters PIN to confirm
6. Telebirr sends webhook to /api/payments/verify
7. Backend verifies signature & amount
8. Update payment status to 'completed'
9. Update user.payment_status = 'paid'
10. Unlock women's contact details
11. Send confirmation email/SMS
```

### 8.2 CBE Birr Integration
```
Similar flow with CBE Birr API endpoints
Webhook verification required
Transaction ID validation
```

### 8.3 Payment Verification Code Structure
```typescript
interface PaymentVerification {
  transactionId: string;
  amount: number;
  currency: 'ETB';
  status: 'SUCCESS' | 'FAILED' | 'PENDING';
  timestamp: string;
  phoneNumber: string;
}

async function verifyPayment(
  paymentData: PaymentVerification
): Promise<boolean> {
  // Verify signature
  // Check amount matches 200 ETB
  // Validate transaction ID uniqueness
  // Update database
  // Unlock contacts
}
```

---

## 9. USE CASE DIAGRAMS

### UC-01: User Registration & Profile Creation
```
Actor: Guest
Precondition: None
Main Flow:
  1. Navigate to registration page
  2. Enter email, phone, password
  3. Verify phone via OTP
  4. Fill profile details (name, age, location, etc.)
  5. Upload profile photo
  6. Select relationship preference
  7. Submit profile
  8. Admin review (if required)
  9. Account activated
Postcondition: User can browse public profiles
```

### UC-02: Male User Payment & Contact Access
```
Actor: Male Member
Precondition: User is logged in, payment_status = 'pending'
Main Flow:
  1. Click on female profile
  2. Click "View Contact" button
  3. Select payment method (Telebirr/CBE Birr)
  4. Enter phone number
  5. Receive USSD prompt
  6. Enter PIN to pay 200 ETB
  7. System verifies payment
  8. Contact details revealed
  9. Payment recorded in history
Postcondition: user.payment_status = 'paid'
```

### UC-03: Profile Browsing & Search
```
Actor: Any User
Precondition: User is logged in
Main Flow:
  1. Navigate to browse page
  2. Apply filters (gender, age, location, preference)
  3. View profile cards
  4. Click profile for details
  5. View public information
  6. Request contact view (if applicable)
Postcondition: Connection record created
```

### UC-04: Admin Profile Approval
```
Actor: Admin
Precondition: Admin is logged in
Main Flow:
  1. View pending profiles queue
  2. Review profile details & photos
  3. Check for fake/inappropriate content
  4. Approve or reject
  5. If rejected, provide reason
  6. Notification sent to user
  7. Log action in admin_logs
Postcondition: Profile status updated
```

---

## 10. ACTIVITY DIAGRAMS

### AD-01: Contact Revelation Process
```
START
  ↓
[User clicks View Contact]
  ↓
{Viewer is Male AND Profile is Female?}
  ↓ YES
[Check Payment Status]
  ↓
{Payment Completed?}
  ↓ NO
[Initiate Payment Flow]
  ↓
[Select Payment Method]
  ↓
[Process 200 ETB Payment]
  ↓
{Payment Success?}
  ↓ YES
[Update Payment Status]
  ↓
[Unlock Contact Details]
  ↓
[Display Phone, Telegram, Instagram]
  ↓
[Record Connection]
  ↓
END

  ↓ NO (Already Paid)
[Display Contact Details]
  ↓
END

  ↓ NO (Viewing Male Profile)
[Display Public Info Only]
  ↓
END
```

### AD-02: User Registration Flow
```
START
  ↓
[Enter Registration Details]
  ↓
[Submit Form]
  ↓
{Validation Passed?}
  ↓ NO
[Show Error Messages]
  ↓
[Return to Form]
  ↓
  ↓ YES
[Send OTP to Phone]
  ↓
[Verify OTP]
  ↓
{OTP Valid?}
  ↓ NO
[Show Error]
  ↓
  ↓ YES
[Create User Account]
  ↓
[Redirect to Profile Setup]
  ↓
[Fill Profile Information]
  ↓
[Upload Profile Photo]
  ↓
[Submit Profile]
  ↓
{Admin Approval Required?}
  ↓ YES
[Set Status: Pending]
  ↓
[Show "Awaiting Approval"]
  ↓
  ↓ NO
[Set Status: Active]
  ↓
[Redirect to Dashboard]
  ↓
END
```

---

## 11. SECURITY REQUIREMENTS

### 11.1 Authentication & Authorization
```
- JWT tokens with 24-hour expiry
- Refresh token rotation
- Password requirements: 8+ chars, 1 number, 1 special char
- Account lockout after 5 failed attempts
- 2FA optional (SMS-based)
- Session management with Redis
```

### 11.2 Data Protection
```
- Encrypt PII at rest (AES-256)
- HTTPS everywhere (TLS 1.3)
- Secure cookie flags (HttpOnly, Secure, SameSite)
- No sensitive data in logs
- Regular security audits
- Penetration testing quarterly
```

### 11.3 API Security
```
- Rate limiting: 100 req/min per IP
- CORS whitelist (production domains only)
- Input validation & sanitization
- SQL injection prevention (parameterized queries)
- XSS protection (CSP headers)
- CSRF tokens for state-changing operations
```

### 11.4 Payment Security
```
- PCI DSS compliance
- Payment gateway signature verification
- Idempotency keys for payment requests
- Transaction amount validation
- Fraud detection algorithms
```

---

## 12. UI/UX DESIGN GUIDELINES

### 12.1 Design System
```
Colors:
- Primary: #FF1493 (Deep Pink)
- Secondary: #9333EA (Purple)
- Background: #0F0F0F (Dark)
- Surface: #1A1A1A (Card Background)
- Text Primary: #FFFFFF
- Text Secondary: #A0A0A0
- Success: #10B981
- Error: #EF4444
- Warning: #F59E0B

Typography:
- Font Family: Inter, sans-serif
- Headings: 24px, 32px, 40px (bold)
- Body: 16px (regular)
- Small: 14px (regular)

Spacing:
- Base unit: 8px
- Common: 8, 16, 24, 32, 48, 64px

Components:
- Buttons: Rounded (8px), padding 12px 24px
- Cards: Rounded (12px), shadow-lg
- Inputs: Rounded (6px), border-gray-700
- Modals: Centered, backdrop-blur
```

### 12.2 Responsive Breakpoints
```
- Mobile: 320px - 640px
- Tablet: 641px - 1024px
- Desktop: 1025px - 1440px
- Wide: 1441px+
```

### 12.3 Key UI Components
```
1. Hero Section
   - Full-width banner with CTA
   - Stats display (50K+ members, etc.)
   - Category selection cards

2. Profile Cards
   - Photo (aspect ratio 3:4)
   - Name, age, location
   - Relationship badge
   - Online indicator
   - "View Profile" button

3. Profile Detail Page
   - Large photo gallery
   - Public info section
   - Locked contact section (blur until paid)
   - Payment modal overlay

4. Payment Modal
   - Amount display (200 ETB)
   - Payment method selection
   - Phone number input
   - Confirmation button
   - Success/failure states

5. Admin Dashboard
   - Stats cards (users, revenue, etc.)
   - Charts (revenue over time)
   - User table with filters
   - Quick actions (approve, ban)
```

---

## 13. TESTING STRATEGY

### 13.1 Test Levels
```
Unit Testing:
- Jest for backend services
- React Testing Library for components
- Coverage target: 80%+

Integration Testing:
- API endpoint testing (Supertest)
- Database integration tests
- Payment gateway mock tests

E2E Testing:
- Cypress for critical user flows
- Registration → Payment → Contact view
- Admin approval workflow

Performance Testing:
- Load testing (1000 concurrent users)
- Stress testing (breaking point)
- API response time monitoring
```

### 13.2 Test Cases (Critical)
```
TC-001: User Registration Success
TC-002: User Registration Validation Fail
TC-003: Phone Verification OTP
TC-004: Profile Creation Complete
TC-005: Payment Initiation (Telebirr)
TC-006: Payment Verification Webhook
TC-007: Contact Unlock After Payment
TC-008: Free Contact View (Male Profile)
TC-009: Search with Multiple Filters
TC-010: Admin Profile Approval
TC-011: Fake Account Detection
TC-012: Payment History Retrieval
TC-013: Password Reset Flow
TC-014: Session Expiry & Refresh
TC-015: Rate Limiting Enforcement
```

---

## 14. DEPLOYMENT CONSIDERATIONS

### 14.1 Environment Setup
```
Development:
- Local Docker containers
- Hot reload enabled
- Mock payment gateway

Staging:
- Cloud deployment (AWS/Azure)
- Production-like config
- Real payment sandbox

Production:
- Multi-region deployment
- Auto-scaling (2-10 instances)
- CDN for static assets
- Database read replicas
- Redis cluster
```

### 14.2 CI/CD Pipeline
```yaml
# GitHub Actions Example
name: Deploy
on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - checkout
      - npm install
      - npm run test
      - npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - deploy to kubernetes
      - run database migrations
      - health check
```

### 14.3 Monitoring & Logging
```
Tools:
- Prometheus (metrics)
- Grafana (dashboards)
- ELK Stack (logs)
- Sentry (error tracking)
- Uptime monitoring (Pingdom)

Key Metrics:
- API response time (p95 < 500ms)
- Error rate (< 1%)
- Active users (real-time)
- Payment success rate
- Server CPU/Memory usage
```

### 14.4 Backup Strategy
```
Database:
- Daily automated backups
- Point-in-time recovery (7 days)
- Off-site backup storage

Files:
- S3 versioning enabled
- Cross-region replication

Disaster Recovery:
- RTO: 4 hours
- RPO: 1 hour
- Documented recovery procedures
```

---

## 15. FUTURE ENHANCEMENTS

### Phase 2 (3-6 months)
```
- Mobile apps (iOS/Android React Native)
- In-app messaging system
- Video call integration
- Advanced matching algorithm (AI-based)
- Profile verification badges
- Premium subscriptions (monthly)
- Event listings & meetups
```

### Phase 3 (6-12 months)
```
- Chatbot for user support
- Personality compatibility test
- Virtual gifts & reactions
- Story feature (24hr posts)
- Advanced analytics for users
- Referral program
- Multi-language support (Amharic, Oromo)
```

### Phase 4 (12+ months)
```
- Blockchain-based verification
- VR dating experiences
- AI-powered profile optimization
- Integration with social media APIs
- Partnership with venues/restaurants
- Expansion to other countries
```

---

## 16. APPENDICES

### A. Environment Variables Template
```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/whaatachi
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRY=24h
REFRESH_TOKEN_SECRET=your-refresh-secret

# AWS
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_BUCKET=whaatachi-uploads
AWS_REGION=us-east-1

# Payments
TELEBIRR_API_KEY=your-telebirr-key
TELEBIRR_MERCHANT_ID=your-merchant-id
CBE_BIRR_API_KEY=your-cbe-key
CBE_BIRR_SECRET=your-cbe-secret

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@whaatachi.com
SMTP_PASS=your-password

# App
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://whaatachi.com
API_URL=https://api.whaatachi.com

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=60000
RATE_LIMIT_MAX=100
```

### B. Package.json Scripts
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint . --ext .ts,.tsx",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "db:migrate": "prisma migrate dev",
    "db:seed": "ts-node prisma/seed.ts",
    "db:studio": "prisma studio"
  }
}
```

### C. Key Third-Party Services
```
- Payment: Telebirr API, CBE Birr API
- Storage: AWS S3 / Cloudinary
- Email: SendGrid / AWS SES
- SMS: Twilio / Local Ethiopian provider
- Analytics: Google Analytics, Mixpanel
- Monitoring: Sentry, Datadog
- CDN: Cloudflare
- Maps: Google Maps API (location)
```

---

## 17. PROJECT STRUCTURE

```
whaatachi/
├── client/                 # Next.js Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Next.js pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities & API clients
│   │   ├── styles/         # Global styles
│   │   └── types/          # TypeScript types
│   ├── public/             # Static assets
│   └── package.json
│
├── server/                 # Express Backend
│   ├── src/
│   │   ├── controllers/    # Route handlers
│   │   ├── services/       # Business logic
│   │   ├── models/         # Database models
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── routes/         # API routes
│   │   ├── utils/          # Helpers
│   │   └── config/         # Configuration
│   ├── prisma/             # Database schema
│   └── package.json
│
├── admin/                  # Admin Dashboard
│   └── (similar structure)
│
├── docker-compose.yml
├── README.md
└── docs/                   # Documentation
```

---


