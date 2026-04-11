# HabitaPlot™ - Docker Setup Guide

## Quick Start with Docker Compose

### Prerequisites

- Docker Desktop (or Docker + Docker Compose)
- Git

### Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/habitaplot/habitaplot.git
   cd habitaplot
   ```

2. **Copy environment files:**
   ```bash
   cp docker/.env.example docker/.env.docker
   cp backend/.env.example backend/.env
   cp frontend/.env.example frontend/.env
   ```

3. **Start all services:**
   ```bash
   docker-compose -f docker/docker-compose.yml up -d
   ```

4. **Wait for services to start:**
   ```bash
   # Check status
   docker-compose -f docker/docker-compose.yml ps
   ```

5. **Run database migrations:**
   ```bash
   docker-compose -f docker/docker-compose.yml exec backend npm run migrate
   ```

6. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - pgAdmin: http://localhost:5050 (admin@habitaplot.com / admin)
   - Redis Commander: http://localhost:8081

### Common Commands

**View logs:**
```bash
docker-compose -f docker/docker-compose.yml logs -f [service-name]
docker-compose -f docker/docker-compose.yml logs -f backend
docker-compose -f docker/docker-compose.yml logs -f frontend
```

**Stop services:**
```bash
docker-compose -f docker/docker-compose.yml down
```

**Remove volumes (clean slate):**
```bash
docker-compose -f docker/docker-compose.yml down -v
```

**Rebuild images:**
```bash
docker-compose -f docker/docker-compose.yml build --no-cache
```

**Enter container shell:**
```bash
docker-compose -f docker/docker-compose.yml exec backend sh
docker-compose -f docker/docker-compose.yml exec frontend sh
docker-compose -f docker/docker-compose.yml exec postgres psql -U habitaplot_user -d habitaplot
```

**Run npm commands:**
```bash
docker-compose -f docker/docker-compose.yml exec backend npm test
docker-compose -f docker/docker-compose.yml exec frontend npm test
```

### Database Management

**Access PostgreSQL:**
```bash
docker-compose -f docker/docker-compose.yml exec postgres psql -U habitaplot_user -d habitaplot
```

**Useful psql commands:**
```sql
-- List tables
\dt

-- Describe table
\d users

-- Run query
SELECT * FROM users;

-- Exit
\q
```

### Troubleshooting

**Port already in use:**
```bash
# Change ports in docker-compose.yml or stop conflicting services
lsof -i :5432  # Check what's using port 5432
```

**Database connection failed:**
```bash
# Check postgres is healthy
docker-compose -f docker/docker-compose.yml ps

# Check logs
docker-compose -f docker/docker-compose.yml logs postgres
```

**Frontend not loading:**
```bash
# Clear browser cache or use Ctrl+Shift+Delete
# Check frontend logs
docker-compose -f docker/docker-compose.yml logs frontend
```

**Redis connection issues:**
```bash
docker-compose -f docker/docker-compose.yml logs redis
docker-compose -f docker/docker-compose.yml exec redis redis-cli ping
```

### Development Workflow

1. **Backend development:**
   - Code changes auto-reload with nodemon
   - Check logs: `docker-compose logs -f backend`
   - Test API: Use Postman or curl

2. **Frontend development:**
   - Code changes auto-reload with React hot reload
   - Check logs: `docker-compose logs -f frontend`
   - Open browser DevTools

3. **Database changes:**
   - Create migration: `npm run migration:create --name <name>`
   - Run migrations: `npm run migrate`
   - Use pgAdmin at http://localhost:5050

### Production Deployment

For production deployment, see [DEPLOYMENT.md](../docs/DEPLOYMENT.md):

1. Use production docker-compose file
2. Set proper environment variables
3. Configure SSL/TLS
4. Set up backup strategy
5. Configure monitoring and alerts

### Health Checks

Each service has health checks configured:

```bash
# Check health
docker-compose -f docker/docker-compose.yml ps

# Manual health check for backend
curl http://localhost:5000/health

# Manual health check for frontend
curl http://localhost:3000/health
```

### Multi-Stage Builds

Images use multi-stage builds for optimization:
- Smaller final image size
- Faster deployments
- Production-ready

### Networking

All services communicate via the `habitaplot-network`:
- Backend can reach PostgreSQL at `postgres:5432`
- Frontend can reach Backend at `backend:5000`
- All can reach Redis at `redis:6379`

### Security Notes (Development Only)

⚠️ These settings are for development only:
- Passwords are simple - change in production
- pgAdmin is exposed - don't expose in production
- Redis is unprotected - use AUTH in production
- CORS is permissive - restrict in production

### Next Steps

1. ✅ Services running
2. ⏳ Create initial data seed
3. ⏳ Set up API endpoints
4. ⏳ Implement frontend pages
5. ⏳ Add authentication
6. ⏳ Integration testing
7. ⏳ Production deployment

See [main README](../README.md) for full project documentation.
