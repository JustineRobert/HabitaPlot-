# HabitaPlot™ - Production Real Estate Marketplace Platform

**Version:** 1.0 (Phase 1 MVP)  
**Status:** Development  
**Last Updated:** April 11, 2026

---

## 🎯 Project Overview

HabitaPlot™ is a production-grade, scalable real estate marketplace platform connecting land owners, developers, property agents, brokers, landlords, buyers, and investors. The platform supports land (plots) sales, residential & commercial housing sales, and short & long-term rentals.

**Phase 1 MVP Focus:**
- Core property listings (CRUD operations)
- Advanced search, filtering, and map-based discovery
- User authentication and profiles
- Basic payment integration (Stripe)
- Agent/owner lead management
- Admin panel for moderation and subscriptions
- Mobile-responsive design

---

## 📦 Project Structure

```
HabitaPlot/
├── docs/                          # Documentation
│   ├── PRD.md                    # Product Requirements Document
│   ├── ARCHITECTURE.md           # System architecture & design
│   ├── DATABASE_SCHEMA.md        # Database ERD & schema
│   ├── API.md                    # REST API documentation
│   ├── DEPLOYMENT.md             # AWS & Docker deployment guide
│   └── USER_MANUAL.md            # End-user documentation
├── backend/                       # Node.js Express API
│   ├── src/
│   │   ├── config/               # Configuration (DB, env, etc.)
│   │   ├── controllers/          # Request handlers
│   │   ├── routes/               # API route definitions
│   │   ├── models/               # Database models (Sequelize/TypeORM)
│   │   ├── middleware/           # Auth, error handling, validation
│   │   ├── services/             # Business logic layer
│   │   ├── utils/                # Helpers and utilities
│   │   └── index.js              # App entry point
│   ├── migrations/               # Database migrations
│   ├── .env.example              # Environment variables template
│   ├── package.json              # Dependencies
│   └── Dockerfile                # Docker configuration
├── frontend/                      # React SPA
│   ├── public/                   # Static assets
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/             # Login, signup, password reset
│   │   │   ├── listings/         # Property listing components
│   │   │   ├── map/              # Map-based search
│   │   │   ├── admin/            # Admin panel components
│   │   │   └── common/           # Navbar, footer, modals
│   │   ├── pages/                # Page-level components (Home, Search, etc.)
│   │   ├── services/             # API client & HTTP utilities
│   │   ├── hooks/                # Custom React hooks
│   │   ├── styles/               # Global CSS
│   │   ├── utils/                # Frontend utilities
│   │   ├── App.js                # App root component
│   │   └── index.js              # React DOM render
│   ├── .env.example              # Environment variables
│   ├── package.json              # Dependencies
│   └── Dockerfile                # Docker configuration
├── docker/                        # Docker Compose files
│   ├── docker-compose.yml        # Multi-container orchestration
│   └── .env.example              # Docker environment variables
├── deployment/                    # Infrastructure & DevOps
│   ├── aws/                      # AWS CloudFormation, IAM, RDS setup
│   ├── kubernetes/               # K8s manifests (optional)
│   └── scripts/                  # Deployment automation scripts
└── .gitignore, .env.example      # Git & environment configuration
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Axios, React Router, Tailwind CSS, Leaflet (maps) |
| **Backend** | Node.js, Express.js, JWT authentication |
| **Database** | PostgreSQL (primary), Redis (caching, sessions) |
| **ORM** | Sequelize / TypeORM |
| **Payments** | Stripe API |
| **File Storage** | AWS S3 or local storage (upgradeable) |
| **Containerization** | Docker & Docker Compose |
| **Cloud** | AWS (EC2, RDS, S3, CloudFront) |
| **DevOps** | GitHub Actions (CI/CD), Terraform (IaC) |

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Docker & Docker Compose
- Git

### Development Setup

1. **Clone and install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   cp docker/.env.example docker/.env
   ```

3. **Start services via Docker:**
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

4. **Run database migrations:**
   ```bash
   cd backend && npm run migrate
   ```

5. **Access the application:**
   - Frontend: `http://localhost:3000`
   - Backend API: `http://localhost:5000`
   - Admin: `http://localhost:3000/admin` (default credentials in docs)

---

## 📚 Documentation Files

### Quick Links
- **[GETTING_STARTED.md](GETTING_STARTED.md)** - Setup and installation guide (START HERE!)
- **[PROJECT_STATUS.md](PROJECT_STATUS.md)** - Current development status and progress
- **[CONTRIBUTING.md](CONTRIBUTING.md)** - Contribution guidelines and workflow

### Technical Documentation
- **[README.md](docs/README.md)** - Documentation index
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design, data flow, and scalability
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database schema, ERD, relationships
- **[API.md](docs/API.md)** - REST API endpoints, request/response examples
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - AWS deployment, Docker setup, CI/CD

### Development & Project Management
- **[PROJECT_STRUCTURE.md](PROJECT_STRUCTURE.md)** - Complete directory structure and file organization
- **[TESTING.md](TESTING.md)** - Testing strategy, unit/integration/E2E tests
- **[SECURITY.md](SECURITY.md)** - Security guidelines, best practices, and checklist
- **[CHANGELOG.md](CHANGELOG.md)** - Version history and release notes

---

## 📋 Phase 1 MVP Features

### 1. User & Authentication
- ✅ Guest browsing
- ✅ User registration & email verification
- ✅ JWT-based authentication
- ✅ Role-based access control (RBAC)
- ✅ User profiles with verification badges

### 2. Property Listings
- ✅ CRUD operations for listings
- ✅ Multi-image uploads
- ✅ Property type (Plot, House, Apartment, Rental, Commercial)
- ✅ Location mapping (Leaflet/OpenStreetMap)
- ✅ Price, size, and amenities management
- ✅ Listing status (Active, Sold, Rental)

### 3. Search & Discovery
- ✅ Advanced filtering (location, price, property type, size)
- ✅ Map-based search
- ✅ Saved searches
- ✅ Favorites / Shortlist
- ✅ Featured listings promotion

### 4. Lead & Messaging
- ✅ Contact agent/owner forms
- ✅ Basic in-app messaging system
- ✅ Email notifications
- ✅ Lead dashboard for sellers

### 5. Payments & Subscriptions
- ✅ Stripe payment integration
- ✅ Listing subscription plans (Free, Premium, Featured)
- ✅ Agent premium accounts
- ✅ Invoice generation

### 6. Admin Panel
- ✅ User management
- ✅ Listing moderation & approval
- ✅ Subscription management
- ✅ Analytics dashboard
- ✅ Content moderation

### 7. Security & Compliance
- ✅ JWT-based auth
- ✅ Password hashing (bcrypt)
- ✅ CSRF protection
- ✅ Input validation & sanitization
- ✅ Audit logging

---

## 📈 Performance & Scalability

- **Caching:** Redis for session management and frequently accessed data
- **Database:** PostgreSQL with indexed searches
- **API:** RESTful with pagination and lazy loading
- **Frontend:** Code splitting, lazy loading, service workers (PWA-ready)
- **CDN:** AWS CloudFront for static assets
- **Load Balancing:** AWS ELB or NGINX

---

## 🚢 Deployment

### Development
```bash
docker-compose -f docker/docker-compose.yml up
```

### Production (AWS)
See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- RDS PostgreSQL setup
- ElastiCache Redis configuration
- EC2 deployment with auto-scaling
- CloudFront CDN
- CI/CD pipeline setup

---

## 👥 Team & Contributions

- **Architecture:** Senior Product Architect
- **Backend:** Full-stack Engineers
- **Frontend:** React/UI Engineers
- **DevOps:** AWS & Infrastructure Engineers

---

## 📞 Support & Communication

For issues, feature requests, or technical questions:
- GitHub Issues: [Link to repo]
- Internal Wiki: [Link to wiki]
- Slack: #habitaplot-dev

---

## 📄 License & Compliance

- **License:** Proprietary (Commercial)
- **Compliance:** GDPR-ready, PCI DSS for payments
- **Data Privacy:** Encrypted transmission, secure storage

---

## 🎯 Success Metrics

- **MVP Launch:** Q2 2026
- **User Adoption:** 10,000+ registered users
- **Listing Count:** 1,000+ active listings
- **Monthly Revenue:** $5,000+ (subscriptions & featured listings)
- **System Uptime:** 99.5%+
- **API Response Time:** <200ms p95

---

**Next Steps:** Review documentation, start backend setup, parallelize frontend development.

