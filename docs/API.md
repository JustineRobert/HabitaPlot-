# HabitaPlot™ - REST API Documentation

**Version:** 1.0  
**Base URL:** `http://localhost:5000/api/v1` (Dev) | `https://api.habitaplot.com/api/v1` (Prod)  
**Authentication:** JWT Bearer Token  
**Response Format:** JSON

---

## 🔐 Authentication

### Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePassword123"
}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "agent",
    "verified_email": true
  },
  "expires_in": 86400
}
```

### Register
```
POST /auth/register
Content-Type: application/json

{
  "email": "newuser@example.com",
  "password": "SecurePassword123",
  "name": "Jane Smith",
  "phone": "+234801234567"
}

Response (201 Created):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "email": "newuser@example.com",
    "name": "Jane Smith",
    "role": "user"
  }
}
```

### Refresh Token
```
POST /auth/refresh-token
Authorization: Bearer {token}

Response (200 OK):
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "expires_in": 86400
}
```

### Logout
```
POST /auth/logout
Authorization: Bearer {token}

Response (200 OK):
{
  "message": "Successfully logged out"
}
```

---

## 🏘️ Listings API

### List All Listings (with filtering & pagination)
```
GET /listings?page=1&limit=20&type=house&price_min=50000&price_max=500000&location=Lagos
Authorization: Bearer {token} (optional)

Query Parameters:
- page: Page number (default: 1)
- limit: Results per page (default: 20, max: 100)
- type: Filter by property type (plot|house|apartment|commercial|rental)
- price_min: Minimum price
- price_max: Maximum price
- location: Location string (city/address)
- district: District name (Ugandan district or administrative area)
- lat: Latitude (for geographic search)
- lon: Longitude (for geographic search)
- radius: Search radius in km (default: 50)
- bedrooms: Number of bedrooms
- sort: Sort field (price|views|created_at, default: created_at)
- order: asc|desc

Response (200 OK):
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Luxury 3-Bedroom House",
      "type": "house",
      "price": 250000,
      "price_negotiable": true,
      "location_address": "Ikoyi, Lagos",
      "location_latitude": 6.4667,
      "location_longitude": 3.6333,
      "size_sqft": 3500,
      "bedrooms": 3,
      "bathrooms": 2,
      "amenities": ["swimming_pool", "gym", "security"],
      "views_count": 145,
      "featured_until": "2026-05-11T00:00:00Z",
      "created_at": "2026-04-01T10:30:00Z",
      "owner": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "name": "Agent Name",
        "verified_id": true
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1250,
    "pages": 63
  }
}
```

### Get Single Listing
```
GET /listings/{id}
Authorization: Bearer {token} (optional)

Response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "Luxury 3-Bedroom House",
  "type": "house",
  "description": "Beautiful modern house with all amenities...",
  "price": 250000,
  "price_negotiable": true,
  "location_address": "Ikoyi, Lagos",
  "location_latitude": 6.4667,
  "location_longitude": 3.6333,
  "size_sqft": 3500,
  "bedrooms": 3,
  "bathrooms": 2,
  "amenities": ["swimming_pool", "gym", "security"],
  "legal_status": "freehold",
  "views_count": 145,
  "images": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "image_url": "https://s3.amazonaws.com/habitaplot/...",
      "is_primary": true
    }
  ],
  "owner": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "name": "John Agent",
    "email": "john@realestate.com",
    "phone": "+234801234567",
    "verified_email": true,
    "verified_id": true
  },
  "created_at": "2026-04-01T10:30:00Z",
  "updated_at": "2026-04-05T14:22:00Z"
}
```

### Create Listing
```
POST /listings
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "New House Listing",
  "type": "house",
  "description": "Modern 3-bedroom house",
  "price": 250000,
  "price_negotiable": true,
  "location_address": "Ikoyi, Lagos",
  "district": "Eti-Osa",
  "location_latitude": 6.4667,
  "location_longitude": 3.6333,
  "size_sqft": 3500,
  "bedrooms": 3,
  "bathrooms": 2,
  "amenities": ["swimming_pool", "gym", "security"],
  "legal_status": "freehold"
}

Response (201 Created):
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "New House Listing",
  "status": "pending_review",
  "message": "Listing created successfully. Awaiting admin approval."
}
```

### Update Listing
```
PATCH /listings/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "title": "Updated Title",
  "price": 280000,
  "amenities": ["swimming_pool", "gym", "security", "parking"]
}

Response (200 OK):
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "message": "Listing updated successfully"
}
```

### Delete Listing
```
DELETE /listings/{id}
Authorization: Bearer {token}

Response (204 No Content)
```

### Upload Listing Images
```
POST /listings/{id}/images
Authorization: Bearer {token}
Content-Type: multipart/form-data

files: [image1.jpg, image2.jpg]
is_primary: true (for first image)

Response (201 Created):
{
  "images": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "image_url": "https://s3.amazonaws.com/habitaplot/...",
      "is_primary": true
    }
  ]
}
```

### Get Listings by User (My Listings)
```
GET /users/me/listings?page=1&limit=20
Authorization: Bearer {token}

Response (200 OK):
{
  "data": [
    { listing objects }
  ],
  "pagination": { pagination info }
}
```

---

## 🔍 Search & Discovery

### Advanced Search
```
GET /listings/search
  ?query=3-bedroom%20house
  &location=Lagos
  &price_min=200000
  &price_max=500000
  &sort=relevance
  &page=1
  &limit=20
Authorization: Bearer {token} (optional)

Response (200 OK):
{
  "data": [ listings ],
  "pagination": { pagination info },
  "facets": {
    "types": [
      { "name": "house", "count": 450 },
      { "name": "apartment", "count": 320 }
    ],
    "price_ranges": [
      { "range": "0-100000", "count": 120 },
      { "range": "100000-500000", "count": 650 }
    ]
  }
}
```

### Map-Based Search
```
GET /listings/map
  ?lat=6.5244
  &lon=3.3792
  &radius=50
  &zoom=12
Authorization: Bearer {token} (optional)

Response (200 OK):
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "House",
      "price": 250000,
      "lat": 6.4667,
      "lon": 3.6333,
      "type": "house"
    }
  ]
}
```

---

## ❤️ Favorites

### Get User Favorites
```
GET /favorites
Authorization: Bearer {token}

Response (200 OK):
{
  "data": [ listing objects ],
  "pagination": { pagination info }
}
```

### Add to Favorites
```
POST /favorites/{listingId}
Authorization: Bearer {token}

Response (201 Created):
{
  "message": "Added to favorites"
}
```

### Remove from Favorites
```
DELETE /favorites/{listingId}
Authorization: Bearer {token}

Response (204 No Content)
```

---

## 💬 Messaging

### Get Messages
```
GET /messages?page=1&limit=20&filter=inbox
Authorization: Bearer {token}

Query Parameters:
- filter: inbox|sent|all (default: all)
- unread_only: true|false

Response (200 OK):
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "sender": { user object },
      "receiver": { user object },
      "listing": { listing object or null },
      "subject": "Inquiry about property",
      "content": "Is this property still available?",
      "is_read": false,
      "created_at": "2026-04-10T15:30:00Z"
    }
  ],
  "unread_count": 5,
  "pagination": { pagination info }
}
```

### Send Message
```
POST /messages
Authorization: Bearer {token}
Content-Type: application/json

{
  "receiver_id": "550e8400-e29b-41d4-a716-446655440001",
  "listing_id": "550e8400-e29b-41d4-a716-446655440010",
  "subject": "Inquiry about property",
  "content": "Is this property still available?"
}

Response (201 Created):
{
  "id": "550e8400-e29b-41d4-a716-446655440100",
  "message": "Message sent successfully"
}
```

### Mark Message as Read
```
PATCH /messages/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "is_read": true
}

Response (200 OK):
{
  "message": "Message marked as read"
}
```

---

## 👤 User Profile

### Get User Profile
```
GET /users/{id}
Authorization: Bearer {token} (optional)

Response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "email": "agent@habitaplot.com",
  "name": "Agent Name",
  "role": "agent",
  "phone": "+234801234567",
  "avatar_url": "https://s3.amazonaws.com/...",
  "bio": "Professional real estate agent",
  "verified_email": true,
  "verified_id": true,
  "listings_count": 25,
  "reviews_count": 12,
  "response_time": "2 hours",
  "created_at": "2026-01-15T10:00:00Z"
}
```

### Update User Profile
```
PATCH /users/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "phone": "+234809876543",
  "bio": "Updated bio"
}

Response (200 OK):
{
  "message": "Profile updated successfully"
}
```

### Get Current User
```
GET /users/me
Authorization: Bearer {token}

Response (200 OK):
{ user object with email and all details }
```

### Change Password
```
POST /users/me/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "current_password": "OldPassword123",
  "new_password": "NewSecurePassword123"
}

Response (200 OK):
{
  "message": "Password changed successfully"
}
```

---

## 💳 Subscriptions & Payments

### Get Available Plans
```
GET /subscriptions/plans
Authorization: Bearer {token} (optional)

Response (200 OK):
{
  "plans": [
    {
      "id": "free",
      "name": "Free Plan",
      "price": 0,
      "currency": "USD",
      "features": ["5 listings", "basic analytics"]
    },
    {
      "id": "premium",
      "name": "Premium Plan",
      "price": 99,
      "currency": "USD",
      "billing_period": "monthly",
      "features": ["50 listings", "advanced analytics", "featured listings"]
    }
  ]
}
```

### Get Current Subscription
```
GET /subscriptions/current
Authorization: Bearer {token}

Response (200 OK):
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "plan_type": "premium",
  "status": "active",
  "amount": 99,
  "currency": "USD",
  "billing_cycle_start": "2026-03-11T00:00:00Z",
  "billing_cycle_end": "2026-04-11T00:00:00Z",
  "renewal_at": "2026-04-11T00:00:00Z",
  "auto_renew": true
}
```

### Create Checkout Session
```
POST /subscriptions/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "plan_id": "premium",
  "success_url": "https://habitaplot.com/dashboard?success=true",
  "cancel_url": "https://habitaplot.com/pricing"
}

Response (201 Created):
{
  "checkout_url": "https://checkout.stripe.com/pay/cs_live_...",
  "session_id": "cs_live_..."
}
```

### Get Supported Mobile Money Providers
```
GET /payments/mobile-money/providers
Authorization: Bearer {token}

Response (200 OK):
{
  "providers": ["mtn", "airtel"]
}
```

### Initiate Mobile Money Payment
```
POST /payments/mobile-money/initiate
Authorization: Bearer {token}
Content-Type: application/json

{
  "provider": "mtn",
  "amount": 50000,
  "currency": "UGX",
  "phoneNumber": "+256772123456",
  "description": "Premium listing upgrade",
  "externalId": "habitaplot-order-1234"
}

Response (201 Created):
{
  "success": true,
  "data": {
    "provider": "mtn",
    "providerName": "MTN MoMo",
    "transactionId": "habitaplot-order-1234",
    "status": "pending",
    "amount": "50000.00",
    "currency": "UGX",
    "phoneNumber": "+256772123456",
    "description": "Premium listing upgrade"
  }
}
```

### Verify Mobile Money Payment
```
POST /payments/mobile-money/verify
Authorization: Bearer {token}
Content-Type: application/json

{
  "provider": "airtel",
  "transactionId": "habitaplot-order-1234"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "provider": "airtel",
    "providerName": "Airtel Money",
    "transactionId": "habitaplot-order-1234",
    "status": "completed",
    "rawResponse": { /* provider response */ }
  }
}
```

### Cancel Subscription
```
POST /subscriptions/cancel
Authorization: Bearer {token}

{
  "immediate": false
}

Response (200 OK):
{
  "message": "Subscription cancelled",
  "effective_date": "2026-05-11T00:00:00Z"
}
```

---

## 🛡️ Admin Endpoints

### Get All Users
```
GET /admin/users?role=agent&page=1&limit=50
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "data": [ user objects ],
  "pagination": { pagination info }
}
```

### Approve Listing
```
PATCH /admin/listings/{id}/approve
Authorization: Bearer {admin_token}
Content-Type: application/json

{
  "approved": true,
  "notes": "Approved after verification"
}

Response (200 OK):
{
  "message": "Listing approved"
}
```

### Get Analytics Dashboard
```
GET /admin/analytics
  ?period=month
  &start_date=2026-03-01
  &end_date=2026-04-11
Authorization: Bearer {admin_token}

Response (200 OK):
{
  "summary": {
    "total_users": 1250,
    "total_listings": 3420,
    "active_subscriptions": 450,
    "revenue": 45000
  },
  "charts": {
    "user_growth": [ data ],
    "listing_trend": [ data ],
    "revenue_trend": [ data ]
  }
}
```

---

## ❌ Error Responses

### 400 Bad Request
```json
{
  "error": "ValidationError",
  "message": "Validation failed",
  "details": [
    { "field": "email", "message": "Invalid email format" }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "AuthenticationError",
  "message": "Invalid or expired token"
}
```

### 403 Forbidden
```json
{
  "error": "AuthorizationError",
  "message": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "error": "NotFoundError",
  "message": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "error": "RateLimitError",
  "message": "Too many requests. Please try again later.",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "error": "InternalServerError",
  "message": "An unexpected error occurred",
  "request_id": "req_12345abcde"
}
```

---

## 🔄 Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 204 | No Content - Request succeeded, no response body |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Authorization failed |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error |

---

## 🔐 Authentication Scheme

All protected endpoints require:
```
Authorization: Bearer {jwt_token}
```

Token payload includes:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "role": "agent",
  "iat": 1649600400,
  "exp": 1649686800
}
```

---

## 📈 Rate Limiting

- **Unauthenticated:** 100 requests/minute
- **Authenticated:** 1000 requests/minute
- **Admin:** 5000 requests/minute

