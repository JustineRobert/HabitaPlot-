# Project Structure Documentation

## Directory Tree

```
habitaplot/
├── .github/
│   └── workflows/
│       └── ci-cd.yml                 # GitHub Actions CI/CD pipeline
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── database.js           # PostgreSQL & Sequelize setup
│   │   ├── controllers/
│   │   │   ├── authController.js     # Authentication handlers
│   │   │   ├── listingController.js  # Listing CRUD handlers
│   │   │   ├── adminController.js    # Admin operations (stub)
│   │   │   ├── paymentController.js  # Payment handlers (stub)
│   │   │   └── messageController.js  # Messaging handlers (stub)
│   │   ├── middleware/
│   │   │   ├── auth.js               # JWT & RBAC middleware
│   │   │   ├── errorHandler.js       # Global error handling
│   │   │   └── validators.js         # Input validation
│   │   ├── models/
│   │   │   ├── User.js               # User model (Sequelize)
│   │   │   ├── Listing.js            # Listing model (Sequelize)
│   │   │   ├── Subscription.js       # Subscription model
│   │   │   ├── Message.js            # Message model
│   │   │   └── AuditLog.js           # Audit logging model
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Auth endpoints
│   │   │   ├── listingRoutes.js      # Listing endpoints
│   │   │   ├── adminRoutes.js        # Admin endpoints
│   │   │   ├── paymentRoutes.js      # Payment endpoints
│   │   │   └── messageRoutes.js      # Messaging endpoints
│   │   ├── services/
│   │   │   ├── listingService.js     # Listing business logic
│   │   │   ├── emailService.js       # Email notifications
│   │   │   └── stripeService.js      # Stripe integration
│   │   ├── utils/
│   │   │   ├── auth.js               # JWT & password utilities
│   │   │   ├── logger.js             # Centralized logging
│   │   │   └── validators.js         # Validation utils
│   │   └── index.js                  # Express server entry point
│   ├── package.json                  # Node dependencies
│   ├── .env.example                  # Environment template
│   ├── Dockerfile                    # Production Docker image
│   └── .dockerignore                 # Docker build exclusions
│
├── frontend/
│   ├── public/
│   │   ├── index.html                # HTML entry point
│   │   ├── favicon.ico               # Favicon
│   │   └── manifest.json             # PWA manifest
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.js         # Top navigation bar
│   │   │   │   ├── Footer.js         # Footer section
│   │   │   │   ├── ProtectedRoute.js # Auth route wrapper
│   │   │   │   └── LoadingSpinner.js # Loading component
│   │   │   ├── forms/
│   │   │   │   ├── SearchForm.js     # Search form
│   │   │   │   ├── ListingForm.js    # Listing creation form
│   │   │   │   └── FilterSidebar.js  # Search filters
│   │   │   ├── listings/
│   │   │   │   ├── ListingCard.js    # Listing preview card
│   │   │   │   ├── ListingGrid.js    # Grid of listings
│   │   │   │   └── ListingDetail.js  # Detailed view
│   │   │   └── dashboard/
│   │   │       ├── UserDashboard.js  # User account page
│   │   │       ├── AdminDashboard.js # Admin panel
│   │   │       └── AgentDashboard.js # Agent tools
│   │   ├── pages/
│   │   │   ├── HomePage.js           # Landing page
│   │   │   ├── SearchPage.js         # Search results
│   │   │   ├── ListingDetailPage.js  # Property details
│   │   │   ├── LoginPage.js          # Login form
│   │   │   ├── RegisterPage.js       # Registration form
│   │   │   ├── DashboardPage.js      # User dashboard
│   │   │   └── NotFoundPage.js       # 404 handler
│   │   ├── services/
│   │   │   ├── api.js                # Axios HTTP client
│   │   │   ├── authService.js        # Auth API calls
│   │   │   ├── listingService.js     # Listing API calls
│   │   │   ├── paymentService.js     # Payment API calls
│   │   │   └── messageService.js     # Messaging API calls
│   │   ├── hooks/
│   │   │   ├── useAuth.js            # Auth state hook
│   │   │   ├── useListings.js        # Listings state hook
│   │   │   └── usePagination.js      # Pagination logic
│   │   ├── utils/
│   │   │   ├── formatters.js         # Display formatting
│   │   │   ├── validators.js         # Form validation
│   │   │   └── constants.js          # App constants
│   │   ├── App.js                    # Root component
│   │   ├── index.js                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── package.json                  # Dependencies
│   ├── .env.example                  # Environment template
│   ├── nginx.conf                    # Nginx config for production
│   ├── Dockerfile                    # Production Docker image
│   ├── .dockerignore                 # Docker build exclusions
│   └── tailwind.config.js            # Tailwind CSS config
│
├── docker/
│   ├── docker-compose.yml            # Multi-container orchestration
│   ├── .env.example                  # Docker environment template
│   └── README.md                     # Docker usage guide
│
├── docs/
│   ├── ARCHITECTURE.md               # System design (2500+ words)
│   ├── DATABASE_SCHEMA.md            # Database spec (3000+ words)
│   ├── API.md                        # API reference (2000+ words)
│   ├── DEPLOYMENT.md                 # Deployment guide (2500+ words)
│   └── README.md                     # Documentation index
│
├── .gitignore                        # Git exclusions
├── .editorconfig                     # Editor settings
├── LICENSE                           # MIT License
├── README.md                         # Project overview
├── GETTING_STARTED.md                # Setup guide (2000+ words)
├── CONTRIBUTING.md                   # Contribution guide (2500+ words)
├── CHANGELOG.md                      # Version history
├── PROJECT_STATUS.md                 # Current status
└── package.json                      # Root dependencies (optional)
```

## File Organization by Function

### Configuration & Setup
- `.env.example` - Environment configuration templates (frontend, backend, docker)
- `.gitignore` - Version control exclusions
- `.editorconfig` - IDE configuration
- `package.json` - Dependency management
- `docker-compose.yml` - Container orchestration
- `Dockerfile` - Container build definitions

### Documentation
- `README.md` - Project overview
- `GETTING_STARTED.md` - Setup instructions
- `CONTRIBUTING.md` - Development guidelines
- `CHANGELOG.md` - Version history
- `PROJECT_STATUS.md` - Current status
- `docs/` - Technical documentation folder
- `docs/API.md` - API specification
- `docs/ARCHITECTURE.md` - System design
- `docs/DATABASE_SCHEMA.md` - Database spec
- `docs/DEPLOYMENT.md` - Production deployment

### Backend API (Node.js + Express)
**Purpose**: RESTful API server with database integration

```
backend/
├── src/
│   ├── index.js              # Entry point (start server)
│   ├── config/               # Configuration modules
│   ├── models/               # Database models (Sequelize ORM)
│   ├── controllers/          # Request handlers
│   ├── routes/               # API endpoint definitions
│   ├── middleware/           # Request/response processing
│   ├── services/             # Business logic
│   └── utils/                # Helper functions
├── package.json              # Dependencies (Express, Sequelize, etc.)
└── Dockerfile                # Production image
```

**Key Technologies**:
- Express.js - Web framework
- Sequelize - ORM for PostgreSQL
- JWT - Authentication tokens
- bcryptjs - Password hashing
- Redis - Session/cache storage

### Frontend (React SPA)
**Purpose**: User interface and client-side logic

```
frontend/
├── public/                   # Static files served directly
├── src/
│   ├── components/           # Reusable UI components
│   ├── pages/                # Full page components
│   ├── services/             # API integration layer
│   ├── hooks/                # Custom React hooks
│   ├── utils/                # Helper functions
│   ├── App.js                # Root component with routing
│   └── index.js              # React entry point
├── package.json              # Dependencies
├── nginx.conf                # Production web server config
└── Dockerfile                # Production image
```

**Key Technologies**:
- React 18 - UI library
- React Router - Client-side routing
- Axios - HTTP client
- Tailwind CSS - Styling
- Leaflet - Maps integration

### Docker Files
- `backend/Dockerfile` - Node.js API container
- `frontend/Dockerfile` - React SPA + Nginx container
- `docker/docker-compose.yml` - Service orchestration

**Services** (8 total):
1. PostgreSQL database
2. Redis cache
3. Backend API
4. Frontend web app
5. pgAdmin (database UI)
6. Redis Commander (cache UI)
7. Nginx reverse proxy (optional)
8. Mail service (optional)

### CI/CD & Automation
- `.github/workflows/ci-cd.yml` - Automated testing, building, deployment

**Pipeline Stages**:
1. Lint backend
2. Test backend
3. Lint frontend
4. Build & test frontend
5. Build Docker images
6. Security scanning
7. Registry push

## Directory Size Guide

| Directory | Size | Files | Purpose |
|-----------|------|-------|---------|
| backend/src | ~50KB | 12 | API logic |
| frontend/src | ~120KB | 25+ | React components |
| docs | ~300KB | 5 | Documentation |
| docker | ~5KB | 3 | Container setup |
| .github | ~10KB | 1 | CI/CD pipeline |
| **Total** | **~500KB** | **50+** | **Complete MVP** |

## Development File Access Patterns

### When Working on Authentication
```
backend/
├── utils/auth.js              ← Auth utilities
├── middleware/auth.js         ← Auth middleware
├── controllers/authController.js ← Auth handlers
└── routes/authRoutes.js       ← Auth endpoints
```

### When Working on Listings
```
backend/
├── models/Listing.js          ← Data model
├── controllers/listingController.js ← Business logic
└── routes/listingRoutes.js    ← API endpoints

frontend/
├── pages/SearchPage.js        ← Search UI
├── pages/ListingDetailPage.js ← Detail view
├── components/ListingCard.js  ← List preview
└── services/listingService.js ← API calls
```

### When Working on Database
```
backend/
├── src/config/database.js     ← Connection & config
├── src/models/               ← All models
└── docs/DATABASE_SCHEMA.md   ← Schema reference
```

### When Working on Deployment
```
docker/
├── docker-compose.yml        ← Local setup
├── .env.example              ← Config template
└── README.md                 ← Docker guide

docs/
├── DEPLOYMENT.md             ← Production guide
└── ARCHITECTURE.md           ← System design
```

## Quick Navigation

### To Find a Specific Endpoint
1. Check `docs/API.md` for spec
2. Check `backend/src/routes/` for route definition
3. Check `backend/src/controllers/` for implementation

### To Find Frontend Component
1. Check page in `frontend/src/pages/`
2. Check components in `frontend/src/components/`
3. Check hooks in `frontend/src/hooks/`

### To Find Configuration
1. `backend/.env.example` and `.env`
2. `frontend/.env.example` and `.env`
3. `docker/.env.example` and `.env`

### To Find Documentation
1. Quick start: `GETTING_STARTED.md`
2. Architecture: `docs/ARCHITECTURE.md`
3. API reference: `docs/API.md`
4. Database: `docs/DATABASE_SCHEMA.md`
5. Deployment: `docs/DEPLOYMENT.md`

## File Naming Conventions

### Backend
- Controllers: `*Controller.js` (e.g., `authController.js`)
- Models: PascalCase (e.g., `User.js`, `Listing.js`)
- Routes: `*Routes.js` (e.g., `authRoutes.js`)
- Middleware: `*Middleware.js` (e.g., `authMiddleware.js`)
- Services: `*Service.js` (e.g., `emailService.js`)

### Frontend
- Components: PascalCase (e.g., `Navbar.js`, `ListingCard.js`)
- Pages: PascalCase ending in `Page` (e.g., `HomePage.js`)
- Services: camelCase ending in `Service.js` (e.g., `apiService.js`)
- Hooks: camelCase starting with `use` (e.g., `useAuth.js`)
- Utils: camelCase (e.g., `formatters.js`)

### Configuration
- Environment: `.env`, `.env.example`, `.env.local`
- Docker: `Dockerfile`, `.dockerignore`, `docker-compose.yml`
- Git: `.gitignore`
- Editor: `.editorconfig`

## Adding New Features

### New Backend API Endpoint
1. Create model in `backend/src/models/` if needed
2. Add controller method in `backend/src/controllers/`
3. Add route in `backend/src/routes/`
4. Update `docs/API.md`
5. Add tests in `backend/tests/`

### New Frontend Page
1. Create page component in `frontend/src/pages/`
2. Create related components in `frontend/src/components/`
3. Add API service calls in `frontend/src/services/`
4. Add route in `frontend/src/App.js`
5. Update navigation if needed

### New Database Table
1. Create model in `backend/src/models/`
2. Update associations
3. Document in `docs/DATABASE_SCHEMA.md`
4. Create migration script

## Performance Optimization

### Backend
- Database indexes in `DATABASE_SCHEMA.md`
- Query optimization in controllers
- Redis caching in services
- Connection pooling in `config/database.js`

### Frontend
- Code splitting in `App.js`
- Lazy loading images
- Memoization in components
- Tailwind CSS minification

### Docker
- Multi-stage builds (smaller images)
- Layer caching optimization
- Health checks for reliability
- Volume management for persistence

---

**Last Updated**: January 2024  
**Version**: 1.0  
**Total Files**: 50+  
**Project Size**: ~500KB (code + docs)
