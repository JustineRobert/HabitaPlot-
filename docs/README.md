# Documentation Index

Welcome to the HabitaPlot™ documentation! This folder contains all technical documentation for the project.

## 📚 Documentation Files

### Core Documentation

1. **[API.md](./API.md)**
   - Complete REST API specification
   - 25+ endpoints documented
   - Authentication endpoints
   - Listing CRUD operations
   - Search and filtering
   - Error handling and status codes
   - Example requests and responses

2. **[ARCHITECTURE.md](./ARCHITECTURE.md)**
   - System design and architecture patterns
   - Three-tier architecture overview
   - Data flow diagrams
   - Database design rationale
   - Security architecture
   - Scalability patterns
   - Performance optimization strategies
   - Deployment pipeline

3. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)**
   - Complete database specification
   - Entity relationship diagrams (ERD)
   - Table definitions (7 tables)
   - Column specifications and constraints
   - Database indexes
   - Migration strategy
   - Sample queries
   - GDPR compliance notes

4. **[UGANDA_LOCALIZATION.md](./UGANDA_LOCALIZATION.md)**
   - Uganda district and regional localization guidance
   - Local property normalization rules
   - District search and filtering
   - Support for Ugandan address patterns

5. **[BUSINESS_PLAN.md](./BUSINESS_PLAN.md)**
   - Uganda market entry strategy
   - Revenue models and pricing
   - Go-to-market plan and risks

6. **[UI_WIREFRAMES.md](./UI_WIREFRAMES.md)**
   - Search and listing wireframes
   - Checkout and payment journeys
   - Admin and listing creation layouts

7. **[DEPLOYMENT.md](./DEPLOYMENT.md)**
   - Development environment setup
   - AWS infrastructure configuration
   - Docker deployment
   - Database setup (RDS)
   - Caching setup (ElastiCache)
   - S3 bucket configuration
   - ECS Fargate deployment
   - CI/CD pipeline setup
   - Monitoring and logging
   - Database migrations
   - SSL/TLS configuration

### Root-Level Documentation

5. **[../README.md](../README.md)**
   - Project overview
   - Feature description
   - Tech stack summary
   - Quick start instructions
   - Project structure
   - Documentation links

6. **[../GETTING_STARTED.md](../GETTING_STARTED.md)**
   - Comprehensive onboarding guide
   - Prerequisites and setup
   - Docker quick start
   - Local development setup
   - Running services
   - Verification steps
   - Common tasks
   - Troubleshooting

7. **[../CONTRIBUTING.md](../CONTRIBUTING.md)**
   - Contribution guidelines
   - Development workflow
   - Commit message conventions
   - Pull request process
   - Code standards
   - Testing requirements
   - Documentation standards

8. **[../PROJECT_STATUS.md](../PROJECT_STATUS.md)**
   - Current development status
   - Completed features
   - In-progress features
   - Testing and QA status
   - Deployment readiness
   - Timeline and milestones
   - Success metrics

9. **[../CHANGELOG.md](../CHANGELOG.md)**
   - Version history
   - Feature releases
   - Bug fixes
   - Breaking changes
   - Deprecations
   - Roadmap for future phases

## 🎯 Documentation by Use Case

### For New Developers
1. Start with: [../GETTING_STARTED.md](../GETTING_STARTED.md)
2. Read: [../README.md](../README.md)
3. Review: [ARCHITECTURE.md](./ARCHITECTURE.md)
4. Reference: [../CONTRIBUTING.md](../CONTRIBUTING.md)

### For System Design
1. Read: [ARCHITECTURE.md](./ARCHITECTURE.md)
2. Review: [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)
3. Check: [API.md](./API.md)
4. Consider: [DEPLOYMENT.md](./DEPLOYMENT.md)

### For API Integration
1. Reference: [API.md](./API.md)
2. Setup: [../GETTING_STARTED.md](../GETTING_STARTED.md) (API testing section)
3. Understand: [ARCHITECTURE.md](./ARCHITECTURE.md) (API architecture)

### For Deployment
1. Follow: [DEPLOYMENT.md](./DEPLOYMENT.md)
2. Reference: [../README.md](../README.md) (Quick start)
3. Verify: [../GETTING_STARTED.md](../GETTING_STARTED.md) (Docker section)

### For Contributing
1. Read: [../CONTRIBUTING.md](../CONTRIBUTING.md)
2. Check: [../PROJECT_STATUS.md](../PROJECT_STATUS.md) (Current tasks)
3. Review: [../CHANGELOG.md](../CHANGELOG.md) (Version info)

## 📋 Quick Reference

### API Endpoints Summary
- **Auth**: `/auth/register`, `/auth/login`, `/auth/refresh-token`, `/auth/me`
- **Listings**: `GET /listings`, `POST /listings`, `GET /listings/:id`, `PATCH /listings/:id`, `DELETE /listings/:id`
- **Search**: `GET /listings?type=...&price_min=...&price_max=...&location=...`

### Technology Stack
- **Frontend**: React 18, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, Sequelize ORM
- **Database**: PostgreSQL 15, Redis 7
- **DevOps**: Docker, Docker Compose, GitHub Actions
- **Cloud**: AWS (RDS, ECS, S3, CloudFront)

### Database Tables
- `users` - User accounts and authentication
- `listings` - Property listings
- `listing_images` - Images associated with listings
- `subscriptions` - User subscription plans
- `messages` - In-app messaging
- `favorites` - User favorite listings
- `audit_logs` - System audit trail

### Key Features (Phase 1)
- User registered and authentication
- Listing creation and management
- Advanced search and filtering
- User dashboard
- Featured listing promotion
- Payment infrastructure ready
- Admin panel foundation

## 🔍 Documentation Standards

All documentation in this project follows these standards:

### Formatting
- Markdown format with proper headings
- Code blocks with language specification
- Tables for structured data
- Links to related documentation
- Examples and use cases

### Content Style
- Clear and concise language
- Active voice preferred
- Technical accuracy
- Practical examples
- Configuration samples

### Organization
- Table of contents for long documents
- Logical section hierarchy
- Clear navigation
- Internal cross-references
- External resource links

## 📝 Updating Documentation

When making changes to the project:

1. Update relevant documentation files
2. Maintain consistency across docs
3. Update TABLE OF CONTENTS if adding new sections
4. Add entry to [../CHANGELOG.md](../CHANGELOG.md)
5. Update [../PROJECT_STATUS.md](../PROJECT_STATUS.md) if applicable
6. Review in pull requests before merge

## 🤝 Getting Help

- **Setup Issues**: See [../GETTING_STARTED.md](../GETTING_STARTED.md) troubleshooting section
- **API Questions**: Review [API.md](./API.md) and examples
- **Architecture Concerns**: Consult [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Deployment Help**: Follow [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Contribution Guidelines**: Check [../CONTRIBUTING.md](../CONTRIBUTING.md)

## 📞 Documentation Contact

For documentation updates or suggestions:
- Submit via GitHub Issues
- Create pull requests with improvements
- Review before merging to main
- Keep documentation in sync with code

---

**Last Updated**: January 2024  
**Documentation Version**: 1.0  
**Total Pages**: 9 main documentation files
