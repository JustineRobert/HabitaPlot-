# Development Guide

Welcome to the HabitaPlot™ development guide! This document covers everything you need to know to start contributing to the project.

## 🎯 Quick Navigation

- **New to the project?** → Start with [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Want to contribute?** → Read [CONTRIBUTING.md](./CONTRIBUTING.md)
- **Need architecture overview?** → See [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Building features?** → Check [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md)
- **Working on tests?** → Review [TESTING.md](./TESTING.md)
- **Security concerns?** → Consult [SECURITY.md](./SECURITY.md)

---

## 📖 Development Workflow

### 1. Setup Your Development Environment

```bash
# Clone repository
git clone https://github.com/yourusername/habitaplot.git
cd habitaplot

# Install dependencies (or use Docker)
cd backend && npm install
cd ../frontend && npm install

# Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp docker/.env.example docker/.env

# Start with Docker (recommended)
docker-compose -f docker/docker-compose.yml up -d
```

**Verify everything is working:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- pgAdmin: http://localhost:5050
- Redis Commander: http://localhost:8081

See [GETTING_STARTED.md](./GETTING_STARTED.md) for detailed setup instructions.

### 2. Choose Your Feature

1. Check [PROJECT_STATUS.md](./PROJECT_STATUS.md) for available features
2. Review [GitHub Issues](https://github.com/habitaplot/issues) for existing work
3. Choose a task matching your skills
4. Comment to claim the feature

### 3. Create Feature Branch

```bash
git checkout -b feature/your-feature-name

# Examples:
git checkout -b feature/add-message-system
git checkout -b fix/auth-token-expiry
git checkout -b docs/api-reference
git checkout -b test/payment-integration
```

**Branch naming convention:**
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation
- `test/*` - Tests
- `refactor/*` - Code refactoring

### 4. Develop Your Feature

#### Backend Development

```bash
# Navigate to backend
cd backend

# Start development server (watches for changes)
npm run dev

# Run linting
npm run lint

# Run tests
npm run test

# Run database migrations
npm run migrate
```

**File structure for new features:**

```
backend/src/
├── models/FeatureName.js           # Database model
├── controllers/featureController.js # Request handlers
├── routes/featureRoutes.js          # API endpoints
├── middleware/featureMiddleware.js  # Specific middleware
└── services/featureService.js       # Business logic
```

**Example: Adding listing search**

```javascript
// models/ListingFilter.js
const ListingFilter = sequelize.define('ListingFilter', {
  // Define model
});

// controllers/listingController.js
export const searchListings = async (req, res, next) => {
  // Implement search logic
};

// routes/listingRoutes.js
router.get('/search', listingController.searchListings);

// middleware/listingValidation.js
export const validateSearchParams = (req, res, next) => {
  // Validate search parameters
};
```

#### Frontend Development

```bash
# Navigate to frontend
cd frontend

# Start development server (with HMR)
npm start

# Run linting
npm run lint

# Run tests
npm run test

# Build for production
npm run build
```

**File structure for new features:**

```
frontend/src/
├── pages/FeaturePage.js             # Full page component
├── components/FeatureComponent.js   # Reusable components
├── hooks/useFeature.js              # Custom hooks
├── services/featureService.js       # API calls
└── __tests__/FeaturePage.test.js   # Tests
```

**Example: Adding search filters**

```jsx
// pages/SearchPage.js
export const SearchPage = () => {
  const [filters, setFilters] = useState({});
  const [results, setResults] = useState([]);

  useEffect(() => {
    searchListings(filters);
  }, [filters]);

  return (
    <div>
      <FilterSidebar filters={filters} onChange={setFilters} />
      <ResultsGrid results={results} />
    </div>
  );
};

// services/listingService.js
export const searchListings = async (filters) => {
  return api.get('/listings/search', { params: filters });
};

// __tests__/SearchPage.test.js
describe('SearchPage', () => {
  it('should filter listings', async () => {
    // Test implementation
  });
});
```

### 5. Write Tests

Test coverage is important. Aim for:
- **Backend**: 80%+ coverage
- **Frontend**: 75%+ coverage

See [TESTING.md](./TESTING.md) for complete testing guide.

**Quick test commands:**

```bash
# Backend
cd backend
npm run test                    # Run all tests
npm run test -- --coverage     # Generate coverage report
npm run test -- --watch        # Watch mode

# Frontend
cd frontend
npm run test                    # Run all tests
npm run test -- --coverage     # Generate coverage report
npm run test -- --watch        # Watch mode
```

### 6. Commit Your Changes

Follow conventional commit messages:

```bash
git add .

# Format: type(scope): subject
git commit -m "feat(listing): add advanced search filters"
git commit -m "fix(auth): resolve token refresh bug"
git commit -m "docs(api): update search endpoints"
git commit -m "test(payment): add Stripe integration tests"
```

**Commit message guidelines:**
- Use imperative mood ("add" not "added")
- Reference related issues (#123)
- Keep subject under 50 characters
- Wrap body at 72 characters

### 7. Push and Create Pull Request

```bash
# Push your branch
git push origin feature/your-feature-name

# Create PR on GitHub
# - Reference any related issues
# - Describe what changed and why
# - Include testing notes
```

**PR Template:**
```markdown
## Description
Brief explanation of changes

## Changes
- Change 1
- Change 2

## Related Issues
Closes #123

## Testing
- [x] Unit tests added
- [x] Manual testing completed
- [x] No breaking changes

## Screenshots
(if applicable)
```

### 8. Code Review & Merge

- Address reviewer feedback
- Ensure all CI checks pass
- Maintain test coverage
- Get minimum 2 approvals
- Merge when ready

---

## 🏗️ General Development Guidelines

### Code Style

**JavaScript/TypeScript:**
- 2-space indentation
- Semicolons at end of statements
- Use `const` by default, `let` for loop counters
- Arrow functions for callbacks
- Template literals for strings

```javascript
// ✅ Good
const calculatePrice = (items) => {
  const total = items.reduce((sum, item) => sum + item.price, 0);
  return `Total: $${total.toFixed(2)}`;
};

// ❌ Bad
var calculatePrice = function(items) {
  var total = 0;
  for (var i = 0; i < items.length; i++) {
    total = total + items[i].price;
  }
  return "Total: $" + total.toFixed(2);
}
```

### Component Structure

**Backend Controller:**
```javascript
export const handler = async (req, res, next) => {
  try {
    // Validate input
    if (!req.body.email) {
      return res.status(400).json({ error: 'Email required' });
    }

    // Business logic
    const result = await Service.process(req.body);

    // Return response
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
```

**React Component:**
```jsx
import React, { useState, useEffect } from 'react';

export const ComponentName = ({ prop1, prop2 }) => {
  const [state, setState] = useState(null);

  useEffect(() => {
    // Setup effect
    return () => {
      // Cleanup
    };
  }, []);

  const handleClick = () => {
    // Handler logic
  };

  return (
    <div>{/* JSX */}</div>
  );
};

export default ComponentName;
```

### Error Handling

**Backend:**
```javascript
export const handler = async (req, res, next) => {
  try {
    const result = await riskyOperation();
    res.json(result);
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ error: error.message });
    }
    if (error.code === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Resource not found' });
    }
    // Default error handler
    next(error);
  }
};
```

**Frontend:**
```javascript
try {
  const result = await apiService.fetch(url);
  setData(result);
} catch (error) {
  if (error.response?.status === 404) {
    setError('Resource not found');
  } else {
    setError('An error occurred');
  }
  toast.error(error.message || 'Request failed');
}
```

### Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `user-service.js` |
| Classes/Components | PascalCase | `UserService` |
| Functions/Variables | camelCase | `getUserById` |
| Constants | UPPER_SNAKE_CASE | `MAX_RETRY_COUNT` |
| Database Columns | snake_case | `created_at` |
| API Endpoints | kebab-case | `/get-user` |

### Performance Tips

**Backend:**
- Use database indexes on frequently queried columns
- Implement pagination for large result sets
- Cache expensive operations with Redis
- Use connection pooling for database
- Monitor query performance

**Frontend:**
- Code splitting with React.lazy()
- Lazy loading images
- Memoization with useMemo/useCallback
- Minimize bundle size
- Use production builds for testing

### Security Reminders

- Never commit secrets or API keys
- Always validate input on server
- Use HTTPS in production
- Implement rate limiting
- Sanitize user inputs
- Use parameterized queries
- Keep dependencies updated

See [SECURITY.md](./SECURITY.md) for comprehensive security guide.

---

## 🔧 Common Development Tasks

### Add a New API Endpoint

```javascript
// 1. Create controller method
export const getFeature = async (req, res, next) => {
  try {
    const feature = await Feature.findByPk(req.params.id);
    if (!feature) return res.status(404).json({ error: 'Not found' });
    res.json(feature);
  } catch (error) {
    next(error);
  }
};

// 2. Add route
router.get('/features/:id', 
  authMiddleware,        // Add auth if needed
  getFeature
);

// 3. Document in API.md
// GET /features/:id
// Returns feature by ID
// Response: { id, name, ... }

// 4. Test it
npm run test -- featureController.test.js
```

### Add a New Database Table

```javascript
// 1. Create migration
// migrations/20240115-create-feature.js
module.exports = {
  up: async (sequelize) => {
    await sequelize.createTable('features', {
      id: { type: DataTypes.UUID, primaryKey: true },
      name: DataTypes.STRING,
      createdAt: DataTypes.DATE,
      updatedAt: DataTypes.DATE
    });
  },
  down: async (sequelize) => {
    await sequelize.dropTable('features');
  }
};

// 2. Create model
// models/Feature.js
const Feature = sequelize.define('Feature', {
  id: { type: DataTypes.UUID, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false }
});

// 3. Run migration
npm run migrate:up

// 4. Update DATABASE_SCHEMA.md
```

### Add Frontend Form Component

```jsx
// 1. Create form component
export const FeatureForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validated = validate(formData);
    if (validated.isValid) {
      onSubmit(formData);
    } else {
      setErrors(validated.errors);
    }
  };

  return <form onSubmit={handleSubmit}>{/* Form fields */}</form>;
};

// 2. Create test file
describe('FeatureForm', () => {
  it('should submit form with valid data', () => {
    // Test implementation
  });
});

// 3. Use in page
export const FeaturePage = () => {
  const handleSubmit = async (data) => {
    await featureService.create(data);
  };
  return <FeatureForm onSubmit={handleSubmit} />;
};
```

---

## 🐛 Debugging Tips

### Backend

```bash
# Debug mode
DEBUG=habitaplot:* npm run dev

# Use breakpoints in VSCode
# Set breakpoints, then:
node --inspect-brk ./src/index.js

# Database logs
DEBUG=sequelize* npm run dev

# Check Redis
redis-cli
> keys *
> get key_name

# View logs
tail -f ./logs/error.log
```

### Frontend

```bash
# React DevTools browser extension
# Redux DevTools (if using Redux)
# Open browser DevTools (F12)

# Debug specific component
// Add this in component
console.log('Component mounted', props);
debugger; // Pause on this line

# Check network requests
# Open Network tab in DevTools
```

---

## 📞 Getting Help

### Common Issues

**Port already in use:**
```bash
# Kill process on port
lsof -ti:5000 | xargs kill -9

# Or use different port
PORT=5001 npm run dev
```

**Database migration failed:**
```bash
# Check migrations status
npm run migrate:status

# Rollback last migration
npm run migrate:down

# Check database state
npm run db:inspect
```

**Tests failing:**
```bash
# Clear Jest cache
npm run test -- --clearCache

# Run specific test with verbose output
npm run test -- MyTest.test.js --verbose

# Update snapshots
npm run test -- -u
```

### Getting Support

1. **Check existing documentation** - See [docs/README.md](./docs/README.md)
2. **Search GitHub Issues** - Look for similar problems
3. **Ask in discussions** - Use GitHub Discussions
4. **Contact maintainers** - Email core team

---

## 📚 Learning Resources

### Frontend Development
- [React Documentation](https://react.dev)
- [Tailwind CSS Guide](https://tailwindcss.com/docs)
- [React Router](https://reactrouter.com)
- [Axios](https://axios-http.com)

### Backend Development
- [Express.js Guide](https://expressjs.com)
- [Sequelize ORM](https://sequelize.org)
- [PostgreSQL Documentation](https://www.postgresql.org/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

### DevOps & Tools
- [Docker Guide](https://docs.docker.com)
- [GitHub Actions](https://docs.github.com/en/actions)
- [AWS Documentation](https://docs.aws.amazon.com)
- [Git Workflow](https://git-scm.com/doc)

---

## 🎓 Next Steps

1. ✅ Read [GETTING_STARTED.md](./GETTING_STARTED.md) - Setup
2. ✅ Review [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Understand layout
3. ✅ Check [CONTRIBUTING.md](./CONTRIBUTING.md) - Contribution guidelines
4. ✅ Read [PROJECT_STATUS.md](./PROJECT_STATUS.md) - See available tasks
5. ✅ Choose a feature and start coding!

Happy coding! 🚀

---

**Last Updated**: January 2024  
**Version**: 1.0
