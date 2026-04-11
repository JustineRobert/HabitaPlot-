# HabitaPlot™ - Getting Started Guide

Welcome to HabitaPlot™! This guide will help you get the development environment set up and running.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start](#quick-start)
3. [Project Structure](#project-structure)
4. [Development Setup](#development-setup)
5. [Running Services](#running-services)
6. [Common Tasks](#common-tasks)
7. [API Testing](#api-testing)
8. [Troubleshooting](#troubleshooting)
9. [Next Steps](#next-steps)

---

## 📦 Prerequisites

Ensure you have the following installed:

- **Node.js**: v18+ ([download](https://nodejs.org/))
- **Docker Desktop**: Latest version ([download](https://www.docker.com/products/docker-desktop))
- **Git**: Latest version ([download](https://git-scm.com/))
- **PostgreSQL**: v14+ (for local development without Docker)
- **Redis**: v7+ (for local development without Docker)

**Recommended tools:**
- **Postman** or **Insomnia**: API testing
- **VS Code**: Code editor with extensions
- **pgAdmin**: Database UI (included in Docker)

---

## 🚀 Quick Start (with Docker)

The fastest way to get everything running:

```bash
# 1. Clone repository
git clone https://github.com/habitaplot/habitaplot.git
cd habitaplot

# 2. Start all services
docker-compose -f docker/docker-compose.yml up -d

# 3. Verify services are running
docker-compose -f docker/docker-compose.yml ps

# 4. Access the application
# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000
# pgAdmin:   http://localhost:5050
```

**That's it!** All services should be running. Continue to [Running Services](#running-services) for details.

---

## 📂 Project Structure

```
habitaplot/
├── docs/                      # Documentation
│   ├── README.md             # Main overview
│   ├── ARCHITECTURE.md        # System design
│   ├── DATABASE_SCHEMA.md    # Database structure
│   ├── API.md                # REST API docs
│   ├── DEPLOYMENT.md         # Deployment guide
├── backend/                   # Express API
│   ├── src/
│   │   ├── index.js         # Entry point
│   │   ├── config/          # Configuration
│   │   ├── controllers/     # Request handlers
│   │   ├── routes/          # API routes
│   │   ├── models/          # Database models
│   │   ├── middleware/      # Auth, validation
│   │   ├── services/        # Business logic
│   │   └── utils/           # Helpers
│   ├── migrations/          # Database migrations
│   ├── package.json
│   └── Dockerfile
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── index.js        # Entry point
│   │   ├── App.js          # Root component
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── services/       # API clients
│   │   └── styles/         # CSS/Tailwind
│   ├── public/
│   ├── package.json
│   └── Dockerfile
├── docker/                   # Docker setup
│   ├── docker-compose.yml   # Multi-container config
│   ├── .env.example         # Environment template
│   └── README.md            # Docker guide
├── deployment/               # DevOps & Infrastructure
│   ├── aws/                 # AWS CloudFormation, scripts
│   └── kubernetes/          # K8s manifests
└── GETTING_STARTED.md       # This file
```

---

## 🛠️ Development Setup

### Option 1: Quick Start with Docker (Recommended)

Already done above? Great! Skip to [Running Services](#running-services).

### Option 2: Local Setup (without Docker)

If you prefer local development:

**1. Install dependencies:**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

**2. Setup PostgreSQL and Redis:**

```bash
# On macOS with Homebrew
brew install postgresql@14
brew install redis

# On Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib redis-server

# On Windows - download from respective websites or use WSL2
```

**3. Start PostgreSQL and Redis:**

```bash
# macOS/Linux
brew services start postgresql@14
brew services start redis

# Ubuntu/Debian
sudo systemctl start postgresql
sudo systemctl start redis-server

# Windows (Redis)
redis-server
```

**4. Create database:**

```bash
# macOS/Linux
psql -U postgres -c "CREATE DATABASE habitaplot;"
psql -U postgres -c "CREATE USER habitaplot_user WITH PASSWORD 'password';"
psql -U postgres -c "ALTER ROLE habitaplot_user SUPERUSER;"

# Windows - use pgAdmin GUI
```

**5. Environment setup:**

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your local setup

# Frontend
cp frontend/.env.example frontend/.env
# Update REACT_APP_API_URL if needed
```

**6. Start services:**

```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm start
```

---

## 🏃 Running Services

### With Docker Compose

**Start services:**
```bash
docker-compose -f docker/docker-compose.yml up -d
```

**View logs:**
```bash
# All services
docker-compose -f docker/docker-compose.yml logs -f

# Specific service
docker-compose -f docker/docker-compose.yml logs -f backend
docker-compose -f docker/docker-compose.yml logs -f frontend
```

**Stop services:**
```bash
docker-compose -f docker/docker-compose.yml down
```

**Restart a service:**
```bash
docker-compose -f docker/docker-compose.yml restart backend
```

### With Local Setup

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
# Runs on http://localhost:3000
```

**Database:**
```bash
# Check PostgreSQL
psql -U habitaplot_user -d habitaplot

# Check Redis
redis-cli ping  # Should respond with PONG
```

---

## ✅ Verify Setup

**Backend health check:**
```bash
curl http://localhost:5000/health
# Response: {"status":"ok","timestamp":"...","uptime":...}
```

**Frontend access:**
```bash
# Open browser
http://localhost:3000
```

**Database check:**
```bash
# From terminal
curl http://localhost:5000/api/v1
# Response: {"name":"HabitaPlot API","version":"1.0.0","status":"running"}
```

---

## 📝 Common Tasks

### Run Database Migrations

```bash
# With Docker
docker-compose -f docker/docker-compose.yml exec backend npm run migrate

# Local
cd backend
npm run migrate
```

### Create New Frontend Component

```bash
# Example: Create listing card component
touch frontend/src/components/listings/ListingCard.js
```

Then add your component code.

### Test Backend API

**Using curl:**
```bash
# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Get listings
curl http://localhost:5000/api/v1/listings
```

**Using Postman:**
1. Import [docs/API.md](docs/API.md) into Postman
2. Set base URL to `http://localhost:5000/api/v1`
3. Test endpoints

### Run Tests

```bash
# Backend tests
docker-compose -f docker/docker-compose.yml exec backend npm test

# Frontend tests
docker-compose -f docker/docker-compose.yml exec frontend npm test
```

### Lint Code

```bash
# Backend
docker-compose -f docker/docker-compose.yml exec backend npm run lint

# Frontend
docker-compose -f docker/docker-compose.yml exec frontend npm run lint
```

### Format Code

```bash
# Backend
docker-compose -f docker/docker-compose.yml exec backend npm run format

# Frontend
docker-compose -f docker/docker-compose.yml exec frontend npm run format
```

---

## 🧪 API Testing

### Using Postman

1. **Download Postman** from https://www.postman.com/
2. **File > Import > Link** and paste: `docs/API.md`
3. **Set Variables:**
   - `base_url`: http://localhost:5000/api/v1
   - `token`: (will be set after login)
4. **Test endpoints**

### Using curl

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Password123!",
    "name": "Test User",
    "phone": "+234801234567"
  }'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Password123!"}'

# Get listings (public)
curl http://localhost:5000/api/v1/listings?page=1&limit=10

# Get user listings (protected)
curl http://localhost:5000/api/v1/users/me/listings \
  -H "Authorization: Bearer {token}"
```

### Using curl with ResponseParser

```bash
# Save response to file
curl -s http://localhost:5000/api/v1/listings > listings.json

# Pretty print
jq . listings.json
```

---

## 🆘 Troubleshooting

### "Port already in use"

```bash
# Find process using port
lsof -i :5000    # Backend
lsof -i :3000    # Frontend
lsof -i :5432    # PostgreSQL

# Kill process
kill -9 <PID>

# Or change port in .env
```

### "Database connection refused"

```bash
# Check PostgreSQL is running
docker-compose -f docker/docker-compose.yml logs postgres

# Check PostgreSQL credentials in .env
# Ensure DB and user exist
psql -l  # List databases
```

### "API returns 401 Unauthorized"

```bash
# Token might be expired
# Get new token by logging in
# Include token in Authorization header:
# Authorization: Bearer <token>
```

### "Frontend won't load"

```bash
# Clear browser cache (Ctrl+Shift+Delete)
# Check frontend logs
docker-compose -f docker/docker-compose.yml logs -f frontend

# Rebuild frontend
docker-compose -f docker/docker-compose.yml build --no-cache frontend
```

### "Redis connection error"

```bash
# Check Redis is running
docker-compose -f docker/docker-compose.yml logs redis

# Test Redis connection
docker-compose -f docker/docker-compose.yml exec redis redis-cli ping
```

---

## 🎯 Next Steps

### Phase 1 (Complete):
- ✅ Project setup
- ✅ Development environment
- ✅ Database schema
- ✅ API documentation
- ✅ Frontend scaffold

### Phase 2 (In Progress):
- 🔄 Implement remaining API endpoints
- 🔄 Complete admin panel
- 🔄 Add search & filtering
- 🔄 Integrate payment system

### Phase 3 (Upcoming):
- ⏳ Integration testing
- ⏳ Performance optimization
- ⏳ Security hardening
- ⏳ Production deployment to AWS

---

## 📚 Documentation

- **[README.md](README.md)** - Project overview
- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** - System design
- **[DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md)** - Database structure
- **[API.md](docs/API.md)** - REST API reference
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** - AWS deployment
- **[docker/README.md](docker/README.md)** - Docker guide

---

## 💬 Support & Collaboration

- **GitHub Issues**: [Link to issue tracker]
- **Internal Slack**: #habitaplot-dev
- **Documentation Wiki**: [Link to wiki]
- **Team Meetings**: Every Tuesday 10 AM UTC

---

## 📞 Questions?

Check the documentation or ask in Slack channel #habitaplot-dev.

---

**Happy coding! 🚀**

HabitaPlot™ Team
