# HabitaPlot™ Deployment Manual

**Version**: 2.0  
**Last Updated**: 2024  
**Audience**: DevOps Engineers, System Administrators, Cloud Architects

---

## Table of Contents

1. [Deployment Overview](#overview)
2. [Pre-Deployment Checklist](#pre-deployment)
3. [AWS Infrastructure Setup](#aws-setup)
4. [Database Configuration](#database)
5. [Application Deployment](#app-deployment)
6. [SSL/TLS & Security](#ssl-tls)
7. [Environment Configuration](#environment)
8. [Monitoring & Logging](#monitoring)
9. [Scaling & Performance](#scaling)
10. [Backup & Disaster Recovery](#backup-recovery)
11. [CI/CD Pipeline](#cicd)
12. [Troubleshooting](#troubleshooting)
13. [Post-Deployment](#post-deployment)

---

## Deployment Overview {#overview}

### Architecture Overview

HabitaPlot™ is deployed on **Amazon Web Services (AWS)** using a modern, scalable microservices architecture:

**Architecture Diagram:**

```
Users → CloudFront (CDN) → Application Load Balancer (ALB)
                                        ↓
                      ┌─────────────────┼─────────────────┐
                      ↓                                    ↓
            ECS Cluster (Backend)               S3 (Static Files)
            - API Containers
            - Admin Services
            - Worker Containers
                      ↓
            ┌─────────┼──────────┐
            ↓         ↓          ↓
          RDS      ElastiCache  SQS
        (DB)       (Cache)     (Queues)
```

### Technology Stack

**Backend:**
- **Runtime**: Node.js 18+ (LTS)
- **Framework**: Express.js
- **ORM**: Sequelize
- **Database**: PostgreSQL 14+
- **Cache**: Redis 7+ (ElastiCache)
- **Message Queue**: AWS SQS

**Frontend:**
- **Framework**: React 18
- **Build Tool**: Vite
- **CSS**: Tailwind CSS
- **Hosting**: CloudFront + S3

**Infrastructure:**
- **Container Orchestration**: Amazon ECS (Fargate)
- **Load Balancer**: Application Load Balancer (ALB)
- **CDN**: CloudFront
- **Secrets**: AWS Secrets Manager
- **Monitoring**: CloudWatch

### Environment Tiers

**Development (dev)**
- Single instance
- 1 backend container
- Shared RDS instance
- Cost optimized
- Real-time logs

**Staging (staging)**
- 2 backend containers
- Separate RDS instance
- Feature testing
- Production-like
- Full monitoring

**Production (prod)**
- 3+ backend containers (auto-scaling)
- High-availability RDS
- Multi-AZ setup
- Full monitoring & redundancy
- Strict security

---

## Pre-Deployment Checklist {#pre-deployment}

### Prerequisites

**AWS Account & Permissions:**
- [ ] AWS account with root access or admin credentials
- [ ] IAM user created with appropriate roles
- [ ] AWS CLI v2 installed and configured
- [ ] Permissions for: EC2, RDS, S3, ECS, CloudFront, CloudWatch, Secrets Manager, IAM

**Tools & Software:**
- [ ] Node.js 18+ installed
- [ ] Docker installed and running
- [ ] Git and GitHub credentials set up
- [ ] PostgreSQL client tools (psql)
- [ ] AWS CLI configured: `aws configure`
- [ ] jq (JSON processor) for CLI parsing

**Code Repository:**
- [ ] All code committed and pushed to GitHub
- [ ] Environment files (.env) prepared (not in repo)
- [ ] Secrets stored in AWS Secrets Manager or .env.local
- [ ] Package.json and lock file up to date
- [ ] Docker images built and available

### Critical Files Checklist

**Backend:**
- [ ] `server.js` - main entry point
- [ ] `package.json` - dependencies and scripts
- [ ] `.env.example` - template for environment variables
- [ ] `Dockerfile` - container definition
- [ ] `config/database.js` - database configuration
- [ ] Database migration scripts ready

**Frontend:**
- [ ] `package.json` - React dependencies
- [ ] `vite.config.js` - Vite configuration
- [ ] `.env.production` - production environment variables
- [ ] Build output directory specified
- [ ] `public/` assets configured

**Docker Images:**
- [ ] `habitaplot-backend:latest` built and current
- [ ] `habitaplot-frontend:latest` built and current
- [ ] Images pushed to Amazon ECR (Elastic Container Registry)

**Documentation:**
- [ ] Deployment procedures documented
- [ ] Rollback procedures documented
- [ ] Team trained on new procedures
- [ ] Architecture diagram updated

---

## AWS Infrastructure Setup {#aws-setup}

### Step 1: AWS Account Setup

**Create AWS Account:**
1. Go to [aws.amazon.com](https://aws.amazon.com)
2. Click "Create an AWS Account"
3. Use business email for primary account
4. Enable MFA on root account
5. Set up billing alerts

**Create IAM User for Deployment:**
```bash
# Using AWS Console or CLI:
aws iam create-user --user-name habitaplot-deploy

# Attach policies:
aws iam attach-user-policy --user-name habitaplot-deploy \
  --policy-arn arn:aws:iam::aws:policy/AdministratorAccess
  # (Or use more restrictive policies in production)

# Create access key:
aws iam create-access-key --user-name habitaplot-deploy
```

### Step 2: Create VPC (Virtual Private Cloud)

A VPC isolates your resources:

```bash
# Create VPC
VPC_ID=$(aws ec2 create-vpc --cidr-block 10.0.0.0/16 \
  --query 'Vpc.VpcId' --output text)
echo "VPC ID: $VPC_ID"

# Enable DNS resolution
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-support
aws ec2 modify-vpc-attribute --vpc-id $VPC_ID --enable-dns-hostnames

# Create subnets (for high availability in 2 AZs)
SUBNET1=$(aws ec2 create-subnet --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 --availability-zone us-east-1a \
  --query 'Subnet.SubnetId' --output text)

SUBNET2=$(aws ec2 create-subnet --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 --availability-zone us-east-1b \
  --query 'Subnet.SubnetId' --output text)

# Create Internet Gateway
IGW=$(aws ec2 create-internet-gateway \
  --query 'InternetGateway.InternetGatewayId' --output text)

# Attach Internet Gateway to VPC
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW

# Create route table
ROUTE_TABLE=$(aws ec2 create-route-table --vpc-id $VPC_ID \
  --query 'RouteTable.RouteTableId' --output text)

# Add route to Internet Gateway
aws ec2 create-route --route-table-id $ROUTE_TABLE \
  --destination-cidr-block 0.0.0.0/0 --gateway-id $IGW

# Associate subnets with route table
aws ec2 associate-route-table --subnet-id $SUBNET1 --route-table-id $ROUTE_TABLE
aws ec2 associate-route-table --subnet-id $SUBNET2 --route-table-id $ROUTE_TABLE
```

### Step 3: Security Groups

Create security groups for controlling traffic:

```bash
# Backend security group
BACKEND_SG=$(aws ec2 create-security-group \
  --group-name habitaplot-backend-sg \
  --description "HabitaPlot Backend Services" \
  --vpc-id $VPC_ID --query 'GroupId' --output text)

# Allow ALB to backend (port 3000)
aws ec2 authorize-security-group-ingress --group-id $BACKEND_SG \
  --protocol tcp --port 3000 --cidr 10.0.0.0/16

# Database security group
DB_SG=$(aws ec2 create-security-group \
  --group-name habitaplot-db-sg \
  --description "HabitaPlot Database" \
  --vpc-id $VPC_ID --query 'GroupId' --output text)

# Allow backend to database (port 5432)
aws ec2 authorize-security-group-ingress --group-id $DB_SG \
  --protocol tcp --port 5432 --source-security-group-id $BACKEND_SG

# ALB security group
ALB_SG=$(aws ec2 create-security-group \
  --group-name habitaplot-alb-sg \
  --description "HabitaPlot Load Balancer" \
  --vpc-id $VPC_ID --query 'GroupId' --output text)

# Allow public HTTP/HTTPS traffic
aws ec2 authorize-security-group-ingress --group-id $ALB_SG \
  --protocol tcp --port 80 --cidr 0.0.0.0/0

aws ec2 authorize-security-group-ingress --group-id $ALB_SG \
  --protocol tcp --port 443 --cidr 0.0.0.0/0
```

### Step 4: Amazon RDS (Database)

Create managed PostgreSQL database:

```bash
# Create DB subnet group
aws rds create-db-subnet-group \
  --db-subnet-group-name habitaplot-db-subnet \
  --db-subnet-group-description "HabitaPlot Database Subnet" \
  --subnet-ids $SUBNET1 $SUBNET2

# Create RDS PostgreSQL instance (production)
aws rds create-db-instance \
  --db-instance-identifier habitaplot-prod-db \
  --db-instance-class db.t3.medium \
  --engine postgres \
  --engine-version 14.7 \
  --master-username admin \
  --master-user-password "$(openssl rand -base64 32)" \
  --allocated-storage 100 \
  --vpc-security-group-ids $DB_SG \
  --db-subnet-group-name habitaplot-db-subnet \
  --multi-az \
  --publicly-accessible false \
  --backup-retention-period 30 \
  --enable-cloudwatch-logs-exports "postgresql" \
  --enable-iam-database-authentication

# Save credentials to AWS Secrets Manager
aws secretsmanager create-secret \
  --name habitaplot/prod/db-credentials \
  --description "HabitaPlot Production Database Credentials" \
  --secret-string '{"username":"admin","password":"YOUR_PASSWORD"}'
```

**Wait for RDS instance to be available (5-10 minutes):**
```bash
aws rds describe-db-instances \
  --db-instance-identifier habitaplot-prod-db \
  --query 'DBInstances[0].DBInstanceStatus'
```

### Step 5: Amazon ElastiCache (Redis)

Create Redis cache for session and data caching:

```bash
# Create cache subnet group
aws elasticache create-cache-subnet-group \
  --cache-subnet-group-name habitaplot-cache-subnet \
  --cache-subnet-group-description "HabitaPlot Cache Subnet" \
  --subnet-ids $SUBNET1 $SUBNET2

# Create ElastiCache cluster
aws elasticache create-replication-group \
  --replication-group-description "HabitaPlot Redis Cache" \
  --replication-group-id habitaplot-prod-cache \
  --engine redis \
  --engine-version 7.0 \
  --cache-node-type cache.t3.micro \
  --num-cache-clusters 2 \
  --automatic-failover-enabled \
  --multi-az-enabled \
  --security-group-ids $BACKEND_SG \
  --cache-subnet-group-name habitaplot-cache-subnet \
  --auto-minor-version-upgrade true

# Get endpoint (takes 5-10 minutes)
aws elasticache describe-replication-groups \
  --replication-group-id habitaplot-prod-cache \
  --query 'ReplicationGroups[0].PrimaryEndpoint'
```

### Step 6: Amazon ECR (Container Registry)

Store Docker images:

```bash
# Create ECR repository for backend
aws ecr create-repository \
  --repository-name habitaplot/backend \
  --image-scan-on-push true \
  --encryption-configuration encryptionType=AES

# Create ECR repository for frontend
aws ecr create-repository \
  --repository-name habitaplot/frontend \
  --image-scan-on-push true

# Get ECR login token and push images
aws ecr get-login-password --region us-east-1 | \
  docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag and push backend image
docker tag habitaplot-backend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/habitaplot/backend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/habitaplot/backend:latest

# Tag and push frontend image
docker tag habitaplot-frontend:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/habitaplot/frontend:latest
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/habitaplot/frontend:latest
```

---

## Database Configuration {#database}

### Step 1: Connect to Database

```bash
# Get RDS endpoint
RDS_ENDPOINT=$(aws rds describe-db-instances \
  --db-instance-identifier habitaplot-prod-db \
  --query 'DBInstances[0].Endpoint.Address' --output text)

# Connect to database
psql -h $RDS_ENDPOINT -U admin -d postgres
```

### Step 2: Create Database & User

```sql
-- Create application database
CREATE DATABASE habitaplot;

-- Create application user
CREATE USER habitaplot_user WITH PASSWORD 'strong_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE habitaplot TO habitaplot_user;
ALTER ROLE habitaplot_user CREATEDB;

-- Connect to habitaplot database
\c habitaplot

-- Grant schema privileges
GRANT USAGE ON SCHEMA public TO habitaplot_user;
GRANT CREATE ON SCHEMA public TO habitaplot_user;
```

### Step 3: Run Migrations

```bash
# SSH into backend container or run migration locally
npm run migrations:latest

# Verify migrations
npm run migrations:status

# Seed initial data (if available)
npm run db:seed
```

### Step 4: Configure Connection Pooling

**Install pgBouncer (optional but recommended for production):**

```bash
# Using pgBouncer for connection pooling
# Configuration in pgbouncer.ini:

[databases]
habitaplot = host=RDS_ENDPOINT port=5432 dbname=habitaplot

[pgbouncer]
pool_mode = transaction
max_client_conn = 1000
default_pool_size = 25
min_pool_size = 10
reserve_pool_size = 5
reserve_pool_timeout = 3

listen_port = 6432
listen_addr = 0.0.0.0
```

### Step 5: Database Backups

**Automated Backups (already configured via RDS):**
```bash
# Configure backup retention
aws rds modify-db-instance \
  --db-instance-identifier habitaplot-prod-db \
  --backup-retention-period 30 \
  --backup-window "03:00-04:00" \
  --preferred-maintenance-window "sun:04:00-sun:05:00"
```

**Manual Backup:**
```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier habitaplot-prod-db \
  --db-snapshot-identifier habitaplot-backup-$(date +%Y%m%d-%H%M%S)

# List snapshots
aws rds describe-db-snapshots \
  --query 'DBSnapshots[*].[DBSnapshotIdentifier,SnapshotCreateTime]'
```

---

## Application Deployment {#app-deployment}

### Step 1: Create ECS Cluster

```bash
# Create ECS cluster
aws ecs create-cluster \
  --cluster-name habitaplot-prod-cluster \
  --settings name=containerInsights,value=enabled

# Create CloudWatch log group for ECS
aws logs create-log-group --log-group-name /ecs/habitaplot
aws logs put-retention-policy \
  --log-group-name /ecs/habitaplot \
  --retention-in-days 30
```

### Step 2: Create ECS Task Definition

**Create `ecs-task-definition.json`:**

```json
{
  "family": "habitaplot-backend",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "habitaplot-backend",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/habitaplot/backend:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "hostPort": 3000,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        },
        {
          "name": "PORT",
          "value": "3000"
        }
      ],
      "secrets": [
        {
          "name": "DB_HOST",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:habitaplot/prod/db-host"
        },
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:us-east-1:ACCOUNT_ID:secret:habitaplot/prod/db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/habitaplot",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ],
  "executionRoleArn": "arn:aws:iam::ACCOUNT_ID:role/ecsTaskExecutionRole"
}
```

**Register task definition:**
```bash
aws ecs register-task-definition \
  --cli-input-json file://ecs-task-definition.json
```

### Step 3: Create Load Balancer

```bash
# Create Application Load Balancer
ALB=$(aws elbv2 create-load-balancer \
  --name habitaplot-alb \
  --subnets $SUBNET1 $SUBNET2 \
  --security-groups $ALB_SG \
  --query 'LoadBalancers[0].LoadBalancerArn' --output text)

# Create target group
TG=$(aws elbv2 create-target-group \
  --name habitaplot-backend \
  --protocol HTTP \
  --port 3000 \
  --vpc-id $VPC_ID \
  --target-type ip \
  --health-check-protocol HTTP \
  --health-check-path /health \
  --health-check-interval-seconds 30 \
  --health-check-timeout-seconds 5 \
  --healthy-threshold-count 2 \
  --unhealthy-threshold-count 2 \
  --query 'TargetGroups[0].TargetGroupArn' --output text)

# Create HTTP listener (will https later)
LISTENER=$(aws elbv2 create-listener \
  --load-balancer-arn $ALB \
  --protocol HTTP \
  --port 80 \
  --default-actions Type=forward,TargetGroupArn=$TG \
  --query 'Listeners[0].ListenerArn' --output text)
```

### Step 4: Create ECS Service

```bash
# Create ECS service
aws ecs create-service \
  --cluster habitaplot-prod-cluster \
  --service-name habitaplot-backend \
  --task-definition habitaplot-backend:1 \
  --desired-count 2 \
  --launch-type FARGATE \
  --network-configuration "awsvpcConfiguration={subnets=[$SUBNET1,$SUBNET2],securityGroups=[$BACKEND_SG],assignPublicIp=DISABLED}" \
  --load-balancers "targetGroupArn=$TG,containerName=habitaplot-backend,containerPort=3000" \
  --deployment-configuration "maximumPercent=200,minimumHealthyPercent=100"

# Verify service started
aws ecs describe-services \
  --cluster habitaplot-prod-cluster \
  --services habitaplot-backend \
  --query 'services[0].[desiredCount,runningCount,pendingCount]'
```

### Step 5: Deploy Frontend (S3 + CloudFront)

```bash
# Create S3 bucket for frontend
aws s3 mb s3://habitaplot-frontend-prod

# Build frontend
cd frontend
npm run build

# Upload to S3
aws s3 sync dist/ s3://habitaplot-frontend-prod/

# Update S3 bucket to serve as static website
aws s3 website s3://habitaplot-frontend-prod --index-document index.html

# Remove public access block to allow CloudFront access
aws s3api put-bucket-policy --bucket habitaplot-frontend-prod \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Sid": "PublicReadGetObject",
        "Effect": "Allow",
        "Principal": "*",
        "Action": "s3:GetObject",
        "Resource": "arn:aws:s3:::habitaplot-frontend-prod/*"
      }
    ]
  }'
```

---

## SSL/TLS & Security {#ssl-tls}

### Step 1: Request SSL Certificate (ACM)

```bash
# Request certificate from AWS Certificate Manager
CERT=$(aws acm request-certificate \
  --domain-name habitaplot.com \
  --subject-alternative-names www.habitaplot.com api.habitaplot.com \
  --validation-method DNS \
  --query 'CertificateArn' --output text)

echo "Certificate ARN: $CERT"
echo "Please validate DNS records in ACM console"
```

### Step 2: Create HTTPS Listener

After certificate is validated:

```bash
# Create HTTPS listener
aws elbv2 create-listener \
  --load-balancer-arn $ALB \
  --protocol HTTPS \
  --port 443 \
  --certificates CertificateArn=$CERT \
  --default-actions Type=forward,TargetGroupArn=$TG \
  --ssl-policy ELBSecurityPolicy-TLS-1-2-2017-01

# Create HTTP to HTTPS redirect
aws elbv2 modify-listener \
  --listener-arn $LISTENER \
  --default-actions Type=redirect,RedirectConfig="{Protocol=HTTPS,Port=443,StatusCode=HTTP_301}"
```

### Step 3: Configure Security Headers

Add security headers to ALB or application:

```bash
# In application middleware (backend)
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Content-Security-Policy', "default-src 'self'");
  next();
});
```

### Step 4: Set Up WAF (Web Application Firewall)

```bash
# Create WAF Web ACL
WAF_ACL=$(aws wafv2 create-web-acl \
  --name habitaplot-waf \
  --scope REGIONAL \
  --default-action Block={} \
  --rules "[{Name: AllowCloudFlare, Priority: 1, Statement: {IpSetReferenceStatement: {Arn: arn:aws:wafv2:us-east-1:ACCOUNT_ID:regional/ipset/cloudflare/}}, Action: {Allow: {}}, VisibilityConfig: {SampledRequestsEnabled: true, CloudWatchMetricsEnabled: true, MetricName: AllowRule}}]" \
  --visibility-config SampledRequestsEnabled=true,CloudWatchMetricsEnabled=true,MetricName=habitaplot-waf \
  --query 'Summary.Id' --output text)

# Associate WAF with ALB
aws wafv2 associate-web-acl \
  --web-acl-arn "arn:aws:wafv2:us-east-1:ACCOUNT_ID:regional/webacl/habitaplot-waf/$WAF_ACL" \
  --resource-arn $ALB
```

---

## Environment Configuration {#environment}

### Step 1: Store Secrets in AWS Secrets Manager

```bash
# Create secrets
aws secretsmanager create-secret \
  --name habitaplot/prod/app-config \
  --secret-string '{
    "DB_HOST": "rds-endpoint.amazonaws.com",
    "DB_USER": "habitaplot_user",
    "DB_PASSWORD": "strong_password",
    "JWT_SECRET": "random_jwt_secret_key",
    "API_KEY_STRIPE": "sk_live_xxxxx",
    "API_KEY_SENDGRID": "sg_live_xxxxx",
    "REDIS_HOST": "redis-endpoint.amazonaws.com",
    "REDIS_PORT": "6379"
  }'

# Retrieve secrets (for verification)
aws secretsmanager get-secret-value \
  --secret-id habitaplot/prod/app-config \
  --query 'SecretString' --output text
```

### Step 2: Configure Environment Variables

**For Backend (in ECS task definition):**
```env
NODE_ENV=production
PORT=3000
LOG_LEVEL=info
SESSION_SECRET=your_session_secret
STRIPE_API_KEY=sk_live_xxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxx
JWT_EXPIRATION=24h
REDIS_URL=redis://habitaplot-prod-cache.xxxxx.ng.0001.use1.cache.amazonaws.com:6379
DATABASE_URL=postgres://habitaplot_user:password@habitaplot-prod-db.xxxxx.rds.amazonaws.com:5432/habitaplot
MTN_MOMO_BASE_URL=https://sandbox.momodeveloper.mtn.com
MTN_MOMO_TARGET_ENV=sandbox
MTN_MOMO_SUBSCRIPTION_KEY=your_mtn_momo_subscription_key
MTN_MOMO_ACCESS_TOKEN=your_mtn_momo_bearer_token
AIRTEL_MONEY_BASE_URL=https://openapi.airtel.africa
AIRTEL_MONEY_API_KEY=your_airtel_money_api_key
AIRTEL_MONEY_API_TOKEN=your_airtel_money_bearer_token
AIRTEL_MONEY_PAYMENT_URL=https://openapi.airtel.africa/v1/payments
AIRTEL_MONEY_VERIFY_URL=https://openapi.airtel.africa/v1/payments/verify
```

**For Frontend (in S3/.env):**
```env
VITE_API_URL=https://api.habitaplot.com
VITE_STRIPE_PUBLIC_KEY=pk_live_xxxxxx
VITE_ENV=production
VITE_LOG_LEVEL=error
```

---

## Monitoring & Logging {#monitoring}

### Step 1: CloudWatch Monitoring

```bash
# Create CloudWatch dashboards
aws cloudwatch put-dashboard \
  --dashboard-name habitaplot-prod \
  --dashboard-body '{
    "widgets": [
      {
        "type": "metric",
        "properties": {
          "metrics": [
            ["AWS/ECS", "CPUUtilization", {"stat": "Average"}],
            ["AWS/ECS", "MemoryUtilization", {"stat": "Average"}],
            ["AWS/RDS", "DatabaseConnections"],
            ["AWS/ElastiCache", "CPUUtilization"]
          ],
          "period": 300,
          "stat": "Average",
          "region": "us-east-1",
          "title": "System Metrics"
        }
      }
    ]
  }'

# Set up CloudWatch alarms
aws cloudwatch put-metric-alarm \
  --alarm-name habitaplot-high-cpu \
  --alarm-description "Alert when CPU usage is high" \
  --metric-name CPUUtilization \
  --namespace AWS/ECS \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2 \
  --alarm-actions arn:aws:sns:us-east-1:ACCOUNT_ID:habitaplot-alerts
```

### Step 2: Application Logging

**Configure structured logging:**

```javascript
// backend/logger.js
const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple()
    }),
    new winston.transports.CloudWatch({
      logGroupName: '/ecs/habitaplot',
      logStreamName: `backend-${process.env.NODE_ENV}`,
      messageFormatter: ({ level, message, meta }) => 
        `[${level}] ${message} ${JSON.stringify(meta)}`
    })
  ]
});

module.exports = logger;
```

### Step 3: Error Tracking (Optional - Sentry)

```bash
# Install Sentry SDK
npm install @sentry/node @sentry/tracing

# Configure in backend
import * as Sentry from "@sentry/node";
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
});
```

---

## Scaling & Performance {#scaling}

### Step 1: Auto-Scaling Configuration

```bash
# Register ECS service for autoscaling
aws application-autoscaling register-scalable-target \
  --service-namespace ecs \
  --resource-id service/habitaplot-prod-cluster/habitaplot-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --min-capacity 2 \
  --max-capacity 10

# Create scaling policy (scale up on high CPU)
aws application-autoscaling put-scaling-policy \
  --policy-name habitaplot-cpu-scaling \
  --service-namespace ecs \
  --resource-id service/habitaplot-prod-cluster/habitaplot-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration "TargetValue=70,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageCPUUtilization},ScaleOutCooldown=300,ScaleInCooldown=300"

# Create scaling policy (scale up on high memory)
aws application-autoscaling put-scaling-policy \
  --policy-name habitaplot-memory-scaling \
  --service-namespace ecs \
  --resource-id service/habitaplot-prod-cluster/habitaplot-backend \
  --scalable-dimension ecs:service:DesiredCount \
  --policy-type TargetTrackingScaling \
  --target-tracking-scaling-policy-configuration "TargetValue=80,PredefinedMetricSpecification={PredefinedMetricType=ECSServiceAverageMemoryUtilization}"
```

### Step 2: Database Performance Tuning

```sql
-- Create indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX idx_messages_user_id_created_at ON messages(user_id, created_at DESC);

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM listings WHERE status = 'active';

-- Enable connection pooling (use pgBouncer)
```

### Step 3: Cache Configuration

```javascript
// backend/cache.js
const redis = require('redis');
const { promisify } = require('util');

const client = redis.createClient({
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  retry_strategy: (opts) => Math.min(opts.attempt * 100, 3000)
});

client.on('error', (err) => logger.error('Redis error:', err));
client.on('connect', () => logger.info('Redis connected'));

// Cache middleware
const cacheMiddleware = (duration = 300) => (req, res, next) => {
  const key = `cache:${req.originalUrl || req.url}`;
  client.get(key, (err, data) => {
    if (data) return res.json(JSON.parse(data));
    res.sendResponse = res.json;
    res.json = (body) => {
      client.setex(key, duration, JSON.stringify(body));
      return res.sendResponse(body);
    };
    next();
  });
};

module.exports = { client, cacheMiddleware };
```

### Step 4: CDN Configuration (CloudFront)

```bash
# Create CloudFront distribution
aws cloudfront create-distribution --distribution-config '{
  "CallerReference": "'"$(date +%s)"'",
  "Comment": "HabitaPlot Frontend",
  "Enabled": true,
  "Origins": {
    "Quantity": 3,
    "Items": [
      {
        "Id": "frontend",
        "DomainName": "habitaplot-frontend-prod.s3.amazonaws.com",
        "S3OriginConfig": {}
      },
      {
        "Id": "api",
        "DomainName": "api.habitaplot.com",
        "CustomOriginConfig": {"HTTPPort": 443, "OriginProtocolPolicy": "https-only"}
      }
    ]
  },
  "DefaultCacheBehavior": {
    "TargetOriginId": "frontend",
    "ViewerProtocolPolicy": "redirect-to-https",
    "CachePolicyId": "658327ea-f89d-4fab-a63d-7e88639e58f6",
    "Compress": true
  }
}'
```

---

## Backup & Disaster Recovery {#backup-recovery}

### Step 1: Automated Backups

**Database Backups (already configured):**
- RDS automated backups: 30-day retention
- Point-in-time recovery: 35 days

**Manual Backup:**
```bash
# Create snapshot
aws rds create-db-snapshot \
  --db-instance-identifier habitaplot-prod-db \
  --db-snapshot-identifier habitaplot-backup-$(date +%Y%m%d) \
  --tags Key=Type,Value=Manual Key=Retention,Value=90days
```

### Step 2: Cross-Region Backup

```bash
# Copy snapshot to another region (for disaster recovery)
aws rds copy-db-snapshot \
  --source-db-snapshot-identifier arn:aws:rds:us-east-1:ACCOUNT_ID:snapshot:habitaplot-backup-20240101 \
  --target-db-snapshot-identifier habitaplot-backup-20240101-dr \
  --source-region us-east-1

# Or for continuous replication
aws rds create-db-instance-read-replica \
  --db-instance-identifier habitaplot-prod-db-dr \
  --source-db-instance-identifier arn:aws:rds:us-east-1:ACCOUNT_ID:db:habitaplot-prod-db \
  --db-instance-class db.t3.small
```

### Step 3: Backup Restoration

**Restore from backup:**
```bash
# List available snapshots
aws rds describe-db-snapshots \
  --query 'DBSnapshots[].[DBSnapshotIdentifier,SnapshotCreateTime]'

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier habitaplot-restored-db \
  --db-snapshot-identifier habitaplot-backup-20240101
```

### Step 4: Disaster Recovery Plan (RTO/RPO)

**RTO (Recovery Time Objective): 1 hour**
- Database: Failover to multi-AZ replica (automatic, ~2 min)
- Application: AlbStarts new container instances (auto-scaling, ~5 min)
- DNS: Update Route 53 (manual, ~5 min)

**RPO (Recovery Point Objective): 5 minutes**
- Database: Continuous replication in multi-AZ
- S3: Versioning enabled on all buckets
- Application state: Stored in database (stateless containers)

**Failover Procedure:**
```bash
# 1. Check RDS status
aws rds describe-db-instances --db-instance-identifier habitaplot-prod-db \
  --query 'DBInstances[0].[DBInstanceStatus,MultiAZ]'

# 2. Trigger manual failover if needed
aws rds reboot-db-instance \
  --db-instance-identifier habitaplot-prod-db \
  --force-failover

# 3. Monitor service health
aws ecs describe-services \
  --cluster habitaplot-prod-cluster \
  --services habitaplot-backend
```

---

## CI/CD Pipeline {#cicd}

### Step 1: GitHub Actions Configuration

**`.github/workflows/deploy.yml`:**

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
  ECR_REPOSITORY_BACKEND: habitaplot/backend
  ECR_REPOSITORY_FRONTEND: habitaplot/frontend
  ECS_CLUSTER: habitaplot-prod-cluster
  ECS_SERVICE: habitaplot-backend
  ECS_TASK_DEFINITION: habitaplot-backend

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm test
      - run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v1
      
      - name: Build Backend Image
        working-directory: ./backend
        run: |
          docker build -t ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY_BACKEND }}:${{ github.sha }} .
          docker tag ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY_BACKEND }}:${{ github.sha }} ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY_BACKEND }}:latest
      
      - name: Push Backend Image
        run: |
          docker push ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY_BACKEND }}:${{ github.sha }}
          docker push ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY_BACKEND }}:latest
      
      - name: Update ECS Task Definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: ecs-task-definition.json
          container-name: habitaplot-backend
          image: ${{ env.ECR_REGISTRY }}/${{ env.ECR_REPOSITORY_BACKEND }}:${{ github.sha }}
      
      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
      
      - name: Deployment Success
        run: echo "✅ Deployment successful"
```

### Step 2: Deployment Workflow

```bash
# 1. Create Deployment
git push main

# 2. GitHub Actions automatically:
#    - Runs tests
#    - Builds Docker image
#    - Pushes to ECR
#    - Updates ECS task definition
#    - Rolls out new container version
#    - Verifies service stability

# 3. Monitor deployment
aws ecs describe-services \
  --cluster habitaplot-prod-cluster \
  --services habitaplot-backend \
  --query 'services[0].deployments'
```

---

## Troubleshooting {#troubleshooting}

### Common Deployment Issues

**Issue: ECS tasks not starting**

```bash
# Check task logs
aws ecs describe-task-definition \
  --task-definition habitaplot-backend:latest

# View task errors
aws ecs describe-tasks \
  --cluster habitaplot-prod-cluster \
  --tasks task-arn \
  --query 'tasks[0].[lastStatus,stoppedReason]'

# Check CloudWatch logs
aws logs tail /ecs/habitaplot --follow
```

**Issue: Database connection failures**

```bash
# Test RDS connection
psql -h $RDS_ENDPOINT -U admin -d habitaplot

# Check security groups
aws ec2 describe-security-groups \
  --group-ids $BACKEND_SG $DB_SG

# Verify network connectivity
aws ec2 describe-network-interfaces
```

**Issue: High latency/timeout errors**

```bash
# Check load balancer target health
aws elbv2 describe-target-health --target-group-arn $TG

# Monitor ECS service metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/ECS \
  --metric-name CPUUtilization \
  --dimensions Name=ServiceName,Value=habitaplot-backend \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-02T00:00:00Z \
  --period 300 \
  --statistics Average
```

---

## Post-Deployment {#post-deployment}

### Step 1: Health Checks

```bash
# Verify application endpoints
curl https://api.habitaplot.com/health
curl https://api.habitaplot.com/admin/health

# Test database connectivity
curl https://api.habitaplot.com/api/listings -H "Accept: application/json"

# Check frontend
curl https://habitaplot.com/
```

### Step 2: Smoke Testing

```javascript
// Run smoke tests
describe('Production Environment', () => {
  it('should connect to database', async () => {
    const result = await db.query('SELECT 1');
    expect(result).toBeDefined();
  });

  it('should reach Redis cache', async () => {
    const result = await redis.ping();
    expect(result).toBe('PONG');
  });

  it('should list listings', async () => {
    const res = await fetch('/api/listings');
    expect(res.status).toBe(200);
  });
});
```

### Step 3: Monitoring Setup

- ✓ CloudWatch dashboards created
- ✓ Alarms configured for CPU, Memory, Errors
- ✓ Log streaming to CloudWatch
- ✓ Error tracking (Sentry/similar) active

### Step 4: Documentation

- ✓ Keep deployment documentation updated
- ✓ Document any manual steps or deviations
- ✓ Record all infrastructure changes
- ✓ Create runbooks for common issues

---

## Maintenance Schedule

**Daily:**
- Monitor CloudWatch dashboards
- Check error rates in logs
- Verify backup completion

**Weekly:**
- Review performance metrics
- Check security logs
- Update dependencies

**Monthly:**
- Review and optimize costs
- Test backup restoration
- Update documentation

---

**Support & Escalation:**
- **Tier 1**: Check logs, restart services
- **Tier 2**: Database optimization, cache issues
- **Tier 3**: Infrastructure changes, migrations

---

**Last Updated**: 2024 | **Version**: 2.0
