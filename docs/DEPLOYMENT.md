# HabitaPlot™ - Deployment & DevOps Guide

**Version:** 1.0  
**Target:** AWS  
**Date:** April 11, 2026

---

## 🚀 Development Setup

### Prerequisites

```bash
# Install Node.js v18+
node --version  # v18.0.0 or higher

# Install PostgreSQL 14+
psql --version  # psql (PostgreSQL 14.0+)

# Install Redis
redis-server --version  # Redis Server v6.0+

# Install Docker & Docker Compose
docker --version  # Docker 20.10+
docker-compose --version  # Docker Compose 1.29+

# Install Git
git --version
```

### Local Development

1. **Clone repository:**
   ```bash
   git clone https://github.com/habitaplot/habitaplot.git
   cd habitaplot
   ```

2. **Install dependencies:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Setup environment variables:**
   ```bash
   # Backend
   cp backend/.env.example backend/.env
   
   # Frontend
   cp frontend/.env.example frontend/.env
   ```

4. **Configure .env for development:**
   ```
   # backend/.env
   NODE_ENV=development
   PORT=5000
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=habitaplot_dev
   DB_USER=postgres
   DB_PASSWORD=postgres
   REDIS_URL=redis://localhost:6379
   JWT_SECRET=your_jwt_secret_key_here_change_in_production
   STRIPE_SECRET_KEY=sk_test_...
   AWS_S3_BUCKET=habitaplot-dev
   SENDGRID_API_KEY=SG....
   
   # frontend/.env
   REACT_APP_API_URL=http://localhost:5000/api/v1
   REACT_APP_STRIPE_PUBLIC_KEY=pk_test_...
   REACT_APP_MAPBOX_TOKEN=pk_...
   ```

5. **Start development services:**
   ```bash
   # Terminal 1: PostgreSQL & Redis
   docker-compose -f docker/docker-compose.dev.yml up
   
   # Terminal 2: Backend
   cd backend
   npm run migrate  # Run migrations
   npm run seed     # Seed initial data (optional)
   npm run dev      # Start dev server with hot reload
   
   # Terminal 3: Frontend
   cd frontend
   npm start        # Start React dev server
   ```

6. **Access development environment:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api/v1
   - Database: localhost:5432
   - Redis: localhost:6379

---

## 🐳 Docker Development

### Docker Compose Setup

**File:** `docker/docker-compose.yml`

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: habitaplot
      POSTGRES_USER: habitaplot_user
      POSTGRES_PASSWORD: secure_password_here
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U habitaplot_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: development
      DB_HOST: postgres
      DB_PORT: 5432
      REDIS_URL: redis://redis:6379
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    volumes:
      - ./backend/src:/app/src
    command: npm run dev

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      REACT_APP_API_URL: http://localhost:5000/api/v1
    depends_on:
      - backend
    volumes:
      - ./frontend/src:/app/src

volumes:
  postgres_data:
```

### Running with Docker Compose

```bash
# Start all services
docker-compose -f docker/docker-compose.yml up

# Start in background
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f

# Stop all services
docker-compose -f docker/docker-compose.yml down

# Rebuild images
docker-compose -f docker/docker-compose.yml build --no-cache
```

---

## ☁️ AWS Production Deployment

### 1. AWS Account Setup

- Create AWS account with billing enabled
- Configure IAM user with appropriate permissions
- Setup MFA for security
- Create VPC and subnets

### 2. RDS PostgreSQL Setup

```bash
# Create RDS instance using AWS Console or CLI:
aws rds create-db-instance \
  --db-instance-identifier habitaplot-prod \
  --db-instance-class db.t3.small \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password "StrongPasswordHere123!" \
  --allocated-storage 100 \
  --storage-type gp3 \
  --backup-retention-period 30 \
  --multi-az \
  --publicly-accessible false
```

### 3. ElastiCache Redis Setup

```bash
aws elasticache create-cache-cluster \
  --cache-cluster-id habitaplot-redis \
  --cache-node-type cache.t3.micro \
  --engine redis \
  --engine-version 7.0 \
  --num-cache-nodes 1
```

### 4. S3 Bucket for Media

```bash
aws s3 mb s3://habitaplot-media-prod --region us-east-1

# Enable versioning for disaster recovery
aws s3api put-bucket-versioning \
  --bucket habitaplot-media-prod \
  --versioning-configuration Status=Enabled

# Configure CORS for image uploads
aws s3api put-bucket-cors \
  --bucket habitaplot-media-prod \
  --cors-configuration file://cors.json
```

**cors.json:**
```json
{
  "CORSRules": [
    {
      "AllowedOrigins": ["https://habitaplot.com"],
      "AllowedMethods": ["GET", "PUT", "POST"],
      "AllowedHeaders": ["*"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

### 5. Elastic Container Registry (ECR)

```bash
# Create ECR repositories
aws ecr create-repository --repository-name habitaplot-backend --region us-east-1
aws ecr create-repository --repository-name habitaplot-frontend --region us-east-1

# Build and push Docker images
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com

docker build -t habitaplot-backend ./backend
docker tag habitaplot-backend:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/habitaplot-backend:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/habitaplot-backend:latest
```

### 6. ECS Fargate Deployment

**File:** `deployment/aws/ecs-task-definition.json`

```json
{
  "family": "habitaplot-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "containerDefinitions": [
    {
      "name": "habitaplot-backend",
      "image": "123456789.dkr.ecr.us-east-1.amazonaws.com/habitaplot-backend:latest",
      "essential": true,
      "portMappings": [
        {
          "containerPort": 5000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "DB_HOST",
          "value": "habitaplot-prod.xxxxx.rds.amazonaws.com"
        }
      ],
      "secrets": [
        {
          "name": "JWT_SECRET",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:123456789:secret:habitaplot/jwt-secret"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/habitaplot-backend",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### 7. Application Load Balancer (ALB)

```bash
# Create ALB
aws elbv2 create-load-balancer \
  --name habitaplot-alb \
  --subnets subnet-12345678 subnet-87654321 \
  --security-groups sg-12345678 \
  --scheme internet-facing \
  --type application

# Create target group
aws elbv2 create-target-group \
  --name habitaplot-backend-tg \
  --protocol HTTP \
  --port 5000 \
  --vpc-id vpc-12345678 \
  --target-type ip

# Create listener
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:us-east-1:123456789:loadbalancer/app/habitaplot-alb/1234567890123456 \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=arn:aws:elasticloadbalancing:us-east-1:123456789:targetgroup/habitaplot-backend-tg/1234567890123456
```

### 8. CloudFront CDN

```bash
# Create CloudFront distribution for S3 (images)
aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### 9. Environment Secrets Management

```bash
# Store secrets in AWS Secrets Manager
aws secretsmanager create-secret \
  --name habitaplot/prod/db-password \
  --secret-string "VerySecurePassword123!"

aws secretsmanager create-secret \
  --name habitaplot/prod/jwt-secret \
  --secret-string "jwt_secret_key_here"

aws secretsmanager create-secret \
  --name habitaplot/prod/stripe-key \
  --secret-string "sk_live_..."
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

**File:** `.github/workflows/deploy.yml`

```yaml
name: Deploy HabitaPlot

on:
  push:
    branches: [main, staging]

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: 123456789.dkr.ecr.us-east-1.amazonaws.com

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd backend && npm install && npm run test
      - run: cd frontend && npm install && npm run test

  build:
    needs: test
    runs-on: ubuntu-latest
    permissions:
      id-token: write
      contents: read
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to ECR
        run: |
          aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REGISTRY
      
      - name: Build and push backend
        run: |
          docker build -t $ECR_REGISTRY/habitaplot-backend:${{ github.sha }} ./backend
          docker push $ECR_REGISTRY/habitaplot-backend:${{ github.sha }}
      
      - name: Build and push frontend
        run: |
          docker build -t $ECR_REGISTRY/habitaplot-frontend:${{ github.sha }} ./frontend
          docker push $ECR_REGISTRY/habitaplot-frontend:${{ github.sha }}

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          role-to-assume: arn:aws:iam::123456789:role/github-actions
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Update ECS service
        run: |
          aws ecs update-service \
            --cluster habitaplot-prod \
            --service habitaplot-backend-service \
            --force-new-deployment
```

---

## 📊 Monitoring & Logging

### CloudWatch Setup

```bash
# Create log group
aws logs create-log-group --log-group-name /ecs/habitaplot-backend

# Create alarms
aws cloudwatch put-metric-alarm \
  --alarm-name habitaplot-backend-cpu-high \
  --alarm-description "Alert when CPU > 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold

aws cloudwatch put-metric-alarm \
  --alarm-name habitaplot-backend-memory-high \
  --alarm-description "Alert when memory > 90%" \
  --metric-name MemoryUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 90 \
  --comparison-operator GreaterThanThreshold
```

### Application Performance Monitoring

```bash
# Install New Relic agent (optional)
npm install newrelic --save

# Configure New Relic
export NEW_RELIC_APP_NAME=HabitaPlot
export NEW_RELIC_LICENSE_KEY=your_license_key
```

---

## 🔐 SSL/TLS & HTTPS

```bash
# Request SSL certificate using AWS Certificate Manager
aws acm request-certificate \
  --domain-name habitaplot.com \
  --subject-alternative-names www.habitaplot.com \
  --validation-method DNS

# Attach certificate to ALB
aws elbv2 create-listener \
  --load-balancer-arn arn:aws:elasticloadbalancing:... \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=arn:aws:acm:us-east-1:123456789:certificate/... \
  --default-actions Type=forward,TargetGroupArn=...
```

---

## 🔄 Database Migrations in Production

```bash
# Create migration
npm run migration:create -- --name add_featured_column

# Run migrations
npm run migrate:prod

# Rollback to previous version
npm run migrate:rollback

# Check migration status
npm run migration:status
```

---

## 🔄 Blue-Green Deployment

1. **Create new ECS service with new container version**
2. **Route traffic to new service via ALB**
3. **Monitor for errors**
4. **Switch fully or rollback**

```bash
# Gradual canary deployment (10% → 50% → 100%)
aws ecs update-service \
  --cluster habitaplot-prod \
  --service habitaplot-backend-service \
  --deployment-configuration "maximumPercent=200,minimumHealthyPercent=50"
```

---

## 🆘 Disaster Recovery

### Backup Strategy

- **Database:** Daily automated snapshots to S3
- **Media:** Versioned S3 buckets
- **Code:** GitHub with protected main branch

### Recovery Procedures

```bash
# Restore from RDS snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier habitaplot-restored \
  --db-snapshot-identifier habitaplot-prod-snapshot-2026-04-11
```

---

## 📈 Scaling Configuration

### Auto-Scaling Policy

```bash
# Register scalable target
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/habitaplot-prod/habitaplot-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy
aws application-autoscaling put-scaling-policy \
  --policy-name habitaplot-backend-scale-policy \
  --service-namespace ecs \
  --resource-id service/habitaplot-prod/habitaplot-backend-service \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration file://scaling-policy.json
```

---

## ✅ Pre-Production Checklist

- [ ] All environment variables configured
- [ ] Database migrations tested
- [ ] SSL certificates installed
- [ ] CloudFront CDN configured
- [ ] CloudWatch alarms active
- [ ] Backup strategy verified
- [ ] Auto-scaling policies configured
- [ ] Security groups properly restricted
- [ ] Load balancer health checks passing
- [ ] Monitoring dashboards created
- [ ] Incident response playbook ready
- [ ] Stakeholder notification plan

---

## 📞 Support

For deployment issues, check:
- CloudWatch logs: `/ecs/habitaplot-backend`
- ECS task status: `aws ecs describe-services --cluster habitaplot-prod --services habitaplot-backend-service`
- RDS status: `aws rds describe-db-instances --db-instance-identifier habitaplot-prod`

