# HabitaPlot™ - Database Schema & ERD

**Version:** 1.0  
**Database:** PostgreSQL 14+  
**Date:** April 11, 2026

---

## 🗄️ Entity Relationship Diagram (ERD)

```
┌──────────────────────┐
│       USERS          │
├──────────────────────┤
│ id (PK)              │
│ email (UNIQUE)       │
│ password_hash        │
│ name                 │
│ role (ENUM)          │
│ phone                │
│ avatar_url           │
│ verified_email       │
│ verified_id          │
│ created_at           │
│ updated_at           │
└──────────────────────┘
        │
        │ 1:N
        ├─────────────────────────────────────┐
        │                                     │
        ▼                                     ▼
┌──────────────────────┐          ┌──────────────────────┐
│     LISTINGS         │          │      MESSAGES        │
├──────────────────────┤          ├──────────────────────┤
│ id (PK)              │          │ id (PK)              │
│ user_id (FK)         │          │ sender_id (FK)       │
│ title                │          │ receiver_id (FK)     │
│ type (ENUM)          │          │ listing_id (FK)      │
│ price                │          │ content              │
│ price_negotiable     │          │ is_read              │
│ description          │          │ created_at           │
│ location_address     │          └──────────────────────┘
│ location_latitude    │
│ location_longitude   │
│ size_sqft            │
│ bedrooms             │
│ bathrooms            │
│ amenities (JSONB)    │
│ status (ENUM)        │
│ featured_until       │
│ views_count          │
│ created_at           │
│ updated_at           │
└──────────────────────┘
        │
        │ 1:N
        ▼
┌──────────────────────┐
│  LISTING_IMAGES      │
├──────────────────────┤
│ id (PK)              │
│ listing_id (FK)      │
│ image_url            │
│ is_primary           │
│ created_at           │
└──────────────────────┘

┌──────────────────────┐          ┌──────────────────────┐
│  SUBSCRIPTIONS       │          │     FAVORITES        │
├──────────────────────┤          ├──────────────────────┤
│ id (PK)              │          │ id (PK)              │
│ user_id (FK)         │          │ user_id (FK)         │
│ plan_type (ENUM)     │          │ listing_id (FK)      │
│ status (ENUM)        │          │ created_at           │
│ stripe_subscription_id
│ stripe_customer_id   │          └──────────────────────┘
│ amount               │
│ billing_cycle_start  │
│ billing_cycle_end    │
│ created_at           │
│ updated_at           │
└──────────────────────┘

┌──────────────────────┐
│    AUDIT_LOGS        │
├──────────────────────┤
│ id (PK)              │
│ user_id (FK)         │
│ action               │
│ entity_type          │
│ entity_id            │
│ old_value (JSONB)    │
│ new_value (JSONB)    │
│ created_at           │
└──────────────────────┘
```

---

## 📋 Table Definitions

### 1. USERS Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'user'
    CHECK (role IN ('guest', 'user', 'agent', 'admin')),
  phone VARCHAR(20),
  avatar_url VARCHAR(500),
  bio TEXT,
  verified_email BOOLEAN DEFAULT FALSE,
  verified_phone BOOLEAN DEFAULT FALSE,
  verified_id BOOLEAN DEFAULT FALSE,
  kyc_status VARCHAR(50) DEFAULT 'pending'
    CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  latitude DECIMAL(9, 6),
  longitude DECIMAL(9, 6),
  CONSTRAINT users_email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_verified_email ON users(verified_email);
```

**Fields:**
- `id`: UUID primary key
- `email`: Unique email address for login
- `password_hash`: bcrypt hashed password
- `role`: RBAC role (guest, user, agent, admin)
- `phone`: Optional phone number
- `avatar_url`: Profile picture URL (S3)
- `verified_email`: Email verification status
- `verified_id`: ID verification badge
- `kyc_status`: Know Your Customer status
- `is_active`: Account active/suspended flag

---

### 2. LISTINGS Table

```sql
CREATE TABLE listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL
    CHECK (type IN ('plot', 'house', 'apartment', 'commercial', 'rental')),
  description TEXT,
  price DECIMAL(15, 2) NOT NULL CHECK (price > 0),
  price_negotiable BOOLEAN DEFAULT FALSE,
  location_address VARCHAR(500) NOT NULL,
  location_latitude DECIMAL(9, 6) NOT NULL,
  location_longitude DECIMAL(9, 6) NOT NULL,
  city VARCHAR(100),
  district VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100),
  zip_code VARCHAR(20),
  size_sqft INT CHECK (size_sqft > 0),
  bedrooms INT,
  bathrooms INT,
  amenities JSONB DEFAULT '[]'::jsonb,
  legal_status VARCHAR(100),
  listing_status VARCHAR(50) NOT NULL DEFAULT 'pending_review'
    CHECK (listing_status IN ('active', 'sold', 'rented', 'deleted', 'pending_review')),
  featured_until TIMESTAMP,
  views_count INT DEFAULT 0,
  favorites_count INT DEFAULT 0,
  last_viewed TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT listings_user_fk FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_listings_status ON listings(listing_status);
CREATE INDEX idx_listings_type ON listings(type);
CREATE INDEX idx_listings_price ON listings(price);
CREATE INDEX idx_listings_user_id ON listings(user_id);
CREATE INDEX idx_listings_location ON listings USING GIST (
  ll_to_earth(location_latitude, location_longitude)
);
CREATE INDEX idx_listings_featured ON listings(featured_until) WHERE featured_until > CURRENT_TIMESTAMP;
CREATE INDEX idx_listings_created ON listings(created_at DESC);
```

**Fields:**
- `id`: UUID primary key
- `user_id`: Reference to listing owner
- `type`: Property type (plot, house, apartment, commercial, rental)
- `price`: Listing price
- `location_*`: Geographic coordinates and address
- `district`: Administrative district or local area
- `size_sqft`: Property size in square feet
- `bedrooms, bathrooms`: Property specs
- `amenities`: JSONB array of amenity tags
- `listing_status`: Active, sold, pending review, etc.
- `featured_until`: Premium listing expiration
- `views_count`: Analytics tracking

---

### 3. LISTING_IMAGES Table

```sql
CREATE TABLE listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  image_order INT DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  file_size INT,
  dimensions JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT one_primary_per_listing UNIQUE (listing_id, is_primary) WHERE is_primary = TRUE
);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);
CREATE INDEX idx_listing_images_primary ON listing_images(listing_id, is_primary);
```

**Fields:**
- `image_url`: S3 URL to image
- `is_primary`: Flag for thumbnail image
- `image_order`: Display order (1, 2, 3, ...)
- `dimensions`: {width, height} for responsive loading

---

### 4. SUBSCRIPTIONS Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  plan_type VARCHAR(50) NOT NULL DEFAULT 'free'
    CHECK (plan_type IN ('free', 'premium', 'featured')),
  status VARCHAR(50) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'cancelled', 'expired', 'paused')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255) UNIQUE,
  stripe_payment_method_id VARCHAR(255),
  amount DECIMAL(10, 2),
  currency VARCHAR(10) DEFAULT 'USD',
  billing_cycle_day INT,
  billing_cycle_start TIMESTAMP,
  billing_cycle_end TIMESTAMP,
  renewal_at TIMESTAMP,
  auto_renew BOOLEAN DEFAULT TRUE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  cancelled_at TIMESTAMP
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_renewal_at ON subscriptions(renewal_at);
```

**Fields:**
- `plan_type`: Free tier or paid plans
- `stripe_*`: Stripe API IDs for payments
- `amount`: Plan cost
- `billing_cycle_*`: Subscription period
- `auto_renew`: Enable automatic renewal

---

### 5. MESSAGES Table

```sql
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID REFERENCES listings(id) ON DELETE SET NULL,
  subject VARCHAR(255),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT no_self_message CHECK (sender_id != receiver_id)
);

CREATE INDEX idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_listing_id ON messages(listing_id);
CREATE INDEX idx_messages_is_read ON messages(receiver_id, is_read);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
```

**Fields:**
- `sender_id, receiver_id`: User references
- `listing_id`: Associated property (nullable)
- `content`: Message body
- `is_read`: Unread message flag
- `reply_to_id`: Thread support

---

### 6. FAVORITES Table

```sql
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  listing_id UUID NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT unique_user_listing UNIQUE (user_id, listing_id)
);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_listing_id ON favorites(listing_id);
```

**Fields:**
- `user_id, listing_id`: Composite primary key ensures no duplicates
- Enables "Saved Searches" feature

---

### 7. AUDIT_LOGS Table

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  old_value JSONB,
  new_value JSONB,
  ip_address INET,
  user_agent VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_audit_logs_user_id ON audit_logs(user_id),
  INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id),
  INDEX idx_audit_logs_action ON audit_logs(action),
  INDEX idx_audit_logs_created ON audit_logs(created_at DESC)
);
```

**Fields:**
- Complete audit trail of all changes
- Tracks who changed what, when, and how
- Compliance requirement for data protection

---

## 🔧 Migration Strategy

### Initial Setup (v1.0)

```sql
-- Run migrations in order:
-- 1. 001_create_users_table.sql
-- 2. 002_create_listings_table.sql
-- 3. 003_create_listing_images_table.sql
-- 4. 004_create_subscriptions_table.sql
-- 5. 005_create_messages_table.sql
-- 6. 006_create_favorites_table.sql
-- 7. 007_create_audit_logs_table.sql
-- 8. 008_create_indexes.sql
```

### Running Migrations

```bash
# Development
npm run migrate:dev

# Production (with rollback capability)
npm run migrate:prod -- --dry-run
npm run migrate:prod

# Rollback
npm run migrate:rollback
```

---

## 📊 Sample Data Queries

### Get Featured Listings

```sql
SELECT 
  id, title, price, location_address, featured_until
FROM listings
WHERE listing_status = 'active'
  AND featured_until > CURRENT_TIMESTAMP
ORDER BY featured_until DESC
LIMIT 10;
```

### Search Listings by Location & Price

```sql
SELECT 
  id, title, price, size_sqft, bedrooms,
  earth_distance(
    ll_to_earth(location_latitude, location_longitude),
    ll_to_earth(6.5244, 3.3792)  -- Lagos coordinates
  ) / 1000 AS distance_km
FROM listings
WHERE listing_status = 'active'
  AND price BETWEEN 50000 AND 500000
  AND type = 'house'
  AND earth_distance(
    ll_to_earth(location_latitude, location_longitude),
    ll_to_earth(6.5244, 3.3792)
  ) < 50000  -- within 50km
ORDER BY distance_km ASC
LIMIT 20;
```

### User Activity Report

```sql
SELECT 
  u.id, u.name, u.email,
  COUNT(l.id) as total_listings,
  COUNT(m.id) as messages_sent,
  COUNT(f.id) as favorites_saved
FROM users u
LEFT JOIN listings l ON u.id = l.user_id
LEFT JOIN messages m ON u.id = m.sender_id
LEFT JOIN favorites f ON u.id = f.user_id
WHERE u.role = 'agent'
  AND u.created_at > CURRENT_DATE - INTERVAL '30 days'
GROUP BY u.id, u.name, u.email
ORDER BY total_listings DESC;
```

---

## 🔒 Data Privacy & Security

### Sensitive Data Handling

- Passwords: bcrypt hashing (rounds: 12)
- Stripe tokens: Stored securely, never in logs
- PII: Encrypted at rest (optional: column-level encryption)
- Audit logs: Immutable, cannot be deleted

### GDPR Compliance

- Right to be forgotten: CASCADE DELETE on user deletion
- Data portability: Export user data as JSON
- Retention: Auto-purge old audit logs (180+ days)

---

## 🚀 Future Schema Extensions

**Phase 2 planned:**
- Video uploads (listing_videos table)
- Advanced analytics (listing_analytics table)
- Review & ratings (reviews table)
- Property documents (listing_documents table)
- Multi-language content (translations table)

