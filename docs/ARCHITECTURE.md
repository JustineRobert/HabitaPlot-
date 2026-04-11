# HabitaPlot™ - System Architecture & Design

**Version:** 1.0  
**Date:** April 11, 2026

---

## 🏗️ Overview

HabitaPlot™ follows a modern **three-tier microservices-ready architecture**:

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  React SPA (Mobile-Responsive, PWA-Ready)          │    │
│  │  - Property Listing Pages                          │    │
│  │  - Search & Filter Interface                       │    │
│  │  - User Auth & Profile                             │    │
│  │  - Admin Dashboard                                 │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS + JWT
┌──────────────────────────▼──────────────────────────────────┐
│                   API GATEWAY LAYER                          │
│  ┌─────────────────────────────────────────────────────┐    │
│  │  Express.js Server                                  │    │
│  │  - CORS & Security Headers                         │    │
│  │  - Rate Limiting & Throttling                      │    │
│  │  - Request Validation & Sanitization               │    │
│  │  - JWT Authentication Middleware                   │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────┬──────────────────────────────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ BUSINESS     │  │  CACHE       │  │ STORAGE      │
│ LOGIC LAYER  │  │  LAYER       │  │ LAYER        │
│              │  │              │  │              │
│ • User Mgmt  │  │ Redis:       │  │ PostgreSQL:  │
│ • Listings   │  │ • Sessions   │  │ • Users      │
│ • Payments   │  │ • Hot Data   │  │ • Listings   │
│ • Messaging  │  │ • Search     │  │ • Payments   │
│ • Admin Ops  │  │   Cache      │  │ • Messages   │
│              │  │              │  │              │
└──────────────┘  └──────────────┘  └──────────────┘
        │                                     │
        └─────────────────┬───────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  EXTERNAL    │  │  EXTERNAL    │  │  EXTERNAL    │
│  SERVICES    │  │  SERVICES    │  │  SERVICES    │
│              │  │              │  │              │
│ • AWS S3     │  │ • Stripe     │  │ • SendGrid   │
│ • File Uploads   │ • Payments      │ • Emails     │
│              │  │              │  │ • SMS        │
└──────────────┘  └──────────────┘  └──────────────┘
```

---

## 💾 Data Flow

### User Registration & Login Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. POST /auth/register
     │    {email, password, name}
     ▼
┌──────────────────────┐
│ Express Server       │
├──────────────────────┤
│ 1. Validate input    │
│ 2. Check email exists│
│ 3. Hash password     │
│ 4. Store user in DB  │
│ 5. Send verification │
│    email             │
├──────────────────────┤
│ 6. Return JWT token  │
└──────────────────────┘
     │
     │ Response: {token, userId}
     ▼
┌─────────┐
│ Client  │
│ Stores  │
│ Token   │
└─────────┘
```

### Property Listing Creation Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. POST /listings
     │    {title, type, price, images, location...}
     │    Header: Authorization: Bearer {token}
     ▼
┌──────────────────────────┐
│ Express Server           │
├──────────────────────────┤
│ 1. Verify JWT token      │
│ 2. Check user role       │
│ 3. Validate listing data │
│ 4. Upload images to S3   │
│ 5. Create listing in DB  │
│ 6. Cache in Redis        │
└──────────────────────────┘
     │
     │ Response: {listingId, status: 'pending_review'}
     ▼
┌─────────────────────────┐
│ Admin Dashboard Notified│
│ (Real-time via WebSocket)
└─────────────────────────┘
```

### Search & Filtering Flow

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. GET /listings/search?location=Lagos&district=Kampala&price_max=5000&type=house
     ▼
┌──────────────────────────┐
│ Express Server           │
├──────────────────────────┤
│ 1. Parse query params    │
│ 2. Check Redis cache     │
│ 3. If cached, return     │
│    (cache hit)           │
│ 4. If not, query         │
│    PostgreSQL with       │
│    indexed queries       │
│ 5. Cache result (30m TTL)│
│ 6. Return paginated      │
│    results               │
└──────────────────────────┘
     │
     │ Response: {listings: [...], total, page}
     ▼
┌─────────┐
│ Client  │
│ Renders │
│ Results │
└─────────┘
```

### Payment Flow (Stripe)

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. Select premium plan
     │ 2. Enter payment details
     ▼
┌──────────────────────────┐
│ Stripe.js (Client-side)  │
├──────────────────────────┤
│ Tokenize payment info    │
└──────────────────────────┘
     │
     │ 2. POST /payments/checkout
     │    {planId, paymentToken}
     ▼
┌──────────────────────────┐
│ Express Server           │
├──────────────────────────┤
│ 1. Verify user           │
│ 2. Call Stripe API       │
│ 3. Process charge        │
│ 4. Create subscription   │
│ 5. Update user in DB     │
│ 6. Send confirmation     │
└──────────────────────────┘
     │
     │ Response: {status: 'success', invoice_url}
```

### Payment Flow (Ugandan Mobile Money)

```
┌─────────┐
│ Client  │
└────┬────┘
     │ 1. Select MTN MoMo or Airtel Money
     │ 2. Enter local phone number
     │ 3. Confirm amount and description
     ▼
┌──────────────────────────┐
│ Express Server           │
├──────────────────────────┤
│ 1. Authenticate user     │
│ 2. Validate provider     │
│ 3. Create mobile money   │
│    request via provider  │
│ 4. Return transaction ID │
└──────────────────────────┘
     │
     │ 5. Client polls /verify
     │    {provider, transactionId}
     ▼
┌──────────────────────────┐
│ Provider API             │
├──────────────────────────┤
│ 1. Confirms payment      │
│ 2. Returns status        │
│ 3. Server updates DB     │
└──────────────────────────┘
```

     ▼
┌─────────┐
│ Client  │
│ Redirect│
│ Success │
└─────────┘
```

---

## 🗄️ Database Design

### Core Tables (PostgreSQL)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('guest', 'user', 'agent', 'admin') DEFAULT 'user',
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  verified_email BOOLEAN DEFAULT FALSE,
  verified_id BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Properties/Listings
CREATE TABLE listings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  type ENUM('plot', 'house', 'apartment', 'commercial', 'rental') NOT NULL,
  price DECIMAL(15,2) NOT NULL,
  price_negotiable BOOLEAN DEFAULT FALSE,
  description TEXT,
  location_address VARCHAR(500),
  location_latitude DECIMAL(9,6),
  location_longitude DECIMAL(9,6),
  size_sqft INT,
  bedrooms INT,
  bathrooms INT,
  amenities JSONB,
  status ENUM('active', 'sold', 'rented', 'deleted', 'pending_review') DEFAULT 'pending_review',
  featured_until TIMESTAMP,
  views_count INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_status (status),
  INDEX idx_type (type),
  INDEX idx_location (location_latitude, location_longitude),
  INDEX idx_price (price)
);

-- Listing Images
CREATE TABLE listing_images (
  id UUID PRIMARY KEY,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  image_url VARCHAR(500),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions & Payments
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_type ENUM('free', 'premium', 'featured') NOT NULL,
  status ENUM('active', 'cancelled', 'expired') DEFAULT 'active',
  stripe_subscription_id VARCHAR(255),
  stripe_customer_id VARCHAR(255),
  amount DECIMAL(10,2),
  billing_cycle_start TIMESTAMP,
  billing_cycle_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Messages/Inquiries
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users(id),
  receiver_id UUID REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_receiver (receiver_id),
  INDEX idx_listing (listing_id)
);

-- Favorites/Shortlist
CREATE TABLE favorites (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  listing_id UUID REFERENCES listings(id),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, listing_id)
);

-- Audit Logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR(255) NOT NULL,
  entity_type VARCHAR(100),
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔐 Security Layers

### Authentication & Authorization

```
┌─────────────────────────────┐
│ 1. JWT Token Generation     │
│   - Issued on login         │
│   - Expires in 24 hours     │
│   - Contains: userId, role  │
└─────────────────────────────┘
              ▼
┌─────────────────────────────┐
│ 2. Token Verification       │
│   - Decode and validate     │
│   - Check expiration        │
│   - Extract user ID         │
└─────────────────────────────┘
              ▼
┌─────────────────────────────┐
│ 3. RBAC Middleware          │
│   - Check user role         │
│   - Enforce permissions     │
│   - Return 403 if denied    │
└─────────────────────────────┘
              ▼
┌─────────────────────────────┐
│ 4. Request Processing       │
│   - Sanitize inputs         │
│   - Validate data           │
│   - Execute business logic  │
└─────────────────────────────┘
```

### Input Validation & Sanitization

- Email validation (RFC 5322)
- Password complexity requirements (8+ chars, uppercase, numbers)
- URL parameter sanitization
- SQL injection prevention (parameterized queries)
- XSS prevention (HTML escaping)

---

## 🚀 Scalability Design

### Horizontal Scaling

```
┌─────────────────────────────────────────┐
│  AWS Load Balancer (ALB)                │
└──────────────┬──────────────────────────┘
               │
   ┌───────────┼───────────┐
   │           │           │
   ▼           ▼           ▼
┌────────┐ ┌────────┐ ┌────────┐
│Express │ │Express │ │Express │
│Server 1│ │Server 2│ │Server N│
└────────┘ └────────┘ └────────┘
   │           │           │
   └───────────┼───────────┘
               │
        ┌──────▼───────┐
        │  PostgreSQL  │
        │  (Primary DB)│
        └──────────────┘
```

### Caching Strategy

- **Redis Cluster** for distributed caching
- Cache: User sessions, hot listings, search results
- TTL: 30 minutes for search results, 1 hour for user data
- Cache invalidation on updates

---

## 📊 API Architecture

### RESTful Endpoints Structure

```
/api/v1/
├── /auth
│   ├── POST /register
│   ├── POST /login
│   ├── POST /logout
│   └── POST /refresh-token
├── /listings
│   ├── GET /          (paginated, filterable)
│   ├── GET /:id       (single listing)
│   ├── POST /         (create, auth required)
│   ├── PATCH /:id     (update, auth required)
│   ├── DELETE /:id    (delete, auth required)
│   ├── GET /search    (advanced search)
│   └── GET /:id/images
├── /messages
│   ├── GET /          (user's messages)
│   ├── POST /         (send message)
│   └── PATCH /:id
├── /users
│   ├── GET /:id       (user profile)
│   ├── PATCH /:id     (update profile)
│   └── GET /:id/listings
├── /subscriptions
│   ├── GET /plans
│   ├── POST /checkout
│   ├── GET /status
│   └── POST /cancel
├── /favorites
│   ├── GET /
│   ├── POST /:listingId
│   └── DELETE /:listingId
└── /admin (protected by admin role)
    ├── /users
    ├── /listings
    ├── /subscriptions
    └── /analytics
```

---

## 🔄 Deployment Pipeline

```
┌─────────────┐
│ Git Commit  │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ GitHub Actions CI/CD │
├──────────────────────┤
│ 1. Run tests         │
│ 2. Build images      │
│ 3. Push to ECR       │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ AWS ECS Deployment   │
├──────────────────────┤
│ 1. Pull new images   │
│ 2. Update services   │
│ 3. Health checks     │
│ 4. Rollback on fail  │
└──────────────────────┘
           │
           ▼
┌──────────────────────┐
│ Production live      │
└──────────────────────┘
```

---

## 📈 Performance Optimization

| Strategy | Implementation |
|----------|----------------|
| **Database Indexing** | Indexes on status, type, price, location |
| **Query Optimization** | N+1 prevention, eager loading, pagination |
| **Caching** | Redis for sessions, search results, hot data |
| **CDN** | CloudFront for images, static assets |
| **Compression** | gzip for API responses |
| **Lazy Loading** | Images load on scroll, infinite pagination |
| **Code Splitting** | React route-based code splitting |
| **Rate Limiting** | 100 req/min for unauthenticated, 1000 for auth |

---

## 🛡️ Disaster Recovery

- **Database Backups:** Automated daily backups to S3
- **Replication:** PostgreSQL with read replicas
- **Failover:** Auto-failover for RDS
- **Monitoring:** CloudWatch alerts for critical metrics
- **Runbooks:** Documented incident response procedures

---

## 📝 Next Steps

1. ✅ Review architecture with team
2. ⏳ Implement database schema
3. ⏳ Set up backend API endpoints
4. ⏳ Build frontend components
5. ⏳ Integration testing
6. ⏳ Performance testing & optimization
7. ⏳ Security audit & penetration testing
8. ⏳ Production deployment

